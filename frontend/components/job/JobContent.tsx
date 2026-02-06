import { CheckCircle2, ExternalLink } from 'lucide-react';
import { Job } from '@/types';

interface JobContentProps {
    job: Job;
}

export default function JobContent({ job }: JobContentProps) {
    return (
        <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-1 h-6 bg-gradient-to-b from-amber-500 to-yellow-500 rounded-full"></span>
                    Job Description
                </h2>
                <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-base mb-8">
                    {job.description}
                </div>

                <div className="h-px bg-zinc-800 my-8"></div>

                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></span>
                    Eligibility
                </h2>
                <div className="p-5 rounded-xl bg-green-500/5 border border-green-500/20">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <p className="text-zinc-300">{job.eligibility}</p>
                    </div>
                </div>
            </div>

            {/* Apply CTA */}
            <div className="p-8 bg-gradient-to-r from-amber-500/5 via-yellow-500/5 to-amber-500/5 border-t border-zinc-800">
                <div className="text-center max-w-md mx-auto">
                    <h3 className="text-2xl font-black text-white mb-2">Ready to Apply?</h3>
                    <p className="text-zinc-500 mb-6 text-sm">Click below to visit the official application page</p>

                    <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-3 w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-lg rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all group"
                    >
                        Apply Now
                        <ExternalLink className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                </div>
            </div>
        </div>
    );
}
