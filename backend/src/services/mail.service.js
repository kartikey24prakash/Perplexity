import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",      // ← Changed from service to host
    port: 587,                    // ← Added explicit port
    secure: false,                // ← Added (false for port 587)
    auth: {
        type: 'OAuth2',
        user: process.env.GOOGLE_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,      // ← Fixed order
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN
    },
    family: 4,                    // ← Force IPv4 (CRITICAL for Render)
    connectionTimeout: 10000,     // ← Added timeout
    greetingTimeout: 5000,
    socketTimeout: 15000
});

// Make verification non-blocking
transporter.verify()
    .then(() => { 
        console.log("✅ Email transporter is ready to send emails"); 
    })
    .catch((err) => { 
        console.error("❌ Email transporter verification failed:", err.message);
        // Don't throw - let app continue running
    });

export async function sendEmail({ to, subject, html, text }) {
    try {
        const mailOptions = {
            from: process.env.GOOGLE_USER,
            to,
            subject,
            html,
            text
        };

        const details = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent:", details.messageId);
        return details;
    } catch (error) {
        console.error("❌ Failed to send email:", error.message);
        throw error;
    }
}