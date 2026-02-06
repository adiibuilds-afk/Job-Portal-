"use client";

import { useState, useEffect } from 'react';
import { ToggleLeft, ToggleRight, Settings, Zap, Bot, FileText, Clock, Sliders } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SettingsTabProps {
    refreshData: () => void;
}

export default function SettingsTab({ refreshData }: SettingsTabProps) {
    const [settings, setSettings] = useState<Record<string, any>>({
        resume_scorer_enabled: true,
        queue_paused: false,
        posting_queue_paused: false,
        schedule_interval_minutes: 60
    });
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/settings`);
            const data = await res.json();
            setSettings({
                resume_scorer_enabled: data.resume_scorer_enabled !== false,
                queue_paused: data.queue_paused === true,
                posting_queue_paused: data.posting_queue_paused === true,
                schedule_interval_minutes: data.schedule_interval_minutes || 60
            });
        } catch (err) {
            console.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const toggleSetting = async (key: string) => {
        const newValue = !settings[key];
        updateSetting(key, newValue);
    };

    const updateSetting = async (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        try {
            await fetch(`${API_URL}/api/admin/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });
            toast.success(`Setting updated`);
        } catch (err) {
            toast.error("Failed to save setting");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center shrink-0 shadow-lg border border-zinc-700">
                        <Sliders className="w-6 h-6 text-white" />
                    </div>
                    Global Configuration
                </h2>
                <p className="text-zinc-500 font-medium">Control platform features, queues, and automation.</p>
            </div>

            {/* Feature Toggles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Resume Scorer Toggle */}
                <SettingCard
                    title="AI Resume Scorer"
                    description="Allow users to submit resumes for analysis."
                    icon={FileText}
                    isActive={settings.resume_scorer_enabled}
                    onToggle={() => toggleSetting('resume_scorer_enabled')}
                    activeColor="green"
                />

                {/* Resume Queue Pause */}
                <SettingCard
                    title="Resume Queue"
                    description="Pause or resume AI resume processing."
                    icon={Clock}
                    isActive={!settings.queue_paused}
                    onToggle={() => toggleSetting('queue_paused')}
                    activeColor="blue"
                    activeLabel="RUNNING"
                    inactiveLabel="PAUSED"
                />

            </div>

            {/* Bot Posting Controls - Full Width */}
            <div className={`bg-zinc-950 border rounded-[2.5rem] p-8 transition-all ${settings.posting_queue_paused
                ? 'border-red-500/30'
                : 'border-blue-500/30'
                }`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">

                    {/* Left: Toggle */}
                    <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${settings.posting_queue_paused ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
                            <Bot className={`w-7 h-7 ${settings.posting_queue_paused ? 'text-red-500' : 'text-blue-500'}`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-1">
                                <h3 className="font-bold text-xl text-white">Telegram Auto-Posting</h3>
                                <button onClick={() => toggleSetting('posting_queue_paused')} className="transition-transform hover:scale-110">
                                    {settings.posting_queue_paused ? (
                                        <ToggleRight className="w-10 h-10 text-red-500" />
                                    ) : (
                                        <ToggleRight className="w-10 h-10 text-blue-500" />
                                    )}
                                </button>
                            </div>
                            <p className="text-sm text-zinc-500 font-medium">
                                {settings.posting_queue_paused
                                    ? "Posting is PAUSED. Scheduled jobs will not be sent."
                                    : "Posting is ACTIVE. The bot is sending jobs to Telegram."}
                            </p>
                        </div>
                    </div>

                    {/* Right: Interval Config */}
                    <div className="flex items-center gap-4 bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                        <div>
                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Post Interval</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={settings.schedule_interval_minutes}
                                    onChange={(e) => updateSetting('schedule_interval_minutes', parseInt(e.target.value) || 60)}
                                    className="bg-zinc-950 border border-zinc-700 text-white font-mono text-xl font-bold rounded-xl w-20 px-3 py-2 focus:border-blue-500 outline-none text-center"
                                    min="1"
                                />
                                <span className="text-zinc-500 text-sm font-bold">mins</span>
                            </div>
                        </div>
                        <div className="text-xs text-zinc-600 max-w-[140px] font-medium">
                            Time gap between consecutive posts when new jobs are scraped.
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}

// ================= SUBCOMPONENT =================

function SettingCard({
    title,
    description,
    icon: Icon,
    isActive,
    onToggle,
    activeColor = 'green',
    activeLabel = 'ENABLED',
    inactiveLabel = 'DISABLED'
}: {
    title: string;
    description: string;
    icon: any;
    isActive: boolean;
    onToggle: () => void;
    activeColor?: 'green' | 'blue' | 'amber';
    activeLabel?: string;
    inactiveLabel?: string;
}) {
    const colorMap = {
        green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-500' },
        blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500' },
        amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500' },
    };
    const c = isActive ? colorMap[activeColor] : { bg: 'bg-zinc-900', border: 'border-zinc-800', text: 'text-zinc-500' };

    return (
        <div className={`p-6 rounded-[2rem] border transition-all ${c.bg} ${c.border}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-zinc-800 border border-zinc-700 ${isActive ? colorMap[activeColor].text : 'text-zinc-600'}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white">{title}</h3>
                        <p className="text-sm text-zinc-500">{description}</p>
                    </div>
                </div>
                <button onClick={onToggle} className="transition-transform hover:scale-110">
                    {isActive ? (
                        <ToggleRight className={`w-10 h-10 ${colorMap[activeColor].text}`} />
                    ) : (
                        <ToggleLeft className="w-10 h-10 text-zinc-700" />
                    )}
                </button>
            </div>
            <div className={`text-[10px] font-black uppercase tracking-widest ${c.text}`}>
                Status: {isActive ? activeLabel : inactiveLabel}
            </div>
        </div>
    );
}
