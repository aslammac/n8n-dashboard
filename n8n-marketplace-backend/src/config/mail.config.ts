import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => {
  const port = parseInt(process.env.MAIL_PORT || '587', 10);
  
  // Default secure to true if port is 465, otherwise false.
  // If MAIL_SECURE is explicitly set, respect it, UNLESS port is 587 which is typically STARTTLS (secure: false).
  let secure = process.env.MAIL_SECURE !== undefined 
    ? process.env.MAIL_SECURE === 'true' 
    : port === 465;

  if (port === 587) {
    secure = false;
  }

  return {
    host: process.env.MAIL_HOST,
    port,
    secure,
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM_NAME && process.env.MAIL_FROM_EMAIL 
      ? `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_EMAIL}>`
      : (process.env.MAIL_FROM || '"No Reply" <noreply@example.com>'),
    mailjet: {
      apiKey: process.env.MAILJET_API_KEY,
      apiSecret: process.env.MAILJET_API_SECRET,
    }
  };
});
