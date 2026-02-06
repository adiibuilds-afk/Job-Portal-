import { format } from 'date-fns';
import { MapPin, Banknote, Calendar, Clock, Eye, Building2 } from 'lucide-react';
import { Job } from '@/types';

interface JobHeaderProps {
    job: Job;
}

export default function JobHeader({ job }: JobHeaderProps) {
    const stats = [
        { icon: MapPin, label: 'Location', value: job.location || 'Not specified', color: 'text-amber-400' },
        { icon: Banknote, label: 'Salary', value: job.salary || 'Not specified', color: 'text-green-400' },
        { icon: Calendar, label: 'Deadline', value: job.lastDate || 'ASAP', color: 'text-orange-400' },
        { icon: Eye, label: 'Views', value: job.views?.toString() || '0', color: 'text-zinc-400' },
    ];

    return (
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden mb-8">
            {/* Gold accent */}
            <div className="h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500"></div>

            {/* Header Content */}
            <div className="p-8 border-b border-zinc-800">
                <div className="flex items-start gap-5 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-amber-500/20 flex items-center justify-center text-2xl font-black text-amber-400 overflow-hidden">
                        {job.companyLogo ? (
                            <img
                                src={job.companyLogo}
                                alt={job.company}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).parentElement!.innerText = job.company.charAt(0);
                                }}
                            />
                        ) : (
                            job.company.charAt(0)
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/20">
                                {job.category}
                            </span>
                            <span className="flex items-center gap-1 text-zinc-500 text-sm">
                                <Clock className="w-3.5 h-3.5" />
                                {format(new Date(job.createdAt), 'MMM dd, yyyy')}
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
                            {job.title}
                        </h1>
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Building2 className="w-4 h-4" />
                            <span className="font-medium">{job.company}</span>
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {stats.map((item, i) => (
                        <div key={i} className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                            <div className="flex items-center gap-2 mb-1">
                                <item.icon className={`w-4 h-4 ${item.color}`} />
                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">{item.label}</span>
                            </div>
                            <p className="text-white font-semibold truncate">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
