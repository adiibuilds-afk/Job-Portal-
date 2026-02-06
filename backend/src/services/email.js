const SibApiV3Sdk = require('@getbrevo/brevo');

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const sendWelcomeEmail = async (email) => {
    if (!process.env.BREVO_API_KEY) {
        console.log('Skipping welcome email: BREVO_API_KEY not set.');
        return;
    }

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = "Welcome to JobGrid! 🚀";
    sendSmtpEmail.htmlContent = `
        <html>
            <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb;">
                <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #000000; padding: 30px; text-align: center;">
                        <img src="https://jobgrid.in/icon.png" alt="JobGrid Logo" style="width: 64px; height: 64px; border-radius: 12px;" />
                        <h1 style="color: #f59e0b; margin-top: 15px; margin-bottom: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">JobGrid</h1>
                    </div>
                    <div style="padding: 40px;">
                        <h2 style="color: #111827; margin-top: 0; font-size: 20px; font-weight: 700;">Welcome to the future of engineering! 🚀</h2>
                        <p>Hello,</p>
                        <p>Thank you for subscribing to <b>JobGrid</b>. You're now part of an exclusive circle of engineers getting ahead with curated opportunities.</p>
                        
                        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0;">
                            <p style="margin: 0; color: #92400e; font-weight: 600;">What to expect:</p>
                            <ul style="margin: 10px 0 0 0; color: #b45309; padding-left: 20px;">
                                <li>Daily hand-picked SDE roles</li>
                                <li>Internships for 2025/26 batches</li>
                                <li>Career growth insights and trends</li>
                            </ul>
                        </div>

                        <p>Stay tuned for your first alert!</p>
                        
                        <div style="margin-top: 40px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                            <p style="margin: 0; font-weight: 700; color: #111827;">The JobGrid Team</p>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Curating the best for the best.</p>
                            <div style="margin-top: 15px;">
                                <a href="https://t.me/jobgridupdates" style="display: inline-block; background-color: #0088cc; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">Join Telegram</a>
                                <a href="https://jobgrid.in" style="display: inline-block; margin-left: 10px; color: #f59e0b; text-decoration: none; font-size: 13px; font-weight: 600;">Visit Website</a>
                            </div>
                        </div>
                    </div>
                    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} JobGrid.in. All rights reserved.</p>
                        <p style="margin: 5px 0 0 0;">If you didn't subscribe, you can safely ignore this email.</p>
                    </div>
                </div>
            </body>
        </html>
    `;
    sendSmtpEmail.sender = { "name": "JobGrid", "email": "alerts@jobgrid.in" };
    sendSmtpEmail.to = [{ "email": email }];

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('Welcome email sent successfully to:', email);
        return data;
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw error;
    }
};

const sendBroadcastEmail = async (recipients, subject, message) => {
    if (!process.env.BREVO_API_KEY) {
        console.log('Skipping broadcast email: BREVO_API_KEY not set.');
        return;
    }

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = `
        <html>
            <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb;">
                <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #000000; padding: 30px; text-align: center;">
                        <img src="https://jobgrid.in/icon.png" alt="JobGrid Logo" style="width: 64px; height: 64px; border-radius: 12px;" />
                        <h1 style="color: #f59e0b; margin-top: 15px; margin-bottom: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">JobGrid Alert</h1>
                    </div>
                    <div style="padding: 40px;">
                        <div style="color: #111827; font-size: 16px; white-space: pre-wrap;">
                            ${message}
                        </div>
                        
                        <div style="margin-top: 40px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                            <p style="margin: 0; font-weight: 700; color: #111827;">The JobGrid Team</p>
                            <p style="margin: 0; font-size: 14px; color: #6b7280;">Your career accelerator.</p>
                            <div style="margin-top: 15px;">
                                <a href="https://t.me/jobgridupdates" style="display: inline-block; background-color: #0088cc; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">Join Telegram</a>
                                <a href="https://jobgrid.in" style="display: inline-block; margin-left: 10px; color: #f59e0b; text-decoration: none; font-size: 13px; font-weight: 600;">Visit Website</a>
                            </div>
                        </div>
                    </div>
                    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
                        <p style="margin: 0;">&copy; ${new Date().getFullYear()} JobGrid.in. All rights reserved.</p>
                        <p style="margin: 5px 0 0 0;">You received this as a registered member of JobGrid.</p>
                    </div>
                </div>
            </body>
        </html>
    `;
    sendSmtpEmail.sender = { "name": "JobGrid", "email": "alerts@jobgrid.in" };
    // Brevo allow sending to multiple in one call via 'to' array
    sendSmtpEmail.to = recipients.map(email => ({ "email": email }));

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`Broadcast email "${subject}" sent to ${recipients.length} recipients.`);
        return data;
    } catch (error) {
        console.error('Error sending broadcast email:', error);
        throw error;
    }
};

module.exports = {
    sendWelcomeEmail,
    sendBroadcastEmail
};
