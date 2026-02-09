"use client";

import { Briefcase } from 'lucide-react';
import { Job, AdminAnalytics } from '@/types';
import { useState } from 'react';
import JobStats from './jobs/JobStats';
import JobFilterBar from './jobs/JobFilterBar';
import JobTable from './jobs/JobTable';

interface JobsTabProps {
    jobs: Job[];
    analytics: AdminAnalytics;
    jobFilter: 'all' | 'reported';
    setJobFilter: (filter: 'all' | 'reported') => void;
    toggleJobStatus: (id: string, current: boolean) => void;
    deleteJob: (id: string) => void;
    clearAllJobs: () => void;
    clearReportedJobs: () => void;
}

export default function JobsTab({
    jobs, analytics, jobFilter, setJobFilter,
    toggleJobStatus, deleteJob, clearAllJobs, clearReportedJobs
}: JobsTabProps) {
    const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const reportedJobs = jobs.filter(j => (j.reportCount || 0) > 0);
    const filteredJobs = jobFilter === 'reported' ? reportedJobs : jobs;
    const displayJobs = filteredJobs.filter(j =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelection = (id: string) => {
        setSelectedJobIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selectedJobIds.length === displayJobs.length) {
            setSelectedJobIds([]);
        } else {
            setSelectedJobIds(displayJobs.map(j => j._id));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedJobIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedJobIds.length} jobs? This cannot be undone.`)) return;

        setIsDeleting(true);
        try {
            const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';
            const res = await fetch(`${BACKEND_URL}/api/admin/jobs/bulk-delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedJobIds })
            });
            const data = await res.json();

            if (res.ok) {
                // Remove deleted jobs from local state (we can't easily update parent 'jobs' prop without a callback, 
                // but we can force a refresh if the parent passed one, or just wait for the next poll)
                // For now, let's assume the parent polling will catch it, but we should clear selection
                setSelectedJobIds([]);
                // Trigger a refresh would be ideal, but we don't have a refresh prop. 
                // We'll rely on the parent's polling, but clearing selection is key.
                alert(data.message);
            } else {
                alert(data.error || 'Failed to delete jobs');
            }
        } catch (err) {
            console.error('Bulk delete failed', err);
            alert('Failed to delete jobs');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                        <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    Job Control Center
                </h2>
                <p className="text-zinc-500 font-medium">Manage listings, monitor engagement, and handle reports.</p>
            </div>

            <JobStats
                totalJobs={jobs.length}
                reportedCount={reportedJobs.length}
                analytics={analytics}
            />

            <JobFilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                jobFilter={jobFilter}
                setJobFilter={setJobFilter}
                totalCount={jobs.length}
                reportedCount={reportedJobs.length}
                onClearReported={clearReportedJobs}
                selectedCount={selectedJobIds.length}
                onBulkDelete={handleBulkDelete}
                isDeleting={isDeleting}
            />

            <JobTable
                jobs={displayJobs}
                toggleJobStatus={toggleJobStatus}
                deleteJob={deleteJob}
                clearAllJobs={clearAllJobs}
                totalCount={jobs.length}
                selectedJobIds={selectedJobIds}
                toggleSelection={toggleSelection}
                toggleAll={toggleAll}
            />
        </div>
    );
}
