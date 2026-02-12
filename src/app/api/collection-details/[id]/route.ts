import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/db/db";
import { eq } from 'drizzle-orm';
import { collectionDetails } from "@/db/schema";
import { addCollectionDetails, deleteCollectionDetail } from "@/lib/collection-actions";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const details = await db.query.collectionDetails.findMany({
            where: eq(collectionDetails.collectionId, id),
            orderBy: (details, { desc }) => [desc(details.createdAt)],
        });

        return NextResponse.json({ details });
    } catch (error) {
        console.error('Fetch collection details error:', error);
        return NextResponse.json({ error: 'Failed to fetch details' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const detailData = await request.json();

        // Match the field names from the frontend
        const result = await addCollectionDetails(id, detailData, '1');

        // Fetch the created detail
        const detail = await db.query.collectionDetails.findFirst({
            where: eq(collectionDetails.id, result.id)
        });

        return NextResponse.json({ success: true, detail });
    } catch (error) {
        console.error('Add collection detail error:', error);
        return NextResponse.json({ error: 'Failed to add detail' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { id: detailId } = await request.json();

        await deleteCollectionDetail(detailId);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete collection detail error:', error);
        return NextResponse.json({ error: 'Failed to delete detail' }, { status: 500 });
    }
}
