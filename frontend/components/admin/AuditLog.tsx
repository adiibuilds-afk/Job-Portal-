"use client";

import { useState, useEffect } from 'react';
import { History, User, Briefcase, Settings, MessageSquare, Filter } from 'lucide-react';

interface AuditLogEntry {
    _id: string;
    action: string;
    category: string;
    details: Record<string, any>;
    adminName: string;
    timestamp: string;
}

const CATEGORY_ICONS: Record<string, any> = {
    user: User,
    job: Briefcase,
    system: Settings,
    forum: MessageSquare,
    cron: Settings,
    settings: Settings
};

const CATEGORY_COLORS: Record<string, string> = {
    user: 'text-blue-500 bg-blue-500/10',
    job: 'text-green-500 bg-green-500/10',
    system: 'text-amber-500 bg-amber-500/10',
    forum: 'text-purple-500 bg-purple-500/10',
    cron: 'text-cyan-500 bg-cyan-500/10',
    settings: 'text-pink-500 bg-pink-500/10'
};

export default function AuditLog() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('');

    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const url = filter
                    ? `${BACKEND_URL}/api/admin/audit-log?category=${filter}`
                    : `${BACKEND_URL}/api/admin/audit-log`;
                const res = await fetch(url);
                const data = await res.json();
                setLogs(data);
            } catch (err) {
                console.error('Failed to fetch audit logs', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [filter]);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    const formatAction = (action: string) => {
        return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <History className="w-5 h-5 text-amber-500" />
                    Audit Log
                </h2>

                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-zinc-500" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-sm border border-zinc-700"
                    >
                        <option value="">All Categories</option>
                        <option value="user">User</option>
                        <option value="job">Job</option>
                        <option value="system">System</option>
                        <option value="forum">Forum</option>
                        <option value="cron">Cron</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-16 bg-zinc-800/50 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                    No audit logs found
                </div>
            ) : (
                <div className="space-y-2">
                    {logs.map(log => {
                        const Icon = CATEGORY_ICONS[log.category] || Settings;
                        const colorClass = CATEGORY_COLORS[log.category] || 'text-zinc-500 bg-zinc-500/10';

                        return (
                            <div
                                key={log._id}
                                className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors"
                            >
                                <div className={`p-2 rounded-lg ${colorClass}`}>
                                    <Icon className="w-4 h-4" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-white">
                                            {formatAction(log.action)}
                                        </span>
                                        <span className="text-xs text-zinc-600">•</span>
                                        <span className="text-xs text-zinc-500">
                                            {formatTime(log.timestamp)}
                                        </span>
                                    </div>

                                    <p className="text-sm text-zinc-400 mt-0.5">
                                        by {log.adminName}
                                        {log.details?.email && ` → ${log.details.email}`}
                                        {log.details?.title && ` → ${log.details.title}`}
                                    </p>
                                </div>

                                <span className="text-xs font-medium px-2 py-1 rounded bg-zinc-800 text-zinc-400 capitalize">
                                    {log.category}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
