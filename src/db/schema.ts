import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

export const users = sqliteTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull().default("password123"), // Default for existing users
    role: text("role", { enum: ["admin", "staff"] }).default("staff"),
    designation: text("designation", { enum: ["salesman", "support", "developer", "accounts", "manager", "other"] }).default("salesman"),
    status: text("status", { enum: ["active", "inactive"] }).default("active"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const usersRelations = relations(users, ({ many }) => ({
    enquiries: many(enquiries),
    serviceRequests: many(serviceRequests),
    serviceRequestAttachments: many(serviceRequestAttachments),
    serviceRequestReplies: many(serviceRequestReplies),
}));

export const enquiries = sqliteTable("enquiries", {
    id: text("id").primaryKey(),
    clientName: text("client_name").notNull(),
    clientEmail: text("client_email"),
    clientPhone: text("client_phone").notNull(),
    source: text("source").notNull(),
    status: text("status", { enum: ["new", "contacted", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"] }).default("new"),
    priority: text("priority", { enum: ["low", "medium", "high", "urgent"] }).default("medium"),
    assignedToId: text("assigned_to_id").references(() => users.id),
    description: text("description"),
    leadScore: integer("lead_score").default(0), // AI lead scoring
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// ... (rest of the code remains the same until line 297)

export const activityLogs = sqliteTable("activity_logs", {
    id: text("id").primaryKey(),
    entityType: text("entity_type").notNull(), // 'enquiry', 'service_request', 'collection'
    entityId: text("entity_id").notNull(),
    action: text("action").notNull(), // 'created', 'updated', 'status_changed', 'deleted', 'note_added'
    details: text("details"),
    userId: text("user_id").references(() => users.id),
    userName: text("user_name"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
    user: one(users, {
        fields: [activityLogs.userId],
        references: [users.id],
    }),
}));

export const enquiriesRelations = relations(enquiries, ({ one }) => ({
    assignedTo: one(users, {
        fields: [enquiries.assignedToId],
        references: [users.id],
    }),
}));

export const appointments = sqliteTable("appointments", {
    id: text("id").primaryKey(),
    enquiryId: text("enquiry_id").references(() => enquiries.id),
    title: text("title").notNull(),
    description: text("description"),
    scheduledAt: integer("scheduled_at", { mode: "timestamp" }).notNull(),
    status: text("status", { enum: ["scheduled", "completed", "cancelled", "missed"] }).default("scheduled"),
    alertSent: integer("alert_sent", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const appointmentsRelations = relations(appointments, ({ one }) => ({
    enquiry: one(enquiries, {
        fields: [appointments.enquiryId],
        references: [enquiries.id],
    }),
}));

export const serviceRequests = sqliteTable("service_requests", {
    id: text("id").primaryKey(),
    ticketNumber: text("ticket_number").notNull().unique(),
    clientId: text("client_id"),
    clientName: text("client_name").notNull(),
    clientEmail: text("client_email"),
    clientPhone: text("client_phone"),
    subject: text("subject").notNull(),
    description: text("description").notNull(),
    priority: text("priority", { enum: ["low", "medium", "high", "urgent"] }).default("medium"),
    category: text("category", { enum: ["technical", "billing", "service", "feature", "bug", "other"] }).default("service"),
    status: text("status", { enum: ["open", "pending", "in_progress", "resolved", "closed"] }).default("open"),
    submittedBy: text("submitted_by").references(() => users.id),
    submittedByName: text("submitted_by_name"),
    assignedTo: text("assigned_to").references(() => users.id),
    emailSent: integer("email_sent", { mode: "boolean" }).default(false),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const serviceRequestsRelations = relations(serviceRequests, ({ one, many }) => ({
    submitter: one(users, {
        fields: [serviceRequests.submittedBy],
        references: [users.id],
    }),
    assignedToUser: one(users, {
        fields: [serviceRequests.assignedTo],
        references: [users.id],
    }),
    attachments: many(serviceRequestAttachments),
    replies: many(serviceRequestReplies),
}));

export const serviceRequestAttachments = sqliteTable("service_request_attachments", {
    id: text("id").primaryKey(),
    requestId: text("request_id").references(() => serviceRequests.id),
    fileName: text("file_name").notNull(),
    fileType: text("file_type").notNull(),
    fileSize: integer("file_size").notNull(),
    filePath: text("file_path").notNull(),
    uploadedBy: text("uploaded_by").references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const serviceRequestAttachmentsRelations = relations(serviceRequestAttachments, ({ one }) => ({
    request: one(serviceRequests, {
        fields: [serviceRequestAttachments.requestId],
        references: [serviceRequests.id],
    }),
    uploader: one(users, {
        fields: [serviceRequestAttachments.uploadedBy],
        references: [users.id],
    }),
}));

export const serviceRequestReplies = sqliteTable("service_request_replies", {
    id: text("id").primaryKey(),
    requestId: text("request_id").references(() => serviceRequests.id),
    message: text("message").notNull(),
    status: text("status", { enum: ["pending", "finished", "investigating"] }).default("pending"),
    repliedBy: text("replied_by").references(() => users.id),
    repliedByName: text("replied_by_name"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const serviceRequestRepliesRelations = relations(serviceRequestReplies, ({ one }) => ({
    request: one(serviceRequests, {
        fields: [serviceRequestReplies.requestId],
        references: [serviceRequests.id],
    }),
    replier: one(users, {
        fields: [serviceRequestReplies.repliedBy],
        references: [users.id],
    }),
}));

export const followups = sqliteTable("followups", {
    id: text("id").primaryKey(),
    enquiryId: text("enquiry_id").references(() => enquiries.id),
    staffId: text("staff_id").references(() => users.id),
    content: text("content").notNull(),
    type: text("type", { enum: ["call", "email", "meeting", "note"] }).default("note"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const followupsRelations = relations(followups, ({ one }) => ({
    enquiry: one(enquiries, {
        fields: [followups.enquiryId],
        references: [enquiries.id],
    }),
    staff: one(users, {
        fields: [followups.staffId],
        references: [users.id],
    }),
}));

export const performanceStats = sqliteTable("performance_stats", {
    id: text("id").primaryKey(),
    staffId: text("staff_id").references(() => users.id),
    month: text("month").notNull(), // YYYY-MM
    totalEnquiries: integer("total_enquiries").default(0),
    convertedEnquiries: integer("converted_enquiries").default(0),
    revenueGenerated: real("revenue_generated").default(0),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const performanceStatsRelations = relations(performanceStats, ({ one }) => ({
    staff: one(users, {
        fields: [performanceStats.staffId],
        references: [users.id],
    }),
}));

// Customer table
export const customers = sqliteTable("customers", {
    id: text("id").primaryKey(),
    accountNumber: text("account_number").unique(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    address: text("address").notNull(),
    bankName: text("bank_name").notNull(),
    branchName: text("branch_name").notNull(),
    businessType: text("business_type").notNull().default("individual"),
    contactPerson: text("contact_person").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const customersRelations = relations(customers, ({ many }) => ({
    collections: many(collections),
}));

// Collections Tables
export const collections = sqliteTable("collections", {
    id: text("id").primaryKey(),
    collectionType: text("collection_type").notNull(),
    collectionDate: text("collection_date").notNull(),
    collectorId: text("collector_id").notNull(),
    collectorName: text("collector_name").notNull(),
    staffId: text("staff_id").references(() => users.id),
    staffName: text("staff_name").notNull(),
    customerId: text("customer_id").references(() => customers.id),
    customerName: text("customer_name").notNull(),
    customerAccountNumber: text("customer_account_number"),
    customerBankName: text("customer_bank_name"),
    customerBranch: text("customer_branch"),
    referenceNumber: text("reference_number"),
    totalCollected: integer("total_collected").notNull().default(0),
    targetAmount: integer("target_amount").notNull(),
    collectedAmount: integer("collected_amount").notNull(),
    outstandingAmount: integer("outstanding_amount").notNull(),
    percentageCollected: real("percentage_collected").notNull().default(0),
    notes: text("notes"),
    status: text("status").notNull().default("pending"),
    assignedPercentage: real("assigned_percentage").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`)
});

export const collectionDetails = sqliteTable("collection_details", {
    id: text("id").primaryKey(),
    collectionId: text("collection_id").notNull(),
    chequeNumber: text("cheque_number"),
    bankName: text("bank_name"),
    branchName: text("branch_name"),
    amount: integer("amount"),
    paymentDate: text("payment_date"),
    dueDate: text("due_date"),
    status: text("status").notNull().default("pending"),
    customerName: text("customer_name"),
    customerAccountNumber: text("customer_account_number"),
    notes: text("notes"),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const collectionReplies = sqliteTable("collection_replies", {
    id: text("id").primaryKey(),
    collectionId: text("collection_id").notNull(),
    staffId: text("staff_id").references(() => users.id),
    staffName: text("staff_name").notNull(),
    message: text("message").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const collectionsRelations = relations(collections, ({ one, many }) => ({
    customer: one(customers, {
        fields: [collections.customerId],
        references: [customers.id],
    }),
    collector: one(users, {
        fields: [collections.collectorId],
        references: [users.id],
    }),
    staffMember: one(users, {
        fields: [collections.staffId],
        references: [users.id],
    }),
    details: many(collectionDetails),
    replies: many(collectionReplies),
}));

export const collectionDetailsRelations = relations(collectionDetails, ({ one }) => ({
    collection: one(collections, {
        fields: [collectionDetails.collectionId],
        references: [collections.id],
    }),
}));

export const collectionRepliesRelations = relations(collectionReplies, ({ one }) => ({
    collection: one(collections, {
        fields: [collectionReplies.collectionId],
        references: [collections.id],
    }),
    collector: one(users, {
        fields: [collectionReplies.staffId],
        references: [users.id],
    }),
}));

export const collectionAssignments = sqliteTable("collection_assignments", {
    id: text("id").primaryKey(),
    collectionId: text("collection_id").references(() => collections.id),
    staffId: text("staff_id").references(() => users.id),
    assignedPercentage: real("assigned_percentage").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
});

export const collectionAssignmentsRelations = relations(collectionAssignments, ({ one }) => ({
    collection: one(collections, {
        fields: [collectionAssignments.collectionId],
        references: [collections.id],
    }),
    staff: one(users, {
        fields: [collectionAssignments.staffId],
        references: [users.id],
    }),
}));