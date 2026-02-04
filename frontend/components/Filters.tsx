"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Briefcase, Calendar, Code2, Globe, Banknote, X } from 'lucide-react';

export default function Filters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial state from URL
    const [filters, setFilters] = useState({
        batch: searchParams.get('batch') || '',
        roleType: searchParams.get('roleType') || '',
        jobType: searchParams.get('jobType') || '',
        isRemote: searchParams.get('isRemote') === 'true',
        minSalary: searchParams.get('minSalary') || '',
    });

    // Update filters
    const updateFilter = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        applyFilters(newFilters);
    };

    // Apply to URL
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

        // Reset page to 1
        params.set('page', '1');

        router.push(`/jobs?${params.toString()}`);
    };

    const clearFilters = () => {
        setFilters({ batch: '', roleType: '', jobType: '', isRemote: false, minSalary: '' });
        router.push('/jobs');
    };

    return (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Filters</h3>
                {(filters.batch || filters.roleType || filters.jobType || filters.isRemote || filters.minSalary) && (
                    <button onClick={clearFilters} className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1">
                        <X className="w-3 h-3" /> Clear
                    </button>
                )}
            </div>

            {/* Batch Filter */}
            <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Batch
                </label>
                <div className="flex flex-wrap gap-2">
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
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${filters.batch === item.value
                                ? 'bg-amber-500 text-black border-amber-500'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600'
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Role Type */}
            <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                    <Code2 className="w-3 h-3" /> Role
                </label>
                <select
                    value={filters.roleType}
                    onChange={(e) => updateFilter('roleType', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-2.5 text-sm text-white outline-none focus:border-amber-500/50"
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
            </div>

            {/* Job Type */}
            <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                    <Briefcase className="w-3 h-3" /> Job Type
                </label>
                <div className="flex bg-zinc-800 p-1 rounded-xl">
                    <button
                        onClick={() => updateFilter('jobType', 'Internship')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${filters.jobType === 'Internship' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        Internship
                    </button>
                    <button
                        onClick={() => updateFilter('jobType', 'FullTime')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${filters.jobType === 'FullTime' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                            }`}
                    >
                        Full Time
                    </button>
                </div>
            </div>

            {/* Min Salary */}
            <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                    <Banknote className="w-3 h-3" /> Min Salary (LPA)
                </label>
                <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={filters.minSalary || 0}
                    onChange={(e) => updateFilter('minSalary', e.target.value)}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-2">
                    <span>0 LPA</span>
                    <span className="text-amber-400 font-bold">{filters.minSalary || 0}+ LPA</span>
                    <span>50+ LPA</span>
                </div>
            </div>

            {/* Remote Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-zinc-300">Remote Only</span>
                </div>
                <button
                    onClick={() => updateFilter('isRemote', !filters.isRemote)}
                    className={`w-10 h-6 rounded-full p-1 transition-colors ${filters.isRemote ? 'bg-blue-500' : 'bg-zinc-700'}`}
                >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${filters.isRemote ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
            </div>
        </div>
    );
}
