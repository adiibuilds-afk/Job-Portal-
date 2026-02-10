/**
 * Shared helpers for cleaning job titles and mapping data formats
 */

const cleanTitle = (title) => {
    if (!title) return '';
    
    // Patterns to remove from end of title
    const patternsToRemove = [
        /\s*\|\s*Role,?\s*Responsibilities\s*&\s*Skills\s*$/i,
        /\s*–\s*Roles?,?\s*Skills?\s*&\s*Eligibility\s*$/i,
        /\s*–\s*Backend\s*Role,?\s*Responsibilities\s*&\s*Required\s*Skills\s*$/i,
        /\s*\|\s*Hybrid\s*Internship\s*Opportunity\s*$/i,
        /\s*\|\s*Remote\s*Internship\s*Opportunity\s*$/i,
        /\s*–\s*Role,?\s*Responsibilities\s*&\s*Required\s*Skills\s*$/i,
        /\s*\|\s*Full\s*Stack\s*Role\s*$/i,
        /\s*\|\s*Backend\s*Role\s*$/i,
        /\s*\|\s*Frontend\s*Role\s*$/i,
        /\s*–\s*Responsibilities\s*&\s*Skills\s*$/i,
        /\s*\|\s*Responsibilities\s*&\s*Skills\s*$/i,
        /\s*–\s*Required\s*Skills\s*$/i,
        /\s*\|\s*Required\s*Skills\s*$/i,
        /\s*–\s*Skills\s*&\s*Eligibility\s*$/i,
        /\s*\|\s*Skills\s*&\s*Eligibility\s*$/i,
    ];
    
    let cleanedTitle = title;
    for (const pattern of patternsToRemove) {
        cleanedTitle = cleanedTitle.replace(pattern, '');
    }
    
    return cleanedTitle.trim();
};

const mapJobType = (jobtype) => {
    // RG Jobs uses numeric job types
    if (typeof jobtype === 'number') {
        switch (jobtype) {
            case 1: return 'FullTime';
            case 2: return 'Internship';
            case 3: return 'Contract';
            default: return 'FullTime';
        }
    }
    // String based mapping
    const type = String(jobtype).toLowerCase();
    if (type.includes('intern')) return 'Internship';
    if (type.includes('contract')) return 'Contract';
    return 'FullTime';
};

const parseMinSalary = (payString) => {
    if (!payString) return 0;
    const str = String(payString);
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
};

const parseBatches = (batchString) => {
    if (!batchString) return [];
    if (Array.isArray(batchString)) return batchString;
    return batchString.split(',').map(b => b.trim()).filter(Boolean);
};

module.exports = {
    cleanTitle,
    mapJobType,
    parseMinSalary,
    parseBatches
};
