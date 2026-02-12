"use server";

import { db } from "@/db/db";
import { activityLogs } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function logActivity(
    entityType: 'enquiry' | 'service_request' | 'collection',
    entityId: string,
    action: string,
    details?: string,
    userId?: string,
    userName?: string
) {
    const id = Math.random().toString(36).substring(2, 11);

    await db.insert(activityLogs).values({
        id,
        entityType,
        entityId,
        action,
        details,
        userId,
        userName,
    });

    return { success: true };
}

export async function getActivityLogs(entityType: string, entityId: string) {
    return await db.query.activityLogs.findMany({
        where: (logs, { and, eq }) => and(
            eq(logs.entityType, entityType),
            eq(logs.entityId, entityId)
        ),
        orderBy: [desc(activityLogs.createdAt)],
    });
}
