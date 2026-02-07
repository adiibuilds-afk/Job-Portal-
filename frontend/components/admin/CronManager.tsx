"use client";

import { useState, useEffect } from 'react';
import { Clock, Play, Pause, RefreshCw, Settings, CheckCircle, XCircle, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CronJob {
    _id: string;
    name: string;
    description: string;
    schedule: string;
    enabled: boolean;
    lastRun: string | null;
    lastStatus: 'success' | 'failed' | 'running' | 'never';
    lastError: string | null;
    runCount: number;
}

const SCHEDULE_PRESETS = [
    { label: 'Every 1 min', value: '*/1 * * * *' },
    { label: 'Every 5 min', value: '*/5 * * * *' },
    { label: 'Every 30 min', value: '*/30 * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Every 2 hours', value: '0 */2 * * *' },
    { label: 'Every 6 hours', value: '0 */6 * * *' },
    { label: 'Daily at 3 AM', value: '0 3 * * *' },
    { label: 'Daily at 9 AM', value: '0 9 * * *' },
    { label: 'Weekly (Mon 9 AM)', value: '0 9 * * 1' },
    { label: 'Custom...', value: 'custom' },
];

export default function CronManager() {
    const [crons, setCrons] = useState<CronJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [runningJob, setRunningJob] = useState<string | null>(null);
    const [editingJob, setEditingJob] = useState<string | null>(null);
    const [customCron, setCustomCron] = useState<string>('');

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const fetchCrons = async () => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/cron`);
            const data = await res.json();
            setCrons(data);
        } catch (err) {
            console.error('Failed to fetch crons', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCrons();
    }, []);

    const toggleCron = async (id: string, enabled: boolean) => {
        try {
            await fetch(`${BACKEND_URL}/api/admin/cron/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled })
            });
            setCrons(prev => prev.map(c => c._id === id ? { ...c, enabled } : c));
            toast.success(enabled ? 'Cron job enabled' : 'Cron job paused');
        } catch (err) {
            toast.error('Failed to update cron job');
        }
    };

    const updateSchedule = async (id: string, schedule: string) => {
        if (schedule === 'custom') {
            // Don't close, wait for custom input
            return;
        }
        try {
            await fetch(`${BACKEND_URL}/api/admin/cron/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schedule })
            });
            setCrons(prev => prev.map(c => c._id === id ? { ...c, schedule } : c));
            setEditingJob(null);
            setCustomCron('');
            toast.success('Schedule updated');
        } catch (err) {
            toast.error('Failed to update schedule');
        }
    };

    const applyCustomCron = async (id: string) => {
        if (!customCron.trim()) {
            toast.error('Enter a valid cron expression');
            return;
        }
        await updateSchedule(id, customCron.trim());
    };

    const runNow = async (id: string) => {
        setRunningJob(id);
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/cron/${id}/run`, { method: 'POST' });
            const data = await res.json();
            fetchCrons();
            toast.success(`Job completed: ${JSON.stringify(data.result)}`);
        } catch (err) {
            toast.error('Failed to run job');
        } finally {
            setRunningJob(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'running': return <Loader className="w-4 h-4 text-amber-500 animate-spin" />;
            default: return <Clock className="w-4 h-4 text-zinc-500" />;
        }
    };

    const formatLastRun = (date: string | null) => {
        if (!date) return 'Never';
        return new Date(date).toLocaleString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-500" />
                    Cron Job Control
                </h2>
                <button
                    onClick={fetchCrons}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4 text-zinc-400" />
                </button>
            </div>

            <div className="grid gap-4">
                {crons.map(cron => (
                    <div
                        key={cron._id}
                        className={`p-4 rounded-xl border transition-all ${cron.enabled
                            ? 'bg-zinc-900/80 border-zinc-700/50'
                            : 'bg-zinc-900/40 border-zinc-800/50 opacity-60'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {getStatusIcon(cron.lastStatus)}
                                <div>
                                    <h3 className="font-semibold text-white capitalize">
                                        {cron.name.replace(/_/g, ' ')}
                                    </h3>
                                    <p className="text-sm text-zinc-500">{cron.description}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Run Count Badge */}
                                <span className="px-2 py-1 text-xs font-mono bg-zinc-800 text-zinc-400 rounded">
                                    {cron.runCount} runs
                                </span>

                                {/* Run Now Button */}
                                <button
                                    onClick={() => runNow(cron._id)}
                                    disabled={runningJob === cron._id}
                                    className="p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 transition-colors disabled:opacity-50"
                                >
                                    {runningJob === cron._id ? (
                                        <Loader className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Play className="w-4 h-4" />
                                    )}
                                </button>

                                {/* Toggle Button */}
                                <button
                                    onClick={() => toggleCron(cron._id, !cron.enabled)}
                                    className={`p-2 rounded-lg transition-colors ${cron.enabled
                                        ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                        : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                                        }`}
                                >
                                    {cron.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Schedule & Last Run */}
                        <div className="mt-3 flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                                {editingJob === cron._id ? (
                                    <div className="flex items-center gap-2">
                                        <select
                                            defaultValue={cron.schedule}
                                            onChange={(e) => {
                                                if (e.target.value === 'custom') {
                                                    setCustomCron(cron.schedule);
                                                } else {
                                                    updateSchedule(cron._id, e.target.value);
                                                }
                                            }}
                                            className="bg-zinc-800 text-white px-2 py-1 rounded text-xs border border-zinc-700"
                                        >
                                            {SCHEDULE_PRESETS.map(p => (
                                                <option key={p.value} value={p.value}>{p.label}</option>
                                            ))}
                                        </select>
                                        {customCron !== '' && (
                                            <>
                                                <input
                                                    type="text"
                                                    value={customCron}
                                                    onChange={(e) => setCustomCron(e.target.value)}
                                                    placeholder="*/5 * * * *"
                                                    className="bg-zinc-800 text-white px-2 py-1 rounded text-xs border border-zinc-700 w-28 font-mono"
                                                />
                                                <button
                                                    onClick={() => applyCustomCron(cron._id)}
                                                    className="px-2 py-1 text-xs bg-amber-500 text-black rounded font-semibold"
                                                >
                                                    Apply
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setEditingJob(cron._id)}
                                        className="font-mono text-zinc-400 hover:text-amber-500 transition-colors"
                                    >
                                        {cron.schedule}
                                    </button>
                                )}
                            </div>
                            <span className="text-zinc-600">|</span>
                            <span className="text-zinc-500">
                                Last: {formatLastRun(cron.lastRun)}
                            </span>
                        </div>

                        {/* Error Message */}
                        {cron.lastError && (
                            <div className="mt-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                                {cron.lastError}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
