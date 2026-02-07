export const BATCH_OPTIONS = [
    { label: '< 2023', value: 'older-2023' },
    { label: '2023', value: '2023' },
    { label: '2024', value: '2024' },
    { label: '2025', value: '2025' },
    { label: '2026', value: '2026' },
    { label: '2027', value: '2027' },
    { label: '2028', value: '2028' },
    { label: '2029', value: '2029' },
    { label: '> 2029', value: 'greater-2029' },
];

export interface AISuggestion {
    _id: string;
    title: string;
    company: string;
    location: string;
    slug: string;
    matchScore: number;
    matchReason: string;
}
