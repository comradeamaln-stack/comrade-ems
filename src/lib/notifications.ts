import { sendEmail, emailTemplates } from "./email";

/**
 * Interface for notification data
 */
interface NotificationData {
    clientName: string;
    clientEmail?: string | null;
    clientPhone?: string | null;
    enquiryId?: string;
    ticketNumber?: string;
    subject?: string;
    status?: string;
    message?: string;
}

/**
 * Sends a WhatsApp message (Simulation/Placeholder for now)
 * In a real-world scenario, you would use Twilio, Meta WhatsApp Business API, etc.
 */
export async function sendWhatsApp(phone: string, message: string) {
    // Normalize phone number
    const cleanPhone = phone.replace(/[^0-9]/g, "");

    // Simulation: Log the WhatsApp message
    console.log(`📱 WHATSAPP NOTIFICATION SENT TO: ${phone}`);
    console.log(`   Message: ${message}`);

    // In a real app, you might use fetch to a WhatsApp API provider
    /*
    await fetch('https://api.whatsapp-provider.com/send', {
      method: 'POST',
      body: JSON.stringify({ to: cleanPhone, message })
    });
    */

    return { success: true, provider: "simulation" };
}

/**
 * Centralized Notification Hub
 */
export const notifications = {
    /**
     * Notify client about a new enquiry
     */
    enquiryReceived: async (data: NotificationData) => {
        // 1. Send Auto Email
        if (data.clientEmail) {
            const template = emailTemplates.welcomeEnquiry(data.clientName, data.enquiryId || "");
            await sendEmail(data.clientEmail, template);
        }

        // 2. Send Auto WhatsApp
        if (data.clientPhone) {
            const message = `Hello ${data.clientName}! 👋 Thank you for your enquiry at Comrade CRM. Your reference is #${data.enquiryId}. We will get back to you shortly.`;
            await sendWhatsApp(data.clientPhone, message);
        }
    },

    /**
     * Notify client about status change
     */
    statusUpdated: async (data: NotificationData) => {
        if (data.clientEmail) {
            const template = {
                subject: `Update on your Enquiry #${data.enquiryId}`,
                html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #6366f1;">Enquiry Update</h2>
            <p>Dear <strong>${data.clientName}</strong>,</p>
            <p>The status of your enquiry <strong>#${data.enquiryId}</strong> has been updated to: <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${data.status}</span></p>
            <p>Our team is working on your request and will contact you if any further information is needed.</p>
            <p>Best regards,<br>Comrade CRM Team</p>
          </div>
        `,
                text: `Dear ${data.clientName}, the status of your enquiry #${data.enquiryId} has been updated to ${data.status}. Best regards, Comrade CRM Team`
            };
            await sendEmail(data.clientEmail, template);
        }

        if (data.clientPhone) {
            const message = `Hi ${data.clientName}, your enquiry #${data.enquiryId} status has been updated to: ${data.status}. We are working on it! 🚀`;
            await sendWhatsApp(data.clientPhone, message);
        }
    },

    /**
     * Notify client about new service ticket
     */
    serviceTicketCreated: async (data: NotificationData) => {
        if (data.clientEmail) {
            const template = emailTemplates.serviceRequestCreated(
                data.clientName,
                data.ticketNumber || "",
                data.subject || ""
            );
            await sendEmail(data.clientEmail, template);
        }

        if (data.clientPhone) {
            const message = `Hi ${data.clientName}, we've opened a new service ticket for you: #${data.ticketNumber}. Subject: ${data.subject}. We're on it! 🛠️`;
            await sendWhatsApp(data.clientPhone, message);
        }
    }
};
