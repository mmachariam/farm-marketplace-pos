<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f8f9fa; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: white;
                 border-radius: 12px; overflow: hidden; }
    .header { background: #198754; padding: 32px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .body { padding: 32px; }
    .body p { color: #444; line-height: 1.6; font-size: 15px; }
    .btn { display: inline-block; background: #198754; color: white;
           text-decoration: none; padding: 14px 32px; border-radius: 8px;
           font-size: 15px; font-weight: bold; margin: 20px 0; }
    .footer { padding: 20px 32px; border-top: 1px solid #eee; }
    .footer p { color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>SokoMoja</h1>
    </div>
    <div class="body">
      <p>Hello,</p>
      <p>We received a request to reset your SokoMoja password.
         Click the button below to choose a new password:</p>
      <p style="text-align:center">
        <a href="{{ $resetUrl }}" class="btn">Reset My Password</a>
      </p>
      <p>This link will expire in <strong>60 minutes</strong>.</p>
      <p>If you did not request a password reset, you can safely ignore
         this email. Your password will not change.</p>
      <p>If the button above does not work, copy and paste this link
         into your browser:<br>
         <span style="color:#198754;font-size:13px">{{ $resetUrl }}</span>
      </p>
    </div>
    <div class="footer">
      <p>© 2026 SokoMoja — Connecting Kenyan farmers directly with buyers.</p>
      <p>This is an automated email, please do not reply.</p>
    </div>
  </div>
</body>
</html>
