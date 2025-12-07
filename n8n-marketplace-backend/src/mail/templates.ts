export const getVerificationEmailTemplate = (url: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #f4f4f5;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #ea580c 0%, #db2777 100%);
      padding: 40px 0;
      text-align: center;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 40px;
      color: #333333;
    }
    .content h2 {
      color: #18181b;
      font-size: 24px;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .content p {
      color: #52525b;
      font-size: 16px;
      margin-bottom: 30px;
    }
    .button-container {
      text-align: center;
      margin: 40px 0;
    }
    .button {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 16px;
      display: inline-block;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
      transition: transform 0.2s;
    }
    .button:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
    }
    .footer {
      background-color: #fafafa;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #f4f4f5;
    }
    .footer p {
      color: #a1a1aa;
      font-size: 12px;
      margin: 0;
    }
    .link-text {
      color: #2563eb;
      word-break: break-all;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>FlowStore</h1>
    </div>
    <div class="content">
      <h2>Verify your email address</h2>
      <p>Thanks for joining FlowStore! We're excited to have you on board. Please verify your email address to get access to thousands of premium n8n workflows.</p>
      
      <div class="button-container">
        <a href="${url}" class="button">Verify Email Address</a>
      </div>
      
      <p style="margin-bottom: 10px;">Or copy and paste this link into your browser:</p>
      <a href="${url}" class="link-text">${url}</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} FlowStore. All rights reserved.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>
`;
