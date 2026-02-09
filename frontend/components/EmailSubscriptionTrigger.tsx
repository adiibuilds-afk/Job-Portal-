"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import EmailSubscriptionModal from './EmailSubscriptionModal';
import { Bell } from 'lucide-react';

export default function EmailSubscriptionTrigger() {
    const { data: session } = useSession();
    const [showModal, setShowModal] = useState(false);
    const [hasShown, setHasShown] = useState(false);

    // Auto-trigger modal after 10 seconds for non-logged-in users
    useEffect(() => {
        // Check local storage to see if shown recently (5 minutes cooldown)
        const lastShown = localStorage.getItem('jobgrid_popup_shown');
        const now = new Date().getTime();

        if (lastShown && (now - parseInt(lastShown)) < 5 * 60 * 1000) {
            setHasShown(true); // Prevent showing if within 5 mins
            return;
        }

        // AUTO-POPUP DISABLED AS PER USER REQUEST
        const ENABLE_AUTO_POPUP = false;

        if (ENABLE_AUTO_POPUP && !session && !hasShown) {
            const timer = setTimeout(() => {
                setShowModal(true);
                setHasShown(true);
                // Save current time to local storage
                localStorage.setItem('jobgrid_popup_shown', new Date().getTime().toString());
            }, 10000); // 10 seconds delay

            return () => clearTimeout(timer);
        }
    }, [session, hasShown]);

    // Don't show anything for logged-in users
    if (session) return null;

    return (
        <>
            {/* Floating Subscribe Button */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-6 right-6 z-50 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black rounded-full shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 transition-all flex items-center gap-2 group"
            >
                <Bell className="w-5 h-5 group-hover:animate-bounce" />
                <span className="hidden md:inline">Get Job Alerts</span>
            </button>

            <EmailSubscriptionModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </>
    );
}
