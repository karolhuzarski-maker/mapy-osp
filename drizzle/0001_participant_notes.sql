CREATE TABLE `participant_notes` (
	`owner` text NOT NULL,
	`unit` text NOT NULL,
	`body` text NOT NULL,
	`version` integer NOT NULL,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`owner`, `unit`)
);
--> statement-breakpoint
CREATE INDEX `participant_notes_unit_idx` ON `participant_notes` (`unit`);