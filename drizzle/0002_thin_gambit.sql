CREATE TABLE `skillsEvaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bilanId` int NOT NULL,
	`skillName` varchar(255) NOT NULL,
	`category` varchar(100),
	`level` int NOT NULL,
	`frequency` enum('RARE','OCCASIONAL','FREQUENT','DAILY'),
	`preference` enum('DISLIKE','NEUTRAL','LIKE','LOVE'),
	`notes` text,
	`validatedByConsultant` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `skillsEvaluations_id` PRIMARY KEY(`id`)
);
