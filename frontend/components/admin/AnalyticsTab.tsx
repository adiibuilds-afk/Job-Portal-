"use client";

import { BarChart3 } from 'lucide-react';
import MetricOverview from './analytics/MetricOverview';
import GrowthChart from './analytics/GrowthChart';
import EngagementChart from './analytics/EngagementChart';
import CleanupUtility from './analytics/CleanupUtility';

interface AnalyticsTabProps {
    chartData: any[];
    runCleanup: () => void;
    cleaning: boolean;
}

export default function AnalyticsTab({ chartData, runCleanup, cleaning }: AnalyticsTabProps) {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    Deep Analytics
                </h2>
                <p className="text-zinc-500 font-medium">Platform trends, engagement metrics, and intelligence.</p>
            </div>

            <MetricOverview chartData={chartData} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GrowthChart data={chartData} />
                <EngagementChart data={chartData} />
            </div>

            <CleanupUtility onRun={runCleanup} loading={cleaning} />
        </div>
    );
}
