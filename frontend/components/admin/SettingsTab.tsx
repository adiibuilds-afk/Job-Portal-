"use client";

import { useState, useEffect } from 'react';
import { Sliders } from 'lucide-react';
import { toast } from 'react-hot-toast';
import FeatureToggles from './settings/FeatureToggles';
import BotPostingControls from './settings/BotPostingControls';

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
            if (key === 'schedule_interval_minutes') refreshData();
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

            <FeatureToggles
                settings={settings}
                toggleSetting={toggleSetting}
            />

            <BotPostingControls
                postingQueuePaused={settings.posting_queue_paused}
                onToggle={() => toggleSetting('posting_queue_paused')}
                interval={settings.schedule_interval_minutes}
                onIntervalChange={(val) => updateSetting('schedule_interval_minutes', val)}
            />
        </div>
    );
}
