import nodemailer from "nodemailer";

// Email configuration
// You can use Gmail, Outlook, or any SMTP service
// For Gmail: You need to enable "App Passwords" in your Google Account settings

export const emailConfig = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || "", // Your email address
    pass: process.env.EMAIL_PASSWORD || "", // Your email password or app password
  },
};

// Create reusable transporter
export const transporter = nodemailer.createTransport(emailConfig);

// Email templates
export const emailTemplates = {
  welcomeEnquiry: (clientName: string, enquiryId: string) => ({
    subject: "Thank you for your enquiry - Comrade CRM",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #818cf8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Thank You for Your Enquiry!</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${clientName}</strong>,</p>
              
              <p>Thank you for reaching out to us! We have successfully received your enquiry and our team is reviewing it.</p>
              
              <p><strong>Your Enquiry Reference:</strong> #${enquiryId}</p>
              
              <p>One of our representatives will get back to you within 24 hours. In the meantime, if you have any urgent questions, please don't hesitate to contact us.</p>
              
              <p>We look forward to assisting you!</p>
              
              <div class="footer">
                <p>Best regards,<br><strong>Comrade CRM Team</strong></p>
                <p style="font-size: 12px; color: #94a3b8;">This is an automated message. Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Dear ${clientName},\n\nThank you for reaching out to us! We have successfully received your enquiry.\n\nYour Enquiry Reference: #${enquiryId}\n\nOne of our representatives will get back to you within 24 hours.\n\nBest regards,\nComrade CRM Team`,
  }),

  serviceRequestCreated: (clientName: string, ticketNumber: string, subject: string) => ({
    subject: `Service Request Created - Ticket #${ticketNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; }
            .ticket-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Service Request Received!</h1>
              <p>Comrade CRM Service Request Management</p>
            </div>
            <div class="content">
              <p>Dear <strong>${clientName}</strong>,</p>
              
              <p>We have received your service request and created a ticket for you. Our team will review it and get back to you shortly.</p>
              
              <div class="ticket-box">
                <h3>Ticket Information:</h3>
                <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
                <p><strong>Subject:</strong> ${subject}</p>
              </div>
              
              <p>What happens next?</p>
              <ul>
                <li>Our support team will review your request</li>
                <li>You'll receive updates via email</li>
                <li>We'll work to resolve your issue promptly</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: #10b981; color: white; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: bold;">
                  🎫 Ticket #${ticketNumber}
                </div>
              </div>
              
              <div class="footer">
                <p>Best regards,<br><strong>Comrade CRM Team</strong></p>
                <p>Need immediate assistance? Call us at <strong>+1 (555) 123-4567</strong></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Dear ${clientName},\n\nWe have received your service request.\n\nTicket Number: ${ticketNumber}\nSubject: ${subject}\n\nOur team will review your request and contact you soon.\n\nBest regards,\nComrade CRM Team`,
  }),

  serviceRequestResolved: (clientName: string, ticketNumber: string, resolutionMessage: string) => ({
    subject: `Service Request Resolved - Ticket #${ticketNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; }
            .resolution-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Service Request Resolved!</h1>
              <p>Comrade CRM Service Request Management</p>
            </div>
            <div class="content">
              <p>Dear <strong>${clientName}</strong>,</p>
              
              <p>Good news! Your service request has been resolved. Here are the details:</p>
              
              <div class="resolution-box">
                <h3>Resolution Information:</h3>
                <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
                <p><strong>Resolution Details:</strong></p>
                <p style="font-style: italic;">${resolutionMessage}</p>
              </div>
              
              <p>If you have any questions about this resolution or if the issue persists, please don't hesitate to contact us.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: #10b981; color: white; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: bold;">
                  🎫 Ticket #${ticketNumber} - RESOLVED
                </div>
              </div>
              
              <div class="footer">
                <p>Best regards,<br><strong>Comrade CRM Team</strong></p>
                <p>Thank you for choosing Comrade CRM!</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Dear ${clientName},\n\nYour service request has been resolved.\n\nTicket Number: ${ticketNumber}\nResolution: ${resolutionMessage}\n\nIf you have any questions, please contact us.\n\nBest regards,\nComrade CRM Team`,
  }),
};

// Send email function
export async function sendEmail(to: string, template: { subject: string; html: string; text: string }) {
  // Check if email is configured
  if (!emailConfig.auth.user || !emailConfig.auth.pass || emailConfig.auth.user === "" || emailConfig.auth.pass === "") {
    console.log("📧 EMAIL TEST MODE (Configure .env.local to send real emails)");
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${template.subject}`);
    console.log(`   Preview: ${template.text.substring(0, 100)}...`);
    return { success: true, messageId: "test-mode", testMode: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Comrade CRM" <${emailConfig.auth.user}>`,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
