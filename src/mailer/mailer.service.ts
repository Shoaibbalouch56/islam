import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendOtp(email: string, otp: string) {
    const appName =
      this.configService.get<string>('APP_NAME') ?? 'Door-to-Door Islam';
    const supportEmail =
      this.configService.get<string>('SUPPORT_EMAIL') ??
      this.configService.get<string>('SMTP_USER');

    const mailOptions = {
      from: `"${appName}" <${supportEmail}>`,
      to: email,
      subject: 'Your verification code',
      text: `Your verification code is ${otp}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #1a1a1a; color: #fff;">
          <h2 style="color: #D4AF37;">Email Verification</h2>
          <p>Your 6-digit verification code is:</p>
          <h1 style="color: #D4AF37; letter-spacing: 8px;">${otp}</h1>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
    return true;
  }
}
