import { db } from "@/db/db";
import { eq, and, desc, like, or } from "drizzle-orm";
import { customers } from "@/db/schema";

// Customer API functions
export async function getCustomers() {
    return await db.query.customers.findMany({
        with: {
            collections: {
                with: {
                    collector: true,
                    staffMember: true,
                },
            },
        },
        orderBy: [desc(customers.createdAt)],
    });
}

export async function getCustomerById(id: string) {
    return await db.query.customers.findFirst({
        where: eq(customers.id, id),
        with: {
            collections: {
                with: {
                    collector: true,
                    staffMember: true,
                },
            },
        },
    });
}

export async function createCustomer(customerData: any) {
    const id = Math.random().toString(36).substring(2, 11);
    const now = new Date();

    await db.insert(customers).values({
        id,
        ...customerData,
        createdAt: now,
        updatedAt: now,
    });

    return { success: true, id };
}

export async function updateCustomer(id: string, updates: any) {
    const updatedAt = new Date();

    await db.update(customers)
        .set({ ...updates, updatedAt })
        .where(eq(customers.id, id));

    return { success: true };
}

export async function searchCustomers(query: string, filters?: any) {
    let whereConditions = [];

    // Text search
    if (query) {
        whereConditions.push(or(
            like(customers.name, `%${query}%`),
            like(customers.email, `%${query}%`),
            like(customers.accountNumber, `%${query}%`),
            like(customers.phone, `%${query}%`)
        ));
    }

    // Apply filters
    if (filters?.businessType) {
        whereConditions.push(eq(customers.businessType, filters.businessType));
    }

    if (filters?.bankName) {
        whereConditions.push(eq(customers.bankName, filters.bankName));
    }

    if (filters?.branchName) {
        whereConditions.push(eq(customers.branchName, filters.branchName));
    }

    return await db.query.customers.findMany({
        where: and(...whereConditions),
        with: {
            collections: {
                with: {
                    collector: true,
                    staffMember: true,
                },
            },
        },
        orderBy: [desc(customers.createdAt)],
    });
}