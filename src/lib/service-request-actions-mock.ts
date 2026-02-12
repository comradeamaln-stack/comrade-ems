

// Mock data for development without database dependencies
const mockServiceRequests = [
    {
        id: "1",
        ticketNumber: "SR20240101001",
        clientName: "John Doe",
        clientEmail: "john@example.com",
        clientPhone: "+1234567890",
        subject: "Login Issue",
        description: "User cannot login to the system",
        priority: "high",
        category: "technical",
        status: "open",
        submittedBy: "user1",
        submittedByName: "Support Staff",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailSent: true,
        attachments: [],
        replies: []
    },
    {
        id: "2",
        ticketNumber: "SR20240101002",
        clientName: "Jane Smith",
        clientEmail: "jane@example.com",
        clientPhone: "+0987654321",
        subject: "Feature Request",
        description: "Would like to see dark mode implemented",
        priority: "medium",
        category: "feature",
        status: "in_progress",
        submittedBy: "user1",
        submittedByName: "Support Staff",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        emailSent: true,
        attachments: [
            {
                id: "att1",
                fileName: "screenshot.png",
                fileType: "image/png",
                fileSize: 245760,
                filePath: "/api/uploads/17041234567-screenshot.png",
                uploadedBy: "user1",
                createdAt: new Date().toISOString()
            }
        ],
        replies: [
            {
                id: "rep1",
                message: "We are working on implementing dark mode for the application.",
                status: "pending",
                repliedBy: "user1",
                repliedByName: "Support Staff",
                createdAt: new Date(Date.now() - 43200000).toISOString()
            }
        ]
    }
];

// Service Request management functions without database dependencies
export async function getServiceRequests() {
    return mockServiceRequests;
}

export async function createServiceRequest(formData: any, submittedBy: string, submittedByName: string) {
    const id = Math.random().toString(36).substring(2, 11);
    const ticketNumber = `SR${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Mock create - in production this would save to database
    console.log('Creating service request:', { formData, submittedBy, submittedByName });

    return {
        success: true,
        id,
        ticketNumber
    };
}

export async function updateServiceRequestStatus(id: string, status: string, assignedTo?: string) {
    console.log('Updating service request status:', { id, status, assignedTo });
    return { success: true };
}

export async function addServiceRequestAttachment(requestId: string, attachment: any, uploadedBy: string) {
    const id = "att-" + Math.random().toString(36).substring(2, 11);
    console.log('Adding service request attachment:', { requestId, attachment, uploadedBy });

    return {
        success: true,
        id,
        fileName: attachment.name || 'unknown',
        filePath: `/api/uploads/${attachment.fileName || attachment.name}`,
        error: undefined as string | undefined
    };
}

export async function getServiceRequestById(id: string) {
    return mockServiceRequests.find(req => req.id === id) || null;
}

export async function addServiceRequestReply(requestId: string, formData: any, repliedBy: string, repliedByName: string) {
    const id = Math.random().toString(36).substring(2, 11);
    console.log('Adding service request reply:', { requestId, formData, repliedBy, repliedByName });

    return {
        success: true,
        id
    };
}

// Mock users for compatibility
export const users = [
    { id: "user1", name: "Support Staff", email: "support@comradeems.com", role: "staff", createdAt: new Date().toISOString() }
];

// Mock email function
export const sendEmail = async (email: string, template: any) => {
    console.log('Sending email to:', email);
    return { success: true };
};

// Mock email templates
export const emailTemplates = {
    serviceRequestCreated: (name: string, ticketNumber: string, subject: string) => ({
        subject: `Service Request Created - ${ticketNumber}`,
        html: `
            <h2>Service Request Confirmed</h2>
            <p>Dear ${name},</p>
            <p>Your service request <strong>${ticketNumber}</strong> has been created successfully.</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p>We will review your request and get back to you shortly.</p>
            <p>Best regards,<br>Comrade EMS Team</p>
        `
    })
};

// Revalidation function mock
export const revalidatePath = (path: string) => {
    console.log('Revalidating path:', path);
};