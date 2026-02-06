// Simple keyword-based resume analyzer
// In a real "AI" version, this would call an LLM.

const analyzeResume = (resumeText, jobDescription, jobTags) => {
    const text = resumeText.toLowerCase();
    const desc = jobDescription.toLowerCase();
    
    // 1. Identify Key Skills from Tags + Common Tech Keywords
    let keywordsToCheck = [...jobTags];
    
    // Add some common extracted keywords if tags are empty
    if (keywordsToCheck.length === 0) {
        const commonTech = ['react', 'node', 'python', 'java', 'sql', 'aws', 'docker', 'typescript', 'nextjs', 'mongodb'];
        keywordsToCheck = commonTech.filter(k => desc.includes(k));
    }

    // 2. Check for matches
    const matched = [];
    const missing = [];

    keywordsToCheck.forEach(keyword => {
        if (text.includes(keyword.toLowerCase())) {
            matched.push(keyword);
        } else {
            missing.push(keyword);
        }
    });

    // 3. Calculate Score
    // Weight: 30% for basic description match, 70% for skills
    let score = 0;
    
    // Skill contribution
    if (keywordsToCheck.length > 0) {
        score += (matched.length / keywordsToCheck.length) * 100;
    } else {
        // Fallback if no specific keywords found to check
        score = 50; 
    }

    // Cap at 95% (nobody is perfect)
    score = Math.min(Math.round(score), 95);
    // Floor at 10%
    score = Math.max(score, 10);

    return {
        score,
        matched,
        missing
    };
};

module.exports = { analyzeResume };
