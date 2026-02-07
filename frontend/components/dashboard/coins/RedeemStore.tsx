import { motion } from 'framer-motion';
import { ShoppingBag, Coins } from 'lucide-react';
import { CoinsData } from './types';
import { STORE_PERKS } from './constants';

interface RedeemStoreProps {
    data: CoinsData | null;
    redeeming: string | null;
    onRedeem: (id: string) => Promise<void>;
}

export default function RedeemStore({ data, redeeming, onRedeem }: RedeemStoreProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                    <ShoppingBag className="w-6 h-6 text-amber-500" />
                    Redeem Store
                </h3>
                <span className="text-zinc-500 text-xs font-bold uppercase">Spend your coins</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STORE_PERKS.map((perk) => (
                    <motion.div
                        key={perk.id}
                        whileHover={{ y: -5 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center text-center group"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-black transition-colors duration-500">
                            <perk.icon className="w-8 h-8" />
                        </div>
                        <h4 className="font-black text-white mb-2">{perk.name}</h4>
                        <p className="text-xs text-zinc-500 mb-6 leading-relaxed">{perk.desc}</p>
                        <button
                            disabled={redeeming === perk.id || (data?.balance || 0) < perk.cost}
                            onClick={() => onRedeem(perk.id)}
                            className={`mt-auto w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${(data?.balance || 0) >= perk.cost
                                ? 'bg-zinc-800 hover:bg-white hover:text-black text-white border border-zinc-700'
                                : 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800'
                                }`}
                        >
                            {redeeming === perk.id ? '...' : <><Coins className="w-4 h-4" /> {perk.cost}</>}
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
