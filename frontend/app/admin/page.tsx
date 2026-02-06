"use client";

import { useState, useEffect } from 'react';
import { Job, QueueItem, AdminAnalytics } from '@/types';
import AdminSidebar, { AdminTab } from '@/components/admin/AdminSidebar';
import CEODashboard from '@/components/admin/CEODashboard';
import JobsTab from '@/components/admin/JobsTab';
import QueueTab from '@/components/admin/QueueTab';
import AnalyticsTab from '@/components/admin/AnalyticsTab';
import ScraperTab from '@/components/admin/ScraperTab';
import BatchAlerts from '@/components/admin/BatchAlerts';
import SettingsTab from '@/components/admin/SettingsTab';
import UsersTab from '@/components/admin/UsersTab'; // Assuming we'll create this next
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';

export default function AdminDashboard() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [analytics, setAnalytics] = useState<AdminAnalytics>({ totalJobs: 0, totalViews: 0, totalClicks: 0 });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cleaning, setCleaning] = useState(false);
    const [activeTab, setActiveTab] = useState<AdminTab>('ceo');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [jobFilter, setJobFilter] = useState<'all' | 'reported'>('all');
    const [dashboardStats, setDashboardStats] = useState<any>(null);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');



    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/admin/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setIsAuthenticated(true);
                sessionStorage.setItem('adminAuth', 'true');
                toast.success(data.message);
            } else {
                toast.error(data.message || 'Invalid Credentials');
            }
        } catch (err) {
            toast.error('Login failed. Server error.');
            console.error(err);
        }
    };

    const fetchDashboardStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/dashboard-stats`);
            const data = await res.json();
            setDashboardStats(data);
        } catch (err) {
            console.error('Failed to fetch CEO stats', err);
        }
    };

    const fetchData = async () => {
        try {
            const [jobsRes, analyticsRes, queueRes, chartRes] = await Promise.all([
                fetch(`${API_URL}/api/jobs?limit=100`),
                fetch(`${API_URL}/api/analytics`),
                fetch(`${API_URL}/api/admin/queue`),
                fetch(`${API_URL}/api/admin/analytics/detailed`)
            ]);

            const jobsData = await jobsRes.json();
            const analyticsData = await analyticsRes.json();
            const queueData = await queueRes.json();
            const chartData = await chartRes.json();

            setJobs(jobsData.jobs || []);
            setAnalytics(analyticsData);
            setQueue(queueData || []);
            setChartData(chartData || []);
        } catch (err) {
            console.error('Failed to fetch admin data', err);
        } finally {
            setLoading(false);
        }
    };

    const runCleanup = async () => {
        if (!confirm('Archive non-featured jobs older than 30 days?')) return;
        setCleaning(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/cleanup`, { method: 'POST' });
            const data = await res.json();
            toast.success(data.message);
            fetchData();
        } catch (err) {
            console.error('Cleanup failed', err);
        } finally {
            setCleaning(false);
        }
    };

    const runQueueItem = async (id: string) => {
        try {
            await fetch(`${API_URL}/api/admin/queue/${id}/run`, { method: 'POST' });
            fetchData();
        } catch (err) {
            console.error('Failed to run queue item', err);
        }
    };

    const deleteQueueItem = async (id: string) => {
        if (!confirm('Cancel this scheduled job?')) return;
        try {
            await fetch(`${API_URL}/api/admin/queue/${id}`, { method: 'DELETE' });
            setQueue(queue.filter(q => q._id !== id));
        } catch (err) {
            console.error('Failed to delete queue item', err);
        }
    };

    const clearQueue = async (status: string = 'pending') => {
        const confirmMsg = status === 'pending'
            ? 'Clear all pending jobs from the queue?'
            : 'Clear all processed job history?';

        if (!confirm(`${confirmMsg} This cannot be undone.`)) return;

        try {
            const res = await fetch(`${API_URL}/api/admin/queue/clear?status=${status}`, { method: 'DELETE' });
            const data = await res.json();
            toast.success(data.message);
            fetchData();
        } catch (err) {
            console.error('Failed to clear queue', err);
            toast.error('Failed to clear queue');
        }
    };

    const clearAllJobs = async () => {
        if (!confirm('EXTREME CAUTION: This will delete ALL job listings from the database. Are you absolutely sure?')) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/jobs/clear`, { method: 'DELETE' });
            const data = await res.json();
            toast.success(data.message);
            fetchData();
        } catch (err) {
            console.error('Failed to clear jobs', err);
            toast.error('Failed to clear jobs');
        }
    };

    const clearReportedJobs = async () => {
        if (!confirm('Clear all reported jobs from the database?')) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/jobs/reported`, { method: 'DELETE' });
            const data = await res.json();
            toast.success(data.message);
            fetchData();
        } catch (err) {
            console.error('Failed to clear reported jobs', err);
            toast.error('Failed to clear reported jobs');
        }
    };

    const toggleJobStatus = async (jobId: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`${API_URL}/api/admin/jobs/${jobId}/toggle`, { method: 'PUT' });
            if (!res.ok) throw new Error('Failed to toggle');

            setJobs(jobs.map(j =>
                j._id === jobId ? { ...j, isActive: !currentStatus } : j
            ));
        } catch (err) {
            console.error('Failed to toggle job status', err);
            toast.error('Failed to update status');
        }
    };

    const deleteJob = async (jobId: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/jobs/${jobId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');

            setJobs(jobs.filter(j => j._id !== jobId));
        } catch (err) {
            console.error('Failed to delete job', err);
            toast.error('Failed to delete job');
        }
    };

    useEffect(() => {
        // Check session storage for persistence
        const auth = sessionStorage.getItem('adminAuth');
        if (auth === 'true') {
            setIsAuthenticated(true);
            fetchData();
            fetchDashboardStats();
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchData();
            fetchDashboardStats();
        }
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-purple-500/10 pointer-events-none" />
                <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl relative z-10">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
                            <span className="text-3xl">👑</span>
                        </div>
                        <h1 className="text-2xl font-black text-white">Admin Access</h1>
                        <p className="text-zinc-500">Enter secure credentials to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:border-amber-500 focus:outline-none transition-colors font-medium"
                                placeholder="Enter username"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:border-amber-500 focus:outline-none transition-colors font-medium"
                                placeholder="Enter password"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold py-3.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
                        >
                            Access Dashboard
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-black p-8">
                <div className="max-w-7xl mx-auto text-center py-20">
                    <div className="animate-spin w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-zinc-500">Loading Dashboard Command Center...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black flex overflow-hidden">
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                pendingCount={queue.filter(q => q.status === 'pending').length}
            />

            <div className={`flex-1 transition-all duration-300 h-screen overflow-y-auto ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
                <div className="max-w-7xl mx-auto p-12">
                    {/* Page Content Mapper */}
                    {activeTab === 'ceo' && (
                        <CEODashboard stats={dashboardStats} loading={loading} />
                    )}

                    {activeTab === 'jobs' && (
                        <JobsTab
                            jobs={jobs}
                            analytics={analytics}
                            jobFilter={jobFilter}
                            setJobFilter={setJobFilter}
                            toggleJobStatus={toggleJobStatus}
                            deleteJob={deleteJob}
                            clearAllJobs={clearAllJobs}
                            clearReportedJobs={clearReportedJobs}
                        />
                    )}

                    {activeTab === 'users' && (
                        <UsersTab apiUrl={API_URL} />
                    )}

                    {activeTab === 'queue' && (
                        <QueueTab
                            queue={queue}
                            runQueueItem={runQueueItem}
                            deleteQueueItem={deleteQueueItem}
                            clearQueue={clearQueue}
                        />
                    )}

                    {activeTab === 'analytics' && (
                        <AnalyticsTab
                            chartData={chartData}
                            runCleanup={runCleanup}
                            cleaning={cleaning}
                        />
                    )}

                    {activeTab === 'scraper' && (
                        <ScraperTab apiUrl={API_URL} />
                    )}

                    {activeTab === 'alerts' && (
                        <BatchAlerts />
                    )}

                    {activeTab === 'settings' && (
                        <SettingsTab refreshData={fetchData} />
                    )}
                </div>
            </div>
        </main>
    );
}
