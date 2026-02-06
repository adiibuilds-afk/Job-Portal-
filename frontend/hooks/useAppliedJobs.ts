import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

export const useAppliedJobs = () => {
    const { data: session } = useSession();
    const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session?.user?.email) {
            fetchAppliedJobs();
        }
    }, [session]);

    const fetchAppliedJobs = async () => {
        if (!session?.user?.email) return;
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile?email=${session.user.email}`);
            const ids = data.user.appliedJobs.map((j: any) => j.jobId._id);
            setAppliedJobIds(ids);
        } catch (error) {
            console.error('Error fetching applied jobs', error);
        }
    };

    const markAsApplied = async (jobId: string) => {
        if (!session) {
            alert('Please login to track your applications!');
            return;
        }

        // Optimistic update
        if (appliedJobIds.includes(jobId)) return; // Already applied

        setAppliedJobIds(prev => [...prev, jobId]);

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/user/applied`, {
                email: session.user?.email,
                jobId
            });
        } catch (error) {
            console.error('Error marking as applied', error);
            // Revert on failure
            setAppliedJobIds(prev => prev.filter(id => id !== jobId));
        }
    };

    const isApplied = (jobId: string) => appliedJobIds.includes(jobId);

    return { appliedJobIds, markAsApplied, isApplied, loading };
};
