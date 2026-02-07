import { History as HistoryIcon } from 'lucide-react';
import { Transaction } from './types';

interface HistoryTabProps {
    transactions: Transaction[];
}

export default function HistoryTab({ transactions }: HistoryTabProps) {
    const lifetimeEarnings = transactions?.reduce((acc, tx) => tx.amount > 0 ? acc + tx.amount : acc, 0) || 0;

    return (
        <div className="pt-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-black text-zinc-400 flex items-center gap-2">
                    <HistoryIcon className="w-5 h-5" />
                    Recent activity
                </h3>
                <p className="text-xs font-bold text-zinc-600">Total Earned: {lifetimeEarnings.toFixed(1)} 🪙</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
                {transactions.length > 0 ? (
                    <div className="divide-y divide-zinc-800">
                        {transactions.slice(0, 10).map((tx) => (
                            <div key={tx._id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${tx.amount > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {tx.amount > 0 ? '+' : '-'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white tracking-tight">{tx.description}</p>
                                        <p className="text-[10px] text-zinc-600 font-mono italic uppercase">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`font-black ${tx.amount > 0 ? 'text-green-400' : 'text-zinc-500'}`}>
                                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-10 text-center text-zinc-700 italic font-medium">No transactions found</div>
                )}
            </div>
        </div>
    );
}
