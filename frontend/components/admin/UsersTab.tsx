"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import UserHeader from './users/UserHeader';
import UserTable from './users/UserTable';
import UserPagination from './users/UserPagination';

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
            <UserHeader
                search={search}
                setSearch={setSearch}
                setPage={setPage}
            />

            <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] overflow-hidden">
                <UserTable
                    users={users}
                    loading={loading}
                    editingUserId={editingUserId}
                    editData={editData}
                    setEditData={setEditData}
                    onUpdate={handleUpdateUser}
                    onCancel={() => setEditingUserId(null)}
                    onEdit={startEditing}
                />

                <UserPagination
                    page={page}
                    totalPages={totalPages}
                    setPage={setPage}
                />
            </div>
        </div>
    );
}
