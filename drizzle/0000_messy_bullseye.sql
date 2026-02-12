CREATE TABLE `activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`action` text NOT NULL,
	`details` text,
	`user_id` text,
	`user_name` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`enquiry_id` text,
	`title` text NOT NULL,
	`description` text,
	`scheduled_at` integer NOT NULL,
	`status` text DEFAULT 'scheduled',
	`alert_sent` integer DEFAULT false,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`enquiry_id`) REFERENCES `enquiries`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `collection_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`collection_id` text,
	`staff_id` text,
	`assigned_percentage` real NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `collection_details` (
	`id` text PRIMARY KEY NOT NULL,
	`collection_id` text NOT NULL,
	`cheque_number` text,
	`bank_name` text,
	`branch_name` text,
	`amount` integer,
	`payment_date` text,
	`due_date` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`customer_name` text,
	`customer_account_number` text,
	`notes` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `collection_replies` (
	`id` text PRIMARY KEY NOT NULL,
	`collection_id` text NOT NULL,
	`staff_id` text,
	`staff_name` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`collection_type` text NOT NULL,
	`collection_date` text NOT NULL,
	`collector_id` text NOT NULL,
	`collector_name` text NOT NULL,
	`staff_id` text,
	`staff_name` text NOT NULL,
	`customer_id` text,
	`customer_name` text NOT NULL,
	`customer_account_number` text,
	`customer_bank_name` text,
	`customer_branch` text,
	`reference_number` text,
	`total_collected` integer DEFAULT 0 NOT NULL,
	`target_amount` integer NOT NULL,
	`collected_amount` integer NOT NULL,
	`outstanding_amount` integer NOT NULL,
	`percentage_collected` real DEFAULT 0 NOT NULL,
	`notes` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`assigned_percentage` real NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`account_number` text,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`bank_name` text NOT NULL,
	`branch_name` text NOT NULL,
	`business_type` text DEFAULT 'individual' NOT NULL,
	`contact_person` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_account_number_unique` ON `customers` (`account_number`);--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`client_name` text NOT NULL,
	`client_email` text,
	`client_phone` text NOT NULL,
	`source` text NOT NULL,
	`status` text DEFAULT 'new',
	`priority` text DEFAULT 'medium',
	`assigned_to_id` text,
	`description` text,
	`lead_score` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`assigned_to_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `followups` (
	`id` text PRIMARY KEY NOT NULL,
	`enquiry_id` text,
	`staff_id` text,
	`content` text NOT NULL,
	`type` text DEFAULT 'note',
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`enquiry_id`) REFERENCES `enquiries`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `performance_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`staff_id` text,
	`month` text NOT NULL,
	`total_enquiries` integer DEFAULT 0,
	`converted_enquiries` integer DEFAULT 0,
	`revenue_generated` real DEFAULT 0,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`staff_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `service_request_attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text,
	`file_name` text NOT NULL,
	`file_type` text NOT NULL,
	`file_size` integer NOT NULL,
	`file_path` text NOT NULL,
	`uploaded_by` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`request_id`) REFERENCES `service_requests`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `service_request_replies` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text,
	`message` text NOT NULL,
	`status` text DEFAULT 'pending',
	`replied_by` text,
	`replied_by_name` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`request_id`) REFERENCES `service_requests`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`replied_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `service_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_number` text NOT NULL,
	`client_id` text,
	`client_name` text NOT NULL,
	`client_email` text,
	`client_phone` text,
	`subject` text NOT NULL,
	`description` text NOT NULL,
	`priority` text DEFAULT 'medium',
	`category` text DEFAULT 'service',
	`status` text DEFAULT 'open',
	`submitted_by` text,
	`submitted_by_name` text,
	`assigned_to` text,
	`email_sent` integer DEFAULT false,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`submitted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `service_requests_ticket_number_unique` ON `service_requests` (`ticket_number`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'staff',
	`created_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);