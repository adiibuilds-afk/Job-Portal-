"use client";

import React from 'react';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Clock,
    MousePointer,
    BarChart3,
    Bell,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';

export type AdminTab = 'ceo' | 'jobs' | 'users' | 'queue' | 'cron' | 'scraper' | 'analytics' | 'alerts' | 'notifications' | 'audit' | 'health' | 'settings';

interface AdminSidebarProps {
    activeTab: AdminTab;
    setActiveTab: (tab: AdminTab) => void;
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    pendingCount: number;
}

export default function AdminSidebar({
    activeTab,
    setActiveTab,
    isCollapsed,
    setIsCollapsed,
    pendingCount
}: AdminSidebarProps) {

    const menuItems = [
        { id: 'ceo', label: 'CEO Dashboard', icon: LayoutDashboard, color: 'text-amber-500' },
        { id: 'jobs', label: 'Manage Jobs', icon: Briefcase, color: 'text-blue-500' },
        { id: 'users', label: 'User Index', icon: Users, color: 'text-green-500' },
        { id: 'queue', label: 'Bot Queue', icon: Clock, color: 'text-purple-500', badge: pendingCount },
        { id: 'cron', label: 'Cron Control', icon: Clock, color: 'text-cyan-500' },
        { id: 'scraper', label: 'Scraper Test', icon: MousePointer, color: 'text-pink-500' },
        { id: 'analytics', label: 'Deep Analytics', icon: BarChart3, color: 'text-cyan-500' },
        { id: 'alerts', label: 'Batch Alerts', icon: Bell, color: 'text-orange-500' },
        { id: 'notifications', label: 'Broadcasts', icon: Bell, color: 'text-purple-500' },
        { id: 'audit', label: 'Audit Log', icon: BarChart3, color: 'text-indigo-500' },
        { id: 'health', label: 'System Health', icon: Settings, color: 'text-green-500' },
        { id: 'settings', label: 'Global Config', icon: Settings, color: 'text-zinc-400' },
    ];

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-zinc-950 border-r border-zinc-800 transition-all duration-300 z-50 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}
        >
            {/* Logo Section */}
            <div className="p-6 flex items-center gap-3 border-b border-zinc-900/50">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                    <Sparkles className="w-5 h-5 text-black" />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col">
                        <span className="text-white font-black tracking-tighter text-lg leading-none">JobGrid</span>
                        <span className="text-amber-500/60 text-[10px] font-bold uppercase tracking-widest mt-1">Admin Command</span>
                    </div>
                )}
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as AdminTab)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${isActive
                                ? 'bg-amber-500/10 text-white'
                                : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                                }`}
                        >
                            {/* Active Indicator Line */}
                            {isActive && (
                                <div className="absolute left-0 w-1 h-6 bg-amber-500 rounded-r-full" />
                            )}

                            <Icon className={`w-5 h-5 transition-colors ${isActive ? item.color : 'group-hover:text-zinc-300'}`} />

                            {!isCollapsed && (
                                <span className={`font-bold text-sm ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                                    {item.label}
                                </span>
                            )}

                            {/* Badge for Queue */}
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className={`absolute right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isCollapsed ? '-top-1 -right-1' : ''}`}>
                                    {item.badge}
                                </span>
                            )}

                            {/* Tooltip for Collapsed State */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl border border-zinc-800 z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer Section */}
            <div className="p-4 border-t border-zinc-900/50 space-y-2">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-xl transition-all group"
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5 mx-auto" /> : (
                        <>
                            <ChevronLeft className="w-5 h-5" />
                            <span className="font-bold text-sm">Collapse Sidebar</span>
                        </>
                    )}
                </button>

                <Link
                    href="/dashboard"
                    className="w-full flex items-center gap-3 px-3 py-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all group"
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!isCollapsed && <span className="font-bold text-sm">Exit Admin</span>}
                </Link>
            </div>
        </aside>
    );
}
