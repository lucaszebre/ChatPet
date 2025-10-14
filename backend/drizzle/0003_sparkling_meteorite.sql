DROP TABLE `user`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_account` (
	`id` text PRIMARY KEY NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_account`("id", "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", "scope", "password", "createdAt", "updatedAt") SELECT "id", "accountId", "providerId", "userId", "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", "scope", "password", "createdAt", "updatedAt" FROM `account`;--> statement-breakpoint
DROP TABLE `account`;--> statement-breakpoint
ALTER TABLE `__new_account` RENAME TO `account`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_chat` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updateAt` integer DEFAULT '"2025-10-14T10:32:04.509Z"' NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`systemPrompt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_chat`("id", "userId", "createdAt", "updateAt", "name", "systemPrompt") SELECT "id", "userId", "createdAt", "updateAt", "name", "systemPrompt" FROM `chat`;--> statement-breakpoint
DROP TABLE `chat`;--> statement-breakpoint
ALTER TABLE `__new_chat` RENAME TO `chat`;--> statement-breakpoint
CREATE TABLE `__new_session` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` integer NOT NULL,
	`token` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_session`("id", "expiresAt", "token", "createdAt", "updatedAt", "ipAddress", "userAgent", "userId") SELECT "id", "expiresAt", "token", "createdAt", "updatedAt", "ipAddress", "userAgent", "userId" FROM `session`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
ALTER TABLE `__new_session` RENAME TO `session`;--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE TABLE `__new_message` (
	`id` text PRIMARY KEY DEFAULT 'uuid()' NOT NULL,
	`content` text NOT NULL,
	`role` text NOT NULL,
	`chatId` text NOT NULL,
	`createdAt` integer DEFAULT '"2025-10-14T10:32:04.509Z"' NOT NULL,
	FOREIGN KEY (`chatId`) REFERENCES `chat`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_message`("id", "content", "role", "chatId", "createdAt") SELECT "id", "content", "role", "chatId", "createdAt" FROM `message`;--> statement-breakpoint
DROP TABLE `message`;--> statement-breakpoint
ALTER TABLE `__new_message` RENAME TO `message`;