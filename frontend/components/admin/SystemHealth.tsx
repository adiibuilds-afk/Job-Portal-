"use client";

import { useState, useEffect } from 'react';
import { Activity, Database, Clock, Cpu, HardDrive, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface HealthData {
    status: string;
    database: string;
    crons: {
        total: number;
        active: number;
        failed: number;
    };
    uptime: number;
    memory: {
        heapUsed: number;
        heapTotal: number;
        rss: number;
    };
}

export default function SystemHealth() {
    const [health, setHealth] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const fetchHealth = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/health`);
            const data = await res.json();
            setHealth(data);
        } catch (err) {
            console.error('Failed to fetch health', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatUptime = (seconds: number) => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    const formatBytes = (bytes: number) => {
        return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    };

    const StatusIndicator = ({ good }: { good: boolean }) => (
        good
            ? <CheckCircle className="w-4 h-4 text-green-500" />
            : <XCircle className="w-4 h-4 text-red-500" />
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-500" />
                    System Health
                </h2>
                <button
                    onClick={fetchHealth}
                    disabled={loading}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Overall Status */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                        <StatusIndicator good={health?.status === 'ok'} />
                        <span className="text-sm text-zinc-400">Status</span>
                    </div>
                    <p className="text-xl font-bold text-white capitalize">
                        {health?.status || 'Unknown'}
                    </p>
                </div>

                {/* Database */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Database className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-zinc-400">Database</span>
                    </div>
                    <p className="text-xl font-bold text-white capitalize">
                        {health?.database || 'Unknown'}
                    </p>
                </div>

                {/* Uptime */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-zinc-400">Uptime</span>
                    </div>
                    <p className="text-xl font-bold text-white">
                        {health ? formatUptime(health.uptime) : '...'}
                    </p>
                </div>

                {/* Memory */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-zinc-400">Memory</span>
                    </div>
                    <p className="text-xl font-bold text-white">
                        {health ? formatBytes(health.memory.heapUsed) : '...'}
                    </p>
                </div>
            </div>

            {/* Cron Status */}
            {health?.crons && (
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
                    <h3 className="text-sm font-medium text-zinc-400 mb-3">Cron Jobs</h3>
                    <div className="flex items-center gap-6">
                        <div>
                            <span className="text-2xl font-bold text-white">{health.crons.total}</span>
                            <span className="text-sm text-zinc-500 ml-1">Total</span>
                        </div>
                        <div>
                            <span className="text-2xl font-bold text-green-500">{health.crons.active}</span>
                            <span className="text-sm text-zinc-500 ml-1">Active</span>
                        </div>
                        <div>
                            <span className="text-2xl font-bold text-red-500">{health.crons.failed}</span>
                            <span className="text-sm text-zinc-500 ml-1">Failed</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
