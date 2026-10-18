CREATE TABLE `hazards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`unit` text NOT NULL,
	`category` text NOT NULL,
	`kind` text NOT NULL,
	`points` text NOT NULL,
	`description` text NOT NULL,
	`priority` text NOT NULL,
	`owner` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `hazards_unit_idx` ON `hazards` (`unit`);--> statement-breakpoint
CREATE INDEX `hazards_owner_idx` ON `hazards` (`owner`);--> statement-breakpoint
CREATE TABLE `memberships` (
	`session_id` text NOT NULL,
	`unit` text NOT NULL,
	PRIMARY KEY(`session_id`, `unit`)
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`unit` text PRIMARY KEY NOT NULL,
	`body` text NOT NULL,
	`version` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL
);
