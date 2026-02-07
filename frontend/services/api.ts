import axios from 'axios';
import { Job } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';

export async function getJobs(params?: {
    q?: string;
    category?: string;
    location?: string;
    page?: number;
    batch?: string;
    tags?: string; // Tag to filter by
    jobType?: string;
    roleType?: string;
    minSalary?: number;
    isRemote?: boolean;
    ids?: string[];
}) {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set('q', params.q);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.location) searchParams.set('location', params.location);
    if (params?.page) searchParams.set('page', params.page.toString());

    // New Filters
    if (params?.batch) searchParams.set('batch', params.batch);
    if (params?.tags) searchParams.set('tags', params.tags);
    if (params?.jobType) searchParams.set('jobType', params.jobType);
    if (params?.roleType) searchParams.set('roleType', params.roleType);
    if (params?.minSalary) searchParams.set('minSalary', params.minSalary.toString());
    if (params?.isRemote) searchParams.set('isRemote', 'true');
    if (params?.ids && params.ids.length > 0) searchParams.set('ids', params.ids.join(','));

    const queryString = searchParams.toString();
    const url = `${API_URL}/api/jobs${queryString ? `?${queryString}` : ''}`;

    const res = await axios.get(url);

    return res.data;
}

export async function getJobBySlug(slug: string): Promise<Job> {
    const res = await axios.get(`${API_URL}/api/jobs/${slug}`);
    return res.data;
}

export async function trackClick(id: string) {
    const res = await axios.post(`${API_URL}/api/jobs/${id}/click`);
    return res.data;
}

export async function getAnalytics() {
    const res = await axios.get(`${API_URL}/api/analytics`);
    return res.data;
}

export async function subscribeEmail(email: string) {
    const res = await axios.post(`${API_URL}/api/subscribe`, { email });
    return res.data;
}

export async function reportJob(id: string, reason: string) {
    const res = await axios.post(`${API_URL}/api/jobs/${id}/report`, { reason });
    return res.data;
}

// Public Dashboard Stats
export async function getPublicStats() {
    const res = await axios.get(`${API_URL}/api/stats`);
    return res.data;
}

// Similar Jobs
export async function getSimilarJobs(jobId: string) {
    const res = await axios.get(`${API_URL}/api/jobs/${jobId}/similar`);
    return res.data as Job[];
}

// Smart Recommendations based on saved jobs
export async function getRecommendations(savedJobIds: string[]) {
    const res = await axios.post(`${API_URL}/api/recommendations`, { savedJobIds });
    return res.data as Job[];
}

// Subscribe with filters
export async function subscribeWithFilters(email: string, filters?: {
    roleType?: string;
    jobType?: string;
    batch?: string;
}) {
    const res = await axios.post(`${API_URL}/api/subscribe`, { email, filters });
    return res.data;
}
