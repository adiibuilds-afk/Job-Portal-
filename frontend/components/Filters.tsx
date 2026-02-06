"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Briefcase, Calendar, Code2, Globe, Banknote, X, SlidersHorizontal, Sparkles, ChevronDown } from 'lucide-react';

export default function Filters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filters, setFilters] = useState({
        batch: searchParams.get('batch') || '',
        roleType: searchParams.get('roleType') || '',
        jobType: searchParams.get('jobType') || '',
        isRemote: searchParams.get('isRemote') === 'true',
        minSalary: searchParams.get('minSalary') || '',
    });

    const [expanded, setExpanded] = useState({
        batch: true,
        role: true,
        type: true,
        salary: false,
    });

    const updateFilter = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    const applyFilters = (currentFilters: any) => {
        const params = new URLSearchParams(searchParams.toString());

        if (currentFilters.batch) params.set('batch', currentFilters.batch);
        else params.delete('batch');

        if (currentFilters.roleType) params.set('roleType', currentFilters.roleType);
        else params.delete('roleType');

        if (currentFilters.jobType) params.set('jobType', currentFilters.jobType);
        else params.delete('jobType');

        if (currentFilters.isRemote) params.set('isRemote', 'true');
        else params.delete('isRemote');

        if (currentFilters.minSalary) params.set('minSalary', currentFilters.minSalary);
        else params.delete('minSalary');

        params.set('page', '1');
        router.push(`/jobs?${params.toString()}`);
    };

    const clearFilters = () => {
        setFilters({ batch: '', roleType: '', jobType: '', isRemote: false, minSalary: '' });
        router.push('/jobs');
    };

    const activeCount = [filters.batch, filters.roleType, filters.jobType, filters.isRemote, filters.minSalary].filter(Boolean).length;

    return (
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-3xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                            <SlidersHorizontal className="w-4 h-4 text-black" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white">Filters</h3>
                            {activeCount > 0 && (
                                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">{activeCount} Active</span>
                            )}
                        </div>
                    </div>
                    {activeCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg transition-all flex items-center gap-1 border border-red-500/20"
                        >
                            <X className="w-3 h-3" /> Clear
                        </button>
                    )}
                </div>
            </div>

            <div className="p-5 space-y-6">
                {/* Batch Filter */}
                <div>
                    <button
                        onClick={() => setExpanded({ ...expanded, batch: !expanded.batch })}
                        className="w-full flex items-center justify-between mb-3 group"
                    >
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="w-3 h-3" /> Graduation Batch
                        </label>
                        <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${expanded.batch ? 'rotate-180' : ''}`} />
                    </button>
                    {expanded.batch && (
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: '< 2023', value: 'lt-2023' },
                                { label: '2023', value: '2023' },
                                { label: '2024', value: '2024' },
                                { label: '2025', value: '2025' },
                                { label: '2026', value: '2026' },
                                { label: '2027', value: '2027' },
                                { label: '2028', value: '2028' },
                                { label: '2029', value: '2029' },
                                { label: '> 2029', value: 'gt-2029' },
                            ].map((item) => (
                                <button
                                    key={item.value}
                                    onClick={() => updateFilter('batch', filters.batch === item.value ? '' : item.value)}
                                    className={`px-2 py-2 rounded-xl text-xs font-bold border transition-all ${filters.batch === item.value
                                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-transparent shadow-lg shadow-amber-500/20'
                                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600 hover:text-white'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Job Type Toggle */}
                <div>
                    <button
                        onClick={() => setExpanded({ ...expanded, type: !expanded.type })}
                        className="w-full flex items-center justify-between mb-3 group"
                    >
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Briefcase className="w-3 h-3" /> Employment Type
                        </label>
                        <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${expanded.type ? 'rotate-180' : ''}`} />
                    </button>
                    {expanded.type && (
                        <div className="flex bg-zinc-800/50 p-1.5 rounded-2xl border border-zinc-700/50">
                            <button
                                onClick={() => updateFilter('jobType', filters.jobType === 'Internship' ? '' : 'Internship')}
                                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${filters.jobType === 'Internship'
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/20'
                                    : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                🎓 Internship
                            </button>
                            <button
                                onClick={() => updateFilter('jobType', filters.jobType === 'FullTime' ? '' : 'FullTime')}
                                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${filters.jobType === 'FullTime'
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/20'
                                    : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                💼 Full Time
                            </button>
                        </div>
                    )}
                </div>

                {/* Role Type */}
                <div>
                    <button
                        onClick={() => setExpanded({ ...expanded, role: !expanded.role })}
                        className="w-full flex items-center justify-between mb-3 group"
                    >
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Code2 className="w-3 h-3" /> Role Type
                        </label>
                        <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${expanded.role ? 'rotate-180' : ''}`} />
                    </button>
                    {expanded.role && (
                        <div className="relative">
                            <select
                                value={filters.roleType}
                                onChange={(e) => updateFilter('roleType', e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-amber-500/50 appearance-none cursor-pointer font-medium"
                            >
                                <option value="">Any Role</option>
                                <option value="SDE">SDE / Software Engineer</option>
                                <option value="Frontend">Frontend Developer</option>
                                <option value="Backend">Backend Developer</option>
                                <option value="FullStack">Full Stack</option>
                                <option value="QA">QA / Testing</option>
                                <option value="Data Science">Data Science / ML</option>
                                <option value="DevOps">DevOps / Cloud</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                        </div>
                    )}
                </div>

                {/* Salary Range */}
                <div>
                    <button
                        onClick={() => setExpanded({ ...expanded, salary: !expanded.salary })}
                        className="w-full flex items-center justify-between mb-3 group"
                    >
                        <label className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Banknote className="w-3 h-3" /> Min Salary (LPA)
                        </label>
                        <ChevronDown className={`w-4 h-4 text-zinc-600 transition-transform ${expanded.salary ? 'rotate-180' : ''}`} />
                    </button>
                    {expanded.salary && (
                        <div className="space-y-3">
                            <input
                                type="range"
                                min="0"
                                max="50"
                                step="1"
                                value={filters.minSalary || 0}
                                onChange={(e) => updateFilter('minSalary', e.target.value === '0' ? '' : e.target.value)}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                            <div className="flex justify-between text-xs text-zinc-500">
                                <span>0 LPA</span>
                                <span className={`font-black ${filters.minSalary ? 'text-amber-400 text-sm' : 'text-zinc-500'}`}>
                                    {filters.minSalary || 0}+ LPA
                                </span>
                                <span>50+ LPA</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Remote Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 border border-cyan-500/20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-cyan-400" />
                        </div>
                        <span className="text-sm font-bold text-white">Remote Only</span>
                    </div>
                    <button
                        onClick={() => updateFilter('isRemote', !filters.isRemote)}
                        className={`w-12 h-7 rounded-full p-1 transition-all ${filters.isRemote
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/20'
                            : 'bg-zinc-700'
                            }`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${filters.isRemote ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>

                {/* Quick Filters */}
                <div className="pt-4 border-t border-zinc-800">
                    <label className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3 block flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Quick Filters
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => { updateFilter('batch', '2025'); updateFilter('jobType', 'Internship'); }}
                            className="px-3 py-2 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl border border-zinc-700 transition-all"
                        >
                            🎓 2025 Interns
                        </button>
                        <button
                            onClick={() => { updateFilter('roleType', 'SDE'); updateFilter('jobType', 'FullTime'); }}
                            className="px-3 py-2 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl border border-zinc-700 transition-all"
                        >
                            💻 SDE Full-Time
                        </button>
                        <button
                            onClick={() => updateFilter('isRemote', true)}
                            className="px-3 py-2 text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl border border-zinc-700 transition-all"
                        >
                            🌍 Remote Jobs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
