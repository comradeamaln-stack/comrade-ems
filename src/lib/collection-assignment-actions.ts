"use server";

import { db } from "@/db/db";
import { eq, sql, desc, and } from 'drizzle-orm';
import { collections, collectionAssignments, users } from "@/db/schema";

// Collection assignment page
export async function getCollectionAssignments() {
    return await db.query.collectionAssignments.findMany({
        with: {
            collection: {
                with: {
                    collector: true,
                    staffMember: true,
                },
            },
            staff: true,
        },
        orderBy: [desc(collectionAssignments.createdAt)],
    });
}

export async function getStaffMembers() {
    return await db.query.users.findMany({
        where: eq(users.role, 'staff'),
        orderBy: [users.name],
    });
}

export async function createCollectionAssignment(collectionId: string, staffId: string, assignedPercentage: number) {
    const id = Math.random().toString(36).substring(2, 11);

    await db.insert(collectionAssignments).values({
        id,
        collectionId,
        staffId,
        assignedPercentage,
        createdAt: new Date(),
    });

    return { success: true, id };
}

export async function updateCollectionAssignment(id: string, updates: any) {
    const updatedAt = new Date();

    await db.update(collectionAssignments)
        .set({ ...updates, updatedAt })
        .where(eq(collectionAssignments.id, id));

    return { success: true };
}

export async function getCollectionAssignmentStats(collectionId: string) {
    const stats = await db.select({
        assignedPercentage: sql<number>`AVG(assigned_percentage) as avg_assigned_percentage`,
        totalStaff: sql<number>`COUNT(DISTINCT staff_id) as total_staff`,
        activeAssignments: sql<number>`COUNT(CASE WHEN ${collections.status} = 'in_progress' THEN 1 ELSE 0 END) as active_assignments`,
    })
        .from(collectionAssignments)
        .where(eq(collectionAssignments.collectionId, collectionId))
        .innerJoin(collections, eq(collectionAssignments.collectionId, collections.id))
        .innerJoin(users, eq(collectionAssignments.staffId, users.id));

    return {
        ...stats[0],
        collectionId,
        staffMembers: await db.query.users.findMany({
            where: eq(users.role, 'staff'),
        }),
    };
}