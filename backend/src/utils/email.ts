import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SERVER || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD?.replace(/ /g, ''), // Remove spaces if any
    },
});

export async function sendEmail(to: string, subject: string, html: string) {
    // If no credentials, fallback to mock
    if (!process.env.MAIL_USERNAME || !process.env.MAIL_PASSWORD) {
        console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME || 'KnowledgeShare'}" <${process.env.MAIL_FROM}>`,
            to,
            subject,
            html,
        });
        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        // Don't throw, just log. Or throw if critical?
        // For verify flow, maybe we should know if it failed.
        throw error;
    }
}
