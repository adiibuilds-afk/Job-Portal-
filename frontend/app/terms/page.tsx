import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-black text-white">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <h1 className="text-4xl font-black mb-8">Terms and Conditions</h1>
                <div className="text-zinc-400 space-y-6 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
                        <p>By accessing JobGrid, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">2. Use License</h2>
                        <p>Permission is granted to temporarily download one copy of the materials on JobGrid's website for personal, non-commercial transitory viewing only.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">3. Disclaimer</h2>
                        <p>The materials on JobGrid's website are provided on an 'as is' basis. JobGrid makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-3">4. Limitations</h2>
                        <p>In no event shall JobGrid or its suppliers be liable for any damages arising out of the use or inability to use the materials on JobGrid's website.</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
