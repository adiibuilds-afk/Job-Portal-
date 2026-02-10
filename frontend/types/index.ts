export interface Job {
    _id: string;
    title: string;
    company: string;
    companyLogo?: string;
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

    // Detailed Content
    rolesResponsibility?: string;
    requirements?: string;
    niceToHave?: string;

    views: number;
    clicks: number;
    isFeatured: boolean;
    isActive?: boolean;
    reportCount?: number;
    createdAt: string;
}

export interface QueueItem {
    _id: string;
    originalUrl: string;
    status: 'pending' | 'processed' | 'failed';
    scheduledFor: string;
}

export interface AdminAnalytics {
    totalJobs: number;
    totalViews: number;
    totalClicks: number;
}
