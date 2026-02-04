export interface Job {
    _id: string;
    title: string;
    company: string;
    slug: string;
    location: string;
    eligibility: string;
    salary: string;
    description: string;
    applyUrl: string;
    lastDate: string;
    category: string;

    // New Fields
    batch?: string[];
    tags?: string[];
    jobType?: string;
    roleType?: string;
    minSalary?: number;
    isRemote?: boolean;

    views: number;
    clicks: number;
    isFeatured: boolean;
    createdAt: string;
}
