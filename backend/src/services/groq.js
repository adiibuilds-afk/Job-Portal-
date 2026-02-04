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
location
eligibility
salary
description
applyUrl
lastDate
category
  
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
- Merge information intelligently but User Input > Scraped Content.`
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
