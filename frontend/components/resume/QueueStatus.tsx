import { Loader2 } from 'lucide-react';

interface QueueStatusProps {
    position: number;
    waitTime: string;
}

export default function QueueStatus({ position, waitTime }: QueueStatusProps) {
    return (
        <div className="py-20 text-center space-y-6">
            <div className="relative inline-block">
                <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">
                    #{position}
                </div>
            </div>
            <div>
                <h3 className="text-2xl font-black text-white">In Queue...</h3>
                <p className="text-zinc-500 font-medium">Wait Time: <span className="text-amber-500 font-bold">{waitTime}</span></p>
            </div>
            <div className="max-w-xs mx-auto h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 animate-pulse w-2/3" />
            </div>
        </div>
    );
}
