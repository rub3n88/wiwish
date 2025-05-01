import { db } from "@db";
import {
  users,
  registries,
  gifts,
  activities,
  reservations,
  User,
  Registry,
  Gift,
  Activity,
  InsertUser
} from "@shared/schema";
import { eq, and, desc, isNull, not, SQL } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";
import { generateRandomToken, slugify } from "./utils";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;

  // Registry methods
  getRegistryById(id: number): Promise<Registry | undefined>;
  getRegistryBySlug(slug: string): Promise<Registry | undefined>;
  getUserRegistries(userId: number): Promise<Registry[]>;
  createRegistry(data: {
    babyName: string;
    description?: string;
    userId: number;
    isPublic: boolean;
  }): Promise<Registry>;
  updateRegistryVisitCount(id: number): Promise<void>;
  getPublicRegistries(): Promise<Registry[]>;

  // Gift methods
  getGiftsByRegistryId(registryId: number): Promise<Gift[]>;
  getGiftById(id: number): Promise<Gift | undefined>;
  createGift(data: {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    url: string;
    store: string;
    category: string;
    registryId: number;
  }): Promise<Gift>;
  updateGift(id: number, data: Partial<Omit<Gift, "id" | "registryId">>): Promise<Gift>;
  deleteGift(id: number): Promise<boolean>;
  reserveGift(
    giftId: number,
    name: string,
    email: string,
    message: string | null
  ): Promise<Gift>;
  cancelReservation(cancellationToken: string): Promise<Gift | undefined>;

  // Activity methods
  createActivity(data: {
    registryId: number;
    type: string;
    userDisplayName: string;
    targetName: string;
    description: string;
  }): Promise<Activity>;
  getActivitiesByRegistryId(registryId: number, limit?: number): Promise<Activity[]>;

  // Session store
  sessionStore: any; // Usamos any para evitar problemas de tipos
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Usamos any para evitar problemas de tipos

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User> {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id)
    });
    
    if (!result) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return await db.query.users.findFirst({
      where: eq(users.username, username)
    });
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Registry methods
  async getRegistryById(id: number): Promise<Registry | undefined> {
    return await db.query.registries.findFirst({
      where: eq(registries.id, id)
    });
  }

  async getRegistryBySlug(slug: string): Promise<Registry | undefined> {
    return await db.query.registries.findFirst({
      where: eq(registries.slug, slug)
    });
  }

  async getUserRegistries(userId: number): Promise<Registry[]> {
    return await db.query.registries.findMany({
      where: eq(registries.userId, userId),
      orderBy: desc(registries.createdAt)
    });
  }

  async createRegistry(data: {
    babyName: string;
    description?: string;
    userId: number;
    isPublic: boolean;
  }): Promise<Registry> {
    // Generate a slug based on the baby name
    let slug = slugify(data.babyName);
    
    // Check if the slug already exists and add a random suffix if it does
    const existingRegistry = await this.getRegistryBySlug(slug);
    if (existingRegistry) {
      slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
    }

    const [registry] = await db.insert(registries).values({
      babyName: data.babyName,
      description: data.description || null,
      userId: data.userId,
      isPublic: data.isPublic,
      slug,
      visitorCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    return registry;
  }

  async updateRegistryVisitCount(id: number): Promise<void> {
    // Primero obtenemos el registro actual para obtener el conteo actual
    const registry = await this.getRegistryById(id);
    if (!registry) return;
    
    // Incrementamos manualmente el contador
    const newCount = (registry.visitorCount || 0) + 1;
    
    await db
      .update(registries)
      .set({ 
        visitorCount: newCount,
        updatedAt: new Date()
      })
      .where(eq(registries.id, id));
    
    // Create activity for visit
    await this.createActivity({
      registryId: id,
      type: "REGISTRY_VIEWED",
      userDisplayName: "Visitantes",
      targetName: "la lista",
      description: "Alguien ha visitado la lista de regalos"
    });
  }

  async getPublicRegistries(): Promise<Registry[]> {
    return await db.query.registries.findMany({
      where: eq(registries.isPublic, true),
      orderBy: desc(registries.createdAt)
    });
  }

  // Gift methods
  async getGiftsByRegistryId(registryId: number): Promise<Gift[]> {
    // Usar un método más simple sin orderBy personalizado
    try {
      // Primero obtenemos los regalos no reservados (NULL primero)
      const nonReservedGifts = await db
        .select()
        .from(gifts)
        .where(and(
          eq(gifts.registryId, registryId),
          isNull(gifts.reservedBy)
        ));
      
      // Luego obtenemos los regalos reservados (donde reservedBy NO es NULL)
      const reservedGifts = await db
        .select()
        .from(gifts)
        .where(and(
          eq(gifts.registryId, registryId),
          // Si no es null, entonces tiene un valor no nulo
          isNotNull(gifts.reservedBy)
        ));
      
      // Combinamos ambos arrays
      return [...nonReservedGifts, ...reservedGifts];
    } catch (error) {
      console.error("Error getting gifts by registry ID:", error);
      // Devolver un array vacío en caso de error
      return [];
    }
  }

  async getGiftById(id: number): Promise<Gift | undefined> {
    return await db.query.gifts.findFirst({
      where: eq(gifts.id, id)
    });
  }

  async createGift(data: {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    url: string;
    store: string;
    category: string;
    registryId: number;
  }): Promise<Gift> {
    const [gift] = await db.insert(gifts).values({
      ...data,
      reservedBy: null,
      reservedByName: null,
      reservationDate: null,
      cancellationToken: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    // Create activity for gift added
    await this.createActivity({
      registryId: data.registryId,
      type: "GIFT_ADDED",
      userDisplayName: "Administrador",
      targetName: data.name,
      description: `Se ha añadido ${data.name} a la lista de regalos`
    });

    return gift;
  }

  async updateGift(id: number, data: Partial<Omit<Gift, "id" | "registryId">>): Promise<Gift> {
    const [updatedGift] = await db
      .update(gifts)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(gifts.id, id))
      .returning();

    return updatedGift;
  }

  async deleteGift(id: number): Promise<boolean> {
    const gift = await this.getGiftById(id);
    if (!gift) return false;

    await db.delete(gifts).where(eq(gifts.id, id));

    // Create activity for gift deleted
    await this.createActivity({
      registryId: gift.registryId,
      type: "GIFT_DELETED",
      userDisplayName: "Administrador",
      targetName: gift.name,
      description: `Se ha eliminado ${gift.name} de la lista de regalos`
    });

    return true;
  }

  async reserveGift(
    giftId: number,
    name: string,
    email: string,
    message: string | null
  ): Promise<Gift> {
    const gift = await this.getGiftById(giftId);
    if (!gift) {
      throw new Error("Regalo no encontrado");
    }

    if (gift.reservedBy) {
      throw new Error("Este regalo ya ha sido reservado");
    }

    const cancellationToken = generateRandomToken();

    // Create reservation record
    const [reservation] = await db.insert(reservations).values({
      giftId,
      name,
      email,
      message: message || null,
      cancellationToken,
      createdAt: new Date()
    }).returning();

    // Update gift reservation status
    const [updatedGift] = await db
      .update(gifts)
      .set({
        reservedBy: email,
        reservedByName: name,
        reservationDate: new Date(),
        cancellationToken,
        updatedAt: new Date()
      })
      .where(eq(gifts.id, giftId))
      .returning();

    // Create activity for gift reserved
    await this.createActivity({
      registryId: gift.registryId,
      type: "GIFT_RESERVED",
      userDisplayName: name,
      targetName: gift.name,
      description: `${name} ha reservado ${gift.name}`
    });

    return updatedGift;
  }

  async cancelReservation(cancellationToken: string): Promise<Gift | undefined> {
    // Find the gift with this cancellation token
    const gift = await db.query.gifts.findFirst({
      where: eq(gifts.cancellationToken, cancellationToken)
    });

    if (!gift || !gift.reservedBy) {
      return undefined;
    }

    // Store the reserver's name for the activity log
    const reserverName = gift.reservedByName || "Alguien";

    // Update the gift to remove reservation
    const [updatedGift] = await db
      .update(gifts)
      .set({
        reservedBy: null,
        reservedByName: null,
        reservationDate: null,
        cancellationToken: null,
        updatedAt: new Date()
      })
      .where(eq(gifts.id, gift.id))
      .returning();

    // Create activity for reservation cancelled
    await this.createActivity({
      registryId: gift.registryId,
      type: "RESERVATION_CANCELLED",
      userDisplayName: reserverName,
      targetName: gift.name,
      description: `${reserverName} ha cancelado la reserva de ${gift.name}`
    });

    return updatedGift;
  }

  // Activity methods
  async createActivity(data: {
    registryId: number;
    type: string;
    userDisplayName: string;
    targetName: string;
    description: string;
  }): Promise<Activity> {
    const [activity] = await db.insert(activities).values({
      ...data,
      createdAt: new Date()
    }).returning();

    return activity;
  }

  async getActivitiesByRegistryId(registryId: number, limit: number = 20): Promise<Activity[]> {
    return await db.query.activities.findMany({
      where: eq(activities.registryId, registryId),
      orderBy: desc(activities.createdAt),
      limit
    });
  }
}

export const storage = new DatabaseStorage();
