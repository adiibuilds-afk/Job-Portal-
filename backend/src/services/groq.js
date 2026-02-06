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
    // Clean potential markdown if model disregards instruction
    const jsonString = content.replace(/^```json/, '').replace(/```$/, '');
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('AI Parsing Error:', error);
    return null;
  }
};

module.exports = { parseJobWithAI };
