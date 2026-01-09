const nodemailer = require('nodemailer');
const logger = require('../logger');

/**
 * Email Service for sending magic links
 */

/**
 * Send magic link email
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} magicLink - Magic link URL
 */
const sendMagicLinkEmail = async (email, name, magicLink) => {
    try {
        // Create transporter
        let transporter;

        if (process.env.NODE_ENV === 'production') {
            // Production email configuration
            transporter = nodemailer.createTransport({
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
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
        }

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
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                    <div style="background: #1a1a1a; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">LIDO.</h1>
                        <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">Interactive Sessions Made Easy</p>
                    </div>
                    
                    <div style="background: #f8f8f8; padding: 40px 30px; border-radius: 0 0 12px 12px;">
                        <h2 style="color: #1a1a1a; margin-top: 0; font-size: 24px; font-weight: 600;">Hi ${name}! 👋</h2>
                        
                        <p style="font-size: 16px; color: #4a4a4a; line-height: 1.6;">
                            Click the button below to securely log in to your LIDO account. This link will expire in <strong style="color: #1a1a1a;">15 minutes</strong>.
                        </p>
                        
                        <div style="text-align: center; margin: 35px 0;">
                            <a href="${magicLink}" 
                               style="background: #1a1a1a; 
                                      color: #ffffff; 
                                      padding: 16px 48px; 
                                      text-decoration: none; 
                                      border-radius: 8px; 
                                      font-size: 16px; 
                                      font-weight: 600;
                                      display: inline-block;
                                      box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                🔐 Log In to LIDO
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #6a6a6a; margin-top: 35px;">
                            Or copy and paste this link into your browser:
                        </p>
                        <p style="font-size: 13px; color: #8a8a8a; word-break: break-all; background: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e0e0e0;">
                            ${magicLink}
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 35px 0;">
                        
                        <p style="font-size: 13px; color: #8a8a8a; margin: 0; line-height: 1.5;">
                            If you didn't request this email, you can safely ignore it.
                        </p>
                        <p style="font-size: 13px; color: #8a8a8a; margin: 8px 0 0 0; line-height: 1.5;">
                            This link will expire in 15 minutes for security reasons.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 24px; color: #999; font-size: 12px;">
                        <p style="margin: 0;">© ${new Date().getFullYear()} LIDO. All rights reserved.</p>
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
