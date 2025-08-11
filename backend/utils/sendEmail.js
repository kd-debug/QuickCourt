const nodemailer = require('nodemailer');

// Create a test account using Ethereal Email (works automatically)
const createTestTransport = async () => {
    try {
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    } catch (error) {
        console.log('Failed to create test account, using console fallback');
        return null;
    }
};

// Console fallback for development
const consoleTransporter = {
    sendMail: async (options) => {
        console.log('\nEMAIL SENT (Console Mode)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Content: ${options.text || options.html}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        return { messageId: 'console-mock-' + Date.now() };
    },
};

const sendEmail = async (options) => {
    try {
        // Try to use Ethereal Email first
        let transporter = await createTestTransport();

        if (!transporter) {
            // Fallback to console mode
            transporter = consoleTransporter;
        }

        const message = {
            from: options.from || 'QuickCourt <noreply@quickcourt.com>',
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };

        const info = await transporter.sendMail(message);

        if (transporter === consoleTransporter) {
            console.log('Email sent successfully (Console Mode)');
        } else {
            console.log('Email sent successfully');
            console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error('Email sending failed:', error.message);

        // Fallback to console mode if email service fails
        try {
            console.log('Falling back to console mode...');
            const consoleInfo = await consoleTransporter.sendMail(options);
            return consoleInfo;
        } catch (fallbackError) {
            console.error('Console fallback also failed:', fallbackError.message);
            throw new Error('Email service unavailable');
        }
    }
};

module.exports = sendEmail;
