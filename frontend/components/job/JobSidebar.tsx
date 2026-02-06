import JobActions from '@/components/JobActions';
import AdBanner from '@/components/AdBanner';
import { Job } from '@/types';

interface JobSidebarProps {
    job: Job;
    slug: string;
}

export default function JobSidebar({ job, slug }: JobSidebarProps) {
    const showDetails = (job.batch && job.batch.length > 0) || job.jobType || job.isRemote || (job.tags && job.tags.length > 0);

    return (
        <div className="sticky top-32 space-y-6">
            {/* Quick Actions */}
            <JobActions jobId={job._id} jobTitle={job.title} jobSlug={slug} />

            {/* Job Details Tags */}
            {showDetails && (
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                    <h4 className="font-bold text-white mb-4">Job Details</h4>
                    <div className="flex flex-wrap gap-2">
                        {job.batch?.map((b: string) => (
                            <span key={b} className="px-3 py-1.5 text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg">
                                {b} Batch
                            </span>
                        ))}
                        {job.jobType && (
                            <span className="px-3 py-1.5 text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg">
                                {job.jobType}
                            </span>
                        )}
                        {job.isRemote && (
                            <span className="px-3 py-1.5 text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg">
                                🌍 Remote
                            </span>
                        )}
                        {job.roleType && (
                            <span className="px-3 py-1.5 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg">
                                {job.roleType}
                            </span>
                        )}
                    </div>
                    {job.tags && job.tags.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-zinc-800">
                            <p className="text-xs text-zinc-500 mb-2">Tech Stack</p>
                            <div className="flex flex-wrap gap-2">
                                {job.tags.map((tag: string) => (
                                    <span key={tag} className="px-2 py-1 text-xs bg-zinc-800 text-zinc-400 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Share */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6">
                <h4 className="font-bold text-white mb-4">Share Job</h4>
                <div className="flex gap-3">
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent(`Check out this job: ${job.title} at ${job.company}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 rounded-xl bg-green-500/10 text-green-400 font-semibold text-sm hover:bg-green-500/20 transition-colors border border-green-500/20 text-center"
                    >
                        WhatsApp
                    </a>
                    <a
                        href={`https://t.me/share/url?url=&text=${encodeURIComponent(`${job.title} at ${job.company}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 rounded-xl bg-blue-500/10 text-blue-400 font-semibold text-sm hover:bg-blue-500/20 transition-colors border border-blue-500/20 text-center"
                    >
                        Telegram
                    </a>
                </div>
            </div>

            {/* Warning */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
                <p className="text-sm text-amber-400/80">⚠️ Never pay for job applications. Report suspicious listings.</p>
            </div>

            <AdBanner slotId="sidebar-1" />
        </div>
    );
}
