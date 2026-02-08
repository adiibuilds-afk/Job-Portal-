"use client";

import { useState, useEffect } from 'react';
import { QueueItem } from '@/types';
import QueueHeader from './queue/QueueHeader';
import QueueStats from './queue/QueueStats';
import QueueTable from './queue/QueueTable';
import AddJobModal from './queue/AddJobModal';
import { Plus } from 'lucide-react';

interface QueueTabProps {
    queue: QueueItem[];
    runQueueItem: (id: string) => void;
    deleteQueueItem: (id: string) => void;
    clearQueue: (status?: string) => void;
    refreshQueue?: () => void;
}

export default function QueueTab({ queue, runQueueItem, deleteQueueItem, clearQueue, refreshQueue }: QueueTabProps) {
    const [interval, setInterval] = useState(5);
    const [unit, setUnit] = useState('minutes');
    const [editingInterval, setEditingInterval] = useState(false);
    const [newInterval, setNewInterval] = useState('5');
    const [showAddModal, setShowAddModal] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';

    const pendingCount = queue.filter(q => q.status === 'pending').length;
    const processedCount = queue.filter(q => q.status === 'processed').length;
    const failedCount = queue.filter(q => q.status === 'failed').length;

    useEffect(() => {
        fetchInterval();
    }, []);

    const fetchInterval = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/queue-interval`);
            const data = await res.json();
            setInterval(data.interval || 5);
            setUnit(data.unit || 'minutes');
            setNewInterval(String(data.interval || 5));
        } catch (error) {
            console.error('Failed to fetch queue interval');
        }
    };

    const saveInterval = async () => {
        try {
            // Save Value
            await fetch(`${API_URL}/api/admin/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'queue_interval_value', value: parseInt(newInterval) || 5 })
            });

            // Save Unit
            await fetch(`${API_URL}/api/admin/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'queue_interval_unit', value: unit })
            });

            setInterval(parseInt(newInterval) || 5);
            setEditingInterval(false);
        } catch (error) {
            console.error('Failed to save interval');
        }
    };

    const handleRefresh = () => {
        if (refreshQueue) refreshQueue();
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with Add Button */}
            <div className="flex items-start justify-between gap-4">
                <QueueHeader
                    interval={interval}
                    editingInterval={editingInterval}
                    setEditingInterval={setEditingInterval}
                    newInterval={newInterval}
                    setNewInterval={setNewInterval}
                    saveInterval={saveInterval}
                    unit={unit}
                    setUnit={setUnit}
                />

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Add Job
                </button>
            </div>

            <QueueStats
                pendingCount={pendingCount}
                processedCount={processedCount}
                failedCount={failedCount}
                totalCount={queue.length}
            />

            <QueueTable
                queue={queue}
                pendingCount={pendingCount}
                processedCount={processedCount}
                failedCount={failedCount}
                clearQueue={clearQueue}
                runQueueItem={runQueueItem}
                deleteQueueItem={deleteQueueItem}
                onRefresh={handleRefresh}
                apiUrl={API_URL}
            />

            {/* Add Job Modal */}
            <AddJobModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleRefresh}
                apiUrl={API_URL}
            />
        </div>
    );
}
