import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { getVerificationEmailTemplate } from './templates';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const mailConfig = {
      host: this.configService.get('mail.host'),
      port: this.configService.get('mail.port'),
      secure: this.configService.get('mail.secure'),
      auth: {
        user: this.configService.get('mail.user'),
        pass: this.configService.get('mail.pass'),
      },
    };

    console.log('Mail Config:', {
      ...mailConfig,
      auth: { ...mailConfig.auth, pass: '****' }
    });

    this.transporter = nodemailer.createTransport(mailConfig);
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `${this.configService.get('app.frontendUrl')}/auth/verify?token=${token}`;
    
    const from = this.configService.get('mail.from');
    console.log(`Attempting to send email from: ${from} to: ${email}`);
    
    try {
      await this.transporter.sendMail({
        from,
        to: email,
        subject: 'Verify your email address',
        html: getVerificationEmailTemplate(url),
      });
      console.log(`Verification email sent to ${email}`);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw error;
    }
  }
}
