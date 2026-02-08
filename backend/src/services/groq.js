const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const parseJobWithAI = async (rawText) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a job data expert. Extract structured data with high precision.
Convert the job post into clean JSON.

Fields:
title, company, companyLogo, location, eligibility, salary, description, applyUrl, lastDate, category

Detailed Content (Formatting: Use bullet points • for strings):
- rolesResponsibility
- requirements
- niceToHave

Engineering & Metadata:
- batch: Array of strings. Extract specific graduation years (e.g. ["2023", "2024", "2025"]). Look for "2025 batch", "Class of 2024", "Graduating in 2026", etc.
- tags: Array of strings. Extract SPECIFIC technical skills (e.g., ["Java", "React", "Node.js", "C++", "DSA", "SQL"]). Focus on programming languages, frameworks, and core CS concepts. Avoid generalities like "Software Development" if specific tech is mentioned.
- jobType: "Internship" or "FullTime".
- roleType: "SDE", "Frontend", "Backend", "FullStack", "QA", "Data Science", "DevOps", "Other".
- seniority: "Entry" (0-2y), "Mid" (2-5y), "Senior" (5y+).
- minSalary: Number (LPA).
- isRemote: Boolean.

Rules:
- User Input > Scraped Content.
- Clean Title: Role only, remove all suffixes like "at Company" or "Hiring for".`
        },
        {
          role: 'user',
          content: rawText
        }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    // Log token usage
    const tokens = completion.usage?.total_tokens || 0;
    try {
      const AIUsage = require('../models/AIUsage');
      await AIUsage.logUsage(tokens, 'other');
    } catch (e) { /* silent fail */ }

    const content = completion.choices[0]?.message?.content || '{}';
    
    // Robust JSON extraction
    const startObj = content.indexOf('{');
    const endObj = content.lastIndexOf('}');
    
    let jsonString = '{}';
    if (startObj !== -1 && endObj !== -1) {
        jsonString = content.substring(startObj, endObj + 1);
    }

    return JSON.parse(jsonString);
  } catch (error) {
    // Log error
    try {
      const AIUsage = require('../models/AIUsage');
      const isRateLimit = error?.error?.code === 'rate_limit_exceeded';
      await AIUsage.logError(isRateLimit);
    } catch (e) { /* silent fail */ }

    if (error?.error?.code === 'rate_limit_exceeded') {
        console.error('❌ Groq Rate Limit Exceeded!');
        return { error: 'rate_limit_exceeded' };
    }
    console.error('AI Parsing Error:', error);
    return null;
  }
};

/**
 * Generate SEO-optimized title and description for job listings
 */
const generateSEOContent = async (jobData) => {
  try {
    const prompt = `You are an SEO expert for a job portal. Generate SEO-optimized, professional content for this job.

Company: ${jobData.company}
Original Title: ${jobData.title}
Role: ${jobData.role || 'Software Engineer'}
Location: ${jobData.location}
Salary: ${jobData.salary || 'Competitive'}
Batch: ${jobData.batch || 'Not specified'}

Original Description:
${jobData.description?.substring(0, 800)}

Generate JSON with these fields:
1. "title": Clean, SEO-friendly title (Examples: "Software Engineer at Google", "Frontend Developer - React"). 
2. "description": A compelling 2-3 sentence meta description (max 160 chars).
3. "rolesResponsibility": A bulleted list (using •) of clear roles and responsibilities.
4. "requirements": A bulleted list (using •) of technical and soft skill requirements.
5. "eligibility": A concise eligibility criteria string (e.g., "B.Tech/B.E. 2024/2025 Batch").
6. "batch": Array of strings (e.g., ["2024", "2025"]).
7. "tags": Array of strings (Tech Stack, frameworks, soft skills).
8. "seniority": "Entry", "Mid", or "Senior".
9. "jobType": "FullTime", "Internship".

Rules:
- Title must be purely the role and company.
- Content should be professional and formatted with bullet points for lists.
- For 'batch', only include years (e.g., 2024).
- For 'tags', include specific tech mentioned in the description (e.g., Java, Python, React, DSA). Prioritize specific languages and frameworks over general skills.
- Output ONLY valid JSON, no markdown.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an SEO content generator. Output only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    // Log token usage
    const tokens = completion.usage?.total_tokens || 0;
    try {
      const AIUsage = require('../models/AIUsage');
      await AIUsage.logUsage(tokens, 'seoGeneration');
    } catch (e) { /* silent fail */ }

    const content = completion.choices[0]?.message?.content || '{}';
    
    // Robust JSON extraction: Find first '{' and last '}'
    const startObj = content.indexOf('{');
    const endObj = content.lastIndexOf('}');
    
    let jsonString = '{}';
    if (startObj !== -1 && endObj !== -1) {
        jsonString = content.substring(startObj, endObj + 1);
    }
    
    return JSON.parse(jsonString);
  } catch (error) {
    // Log error
    try {
      const AIUsage = require('../models/AIUsage');
      const isRateLimit = error?.status === 429 || error?.error?.code === 'rate_limit_exceeded';
      await AIUsage.logError(isRateLimit);
    } catch (e) { /* silent fail */ }

    if (error?.status === 429 || error?.error?.code === 'rate_limit_exceeded' || error?.error?.error?.code === 'rate_limit_exceeded') {
        console.error('❌ Groq Rate Limit Exceeded! (Stopping)');
        return { error: 'rate_limit_exceeded' };
    }
    console.error('SEO Generation Error:', error.message || error);
    return null;
  }
};

module.exports = { parseJobWithAI, generateSEOContent };
