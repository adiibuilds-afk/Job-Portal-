import { Suspense } from 'react';
import Footer from '@/components/Footer';
import { Mail, MapPin, Globe } from 'lucide-react';

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-black text-white">
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20 text-center">
                <h1 className="text-5xl font-black mb-4">Get in Touch</h1>
                <p className="text-zinc-500 mb-12">Have questions or feedback? We'd love to hear from you.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl">
                        <Mail className="w-8 h-8 text-amber-500 mx-auto mb-4" />
                        <h3 className="font-bold text-white mb-2">Email</h3>
                        <p className="text-zinc-400">support@jobgrid.in</p>
                    </div>
                    <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl">
                        <MapPin className="w-8 h-8 text-amber-500 mx-auto mb-4" />
                        <h3 className="font-bold text-white mb-2">Location</h3>
                        <p className="text-zinc-400">Remote, India</p>
                    </div>
                    <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-3xl">
                        <Globe className="w-8 h-8 text-amber-500 mx-auto mb-4" />
                        <h3 className="font-bold text-white mb-2">Website</h3>
                        <p className="text-zinc-400">www.jobgrid.in</p>
                    </div>
                </div>

                <div className="mt-20 bg-amber-500/5 border border-amber-500/10 p-10 rounded-3xl">
                    <h2 className="text-2xl font-bold mb-4">Business Inquiries</h2>
                    <p className="text-zinc-400">For partnership opportunities or advertising, please reach out via email.</p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
