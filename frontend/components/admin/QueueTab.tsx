"use client";

import { useState, useEffect } from 'react';
import { QueueItem } from '@/types';
import QueueHeader from './queue/QueueHeader';
import QueueStats from './queue/QueueStats';
import QueueTable from './queue/QueueTable';

interface QueueTabProps {
    queue: QueueItem[];
    runQueueItem: (id: string) => void;
    deleteQueueItem: (id: string) => void;
    clearQueue: (status?: string) => void;
}

export default function QueueTab({ queue, runQueueItem, deleteQueueItem, clearQueue }: QueueTabProps) {
    const [interval, setInterval] = useState(5);
    const [editingInterval, setEditingInterval] = useState(false);
    const [newInterval, setNewInterval] = useState('5');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobgrid-in.onrender.com';

    const pendingCount = queue.filter(q => q.status === 'pending').length;
    const processedCount = queue.filter(q => q.status === 'processed').length;

    useEffect(() => {
        fetchInterval();
    }, []);

    const fetchInterval = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/queue-interval`);
            const data = await res.json();
            setInterval(data.interval || 5);
            setNewInterval(String(data.interval || 5));
        } catch (error) {
            console.error('Failed to fetch queue interval');
        }
    };

    const saveInterval = async () => {
        try {
            await fetch(`${API_URL}/api/admin/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'queue_interval_minutes', value: parseInt(newInterval) || 5 })
            });
            setInterval(parseInt(newInterval) || 5);
            setEditingInterval(false);
        } catch (error) {
            console.error('Failed to save interval');
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <QueueHeader
                interval={interval}
                editingInterval={editingInterval}
                setEditingInterval={setEditingInterval}
                newInterval={newInterval}
                setNewInterval={setNewInterval}
                saveInterval={saveInterval}
            />

            <QueueStats
                pendingCount={pendingCount}
                processedCount={processedCount}
                totalCount={queue.length}
            />

            <QueueTable
                queue={queue}
                pendingCount={pendingCount}
                processedCount={processedCount}
                clearQueue={clearQueue}
                runQueueItem={runQueueItem}
                deleteQueueItem={deleteQueueItem}
            />
        </div>
    );
}
