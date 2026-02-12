import { db } from "@/db/db";
import { enquiries, followups } from "@/db/schema";
import { eq, count } from "drizzle-orm";

/**
 * Calculates a lead score (0-100) based on enquiry data and engagement.
 */
export function calculateLeadScore(enquiry: any, followupsCount: number): number {
    let score = 0;

    // 1. Status Impact (Primary factor)
    const statusScores: Record<string, number> = {
        'new': 10,
        'contacted': 25,
        'qualified': 50,
        'proposal': 70,
        'negotiation': 85,
        'closed_won': 100,
        'closed_lost': 0
    };
    score += statusScores[enquiry.status] || 0;

    // 2. Priority Impact
    const priorityScores: Record<string, number> = {
        'low': 0,
        'medium': 10,
        'high': 20,
        'urgent': 30
    };
    score += priorityScores[enquiry.priority] || 0;

    // 3. Source Impact
    const source = (enquiry.source || '').toLowerCase();
    if (source.includes('referral')) score += 20;
    else if (source.includes('website')) score += 15;
    else if (source.includes('social')) score += 10;
    else if (source.includes('cold')) score += 5;
    else score += 5; // Default

    // 4. Engagement Impact (Follow-ups)
    // Every follow-up shows higher interest
    score += Math.min(followupsCount * 5, 25);

    // Final score normalization
    return Math.min(Math.round(score), 100);
}

/**
 * Updates the lead score for a specific enquiry in the database.
 */
export async function updateEnquiryLeadScore(enquiryId: string) {
    try {
        // Fetch enquiry and follow-up count
        const enquiry = await db.query.enquiries.findFirst({
            where: eq(enquiries.id, enquiryId)
        });

        if (!enquiry) return;

        const followupsResult = await db.select({ count: count() })
            .from(followups)
            .where(eq(followups.enquiryId, enquiryId));

        const followupsCount = followupsResult[0]?.count || 0;

        // Calculate score
        const newScore = calculateLeadScore(enquiry, followupsCount);

        // Update database
        await db.update(enquiries)
            .set({ leadScore: newScore })
            .where(eq(enquiries.id, enquiryId));

        return newScore;
    } catch (error) {
        console.error("Error updating lead score:", error);
        return null;
    }
}
