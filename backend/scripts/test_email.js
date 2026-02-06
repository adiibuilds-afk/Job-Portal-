require('dotenv').config();
const { sendWelcomeEmail } = require('../src/services/email');

const testEmail = async () => {
    const recipient = process.argv[2];
    if (!recipient) {
        console.error('Usage: node scripts/test_email.js <recipient_email>');
        process.exit(1);
    }

    console.log(`Attempting to send test welcome email to ${recipient}...`);
    try {
        await sendWelcomeEmail(recipient);
        console.log('Test completed successfully. Check your inbox (and spam folder).');
    } catch (error) {
        console.error('Test failed:', error.message);
    }
};
 
testEmail();
