const nodemailer = require('nodemailer');
const logger = require('../logger');

/**
 * Email Service for sending magic links
 */

// Create transporter (configure based on your email provider)
const createTransporter = () => {
    // For development: Use Gmail or a test service like Ethereal
    // For production: Use SendGrid, AWS SES, or your email provider

    if (process.env.NODE_ENV === 'production') {
        // Production email configuration
        return nodemailer.createTransporter({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    } else {
        // Development: Use Gmail (requires app password)
        // Or use Ethereal for testing: https://ethereal.email/
        return nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'your-email@gmail.com',
                pass: process.env.EMAIL_PASSWORD || 'your-app-password'
            }
        });
    }
};

/**
 * Send magic link email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} magicLink - Magic link URL
 */
const sendMagicLinkEmail = async (email, name, magicLink) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || '"LIDO" <noreply@lido.app>',
            to: email,
            subject: 'Your LIDO Magic Link - Login',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>LIDO Magic Link</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 32px;">LIDO</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Interactive Sessions Made Easy</p>
                    </div>
                    
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #333; margin-top: 0;">Hi ${name}! 👋</h2>
                        
                        <p style="font-size: 16px; color: #555;">
                            Click the button below to log in to your LIDO account. This link will expire in <strong>15 minutes</strong>.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${magicLink}" 
                               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                      color: white; 
                                      padding: 15px 40px; 
                                      text-decoration: none; 
                                      border-radius: 5px; 
                                      font-size: 16px; 
                                      font-weight: bold;
                                      display: inline-block;">
                                🔐 Log In to LIDO
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #777; margin-top: 30px;">
                            Or copy and paste this link into your browser:
                        </p>
                        <p style="font-size: 12px; color: #999; word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
                            ${magicLink}
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                        
                        <p style="font-size: 12px; color: #999; margin: 0;">
                            If you didn't request this email, you can safely ignore it.
                        </p>
                        <p style="font-size: 12px; color: #999; margin: 5px 0 0 0;">
                            This link will expire in 15 minutes for security reasons.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                        <p>© ${new Date().getFullYear()} LIDO. All rights reserved.</p>
                    </div>
                </body>
                </html>
            `,
            text: `
Hi ${name}!

Click the link below to log in to your LIDO account:
${magicLink}

This link will expire in 15 minutes.

If you didn't request this email, you can safely ignore it.

© ${new Date().getFullYear()} LIDO
            `
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Magic link email sent to ${email}: ${info.messageId}`);

        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error(`Failed to send magic link email to ${email}: ${error.message}`);
        throw new Error('Failed to send email');
    }
};

module.exports = {
    sendMagicLinkEmail
};
