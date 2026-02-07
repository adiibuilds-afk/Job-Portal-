import Navbar from '@/components/Navbar';
import LatestJobsTicker from '@/components/LatestJobsTicker';
import Footer from '@/components/Footer';
import dynamicImport from 'next/dynamic';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Briefcase, Users, TrendingUp, Sparkles, Crown } from 'lucide-react';
import LandingSearchTags from '@/components/home/LandingSearchTags';
import HeroSearch from '@/components/home/HeroSearch';

const HiringHeatmap = dynamicImport(() => import('@/components/home/HiringHeatmap'));
const FeatureShowcase = dynamicImport(() => import('@/components/home/FeatureShowcase'));
const LogoCloud = dynamicImport(() => import('@/components/home/LogoCloud'));
const Testimonials = dynamicImport(() => import('@/components/home/Testimonials'));
const CTABanner = dynamicImport(() => import('@/components/home/CTABanner'));

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/jobs");
  }

  return (
    <main className="min-h-screen bg-black relative overflow-hidden text-zinc-300">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[120px]"></div>

      {/* Gold grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(245,158,11,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

      <Navbar />
      <div className="pt-28 relative z-10">
        <LatestJobsTicker />
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">#1 Engineering Job Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-[85px] font-black text-white leading-[0.95] tracking-tight mb-8">
            The Future of
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 font-extrabold italic">Engineering Hiring</span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            AI-powered discovery for
            <span className="text-white font-bold px-2 underline decoration-amber-500/50">2024, 2025, 2026, 2027 & 2028</span>
            batches. Land your dream SDE role today.
          </p>

          {/* Search Box */}
          <HeroSearch />

          {/* Popular Tags */}
          <LandingSearchTags tags={['SDE-1', '2026 Batch', '2027 Batch', '2028 Batch', 'Remote', 'Frontend', 'Backend', 'Internships']} />
        </div>
      </section>

      {/* Social Proof */}
      <LogoCloud />

      {/* Features */}
      <FeatureShowcase />

      {/* Stats Section */}
      <section className="py-24 px-4 bg-black">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Briefcase, value: `12K+`, label: 'Live Tech Jobs' },
            { icon: Users, value: '25K+', label: 'Monthly Users' },
            { icon: TrendingUp, value: '2024-29', label: 'Batch Focused' },
            { icon: Sparkles, value: '98%', label: 'AI Match Rate' },
          ].map((stat, i) => (
            <div key={i} className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-2xl p-8 text-center group hover:border-amber-500/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                <stat.icon className="w-6 h-6 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-white mb-2">{stat.value}</div>
              <div className="text-xs font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Heatmap - Power User Feature (moved lower) */}
      <section className="py-24 bg-zinc-950/50 border-y border-zinc-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[100px]"></div>
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4">Real-time Hiring Activity</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">Monitor global engineering hiring trends happening right now on JobGrid.</p>
          </div>
          <HiringHeatmap />
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Banner with View All Jobs */}
      <CTABanner />

      <Footer />
    </main>
  );
}
