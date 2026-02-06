const ResumeQueue = require('../models/ResumeQueue');
const Job = require('../models/Job');
const Settings = require('../models/Settings'); // Import Settings
const { parseJobWithAI } = require('./groq'); // We'll adapt Groq client
const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

let isProcessing = false;

const processQueue = async () => {
    if (isProcessing) return;
    isProcessing = true;

    try {
        // Check if Queue is Paused
        const pauseSetting = await Settings.findOne({ key: 'queue_paused' });
        if (pauseSetting && pauseSetting.value === true) {
            isProcessing = false;
            return;
        }

        // Find oldest pending job
        const task = await ResumeQueue.findOne({ status: 'pending' }).sort({ createdAt: 1 });
        
        if (!task) {
            isProcessing = false;
            return;
        }

        // Mark as processing
        task.status = 'processing';
        task.processingStartedAt = new Date();
        await task.save();

        let prompt = "";

        if (task.jobId) {
            const job = await Job.findById(task.jobId);
            if (!job) {
                task.status = 'failed';
                task.error = 'Job not found';
                await task.save();
                isProcessing = false;
                setImmediate(processQueue);
                return;
            }

            prompt = `
            You are an expert ATS (Applicant Tracking System) and Hiring Manager.
            Analyze the following Resume against the Job Description.

            Job Title: ${job.title}
            Job Description: ${job.description.substring(0, 1000)}...
            Required Skills: ${job.tags?.join(', ') || 'N/A'}

            Resume Text:
            ${task.resumeText.substring(0, 2000)}

            Output strictly in JSON format:
            {
                "score": 0-100 (Number),
                "matchLevel": "Low" | "Medium" | "High",
                "strengths": ["string", "string"],
                "missingKeywords": ["string", "string"],
                "improvements": ["string", "string"],
                "summary": "Short 2 sentence feedback for this specific job"
            }
            Do not include markdown formatting. Just raw JSON.
            `;
        } else {
            // General Scan or Custom Job Scan
            const customTitle = task.customJob?.title || "Professional Profile";
            const customCompany = task.customJob?.company || "General Career Market";

            prompt = `
            You are an elite Career Coach and Senior Technical Recruiter.
            Analyze the following Resume for overall quality, ATS compatibility, and professional impact.

            Target Direction: ${customTitle} ${task.customJob?.company ? `at ${customCompany}` : '(General)'}

            Resume Text:
            ${task.resumeText.substring(0, 3000)}

            Analyze for:
            1. Formatting and Scanability.
            2. Content Impact and Quantified Achievements.
            3. ATS Compatibility for ${customTitle} roles.
            4. General Industry Standards.

            Output strictly in JSON format:
            {
                "score": 0-100 (Number),
                "matchLevel": "Low" | "Medium" | "High",
                "strengths": ["string", "string"],
                "missingKeywords": ["Missing general industry keywords/skills if applicable"],
                "improvements": ["Specific formatting or content advice"],
                "summary": "Full overview of resume health and potential impact for ${customTitle} roles."
            }
            Do not include markdown formatting. Just raw JSON.
            `;
        }

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
        });

        const content = completion.choices[0]?.message?.content || '{}';
        const cleanJson = content.replace(/^```json/, '').replace(/```$/, '');
        const analysis = JSON.parse(cleanJson);

        // Success
        task.result = analysis;
        task.status = 'completed';
        task.completedAt = new Date();
        await task.save();

    } catch (error) {
        console.error('Queue Processing Error:', error);
        if (task) { // task might be undefined if error in query
            task.status = 'failed';
            task.error = error.message;
            await task.save();
        }
    } finally {
        isProcessing = false;
        // Check for more jobs immediately if we just finished one
        if (await ResumeQueue.exists({ status: 'pending' })) {
            setImmediate(processQueue);
        }
    }
};

// Start polling loop
const startWorker = () => {
    console.log('Resume Queue Worker Started');
    setInterval(processQueue, 5000); // Check every 5 seconds
};

module.exports = { startWorker };
