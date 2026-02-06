import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DisclaimerPage() {
    return (
        <main className="min-h-screen bg-black text-white">
            <Suspense fallback={null}>
                <Navbar />
            </Suspense>
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <h1 className="text-4xl font-black mb-8">Disclaimer</h1>
                <div className="text-zinc-400 space-y-6 text-sm leading-relaxed">
                    <p>The information provided on <strong>JobGrid</strong> is for general informational purposes only. All information on the site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability or completeness of any information on the site.</p>

                    <p>Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site. Your use of the site and your reliance on any information on the site is solely at your own risk.</p>

                    <h2 className="text-xl font-bold text-white mt-8 mb-4">External Links Disclaimer</h2>
                    <p>JobGrid may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability or completeness by us.</p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
