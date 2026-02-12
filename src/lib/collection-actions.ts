"use server";

import { db } from "@/db/db";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { collections, collectionDetails, collectionReplies, users, customers } from "@/db/schema";
import { relations } from "drizzle-orm"; // Not really needed if relations are defined in schema? But file might use them... no, mostly API functions.

// Types
export type CollectionType = "cheque" | "cash" | "deposit" | "bank_transfer" | "other";
export type CollectionStatus = "pending" | "in_progress" | "completed" | "failed";
export type ChequeStatus = "pending" | "cleared" | "bounced" | "cancelled";

// API Functions
export async function getCollections() {
    return await db.query.collections.findMany({
        with: {
            customer: true,
            collector: true,
            staffMember: true,
            details: true,
            replies: true,
        },
        orderBy: [desc(collections.collectionDate)],
    });
}

export async function getCollectionById(id: string) {
    return await db.query.collections.findFirst({
        where: eq(collections.id, id),
        with: {
            customer: true,
            collector: true,
            staffMember: true,
            details: true,
            replies: {
                with: {
                    collector: true,
                },
            },
        },
        orderBy: [desc(collections.collectionDate)],
    });
}

export async function createCollection(collectionData: any, collectorId: string, staffId: string) {
    const id = Math.random().toString(36).substring(2, 11);
    const now = new Date();

    await db.insert(collections).values({
        id,
        ...collectionData,
        collectorId,
        staffId,
        createdAt: now,
        updatedAt: now,
    });

    return { success: true, id };
}

export async function updateCollection(id: string, updates: any) {
    const updatedAt = new Date();

    await db.update(collections)
        .set({ ...updates, updatedAt })
        .where(eq(collections.id, id));

    return { success: true };
}

export async function deleteCollection(id: string) {
    await db.delete(collections)
        .where(eq(collections.id, id));

    return { success: true };
}

// Collection Details Management
export async function addCollectionDetails(collectionId: string, detailData: any, staffId: string) {
    const id = Math.random().toString(36).substring(2, 11);
    const now = new Date();

    await db.insert(collectionDetails).values({
        id,
        collectionId,
        ...detailData,
        createdAt: now,
    });

    return { success: true, id };
}

export async function updateCollectionDetail(id: string, updates: any) {
    await db.update(collectionDetails)
        .set({ ...updates })
        .where(eq(collectionDetails.id, id));

    return { success: true };
}

export async function deleteCollectionDetail(id: string) {
    await db.delete(collectionDetails)
        .where(eq(collectionDetails.id, id));

    return { success: true };
}

// Collection Replies
export async function addCollectionReply(collectionId: string, message: string, staffId: string) {
    const id = Math.random().toString(36).substring(2, 11);
    const now = new Date();

    const user = await db.query.users.findFirst({
        where: eq(users.id, staffId)
    });

    if (!user) {
        throw new Error('Staff user not found');
    }

    await db.insert(collectionReplies).values({
        id,
        collectionId,
        message,
        staffId,
        staffName: user.name,
        createdAt: now,
    });

    return { success: true, id };
}

// Staff Assignment and Performance
export async function assignCollectionToStaff(collectionId: string, staffId: string, assignedPercentage: number) {

    const now = new Date();

    // Update collection with staff assignment
    await db.update(collections)
        .set({
            staffId,
            assignedPercentage,
            updatedAt: now,
        })
        .where(eq(collections.id, collectionId));

    return { success: true, staffId };
}

export async function updateCollectionStatus(id: string, status: CollectionStatus) {
    const now = new Date();

    await db.update(collections)
        .set({
            status,
            updatedAt: now,
        })
        .where(eq(collections.id, id));

    return { success: true };
}

export async function getCollectionStatistics() {
    const stats = await db.select({
        totalCollected: sql<number>`SUM(CASE WHEN ${collections.totalCollected} > 0 THEN ${collections.totalCollected} ELSE 0 END) as total`,
        targetAmount: sql<number>`SUM(CASE WHEN ${collections.targetAmount} > 0 THEN ${collections.targetAmount} ELSE 0 END) as target`,
        completedCollections: sql<number>`COUNT(CASE WHEN ${collections.status} = 'completed' THEN 1 ELSE 0 END) as completed`,
        pendingCollections: sql<number>`COUNT(CASE WHEN ${collections.status} = 'pending' THEN 1 ELSE 0 END) as pending`,
        inProgressCollections: sql<number>`COUNT(CASE WHEN ${collections.status} = 'in_progress' THEN 1 ELSE 0 END) as inProgress`,
        failedCollections: sql<number>`COUNT(CASE WHEN ${collections.status} = 'failed' THEN 1 ELSE 0 END) as failed`,
    })
        .from(collections);

    return stats[0] || {
        totalCollected: 0,
        targetAmount: 0,
        completedCollections: 0,
        pendingCollections: 0,
        inProgressCollections: 0,
        failedCollections: 0,
    };
}

// Cheque Management
export async function updateChequeStatus(detailId: string, status: ChequeStatus, notes?: string) {
    const updatedAt = new Date();

    const updateData: any = { status, updatedAt };
    if (notes) {
        updateData.notes = notes;
    }

    await db.update(collectionDetails)
        .set(updateData)
        .where(eq(collectionDetails.id, detailId));

    return { success: true };
}

// Staff Performance Metrics
export async function getStaffPerformance(startDate: string, endDate: string) {
    const performance = await db.select({
        staffId: users.id,
        staffName: users.name,
        totalCollections: sql<number>`COUNT(CASE WHEN ${collections.status} = 'completed' THEN 1 ELSE 0 END) as total`,
        totalAmount: sql<number>`SUM(CASE WHEN ${collections.status} = 'completed' THEN ${collections.totalCollected} ELSE 0 END) as collected`,
        completionRate: sql<number>`(CASE WHEN COUNT(CASE WHEN ${collections.status} = 'completed' THEN 1 ELSE 0 END) > 0 THEN 
            ROUND(CAST(SUM(CASE WHEN ${collections.status} = 'completed' THEN ${collections.totalCollected} ELSE 0 END) as REAL) / 
            CAST(COUNT(CASE WHEN ${collections.status} = 'completed' THEN 1 ELSE 0 END) as REAL) * 100, 2
        ) as completionRate`,
    })
        .from(collections)
        .innerJoin(users, eq(collections.staffId, users.id))
        .where(and(
            sql`${collections.collectionDate} >= ${startDate}`,
            sql`${collections.collectionDate} <= ${endDate}`
        ))
        .groupBy(users.id, users.name)
        .orderBy(desc(sql`totalCollections`));

    return performance;
}

// Customer Management
export async function getCustomers() {
    return await db.query.customers.findMany({
        with: {
            collections: true,
        },
        orderBy: [desc(customers.createdAt)],
    });
}

export async function getCustomerCollections(customerId: string) {
    return await db.query.collections.findMany({
        where: eq(collections.customerId, customerId),
        with: {
            customer: true,
            collector: true,
            staffMember: true,
            details: true,
        },
        orderBy: [desc(collections.collectionDate)],
    });
}