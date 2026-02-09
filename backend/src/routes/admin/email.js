const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const SibApiV3Sdk = require('@getbrevo/brevo');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// AI Email Generation
router.post('/generate', async (req, res) => {
    try {
        const { prompt, tone = 'professional' } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const systemPrompt = `You are an expert email copywriter for JobGrid, a job portal for software engineers. 
Write compelling email content based on the user's request.
Tone: ${tone}
Rules:
- Write ONLY the email body content (no subject line, no greeting like "Dear user", no signature)
- Use HTML formatting with <p>, <strong>, <ul>, <li> tags
- Keep it concise but impactful
- Include a clear call-to-action when appropriate
- Do not include any headers or footers - they will be added automatically`;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        const emailContent = completion.choices[0]?.message?.content || '';
        
        // Generate subject line
        const subjectCompletion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: 'Generate a short, catchy email subject line (max 60 chars) for this email. Return ONLY the subject line, nothing else.' },
                { role: 'user', content: emailContent.substring(0, 500) }
            ],
            temperature: 0.8,
            max_tokens: 50
        });

        const subject = subjectCompletion.choices[0]?.message?.content?.replace(/^["']|["']$/g, '') || 'JobGrid Update';

        res.json({ 
            content: emailContent,
            subject: subject.trim()
        });
    } catch (error) {
        console.error('AI Email Generation Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Build full HTML email from content
const buildEmailHtml = (content) => {
    return `
        <html>
            <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb;">
                <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #000000; padding: 30px; text-align: center;">
                        <img src="https://jobgrid.in/icon.png" alt="JobGrid Logo" style="width: 64px; height: 64px; border-radius: 12px;" />
                        <h1 style="color: #f59e0b; margin-top: 15px; margin-bottom: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">JobGrid</h1>
                    </div>
                    <div style="padding: 40px;">
                        <div style="color: #111827; font-size: 16px;">
                            ${content}
                        </div>
                        
                        <div style="margin-top: 40px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                            <p style="margin: 0; font-weight: 700; color: #111827;">The JobGrid Team</p>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Your career accelerator.</p>
                            <div style="margin-top: 15px;">
                                <a href="https://t.me/jobgridupdates" style="display: inline-block; background-color: #0088cc; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; margin-right: 10px; margin-bottom: 10px;">Join Telegram</a>
                                <a href="https://whatsapp.com/channel/0029Vak74nQ0wajvYa3aA432" style="display: inline-block; background-color: #25D366; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; margin-right: 10px; margin-bottom: 10px;">Join WhatsApp</a>
                                <a href="https://www.linkedin.com/company/jobgrid-in" style="display: inline-block; background-color: #0077b5; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; margin-right: 10px; margin-bottom: 10px;">Follow LinkedIn</a>
                                <a href="https://jobgrid.in" style="display: inline-block; background-color: #f59e0b; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; margin-bottom: 10px;">Visit Website</a>
                            </div>
                        </div>
                    </div>
                    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} JobGrid.in. All rights reserved.</p>
                        <p style="margin: 5px 0 0 0;">You received this as a member of JobGrid.</p>
                    </div>
                </div>
            </body>
        </html>
    `;
};

// Preview endpoint (returns full HTML)
router.post('/preview', (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }
    res.json({ html: buildEmailHtml(content) });
});

// Send bulk email (batched - 50 per request to avoid rate limits)
router.post('/send', async (req, res) => {
    try {
        const { recipients, subject, content } = req.body;

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ error: 'Recipients array is required' });
        }
        if (!subject) {
            return res.status(400).json({ error: 'Subject is required' });
        }
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        // Filter valid emails
        const validEmails = recipients.filter(email => 
            email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ).map(e => e.trim());

        if (validEmails.length === 0) {
            return res.status(400).json({ error: 'No valid email addresses found' });
        }

        // Check for Brevo API key
        if (!process.env.BREVO_API_KEY) {
            return res.status(500).json({ error: 'Email service not configured (BREVO_API_KEY missing)' });
        }

        // Brevo API setup
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        const apiKey = apiInstance.authentications['apiKey'];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        const htmlContent = buildEmailHtml(content);
        const BATCH_SIZE = 50;
        const batches = [];
        
        // Split into batches of 50
        for (let i = 0; i < validEmails.length; i += BATCH_SIZE) {
            batches.push(validEmails.slice(i, i + BATCH_SIZE));
        }

        let sent = 0;
        let failed = 0;
        const errors = [];

        // Process each batch with delay
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            
            try {
                const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
                sendSmtpEmail.subject = subject;
                sendSmtpEmail.htmlContent = htmlContent;
                sendSmtpEmail.sender = { name: 'JobGrid', email: 'alerts@jobgrid.in' };
                sendSmtpEmail.to = batch.map(email => ({ email }));

                await apiInstance.sendTransacEmail(sendSmtpEmail);
                sent += batch.length;
                console.log(`✉️ Batch ${i + 1}/${batches.length}: Sent ${batch.length} emails`);
                
                // Add delay between batches (1 second) to avoid rate limiting
                if (i < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (batchError) {
                failed += batch.length;
                errors.push(`Batch ${i + 1}: ${batchError.message}`);
                console.error(`❌ Batch ${i + 1} failed:`, batchError.message);
            }
        }

        // Log to audit
        try {
            const AuditLog = require('../../models/AuditLog');
            await AuditLog.log('EMAIL_BROADCAST', 'admin', { 
                subject, 
                recipientCount: validEmails.length,
                sent,
                failed,
                batches: batches.length
            });
        } catch (e) {}

        res.json({ 
            message: `Email sent to ${sent} recipients (${batches.length} batches)`,
            sent,
            failed,
            total: validEmails.length,
            batches: batches.length,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Email Send Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
