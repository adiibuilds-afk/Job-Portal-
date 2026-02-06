import { getJobs } from '@/services/api';
import JobCard from '@/components/JobCard';
import Navbar from '@/components/Navbar';
import LatestJobsTicker from '@/components/LatestJobsTicker';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';
import EmailSubscription from '@/components/EmailSubscription';
import { Job } from '@/types';
import { Search, Crown, TrendingUp, Users, Briefcase, ArrowRight, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let jobs: Job[] = [];
  try {
    jobs = await getJobs();
  } catch (error) {
    console.error('Failed to fetch jobs', error);
  }

  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[120px]"></div>

      {/* Gold grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      <Navbar />
      <LatestJobsTicker />
      {/* Hero Section */}
      <section className="relative pt-44 pb-28 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">#1 Engineering Job Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6">
            Launch Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500">Engineering Career</span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
            Curated opportunities for
            <span className="text-amber-400 font-medium"> Developers</span>,
            <span className="text-amber-400 font-medium"> Data Scientists</span>, and
            <span className="text-amber-400 font-medium"> Core Engineers</span>. From Internships to Senior Roles.
          </p>

          {/* Search Box */}
          <div className="max-w-3xl mx-auto mb-12">
            <form action="/jobs" method="GET">
              <div className="relative p-1 rounded-2xl bg-gradient-to-r from-amber-500/50 via-yellow-500/50 to-amber-500/50">
                <div className="bg-black rounded-xl p-2 flex flex-col md:flex-row items-center gap-2">
                  <div className="flex-1 flex items-center px-5 py-4 w-full">
                    <Search className="w-5 h-5 text-amber-500 mr-4" />
                    <input
                      type="text"
                      name="q"
                      placeholder="Search roles (e.g. React, Java, SDE)..."
                      className="w-full bg-transparent text-white placeholder:text-zinc-500 outline-none text-lg"
                    />
                  </div>
                  <div className="hidden md:block w-px h-10 bg-zinc-800"></div>
                  <div className="flex-1 flex items-center px-5 py-4 w-full">
                    <TrendingUp className="w-5 h-5 text-amber-500 mr-4" />
                    <select name="location" className="w-full bg-transparent text-white outline-none text-lg cursor-pointer">
                      <option value="" className="bg-black">Any Location</option>
                      <option value="remote" className="bg-black">Remote</option>
                      <option value="bangalore" className="bg-black">Bangalore</option>
                      <option value="hyderabad" className="bg-black">Hyderabad</option>
                      <option value="pune" className="bg-black">Pune</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-lg rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] transition-all">
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Popular Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-20">
            <span className="text-zinc-600 text-sm">Trending:</span>
            {['SDE I', 'Full Stack', 'Data Science', '2025 Batch', 'Internship', 'React', 'Python', 'AWS'].map((tag) => (
              <a
                key={tag}
                href={`/jobs?q=${encodeURIComponent(tag)}`}
                className="px-4 py-2 text-sm text-zinc-400 rounded-full bg-zinc-900 border border-zinc-800 hover:border-amber-500/30 hover:text-amber-400 transition-all"
              >
                {tag}
              </a>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Briefcase, value: '500+', label: 'Tech Jobs' },
              { icon: Users, value: '10K+', label: 'Engineers' },
              { icon: TrendingUp, value: '2025', label: 'Batch Focused' },
              { icon: Sparkles, value: 'AI', label: 'Powered Match' },
            ].map((stat, i) => (
              <div key={i} className="bg-zinc-900/60 backdrop-blur border border-zinc-800 rounded-xl p-6 text-center group hover:border-amber-500/30 transition-all">
                <stat.icon className="w-7 h-7 text-amber-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-sm text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="relative px-4 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Main */}
            <div className="lg:w-3/4">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black text-white mb-2">Latest Openings</h2>
                  <p className="text-zinc-500">Fresh opportunities, updated daily</p>
                </div>
                <a href="/jobs" className="hidden md:flex items-center gap-2 text-amber-400 font-semibold hover:text-amber-300 transition-colors">
                  View all <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {jobs.slice(0, 6).map((job, idx) => (
                  <JobCard key={job._id} job={job} index={idx} />
                ))}

                {jobs.length === 0 && (
                  <div className="col-span-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">No Jobs Yet</h3>
                    <p className="text-zinc-500">New opportunities coming soon!</p>
                  </div>
                )}
              </div>

              {jobs.length > 6 && (
                <div className="mt-8 text-center">
                  <a
                    href="/jobs"
                    className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 border border-zinc-800 text-white font-medium rounded-xl hover:border-amber-500/30 hover:text-amber-400 transition-all"
                  >
                    View All Jobs <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-1/4 space-y-6">
              <EmailSubscription />

              <div className="relative p-px rounded-2xl bg-gradient-to-b from-amber-500/50 to-amber-500/0">
                <div className="bg-zinc-900 rounded-2xl p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/25">
                    <Crown className="w-7 h-7 text-black" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Premium Alerts</h3>
                  <p className="text-zinc-500 text-sm mb-5">Get instant job notifications on Telegram</p>
                  <a
                    href="https://t.me/jobgridupdates"
                    target="_blank"
                    className="block w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all"
                  >
                    Join Now
                  </a>
                </div>
              </div>

              <AdBanner slotId="sidebar-1" />
              <AdBanner slotId="sidebar-2" />
            </aside>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
