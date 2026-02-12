"use server";

import { cookies } from "next/headers";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const SESSION_COOKIE = "comrade_session";

export async function login(email: string, password: string) {
    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user || user.password !== password) {
        return { success: false, error: "Invalid email or password" };
    }

    if (user.status === "inactive") {
        return { success: false, error: "Account is inactive" };
    }

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
    });

    return { success: true, user };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
}
