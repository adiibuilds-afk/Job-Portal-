import { Mail, Coins, Edit2, Check, X } from 'lucide-react';

interface UserTableProps {
    users: any[];
    loading: boolean;
    editingUserId: string | null;
    editData: any;
    setEditData: (val: any) => void;
    onUpdate: (id: string) => void;
    onCancel: () => void;
    onEdit: (user: any) => void;
}

const TIERS = ['Bronze', 'Silver', 'Gold', 'Diamond'];

export default function UserTable(props: UserTableProps) {
    const { users, loading, editingUserId, editData, setEditData, onUpdate, onCancel, onEdit } = props;

    return (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-zinc-900/50 border-b border-zinc-800">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Identity</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Tier</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Grid Coins</th>
                        <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td colSpan={4} className="px-6 py-8"><div className="h-4 bg-zinc-800 rounded w-1/3 mx-auto"></div></td>
                            </tr>
                        ))
                    ) : users.map((user) => (
                        <tr key={user._id} className="hover:bg-zinc-800/20 transition-colors group">
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700 font-black text-xs text-zinc-400">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        {editingUserId === user._id ? (
                                            <input
                                                type="text"
                                                value={editData.name}
                                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm text-white"
                                            />
                                        ) : (
                                            <div className="font-bold text-white leading-none mb-1">{user.name}</div>
                                        )}
                                        <div className="text-xs text-zinc-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                                {editingUserId === user._id ? (
                                    <select
                                        value={editData.tier}
                                        onChange={(e) => setEditData({ ...editData, tier: e.target.value })}
                                        className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white outline-none"
                                    >
                                        {TIERS.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                ) : (
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.tier === 'Diamond' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500' :
                                        user.tier === 'Gold' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                                            user.tier === 'Silver' ? 'bg-zinc-400/10 border-zinc-400/20 text-zinc-400' :
                                                'bg-orange-500/10 border-orange-500/20 text-orange-500'
                                        }`}>
                                        {user.tier || 'Bronze'}
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-5 text-center">
                                {editingUserId === user._id ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Coins className="w-3 h-3 text-amber-500" />
                                        <input
                                            type="number"
                                            value={editData.gridCoins}
                                            onChange={(e) => setEditData({ ...editData, gridCoins: parseFloat(e.target.value) })}
                                            className="w-16 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white text-center"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-1.5 font-black text-white">
                                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                                        {user.gridCoins?.toFixed(1) || 0}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-5 text-right">
                                {editingUserId === user._id ? (
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => onUpdate(user._id)} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all"><Check className="w-4 h-4" /></button>
                                        <button onClick={onCancel} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"><X className="w-4 h-4" /></button>
                                    </div>
                                ) : (
                                    <button onClick={() => onEdit(user)} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
