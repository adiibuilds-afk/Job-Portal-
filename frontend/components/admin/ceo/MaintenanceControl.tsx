import { Globe, AlertCircle, LogOut, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function MaintenanceControl() {
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [maintenanceEta, setMaintenanceEta] = useState('30');
    const [customEta, setCustomEta] = useState('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';

    useEffect(() => {
        fetchMaintenanceStatus();
    }, []);

    const fetchMaintenanceStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/settings`);
            const settings = await res.json();
            setIsMaintenance(settings.maintenance_mode === true);
        } catch (error) { }
    };

    const toggleMaintenance = async () => {
        if (!confirm(`Are you sure you want to ${isMaintenance ? 'disable' : 'enable'} maintenance mode?`)) return;
        setToggling(true);
        try {
            await fetch(`${API_URL}/api/admin/maintenance/toggle`, { method: 'POST' });
            setIsMaintenance(!isMaintenance);
            toast.success(`Maintenance mode ${!isMaintenance ? 'enabled' : 'disabled'}`);
        } catch (error) {
            toast.error("Toggle failed");
        } finally {
            setToggling(false);
        }
    };

    return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-[2.5rem] p-8 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl -mr-16 -mt-16 transition-all ${isMaintenance ? 'bg-red-500/20' : 'bg-amber-500/5 group-hover:bg-amber-500/10'}`} />
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Globe className="w-6 h-6 text-amber-500" /> Maintenance Center
            </h3>
            <p className="text-zinc-500 text-sm mb-4 leading-relaxed">
                Toggle the site into maintenance mode. Set an ETA so users know when to return.
            </p>

            <div className="mb-6">
                <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Estimated Downtime</label>
                <div className="grid grid-cols-2 gap-3">
                    <select
                        value={maintenanceEta}
                        onChange={(e) => setMaintenanceEta(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-amber-500 transition-all outline-none"
                    >
                        <option value="15">~15 Minutes</option>
                        <option value="30">~30 Minutes</option>
                        <option value="60">~1 Hour</option>
                        <option value="120">~2 Hours</option>
                        <option value="custom">Custom</option>
                    </select>
                    {maintenanceEta === 'custom' && (
                        <input
                            type="text"
                            placeholder="e.g., Until 6 PM IST"
                            value={customEta}
                            onChange={(e) => setCustomEta(e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-amber-500 transition-all outline-none"
                        />
                    )}
                </div>
            </div>

            <button
                onClick={toggleMaintenance}
                disabled={toggling}
                className={`w-full py-4 border font-bold rounded-2xl transition-all flex items-center justify-center gap-3 ${isMaintenance
                    ? 'bg-red-500 text-white border-red-500 hover:bg-red-600'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500'
                    }`}
            >
                {toggling ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isMaintenance ? (
                    <>
                        <LogOut className="w-5 h-5" />
                        Disable Maintenance Mode
                    </>
                ) : (
                    <>
                        <AlertCircle className="w-5 h-5" />
                        Activate for {maintenanceEta === 'custom' ? customEta || '?' : `~${maintenanceEta} mins`}
                    </>
                )}
            </button>
            <p className="text-[10px] text-zinc-600 mt-4 text-center font-bold uppercase tracking-widest">
                {isMaintenance ? 'Site is currently hidden from public' : 'Only use during critical updates'}
            </p>
        </div>
    );
}
