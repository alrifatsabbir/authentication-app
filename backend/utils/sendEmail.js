// utils/sendEmail.js

import nodemailer from 'nodemailer';

export const sendOTPEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `AUTHENTICATE <${process.env.SMTP_USER}>`,
    to,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`,
    html: `<p>Your OTP code is: <strong>${otp}</strong></p>`,
  });
};
