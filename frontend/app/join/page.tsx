"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Gift, Loader2, ArrowRight } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

function JoinContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const [referralCode, setReferralCode] = useState<string | null>(null);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        const ref = searchParams.get("ref");
        if (ref) {
            setReferralCode(ref.toUpperCase());
            localStorage.setItem("pendingReferral", ref.toUpperCase());
        } else {
            const stored = localStorage.getItem("pendingReferral");
            if (stored) setReferralCode(stored);
        }
    }, [searchParams]);

    useEffect(() => {
        // Auto-apply referral if user is logged in
        const applyReferral = async () => {
            if (status === "authenticated" && session?.user?.email && referralCode) {
                setApplying(true);
                try {
                    const { data } = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/user/referral/apply`,
                        { email: session.user.email, referralCode }
                    );
                    if (data.success) {
                        toast.success(data.message || "Referral applied! +2.5 coins");
                        localStorage.removeItem("pendingReferral");
                    } else {
                        toast.error(data.message || "Could not apply referral");
                    }
                } catch (error: any) {
                    console.error("Referral apply error:", error);
                    toast.error(error.response?.data?.error || "Failed to apply referral");
                } finally {
                    setApplying(false);
                    router.push("/dashboard");
                }
            }
        };

        if (status !== "loading") {
            applyReferral();
        }
    }, [status, session, referralCode, router]);

    const handleSignIn = () => {
        signIn("google", { callbackUrl: "/join" });
    };

    if (status === "loading" || applying) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400 font-medium">
                        {applying ? "Applying your referral bonus..." : "Loading..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Gift className="w-10 h-10 text-black" />
                    </div>

                    <h1 className="text-3xl font-black text-white mb-2">
                        You've Been Invited!
                    </h1>

                    {referralCode && (
                        <div className="bg-zinc-800 rounded-xl px-4 py-3 mb-6 inline-block">
                            <p className="text-zinc-400 text-sm">Referral Code</p>
                            <p className="text-2xl font-mono font-black text-amber-500 tracking-widest">
                                {referralCode}
                            </p>
                        </div>
                    )}

                    <p className="text-zinc-400 mb-8">
                        Sign up now and get <span className="text-amber-400 font-bold">+2.5 Grid Coins</span> as a welcome bonus!
                    </p>

                    {status === "unauthenticated" ? (
                        <button
                            onClick={handleSignIn}
                            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            Sign Up with Google
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="w-full bg-zinc-800 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors"
                        >
                            Go to Dashboard
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}

                    <p className="text-zinc-600 text-xs mt-6">
                        By signing up, you agree to our Terms of Service
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function JoinPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
            </div>
        }>
            <JoinContent />
        </Suspense>
    );
}
