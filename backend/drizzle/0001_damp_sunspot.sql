PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_chat` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updateAt` integer DEFAULT '"2025-10-14T10:02:47.283Z"' NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`systemPrompt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_chat`("id", "userId", "createdAt", "updateAt", "name", "systemPrompt") SELECT "id", "userId", "createdAt", "updateAt", "name", "systemPrompt" FROM `chat`;--> statement-breakpoint
DROP TABLE `chat`;--> statement-breakpoint
ALTER TABLE `__new_chat` RENAME TO `chat`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_message` (
	`id` text PRIMARY KEY DEFAULT 'uuid()' NOT NULL,
	`content` text NOT NULL,
	`role` text NOT NULL,
	`chatId` text NOT NULL,
	`createdAt` integer DEFAULT '"2025-10-14T10:02:47.283Z"' NOT NULL,
	FOREIGN KEY (`chatId`) REFERENCES `chat`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_message`("id", "content", "role", "chatId", "createdAt") SELECT "id", "content", "role", "chatId", "createdAt" FROM `message`;--> statement-breakpoint
DROP TABLE `message`;--> statement-breakpoint
ALTER TABLE `__new_message` RENAME TO `message`;--> statement-breakpoint
ALTER TABLE `sessions` ADD `timezone` text;