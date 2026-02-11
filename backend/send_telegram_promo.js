/**
 * Telegram Channel Promotion Email Script
 * Sends invitation emails to all subscribers in email.txt
 * 
 * Usage: node send_telegram_promo.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const SibApiV3Sdk = require('@getbrevo/brevo');

// Configure Brevo API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// Configuration
const TELEGRAM_CHANNEL = 'https://t.me/jobgridupdates'; 
const WHATSAPP_GROUP = 'https://chat.whatsapp.com/EuNhXQkwy7Y4ELMjB1oVPd?mode=gi_t';
const BATCH_SIZE = 20; // Send emails in batches to avoid rate limits
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds between batches

const PROMO_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #0a0a0a;">
    <div style="max-width: 600px; margin: 40px auto; background-color: #18181b; border-radius: 16px; overflow: hidden; border: 1px solid #27272a;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #eab308 100%); padding: 40px; text-align: center;">
            <h1 style="color: #000000; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.025em;">🚀 Something BIG is Coming!</h1>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px;">
            <p style="color: #e4e4e7; font-size: 16px; margin-bottom: 20px;">Hey there, Job Seeker! 👋</p>
            
            <p style="color: #a1a1aa; font-size: 15px; margin-bottom: 25px;">
                We're building something <strong style="color: #f59e0b;">game-changing</strong> that will revolutionize your job search...
            </p>
            
            <!-- Exclusive Feature Box -->
            <div style="background-color: #27272a; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #f59e0b;">
                <h2 style="color: #ffffff; margin: 0 0 15px 0; font-size: 20px;">🤖 Auto Apply Tool (Coming Soon!)</h2>
                <p style="color: #a1a1aa; margin: 0; font-size: 14px;">
                    Imagine applying to <strong style="color: #f59e0b;">100+ jobs automatically</strong> while you sleep. Our AI-powered auto-apply feature will:
                </p>
                <ul style="color: #a1a1aa; font-size: 14px; padding-left: 20px; margin: 15px 0 0 0;">
                    <li style="margin-bottom: 8px;">Match your profile with relevant jobs</li>
                    <li style="margin-bottom: 8px;">Auto-fill applications with your resume data</li>
                    <li style="margin-bottom: 8px;">Track all your applications in one place</li>
                    <li>Give you a massive head start over other candidates</li>
                </ul>
            </div>
            
            <!-- Telegram CTA -->
            <div style="background: linear-gradient(135deg, #0088cc 0%, #00b4db 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <h3 style="color: #ffffff; margin: 0 0 10px 0; font-size: 18px;">🎁 EXCLUSIVE ACCESS</h3>
                <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0 0 20px 0;">
                    This feature will be <strong>exclusive to our Telegram members</strong>.<br/>Join now to be first in line!
                </p>
                <a href="${TELEGRAM_CHANNEL}" style="display: inline-block; background-color: #ffffff; color: #0088cc; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 700; margin-right: 10px; margin-bottom: 15px;">
                    📱 Join Telegram
                </a>
                <a href="${WHATSAPP_GROUP}" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: 700; margin-bottom: 15px;">
                    🟢 Join WhatsApp Group
                </a>
            </div>
            
            <!-- Daily Updates -->
            <div style="background-color: #1f1f23; border-radius: 12px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #f59e0b; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">What You'll Get Daily:</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    <span style="background-color: #27272a; color: #e4e4e7; padding: 6px 12px; border-radius: 6px; font-size: 13px;">🔥 Fresh Job Openings</span>
                    <span style="background-color: #27272a; color: #e4e4e7; padding: 6px 12px; border-radius: 6px; font-size: 13px;">💰 Salary Insights</span>
                    <span style="background-color: #27272a; color: #e4e4e7; padding: 6px 12px; border-radius: 6px; font-size: 13px;">🎯 Off-Campus Drives</span>
                    <span style="background-color: #27272a; color: #e4e4e7; padding: 6px 12px; border-radius: 6px; font-size: 13px;">📊 Interview Tips</span>
                </div>
            </div>
            
            <p style="color: #71717a; font-size: 13px; text-align: center; margin-top: 30px;">
                Don't miss out. The early bird gets the job! 🐦
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #0f0f10; padding: 25px; text-align: center; border-top: 1px solid #27272a;">
            <p style="margin: 0; font-weight: 700; color: #f59e0b; font-size: 16px;">JobGrid</p>
            <p style="margin: 5px 0 15px 0; font-size: 12px; color: #52525b;">Your Career Accelerator</p>
            <a href="https://jobgrid.in" style="color: #71717a; font-size: 12px; text-decoration: none;">jobgrid.in</a>
            <p style="margin: 15px 0 0 0; font-size: 11px; color: #3f3f46;">
                © ${new Date().getFullYear()} JobGrid. You received this because you signed up on our platform.
            </p>
        </div>
    </div>
</body>
</html>
`;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sendPromoEmail = async (email) => {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = "🚀 Exclusive: Auto-Apply Tool Coming to JobGrid Telegram!";
    sendSmtpEmail.htmlContent = PROMO_EMAIL_TEMPLATE;
    sendSmtpEmail.sender = { "name": "JobGrid", "email": "alerts@jobgrid.in" };
    sendSmtpEmail.to = [{ "email": email }];

    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        return { success: true, email };
    } catch (error) {
        return { success: false, email, error: error.message };
    }
};

const main = async () => {
    console.log('🚀 JobGrid Telegram Promo Email Sender\n');
    
    // Check API key
    if (!process.env.BREVO_API_KEY) {
        console.error('❌ BREVO_API_KEY not set in .env file!');
        process.exit(1);
    }
    
    // Read email list
    const emailFilePath = path.join(__dirname, '../email.txt');
    if (!fs.existsSync(emailFilePath)) {
        console.error('❌ email.txt not found at:', emailFilePath);
        process.exit(1);
    }
    
    const fileContent = fs.readFileSync(emailFilePath, 'utf-8');
    const emails = fileContent
        .split('\n')
        .map(e => e.trim())
        .filter(e => e && e.includes('@') && !e.startsWith('.')); // Filter valid emails
    
    console.log(`📧 Found ${emails.length} valid email addresses\n`);
    
    // Confirm before sending
    console.log('First 5 emails:', emails.slice(0, 5));
    console.log('\n⚠️  Press Ctrl+C within 5 seconds to cancel...\n');
    await sleep(5000);
    
    // Send in batches
    let successCount = 0;
    let failCount = 0;
    const failed = [];
    
    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        const batch = emails.slice(i, i + BATCH_SIZE);
        console.log(`\n📤 Sending batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(emails.length/BATCH_SIZE)} (${batch.length} emails)...`);
        
        const results = await Promise.all(batch.map(email => sendPromoEmail(email)));
        
        results.forEach(r => {
            if (r.success) {
                successCount++;
                console.log(`  ✅ ${r.email}`);
            } else {
                failCount++;
                failed.push(r);
                console.log(`  ❌ ${r.email}: ${r.error}`);
            }
        });
        
        // Delay between batches to respect rate limits
        if (i + BATCH_SIZE < emails.length) {
            console.log(`  ⏳ Waiting ${DELAY_BETWEEN_BATCHES/1000}s before next batch...`);
            await sleep(DELAY_BETWEEN_BATCHES);
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully sent: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    
    if (failed.length > 0) {
        console.log('\nFailed emails:');
        failed.forEach(f => console.log(`  - ${f.email}: ${f.error}`));
    }
    
    console.log('\n🎉 Done!');
};

main().catch(console.error);
