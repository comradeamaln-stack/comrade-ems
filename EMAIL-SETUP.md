# 📧 Email Configuration Guide

## Current Status
The Comrade CRM email system is **fully implemented** and ready to use. It's currently running in test mode until you configure your email credentials.

## How to Configure Email

### Step 1: Update Your `.env.local` File
Replace the placeholder values in your `.env.local` file:

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
```

### Step 2: Get Gmail App Password
1. **Enable 2-Step Verification:**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification (if not already enabled)

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Comrade CRM"
   - Click "Generate"
   - Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
   - **Remove the spaces** when pasting into `.env.local`

### Step 3: Restart the Server
```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

## Email Features Available

### ✅ Service Request Emails
- **Creation:** Automatic email to customer when ticket is created
- **Resolution:** Email to customer when ticket is marked as "finished"

### ✅ Enquiry Emails  
- **Welcome:** Automatic email to new enquiries

### ✅ Professional Templates
- Modern HTML design with branding
- Text-only fallback versions
- Professional formatting

## Testing Email Configuration

After setting up your credentials:

1. **Create a test Service Request** at http://localhost:3000/service-requests
2. **Check the console** for email sending status
3. **Verify receipt** of emails at your test address

## Email Log Examples

### Test Mode (Current)
```
📧 EMAIL TEST MODE (Configure .env.local to send real emails)
   To: customer@example.com
   Subject: Service Request Created - Ticket #SR202602123001
   Preview: Dear Customer Name, We have received your service request...
```

### Live Mode (After Configuration)
```
✅ Email sent successfully: <abc123def456@smtp.gmail.com>
```

## Security Notes

- ✅ Emails are sent via secure SMTP (TLS)
- ✅ Passwords are stored in environment variables (not in code)
- ✅ App passwords are revocable at any time
- ✅ No email credentials are ever logged

## Alternative Email Providers

You can also use other email providers by updating `.env.local`:

### Outlook/Hotmail
```bash
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Other SMTP Services
Update `EMAIL_HOST`, `EMAIL_PORT`, and credentials accordingly.

## Troubleshooting

### "Authentication failed"
- Verify you're using an App Password (not your regular password)
- Ensure 2-Step Verification is enabled
- Check for typos in email/password

### "Connection timeout"
- Verify EMAIL_PORT is correct (587 for Gmail)
- Check firewall settings
- Ensure internet connectivity

### Need Help?
The system will provide detailed error messages in the console if email sending fails.

---

**🎉 Once configured, your CRM will automatically send professional emails to customers!**