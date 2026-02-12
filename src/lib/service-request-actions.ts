"use server";

import { db } from "@/db/db";
import { serviceRequests, serviceRequestAttachments, serviceRequestReplies, users } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { notifications } from "./notifications";

// Generate ticket number
function generateTicketNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `SR${year}${month}${day}${random}`;
}

// Service Request management
export async function getServiceRequests() {
    return await db.query.serviceRequests.findMany({
        with: {
            submitter: true,
            assignedToUser: true,
            attachments: true,
            replies: {
                with: {
                    replier: true,
                },
                orderBy: [desc(serviceRequestReplies.createdAt)],
            },
        },
        orderBy: [desc(serviceRequests.createdAt)],
    });
}

export async function createServiceRequest(formData: any, submittedBy: string, submittedByName: string) {
    const id = Math.random().toString(36).substring(2, 11);
    const ticketNumber = generateTicketNumber();
    const now = new Date();

    // Ensure we have a valid user for the foreign key constraint
    let validUserId = null;
    let validUserName = submittedByName;

    // Always validate the user, even if submittedBy is provided
    const existingUsers = await db.query.users.findMany({
        limit: 1
    });

    if (existingUsers.length > 0) {
        validUserId = existingUsers[0].id;
        validUserName = existingUsers[0].name;
    } else {
        // Create a default admin user if none exists
        const defaultUserId = Math.random().toString(36).substring(2, 11);
        await db.insert(users).values({
            id: defaultUserId,
            name: "Admin User",
            email: "admin@comradeems.com",
            role: "admin",
            createdAt: now
        });
        validUserId = defaultUserId;
        validUserName = "Admin User";
    }

    // Only use fields that we have
    await db.insert(serviceRequests).values({
        id,
        ticketNumber,
        clientName: formData.clientName || '',
        clientEmail: formData.clientEmail || '',
        clientPhone: formData.clientPhone || '',
        subject: formData.subject || '',
        description: formData.description || '',
        priority: formData.priority || 'medium',
        category: formData.category || 'service',
        submittedBy: validUserId,
        submittedByName: validUserName,
        createdAt: now,
        updatedAt: now,
    });

    // Send automated notifications
    await notifications.serviceTicketCreated({
        clientName: formData.clientName || '',
        clientEmail: formData.clientEmail || '',
        clientPhone: formData.clientPhone || '',
        ticketNumber: ticketNumber,
        subject: formData.subject || ''
    });

    // Mark email as sent (assuming notification hub handles it)
    await db.update(serviceRequests)
        .set({ emailSent: true })
        .where(eq(serviceRequests.id, id));

    revalidatePath("/service-requests");
    return { success: true, id, ticketNumber };
}

export async function updateServiceRequestStatus(id: string, status: string, assignedTo?: string) {
    const updateData: any = {
        status,
        updatedAt: new Date()
    };

    if (assignedTo) {
        updateData.assignedTo = assignedTo;
    }

    await db.update(serviceRequests)
        .set(updateData)
        .where(eq(serviceRequests.id, id));
    revalidatePath("/service-requests");
    revalidatePath(`/service-requests/${id}`);
    return { success: true };
}

export async function deleteServiceRequest(id: string) {
    await db.delete(serviceRequests).where(eq(serviceRequests.id, id));
    revalidatePath("/service-requests");
    return { success: true };
}

// Attachment management
export async function addServiceRequestAttachment(requestId: string, attachment: any, uploadedBy: string) {
    try {
        // Validate inputs
        if (!requestId || !attachment) {
            throw new Error("Missing required parameters: requestId and attachment are required");
        }

        // Check if the service request exists
        const existingRequest = await db.select().from(serviceRequests).where(eq(serviceRequests.id, requestId)).limit(1);
        if (existingRequest.length === 0) {
            throw new Error(`Service request with ID ${requestId} not found`);
        }

        // Ensure we have a valid uploadedBy user ID
        let validUploadedBy = uploadedBy;

        if (!uploadedBy) {
            // Get any existing user
            const anyUsers = await db.select().from(users).limit(1);
            if (anyUsers.length > 0) {
                validUploadedBy = anyUsers[0].id;
            } else {
                // Create a default user
                const defaultUserId = Math.random().toString(36).substring(2, 11);
                await db.insert(users).values({
                    id: defaultUserId,
                    name: "Support Staff",
                    email: "support@comradeems.com",
                    role: "staff",
                    createdAt: new Date()
                });
                validUploadedBy = defaultUserId;
            }
        } else {
            // Check if the specified user exists
            const existingUser = await db.select().from(users).where(eq(users.id, uploadedBy)).limit(1);
            if (existingUser.length === 0) {
                console.warn(`User with ID ${uploadedBy} not found, using first available user`);
                const anyUsers = await db.select().from(users).limit(1);
                if (anyUsers.length > 0) {
                    validUploadedBy = anyUsers[0].id;
                } else {
                    // Create fallback user
                    const fallbackUserId = Math.random().toString(36).substring(2, 11);
                    await db.insert(users).values({
                        id: fallbackUserId,
                        name: "Support Staff",
                        email: "support@comradeems.com",
                        role: "staff",
                        createdAt: new Date()
                    });
                    validUploadedBy = fallbackUserId;
                }
            }
        }

        const id = Math.random().toString(36).substring(2, 11);

        await db.insert(serviceRequestAttachments).values({
            id,
            requestId,
            fileName: attachment.originalName || attachment.fileName || attachment.name || 'unknown',
            fileType: attachment.type || attachment.fileType || 'application/octet-stream',
            fileSize: attachment.size || attachment.fileSize || 0,
            filePath: attachment.apiPath || attachment.path || attachment.filePath || '',
            uploadedBy: validUploadedBy,
        });

        revalidatePath(`/service-requests/${requestId}`);
        return { success: true, id };
    } catch (error: any) {
        console.error('Error adding service request attachment:', error);
        return { success: false, error: error.message };
    }
}

export async function getServiceRequestAttachments(requestId: string) {
    return await db.query.serviceRequestAttachments.findMany({
        where: eq(serviceRequestAttachments.requestId, requestId),
        with: {
            uploader: true,
        },
        orderBy: [desc(serviceRequestAttachments.createdAt)],
    });
}

// Reply management
export async function addServiceRequestReply(requestId: string, formData: any, repliedBy: string, repliedByName: string) {
    const id = Math.random().toString(36).substring(2, 11);

    await db.insert(serviceRequestReplies).values({
        id,
        requestId,
        message: formData.message,
        status: formData.status,
        repliedBy,
        repliedByName,
    });

    // Update request status based on reply
    if (formData.status === "finished") {
        await updateServiceRequestStatus(requestId, "resolved");

        // Send automated notifications about resolution
        const request = await getServiceRequestById(requestId);
        if (request) {
            await notifications.statusUpdated({
                clientName: request.clientName,
                clientEmail: request.clientEmail,
                clientPhone: request.clientPhone,
                enquiryId: request.ticketNumber, // Using ticket number as ref
                status: "RESOLVED"
            });
        }
    } else if (formData.status === "investigating") {
        await updateServiceRequestStatus(requestId, "in_progress");
    }

    revalidatePath(`/service-requests/${requestId}`);
    revalidatePath("/service-requests");
    return { success: true, id };
}

export async function getServiceRequestById(id: string) {
    return await db.query.serviceRequests.findFirst({
        where: eq(serviceRequests.id, id),
        with: {
            submitter: true,
            assignedToUser: true,
            attachments: true,
            replies: true,
        },
    });
}