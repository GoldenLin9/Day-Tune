// app/api/sendEmail/route.ts

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { redirect } from 'next/navigation';

export async function POST(request: Request) {

    const GMAIL_USER = process.env.GMAIL_USER as string;
    const GMAIL_PASS = process.env.GMAIL_PASSWORD as string;


    const {to, subject, text } = await request.json();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        secure: false, // true for 465, false for other ports
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_PASS
        }
      })

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: to,
        subject: subject,
        text: text
    };

    
    try {
        await transporter.sendMail(mailOptions);
        return NextResponse.json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
