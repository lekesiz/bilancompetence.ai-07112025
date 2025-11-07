import { boolean, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, float } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = ["BENEFICIARY", "CONSULTANT", "ORG_ADMIN", "ADMIN"] as const;
export const bilanStatusEnum = ["PRELIMINARY", "INVESTIGATION", "CONCLUSION", "COMPLETED", "ARCHIVED"] as const;
export const sessionStatusEnum = ["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED"] as const;
export const documentTypeEnum = ["CV", "COVER_LETTER", "SYNTHESIS", "REPORT", "OTHER"] as const;
export const recommendationTypeEnum = ["JOB", "TRAINING", "SKILL", "CERTIFICATION"] as const;

// ============================================================================
// CORE TABLES
// ============================================================================

/**
 * Core user table backing auth flow.
 * Extended with BilanCompetence.AI specific fields and roles.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  // Extended role system for BilanCompetence.AI
  role: mysqlEnum("role", userRoleEnum).default("BENEFICIARY").notNull(),
  organizationId: int("organizationId"),
  phone: varchar("phone", { length: 20 }),
  avatarUrl: text("avatarUrl"),
  emailVerifiedAt: timestamp("emailVerifiedAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// ORGANIZATIONS
// ============================================================================

export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  siret: varchar("siret", { length: 14 }).unique(),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 255 }),
  logoUrl: text("logoUrl"),
  settings: json("settings"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

// ============================================================================
// BILANS (Core business entity)
// ============================================================================

export const bilans = mysqlTable("bilans", {
  id: int("id").autoincrement().primaryKey(),
  beneficiaryId: int("beneficiaryId").notNull(),
  consultantId: int("consultantId"),
  organizationId: int("organizationId"),
  status: mysqlEnum("status", bilanStatusEnum).default("PRELIMINARY").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  expectedEndDate: timestamp("expectedEndDate"),
  actualEndDate: timestamp("actualEndDate"),
  durationHours: float("durationHours"),
  objectives: text("objectives"),
  context: text("context"),
  assessmentData: json("assessmentData"),
  synthesisData: json("synthesisData"),
  actionPlan: json("actionPlan"),
  satisfactionScore: int("satisfactionScore"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Bilan = typeof bilans.$inferSelect;
export type InsertBilan = typeof bilans.$inferInsert;

// ============================================================================
// SESSIONS
// ============================================================================

export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  bilanId: int("bilanId").notNull(),
  consultantId: int("consultantId").notNull(),
  beneficiaryId: int("beneficiaryId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduledAt").notNull(),
  durationMinutes: int("durationMinutes").default(60).notNull(),
  status: mysqlEnum("status", sessionStatusEnum).default("SCHEDULED").notNull(),
  notes: text("notes"),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

export const recommendations = mysqlTable("recommendations", {
  id: int("id").autoincrement().primaryKey(),
  bilanId: int("bilanId").notNull(),
  type: mysqlEnum("type", recommendationTypeEnum).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  romeCode: varchar("romeCode", { length: 10 }),
  matchScore: float("matchScore"),
  priority: int("priority").default(1).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Recommendation = typeof recommendations.$inferSelect;
export type InsertRecommendation = typeof recommendations.$inferInsert;

// ============================================================================
// DOCUMENTS
// ============================================================================

export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  bilanId: int("bilanId").notNull(),
  type: mysqlEnum("type", documentTypeEnum).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  filePath: text("filePath").notNull(),
  fileSize: int("fileSize").notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  uploadedBy: int("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// ============================================================================
// MESSAGES
// ============================================================================

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  bilanId: int("bilanId"),
  senderId: int("senderId").notNull(),
  receiverId: int("receiverId").notNull(),
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ============================================================================
// SATISFACTION SURVEYS (Qualiopi)
// ============================================================================

export const satisfactionSurveys = mysqlTable("satisfactionSurveys", {
  id: int("id").autoincrement().primaryKey(),
  bilanId: int("bilanId").notNull(),
  questions: json("questions").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SatisfactionSurvey = typeof satisfactionSurveys.$inferSelect;
export type InsertSatisfactionSurvey = typeof satisfactionSurveys.$inferInsert;

export const surveyResponses = mysqlTable("surveyResponses", {
  id: int("id").autoincrement().primaryKey(),
  surveyId: int("surveyId").notNull(),
  answers: json("answers").notNull(),
  comments: text("comments"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type InsertSurveyResponse = typeof surveyResponses.$inferInsert;

// ============================================================================
// AUDIT LOGS
// ============================================================================

export const skillsEvaluations = mysqlTable("skillsEvaluations", {
  id: int("id").autoincrement().primaryKey(),
  bilanId: int("bilanId").notNull(),
  skillName: varchar("skillName", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  level: int("level").notNull(), // 1-5
  frequency: mysqlEnum("frequency", ["RARE", "OCCASIONAL", "FREQUENT", "DAILY"]),
  preference: mysqlEnum("preference", ["DISLIKE", "NEUTRAL", "LIKE", "LOVE"]),
  notes: text("notes"),
  validatedByConsultant: boolean("validatedByConsultant").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: int("entityId").notNull(),
  changes: json("changes"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ============================================================================
// RELATIONS (for Drizzle ORM queries)
// ============================================================================

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  bilansAsBeneficiary: many(bilans, { relationName: "beneficiary" }),
  bilansAsConsultant: many(bilans, { relationName: "consultant" }),
  sessionsAsConsultant: many(sessions, { relationName: "sessionConsultant" }),
  sessionsAsBeneficiary: many(sessions, { relationName: "sessionBeneficiary" }),
  messagesSent: many(messages, { relationName: "sender" }),
  messagesReceived: many(messages, { relationName: "receiver" }),
  auditLogs: many(auditLogs),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  bilans: many(bilans),
}));

export const bilansRelations = relations(bilans, ({ one, many }) => ({
  beneficiary: one(users, {
    fields: [bilans.beneficiaryId],
    references: [users.id],
    relationName: "beneficiary",
  }),
  consultant: one(users, {
    fields: [bilans.consultantId],
    references: [users.id],
    relationName: "consultant",
  }),
  organization: one(organizations, {
    fields: [bilans.organizationId],
    references: [organizations.id],
  }),
  sessions: many(sessions),
  recommendations: many(recommendations),
  documents: many(documents),
  satisfactionSurveys: many(satisfactionSurveys),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  bilan: one(bilans, {
    fields: [sessions.bilanId],
    references: [bilans.id],
  }),
  consultant: one(users, {
    fields: [sessions.consultantId],
    references: [users.id],
    relationName: "sessionConsultant",
  }),
  beneficiary: one(users, {
    fields: [sessions.beneficiaryId],
    references: [users.id],
    relationName: "sessionBeneficiary",
  }),
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  bilan: one(bilans, {
    fields: [recommendations.bilanId],
    references: [bilans.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  bilan: one(bilans, {
    fields: [documents.bilanId],
    references: [bilans.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

export const satisfactionSurveysRelations = relations(satisfactionSurveys, ({ one, many }) => ({
  bilan: one(bilans, {
    fields: [satisfactionSurveys.bilanId],
    references: [bilans.id],
  }),
  responses: many(surveyResponses),
}));

export const surveyResponsesRelations = relations(surveyResponses, ({ one }) => ({
  survey: one(satisfactionSurveys, {
    fields: [surveyResponses.surveyId],
    references: [satisfactionSurveys.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));