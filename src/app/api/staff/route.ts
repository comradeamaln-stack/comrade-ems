import { NextRequest, NextResponse } from 'next/server';
import { db } from "@/db/db";
import { eq } from 'drizzle-orm';
import { users } from "@/db/schema";

export async function GET() {
    try {
        const staff = await db.query.users.findMany({
            where: eq(users.role, 'staff'),
            orderBy: (users, { asc }) => [asc(users.name)],
        });

        return NextResponse.json({ users: staff });
    } catch (error) {
        console.error('Fetch staff error:', error);
        return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
    }
}
