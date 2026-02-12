"use server";

import { db } from "@/db/db";
import { enquiries, users, appointments, followups, performanceStats } from "@/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { updateEnquiryLeadScore } from "./lead-scoring";
import { notifications } from "./notifications";

export async function getEnquiries() {
    return await db.query.enquiries.findMany({
        with: {
            assignedTo: true,
        },
        orderBy: [desc(enquiries.createdAt)],
    });
}

export async function createEnquiry(formData: any) {
    const id = Math.random().toString(36).substring(2, 11);
    const now = new Date();

    await db.insert(enquiries).values({
        id,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        source: formData.source,
        priority: formData.priority,
        description: formData.description,
        status: "new",
        createdAt: now,
        updatedAt: now,
    });

    // Send automated notifications
    await notifications.enquiryReceived({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        enquiryId: id
    });

    // Calculate initial lead score
    await updateEnquiryLeadScore(id);

    revalidatePath("/enquiries");
    return { success: true, id };
}

export async function getEnquiryById(id: string) {
    return await db.query.enquiries.findFirst({
        where: eq(enquiries.id, id),
        with: {
            assignedTo: true,
        },
    });
}

export async function deleteEnquiry(id: string) {
    await db.delete(enquiries).where(eq(enquiries.id, id));
    revalidatePath("/enquiries");
    return { success: true };
}

export async function updateEnquiryStatus(id: string, status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "closed_won" | "closed_lost") {
    await db.update(enquiries)
        .set({ status, updatedAt: new Date() })
        .where(eq(enquiries.id, id));
    // Update lead score
    await updateEnquiryLeadScore(id);

    // Send status update notification
    const enquiry = await getEnquiryById(id);
    if (enquiry) {
        await notifications.statusUpdated({
            clientName: enquiry.clientName,
            clientEmail: enquiry.clientEmail,
            clientPhone: enquiry.clientPhone,
            enquiryId: enquiry.id,
            status: status
        });
    }

    revalidatePath("/enquiries");
    revalidatePath(`/enquiries/${id}`);
    return { success: true };
}

export async function updateEnquiry(id: string, updates: any) {
    await db.update(enquiries)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(enquiries.id, id));
    // Update lead score
    await updateEnquiryLeadScore(id);

    revalidatePath("/enquiries");
    revalidatePath(`/enquiries/${id}`);
    revalidatePath(`/enquiries/${id}/edit`);
    return { success: true };
}

// Team/User management actions
export async function getUsers() {
    return await db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
    });
}

export async function createUser(formData: any) {
    const id = Math.random().toString(36).substring(2, 11);
    const now = new Date();

    await db.insert(users).values({
        id,
        name: formData.name,
        email: formData.email,
        password: formData.password || "password123",
        role: formData.role || "staff",
        designation: formData.designation || "salesman",
        status: formData.status || "active",
        createdAt: now,
    });

    revalidatePath("/team");
    return { success: true, id };
}

export async function deleteUser(id: string) {
    await db.delete(users).where(eq(users.id, id));
    revalidatePath("/team");
    return { success: true };
}

// Appointments management
export async function getAppointments() {
    return await db.query.appointments.findMany({
        with: {
            enquiry: true,
        },
        orderBy: [desc(appointments.scheduledAt)],
    });
}

export async function createAppointment(formData: any) {
    const id = Math.random().toString(36).substring(2, 11);
    const now = new Date();

    // Parse the scheduled date
    const scheduledAt = new Date(`${formData.date}T${formData.time || '09:00'}`);

    await db.insert(appointments).values({
        id,
        enquiryId: formData.enquiryId,
        title: formData.title,
        description: formData.description,
        scheduledAt,
        status: "scheduled",
        alertSent: false,
    });

    // Send automated notification
    const enquiry = await getEnquiryById(formData.enquiryId);
    if (enquiry) {
        await notifications.statusUpdated({
            clientName: enquiry.clientName,
            clientEmail: enquiry.clientEmail,
            clientPhone: enquiry.clientPhone,
            enquiryId: enquiry.id,
            status: "Appointment Scheduled"
        });
    }

    revalidatePath("/appointments");
    return { success: true, id };
}

export async function updateAppointmentStatus(id: string, status: "scheduled" | "completed" | "cancelled" | "missed") {
    await db.update(appointments)
        .set({ status })
        .where(eq(appointments.id, id));
    revalidatePath("/appointments");
    return { success: true };
}

export async function deleteAppointment(id: string) {
    await db.delete(appointments).where(eq(appointments.id, id));
    revalidatePath("/appointments");
    return { success: true };
}

// Follow-up management
export async function getFollowups(enquiryId?: string) {
    if (enquiryId) {
        return await db.query.followups.findMany({
            where: eq(followups.enquiryId, enquiryId),
            with: {
                staff: true,
                enquiry: true,
            },
            orderBy: [desc(followups.createdAt)],
        });
    }

    return await db.query.followups.findMany({
        with: {
            staff: true,
            enquiry: true,
        },
        orderBy: [desc(followups.createdAt)],
    });
}

export async function createFollowup(formData: any) {
    const id = Math.random().toString(36).substring(2, 11);
    const now = new Date();

    await db.insert(followups).values({
        id,
        enquiryId: formData.enquiryId,
        staffId: formData.staffId,
        content: formData.content,
        type: formData.type,
        createdAt: now,
    });

    // Update lead score
    await updateEnquiryLeadScore(formData.enquiryId);

    revalidatePath(`/enquiries/${formData.enquiryId}`);
    return { success: true, id };
}

// Performance stats
export async function getPerformanceStats() {
    return await db.query.performanceStats.findMany({
        with: {
            staff: true,
        },
        orderBy: [desc(performanceStats.month)],
    });
}

export async function updatePerformanceStats(staffId: string, month: string, updates: any) {
    const existing = await db.query.performanceStats.findFirst({
        where: and(
            eq(performanceStats.staffId, staffId),
            eq(performanceStats.month, month)
        ),
    });

    if (existing) {
        await db.update(performanceStats)
            .set({ ...updates, updatedAt: new Date() })
            .where(and(
                eq(performanceStats.staffId, staffId),
                eq(performanceStats.month, month)
            ));
    } else {
        const id = Math.random().toString(36).substring(2, 11);
        await db.insert(performanceStats).values({
            id,
            staffId,
            month,
            ...updates,
            updatedAt: new Date(),
        });
    }

    revalidatePath("/performance");
    return { success: true };
}
