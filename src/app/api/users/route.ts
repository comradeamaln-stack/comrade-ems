import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/db/db";
import { eq } from 'drizzle-orm';
import { users } from "@/db/schema";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    try {
        let query = db.query.users.findMany({
            orderBy: (users, { desc }) => [desc(users.createdAt)],
        });

        if (role) {
            query = db.query.users.findMany({
                where: eq(users.role, role as any),
                orderBy: (users, { desc }) => [desc(users.createdAt)],
            });
        }

        const allUsers = await query;
        return NextResponse.json({ users: allUsers });
    } catch (error) {
        console.error('Fetch users error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
