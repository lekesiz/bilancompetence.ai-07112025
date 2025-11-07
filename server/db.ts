import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  organizations,
  bilans,
  sessions,
  recommendations,
  documents,
  messages,
  satisfactionSurveys,
  surveyResponses,
  auditLogs,
  type Organization,
  type InsertOrganization,
  type Bilan,
  type InsertBilan,
  type Session,
  type InsertSession,
  type Recommendation,
  type InsertRecommendation,
  type Document,
  type InsertDocument,
  type Message,
  type InsertMessage,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'ADMIN';
      updateSet.role = 'ADMIN';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listUsers(filters?: { 
  role?: string; 
  organizationId?: number;
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  
  if (filters?.role) {
    conditions.push(eq(users.role, filters.role as any));
  }
  if (filters?.organizationId !== undefined) {
    conditions.push(eq(users.organizationId, filters.organizationId));
  }
  if (filters?.isActive !== undefined) {
    conditions.push(eq(users.isActive, filters.isActive));
  }

  if (conditions.length > 0) {
    return await db.select().from(users).where(and(...conditions));
  }
  
  return await db.select().from(users);
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(users).set(data).where(eq(users.id, id));
  return await getUserById(id);
}

export async function deactivateUser(id: number) {
  const db = await getDb();
  if (!db) return null;

  await db.update(users).set({ 
    isActive: false,
    deletedAt: new Date()
  }).where(eq(users.id, id));
  
  return await getUserById(id);
}

// ============================================================================
// ORGANIZATION MANAGEMENT
// ============================================================================

export async function createOrganization(data: InsertOrganization): Promise<Organization | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(organizations).values(data);
  const insertId = Number(result[0].insertId);
  
  return await getOrganizationById(insertId);
}

export async function getOrganizationById(id: number): Promise<Organization | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function listOrganizations(filters?: { isActive?: boolean }) {
  const db = await getDb();
  if (!db) return [];

  if (filters?.isActive !== undefined) {
    return await db.select().from(organizations)
      .where(eq(organizations.isActive, filters.isActive))
      .orderBy(desc(organizations.createdAt));
  }

  return await db.select().from(organizations).orderBy(desc(organizations.createdAt));
}

export async function updateOrganization(id: number, data: Partial<InsertOrganization>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(organizations).set(data).where(eq(organizations.id, id));
  return await getOrganizationById(id);
}

// ============================================================================
// BILAN MANAGEMENT
// ============================================================================

export async function createBilan(data: InsertBilan): Promise<Bilan | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(bilans).values(data);
  const insertId = Number(result[0].insertId);
  
  return await getBilanById(insertId);
}

export async function getBilanById(id: number): Promise<Bilan | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(bilans).where(eq(bilans.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function listBilans(filters?: {
  beneficiaryId?: number;
  consultantId?: number;
  organizationId?: number;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [];

  if (filters?.beneficiaryId) {
    conditions.push(eq(bilans.beneficiaryId, filters.beneficiaryId));
  }
  if (filters?.consultantId) {
    conditions.push(eq(bilans.consultantId, filters.consultantId));
  }
  if (filters?.organizationId) {
    conditions.push(eq(bilans.organizationId, filters.organizationId));
  }
  if (filters?.status) {
    conditions.push(eq(bilans.status, filters.status as any));
  }

  const query = conditions.length > 0 
    ? db.select().from(bilans).where(and(...conditions))
    : db.select().from(bilans);

  return await query.orderBy(desc(bilans.createdAt));
}

export async function updateBilan(id: number, data: Partial<InsertBilan>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(bilans).set(data).where(eq(bilans.id, id));
  return await getBilanById(id);
}

export async function deleteBilan(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(bilans).where(eq(bilans.id, id));
  return true;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export async function createSession(data: InsertSession): Promise<Session | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(sessions).values(data);
  const insertId = Number(result[0].insertId);
  
  const sessionResult = await db.select().from(sessions).where(eq(sessions.id, insertId)).limit(1);
  return sessionResult.length > 0 ? sessionResult[0] : null;
}

export async function listSessionsByBilan(bilanId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(sessions)
    .where(eq(sessions.bilanId, bilanId))
    .orderBy(sessions.scheduledAt);
}

export async function updateSession(id: number, data: Partial<InsertSession>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(sessions).set(data).where(eq(sessions.id, id));
  
  const result = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ============================================================================
// RECOMMENDATION MANAGEMENT
// ============================================================================

export async function createRecommendation(data: InsertRecommendation): Promise<Recommendation | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(recommendations).values(data);
  const insertId = Number(result[0].insertId);
  
  const recResult = await db.select().from(recommendations).where(eq(recommendations.id, insertId)).limit(1);
  return recResult.length > 0 ? recResult[0] : null;
}

export async function listRecommendationsByBilan(bilanId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(recommendations)
    .where(eq(recommendations.bilanId, bilanId))
    .orderBy(recommendations.priority, desc(recommendations.matchScore));
}

// ============================================================================
// DOCUMENT MANAGEMENT
// ============================================================================

export async function createDocument(data: InsertDocument): Promise<Document | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(documents).values(data);
  const insertId = Number(result[0].insertId);
  
  const docResult = await db.select().from(documents).where(eq(documents.id, insertId)).limit(1);
  return docResult.length > 0 ? docResult[0] : null;
}

export async function listDocumentsByBilan(bilanId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(documents)
    .where(eq(documents.bilanId, bilanId))
    .orderBy(desc(documents.createdAt));
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(documents).where(eq(documents.id, id));
  return true;
}

// ============================================================================
// MESSAGE MANAGEMENT
// ============================================================================

export async function createMessage(data: InsertMessage): Promise<Message | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(messages).values(data);
  const insertId = Number(result[0].insertId);
  
  const msgResult = await db.select().from(messages).where(eq(messages.id, insertId)).limit(1);
  return msgResult.length > 0 ? msgResult[0] : null;
}

export async function listMessagesForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(messages)
    .where(eq(messages.receiverId, userId))
    .orderBy(desc(messages.createdAt));
}

export async function markMessageAsRead(id: number) {
  const db = await getDb();
  if (!db) return null;

  await db.update(messages).set({ 
    isRead: true,
    readAt: new Date()
  }).where(eq(messages.id, id));
  
  const result = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ============================================================================
// AUDIT LOG
// ============================================================================

export async function createAuditLog(data: {
  userId?: number;
  action: string;
  entityType: string;
  entityId: number;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
}) {
  const db = await getDb();
  if (!db) return;

  await db.insert(auditLogs).values(data);
}
