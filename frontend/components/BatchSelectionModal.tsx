"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Check } from 'lucide-react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface BatchSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBatchSelect?: (batch: string) => void;
}

export default function BatchSelectionModal({ isOpen, onClose, onBatchSelect }: BatchSelectionModalProps) {
    const { data: session, update } = useSession();
    const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const batches = ['2023', '2024', '2025', '2026', '2027', '2028'];

    const handleSave = async () => {
        if (!selectedBatch) return;
        setLoading(true);

        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile/update`, {
                email: session?.user?.email,
                batch: selectedBatch
            });

            await update({
                ...session,
                user: {
                    ...session?.user,
                    batch: selectedBatch
                }
            });

            toast.success("Batch updated successfully!");
            if (onBatchSelect) onBatchSelect(selectedBatch);
            onClose();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update batch");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 z-[70] shadow-2xl"
                    >
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                                <GraduationCap className="w-8 h-8 text-amber-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Select Your Batch</h2>
                            <p className="text-zinc-400 mt-2">
                                We'll show you jobs specifically curated for your graduation year.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {batches.map((batch) => (
                                <button
                                    key={batch}
                                    onClick={() => setSelectedBatch(batch)}
                                    className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all ${selectedBatch === batch
                                        ? 'bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20'
                                        : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-white'
                                        }`}
                                >
                                    {batch}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!selectedBatch || loading}
                                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Saving...' : 'Confirm'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
