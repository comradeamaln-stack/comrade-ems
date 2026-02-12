import { cookies } from "next/headers";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const SESSION_COOKIE = "comrade_session";

export async function getSession() {
    try {
        const cookieStore = await cookies();
        const sessionId = cookieStore.get(SESSION_COOKIE)?.value;

        if (!sessionId) return null;

        const user = await db.query.users.findFirst({
            where: eq(users.id, sessionId),
        });

        if (!user || user.status === "inactive") return null;

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as "admin" | "staff",
        };
    } catch (error) {
        return null;
    }
}

export async function isAdmin() {
    const session = await getSession();
    return session?.role === "admin";
}
