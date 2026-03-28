import { Suspense } from 'react';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-black text-white">
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>
                <div className="text-zinc-400 space-y-6 text-sm leading-relaxed">
                    <p>Last updated: February 05, 2026</p>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
                        <p>We collect information you provide directly to us (like email addresses for subscriptions) and information collected automatically through cookies and similar technologies when you use our site.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
                        <p>Your information is used to provide, maintain, and improve our services, send newsletters, and show relevant job listings. We do not sell your personal data to third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. Data Security</h2>
                        <p>We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Third-Party Links</h2>
                        <p>Our site contains links to external job boards. We are not responsible for the privacy practices of those sites.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">5. Google AdSense & Advertising</h2>
                        <p>We use Google AdSense to display ads on our platform. Google, as a third-party vendor, uses cookies to serve ads based on your prior visits to our site or other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your internet usage. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noreferrer" className="text-amber-500 hover:underline">Google Ads Settings</a>.</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
