import { ToggleLeft, ToggleRight } from 'lucide-react';

interface SettingCardProps {
    title: string;
    description: string;
    icon: any;
    isActive: boolean;
    onToggle: () => void;
    activeColor?: 'green' | 'blue' | 'amber';
    activeLabel?: string;
    inactiveLabel?: string;
}

export default function SettingCard({
    title,
    description,
    icon: Icon,
    isActive,
    onToggle,
    activeColor = 'green',
    activeLabel = 'ENABLED',
    inactiveLabel = 'DISABLED'
}: SettingCardProps) {
    const colorMap = {
        green: { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-500' },
        blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500' },
        amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-500' },
    };
    const c = isActive ? colorMap[activeColor] : { bg: 'bg-zinc-900', border: 'border-zinc-800', text: 'text-zinc-500' };

    return (
        <div className={`p-6 rounded-[2rem] border transition-all ${c.bg} ${c.border}`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-zinc-800 border border-zinc-700 ${isActive ? colorMap[activeColor].text : 'text-zinc-600'}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white">{title}</h3>
                        <p className="text-sm text-zinc-500">{description}</p>
                    </div>
                </div>
                <button onClick={onToggle} className="transition-transform hover:scale-110">
                    {isActive ? (
                        <ToggleRight className={`w-10 h-10 ${colorMap[activeColor].text}`} />
                    ) : (
                        <ToggleLeft className="w-10 h-10 text-zinc-700" />
                    )}
                </button>
            </div>
            <div className={`text-[10px] font-black uppercase tracking-widest ${c.text}`}>
                Status: {isActive ? activeLabel : inactiveLabel}
            </div>
        </div>
    );
}
