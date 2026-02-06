const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const parseJobWithAI = async (rawText) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a job data extractor.
Convert the following raw job post into clean JSON.

Fields:
title
company
companyLogo
location
eligibility
salary
description
applyUrl
lastDate
category
  
  // Detailed Content
  rolesResponsibility (String: "• Item 1\n• Item 2" formatted content)
  requirements (String: "• Item 1\n• Item 2" formatted content)
  niceToHave (String: "• Item 1" or empty if none)

  // Engineering Fields
  batch (Array of strings, e.g. ["2024", "2025"])
  tags (Array of strings for tech stack, e.g. ["React", "Node.js", "AWS"])
  jobType (String: "Internship" or "FullTime")
  roleType (String: "SDE", "Frontend", "Backend", "FullStack", "QA", "Data Science", "DevOps", "Other")
  seniority (String: "Entry" for 0-2 years, "Mid" for 2-5 years, "Senior" for 5+ years)
  minSalary (Number: lower bound of salary in LPA, e.g. 5, 0 if unknown)
  isRemote (Boolean)

Rules:
- No markdown
- No explanation  
- Only valid JSON
- output raw json string without code block formatting
- PRIORITIZE user provided text over scraped content specifically for Eligibility/Batch.
- If the user text contains year (e.g., 2024, 2025, 2026), keep it exactly as is for eligibility.
- Only use scraped content for fields that are missing in the user's short text.
- Merge information intelligently but User Input > Scraped Content.
- CRITICAL: Split the raw text into 'description' (About), 'rolesResponsibility', and 'requirements' intelligently.
- 'description' should just be the company intro and opportunity overview. 
- Use bullet points (•) for list items in roles/requirements strings.
- CRITICAL: Extract the COMPANY NAME correctly. If the title is "Software Engineer at Google", company is "Google".
- CRITICAL: If the input text has "Job in [Location] at [Company]", extract Company and Location accurately.
- Avoid using the full page title as the text for 'company' field.
- If 'applyUrl' is not found, leave it as null or empty string, do NOT invent one.
- For 'jobType', look for keywords like "Full Time", "Part Time", "Internship". Default to "FullTime" if unsure but context implies a standard job.
- Clean up the 'title'. Remove "Job in..." or "Hiring for..." prefixes if possible.`
        },
        {
          role: 'user',
          content: rawText
        }
      ],
      model: 'llama-3.3-70b-versatile',
    });

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
   - CRITICAL: DO NOT include "Role, Responsibilities & Skills", "Eligibility", "Internship Opportunity", "Required Skills" in the title.
   - Removing suffixes is MANDATORY.
2. "description": A compelling 2-3 sentence meta description (max 160 chars).
3. "rolesResponsibility": A bulleted list (using •) of clear roles and responsibilities.
4. "requirements": A bulleted list (using •) of technical and soft skill requirements.
5. "eligibility": A concise eligibility criteria string (e.g., "B.Tech/B.E. 2024/2025 Batch").

Rules:
- Title must be purely the role and company (e.g., "Java Developer at Amazon").
- NO "Hiring for", "Job in", or long suffixes in title.
- Content should be professional, grammatically correct, and formatted with bullet points for lists.
- Output ONLY valid JSON, no markdown.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are an SEO content generator. Output only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      model: 'llama-3.3-70b-versatile',
    });

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
    console.error('SEO Generation Error:', error);
    return null;
  }
};

module.exports = { parseJobWithAI, generateSEOContent };
