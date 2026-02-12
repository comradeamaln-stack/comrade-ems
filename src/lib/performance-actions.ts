"use server";

import { db } from "@/db/db";
import { sql, eq, and, desc } from 'drizzle-orm';
import { collections, users, collectionAssignments, customers } from "@/db/schema";

// Performance Metrics calculations
export async function getPerformanceMetrics() {
    const stats = await db.select({
        totalCollections: sql<number>`COUNT(*)`,
        completedCollections: sql<number>`COUNT(CASE WHEN status = 'completed' THEN 1 ELSE NULL END)`,
        targetAmount: sql<number>`SUM(CASE WHEN status = 'completed' THEN target_amount ELSE 0 END)`,
        totalCollected: sql<number>`SUM(CASE WHEN status = 'completed' THEN total_collected ELSE 0 END)`,
        activeCollections: sql<number>`COUNT(CASE WHEN status = 'in_progress' THEN 1 ELSE NULL END)`,
        failedCollections: sql<number>`COUNT(CASE WHEN status = 'failed' THEN 1 ELSE NULL END)`,
        efficiency: sql<number>`AVG(CASE WHEN ${collections.targetAmount} > 0 THEN CAST(${collections.totalCollected} AS REAL) / ${collections.targetAmount} * 100 ELSE 0 END)`
    }).from(collections);

    return {
        totalCollections: Number(stats[0]?.totalCollections || 0),
        completedCollections: Number(stats[0]?.completedCollections || 0),
        targetAmount: Number(stats[0]?.targetAmount || 0),
        totalCollected: Number(stats[0]?.totalCollected || 0),
        activeCollections: Number(stats[0]?.activeCollections || 0),
        failedCollections: Number(stats[0]?.failedCollections || 0),
        efficiency: Number(stats[0]?.efficiency || 0),
    };
}

// Daily Collection Reports
export async function getDailyCollectionReport(date: string) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const dailyStats = await db.select({
        date: sql<string>`DATE(${collections.collectionDate})`,
        totalCollected: sql<number>`SUM(${collections.totalCollected})`,
        completedCollections: sql<number>`COUNT(CASE WHEN ${collections.status} = 'completed' THEN 1 ELSE NULL END)`,
        activeCollections: sql<number>`COUNT(CASE WHEN ${collections.status} = 'in_progress' THEN 1 ELSE NULL END)`,
        targetAmount: sql<number>`SUM(${collections.targetAmount})`,
        newCustomers: sql<number>`COUNT(DISTINCT ${collections.customerId})`
    })
        .from(collections)
        .where(and(
            sql`${collections.collectionDate} >= ${startDate.toISOString()}`,
            sql`${collections.collectionDate} < ${endDate.toISOString()}`
        ))
        .groupBy(sql<string>`DATE(${collections.collectionDate})`)
        .orderBy(sql<string>`DATE(${collections.collectionDate})`)
        .having(sql<string>`SUM(${collections.totalCollected}) > 0`);

    return dailyStats;
}

// Staff Leaderboard
export async function getStaffLeaderboard(startDate: string, endDate: string) {
    const leaderboard = await db.select({
        staffId: users.id,
        staffName: users.name,
        totalCollections: sql<number>`COUNT(CASE WHEN ${collections.status} = 'completed' THEN 1 ELSE NULL END)`,
        totalAmount: sql<number>`SUM(CASE WHEN ${collections.status} = 'completed' THEN ${collections.targetAmount} ELSE 0 END)`,
        completionRate: sql<number>`AVG(CASE WHEN ${collections.targetAmount} > 0 THEN CAST(${collections.totalCollected} AS REAL) / ${collections.targetAmount} * 100 ELSE 0 END)`,
        efficiency: sql<number>`AVG(CASE WHEN ${collections.targetAmount} > 0 THEN CAST(${collections.totalCollected} AS REAL) / ${collections.targetAmount} * 100 ELSE 0 END)`
    })
        .from(collections)
        .innerJoin(users, eq(collections.staffId, users.id))
        .leftJoin(collectionAssignments, eq(collections.id, collectionAssignments.collectionId))
        .where(and(
            sql`${collections.collectionDate} >= ${startDate}`,
            sql`${collections.collectionDate} <= ${endDate}`
        ))
        .groupBy(users.id, users.name)
        .orderBy(
            desc(sql<number>`AVG(CASE WHEN ${collections.targetAmount} > 0 THEN CAST(${collections.totalCollected} AS REAL) / ${collections.targetAmount} * 100 ELSE 0 END)`),
            desc(sql<number>`SUM(CASE WHEN ${collections.status} = 'completed' THEN ${collections.targetAmount} ELSE 0 END)`)
        );

    return leaderboard;
}
