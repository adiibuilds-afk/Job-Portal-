import { Job } from '@/types';

export default function JobSchema({ job }: { job: Job }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: job.description,
        datePosted: job.createdAt,
        validThrough: job.lastDate ? new Date(job.lastDate).toISOString() : undefined,
        employmentType: job.category?.toLowerCase().includes('intern') ? 'INTERN' : 'FULL_TIME',
        hiringOrganization: {
            '@type': 'Organization',
            name: job.company,
            logo: 'https://jobgrid.in/icon.png',
            sameAs: 'https://jobgrid.in'
        },
        jobLocation: {
            '@type': 'Place',
            address: {
                '@type': 'PostalAddress',
                addressLocality: job.location || 'Remote',
                addressCountry: 'IN'
            }
        },
        baseSalary: job.salary && job.salary !== 'N/A' ? {
            '@type': 'MonetaryAmount',
            currency: 'INR',
            value: {
                '@type': 'QuantitativeValue',
                value: job.salary,
                unitText: 'YEAR'
            }
        } : undefined
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
