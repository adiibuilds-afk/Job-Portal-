import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';

export function useSavedJobs() {
    const { data: session } = useSession();
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session?.user?.email) {
            fetchSavedJobs();
        } else {
            // Clear if logout
            setSavedIds([]);
        }
    }, [session]);

    const fetchSavedJobs = async () => {
        if (!session?.user?.email) return;
        try {
            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile?email=${session.user.email}`);
            setSavedIds(data.user.savedJobs
                .filter((j: any) => j)
                .map((j: any) => j._id));
        } catch (error) {
            console.error('Error fetching saved jobs', error);
        }
    };

    const toggleSave = async (jobId: string) => {
        if (!session) {
            alert('Please login to save jobs!');
            return;
        }

        const isCurrentlySaved = savedIds.includes(jobId);

        // Optimistic update
        if (isCurrentlySaved) {
            setSavedIds(prev => prev.filter(id => id !== jobId));
        } else {
            setSavedIds(prev => [...prev, jobId]);
        }

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/user/saved`, {
                email: session.user?.email,
                jobId
            });
        } catch (error) {
            console.error('Error toggling save', error);
            // Revert
            if (isCurrentlySaved) {
                setSavedIds(prev => [...prev, jobId]);
            } else {
                setSavedIds(prev => prev.filter(id => id !== jobId));
            }
        }
    };

    const isSaved = (jobId: string) => savedIds.includes(jobId);

    return { savedIds, toggleSave, isSaved, loading };
}
