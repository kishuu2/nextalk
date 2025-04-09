const nodemailer = require("nodemailer");

async function sendOTPEmail(email, otp) {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: `"Nextalk Support" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: "Your OTP Code",
        html: `<h6>do not share One Time Password anyone!<h6/><br/>
        <p>Here is your OTP: <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
    });
}

module.exports = sendOTPEmail;
