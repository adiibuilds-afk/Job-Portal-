"use client";

import { useState, useEffect } from 'react';

export function useSavedJobs() {
    const [savedIds, setSavedIds] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('savedJobs');
        if (saved) {
            setSavedIds(JSON.parse(saved));
        }
    }, []);

    const toggleSave = (jobId: string) => {
        let newSaved;
        if (savedIds.includes(jobId)) {
            newSaved = savedIds.filter(id => id !== jobId);
        } else {
            newSaved = [...savedIds, jobId];
        }
        setSavedIds(newSaved);
        localStorage.setItem('savedJobs', JSON.stringify(newSaved));
    };

    const isSaved = (jobId: string) => savedIds.includes(jobId);

    return { savedIds, toggleSave, isSaved };
}
