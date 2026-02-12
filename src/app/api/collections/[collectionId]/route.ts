import { NextRequest, NextResponse } from 'next/server';
import { addCollectionDetails, updateCollectionDetail, deleteCollectionDetail, getCollectionById, updateCollection } from '@/lib/collection-actions';

// Collection Details API Routes
export async function GET(request: NextRequest, { params }: { params: Promise<{ collectionId: string }> }) {
    try {
        const { collectionId } = await params;
        const collection = await getCollectionById(collectionId);

        if (!collection) {
            return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
        }

        return NextResponse.json({
            collection,
            customer: collection.customer,
            details: collection.details || []
        });
    } catch (error) {
        console.error('Get collection details error:', error);
        return NextResponse.json({ error: 'Failed to fetch collection details' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ collectionId: string }> }) {
    try {
        const { collectionId } = await params;
        const detailData = await request.json();

        if (!collectionId || !detailData.chequeNumber || !detailData.amount || !detailData.paymentDate || !detailData.dueDate || !detailData.customerName) {
            return NextResponse.json({ error: 'Cheque number, amount, payment date, due date, and customer name are required' }, { status: 400 });
        }

        await addCollectionDetails(collectionId, detailData, '1');

        return NextResponse.json({ success: true, message: 'Cheque added successfully' });
    } catch (error) {
        console.error('Add collection detail error:', error);
        return NextResponse.json({ error: 'Failed to add collection detail' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ collectionId: string }> }) {
    try {
        const { collectionId } = await params;
        const updates = await request.json();

        await updateCollection(collectionId, updates);

        const updatedCollection = await getCollectionById(collectionId);

        return NextResponse.json(updatedCollection);
    } catch (error) {
        console.error('Update collection error:', error);
        return NextResponse.json({ error: 'Failed to update collection' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ collectionId: string }> }) {
    try {
        const { collectionId } = await params;
        const { id } = await request.json();

        if (!id || !collectionId) {
            return NextResponse.json({ error: 'Detail ID and collection ID are required' }, { status: 400 });
        }

        await deleteCollectionDetail(id);

        return NextResponse.json({ success: true, message: 'Collection detail deleted successfully' });
    } catch (error) {
        console.error('Delete collection detail error:', error);
        return NextResponse.json({ error: 'Failed to delete collection detail' }, { status: 500 });
    }
}