import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  doublePrecision,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Sessions table (para connect-pg-simple)
export const sessions = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(), // JSON como texto
  expire: timestamp("expire").notNull(),
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Registries table
export const registries = pgTable("registries", {
  id: serial("id").primaryKey(),
  babyName: text("baby_name").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  visitorCount: integer("visitor_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const registriesRelations = relations(registries, ({ one, many }) => ({
  user: one(users, {
    fields: [registries.userId],
    references: [users.id],
  }),
  gifts: many(gifts),
}));

// Gifts table
export const gifts = pgTable("gifts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default("").notNull(),
  price: doublePrecision("price").notNull(),
  imageUrl: text("image_url").notNull(),
  url: text("url").default(""),
  store: text("store").default(""),
  category: text("category").default("General"),
  registryId: integer("registry_id")
    .references(() => registries.id)
    .notNull(),
  reservedBy: text("reserved_by"),
  reservedByName: text("reserved_by_name"),
  reservationDate: timestamp("reservation_date"),
  cancellationToken: text("cancellation_token"),
  isHidden: boolean("is_hidden").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const giftsRelations = relations(gifts, ({ one }) => ({
  registry: one(registries, {
    fields: [gifts.registryId],
    references: [registries.id],
  }),
}));

// Reservations table
export const reservations = pgTable("reservations", {
  id: serial("id").primaryKey(),
  giftId: integer("gift_id")
    .references(() => gifts.id)
    .notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message"),
  cancellationToken: text("cancellation_token").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reservationsRelations = relations(reservations, ({ one }) => ({
  gift: one(gifts, {
    fields: [reservations.giftId],
    references: [gifts.id],
  }),
}));

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  registryId: integer("registry_id")
    .references(() => registries.id)
    .notNull(),
  type: text("type").notNull(),
  userDisplayName: text("user_display_name").notNull(),
  targetName: text("target_name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  registry: one(registries, {
    fields: [activities.registryId],
    references: [registries.id],
  }),
}));

// Define types
export type Registry = typeof registries.$inferSelect;
export type Gift = typeof gifts.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
export type Activity = typeof activities.$inferSelect;
