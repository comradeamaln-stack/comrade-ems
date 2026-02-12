# Comrade CRM - Email Configuration Guide

## Setting Up Email Notifications

To enable automatic email notifications when enquiries are registered, you need to configure your email credentials.

### Step 1: Create Environment File

Create a file named `.env.local` in the root directory (d:\ComradeEMS) with the following content:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Step 2: Configure Gmail (Recommended)

If using Gmail:

1. **Enable 2-Step Verification**
   - Go to https://myaccount.google.com/security
   - Turn on 2-Step Verification

2. **Create App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Click "Generate"
   - Copy the 16-character password

3. **Update .env.local**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-actual-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

### Alternative SMTP Services

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

#### Yahoo Mail
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

#### SendGrid (Professional)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### Step 3: Restart the Development Server

After creating `.env.local`, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Testing Email Functionality

1. Create a new enquiry with a valid email address
2. Check the terminal for email sending logs
3. The client should receive a welcome email

### Email Template

The system sends a professional HTML email with:
- Welcome message
- Enquiry reference number
- Company branding
- Automated response notice

### Troubleshooting

**Email not sending?**
- Check terminal for error messages
- Verify credentials in `.env.local`
- Ensure "Less secure app access" is enabled (Gmail)
- Check spam folder

**Gmail blocking sign-in?**
- Use App Password instead of regular password
- Enable 2-Step Verification first
- Allow access from new devices

### Security Notes

- Never commit `.env.local` to version control
- Use App Passwords, not your main password
- Rotate credentials regularly
- Consider using professional email services for production
