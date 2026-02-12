import { NextRequest, NextResponse } from 'next/server';
import { createCollectionAssignment } from "@/lib/collection-assignment-actions";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { staffId, assignedPercentage } = await request.json();

        const result = await createCollectionAssignment(id, staffId, assignedPercentage);

        return NextResponse.json({ success: true, id: result.id });
    } catch (error) {
        console.error('Create collection assignment error:', error);
        return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
    }
}
