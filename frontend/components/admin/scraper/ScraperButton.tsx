import { ArrowRight } from 'lucide-react';

interface ScraperButtonProps {
    name: string;
    emoji: string;
    color: 'indigo' | 'amber' | 'blue';
    onClick: () => void;
}

export default function ScraperButton({ name, emoji, color, onClick }: ScraperButtonProps) {
    const colorMap = {
        indigo: 'from-indigo-500 to-violet-600 shadow-indigo-500/20',
        amber: 'from-amber-500 to-yellow-600 shadow-amber-500/20',
        blue: 'from-blue-500 to-cyan-600 shadow-blue-500/20',
    };

    return (
        <button
            onClick={onClick}
            className={`p-6 bg-gradient-to-br ${colorMap[color]} rounded-3xl text-white font-black text-left shadow-xl hover:scale-105 transition-all group`}
        >
            <div className="text-4xl mb-4">{emoji}</div>
            <div className="flex items-center justify-between">
                <span className="text-xl">{name}</span>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </button>
    );
}
