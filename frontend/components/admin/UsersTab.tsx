"use client";

import React, { useState, useEffect } from 'react';
import { Users, Search, Award, Shield, Mail, Coins, Edit2, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface UsersTabProps {
    apiUrl: string;
}

export default function UsersTab({ apiUrl }: UsersTabProps) {
    const [users, setUsers] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editData, setEditData] = useState({ name: '', tier: '', gridCoins: 0 });

    const roles = ['Bronze', 'Silver', 'Gold', 'Diamond'];

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${apiUrl}/api/admin/users?search=${search}&page=${page}`);
            setUsers(res.data.users);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (userId: string) => {
        try {
            await axios.put(`${apiUrl}/api/admin/users/${userId}`, editData);
            toast.success("User updated successfully");
            setEditingUserId(null);
            fetchUsers();
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const startEditing = (user: any) => {
        setEditingUserId(user._id);
        setEditData({ name: user.name, tier: user.tier, gridCoins: user.gridCoins });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/50 p-6 rounded-[2rem] border border-zinc-800">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        <Users className="w-6 h-6 text-green-500" /> User Index
                    </h2>
                    <p className="text-zinc-500 text-sm font-medium mt-1">Manage platform participants and rewards.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-green-500/50 transition-all font-medium"
                    />
                </div>
            </div>

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
                                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
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
                                            <button onClick={() => handleUpdateUser(user._id)} className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-all"><Check className="w-4 h-4" /></button>
                                            <button onClick={() => setEditingUserId(null)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"><X className="w-4 h-4" /></button>
                                        </div>
                                    ) : (
                                        <button onClick={() => startEditing(user)} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="p-6 bg-zinc-900/50 flex items-center justify-between border-t border-zinc-800">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
