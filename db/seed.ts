import { db } from "./index";
import * as schema from "@shared/schema";
import { storage } from "../server/storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting database seed...");

    // Check if users already exist
    const existingUsers = await db.query.users.findMany();

    if (existingUsers.length === 0) {
      console.log("Creating admin user...");

      // Create admin user
      const adminUser = await storage.createUser({
        username: "admin",
        email: "admin@example.com", // Opcional, pero lo incluimos para el admin
        password: await hashPassword("password123"),
      });

      console.log(`Created admin user with ID: ${adminUser.id}`);

      // Create a demo registry
      console.log("Creating demo registry...");

      const demoRegistry = await storage.createRegistry({
        babyName: "Lucas",
        description: "Lista de regalos para nuestro pequeño Lucas",
        userId: adminUser.id,
        isPublic: true,
      });

      console.log(`Created demo registry with ID: ${demoRegistry.id}`);

      // Create sample gifts
      console.log("Creating sample gifts...");

      const sampleGifts = [
        {
          name: "Cuna de madera convertible",
          description:
            "Cuna de alta calidad que se convierte en cama infantil a medida que el bebé crece.",
          price: 179.99,
          imageUrl:
            "https://images.unsplash.com/photo-1584304779423-2bff862e2e81?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
          url: "https://www.babystore.com/cuna-convertible",
          store: "BabyStore",
          category: "Muebles",
          registryId: demoRegistry.id,
        },
        {
          name: "Set de sonajeros coloridos",
          description:
            "Conjunto de 4 sonajeros de diferentes colores y formas, ideales para estimulación sensorial.",
          price: 24.95,
          imageUrl:
            "https://images.unsplash.com/photo-1519689680058-324335c77eba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
          url: "https://www.toyworld.com/sonajeros-set",
          store: "ToyWorld",
          category: "Juguetes",
          registryId: demoRegistry.id,
        },
        {
          name: "Pack de 5 bodys",
          description:
            "Conjunto de 5 bodys de algodón orgánico en colores neutros, talla 0-3 meses.",
          price: 34.99,
          imageUrl:
            "https://images.unsplash.com/photo-1617331721458-bd3bd3f9c7f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
          url: "https://www.babyfashion.com/bodys-pack5",
          store: "BabyFashion",
          category: "Ropa",
          registryId: demoRegistry.id,
        },
        {
          name: "Cambiador portátil",
          description:
            "Cambiador plegable con bolsillos para pañales y toallitas, fácil de transportar.",
          price: 29.99,
          imageUrl:
            "https://images.unsplash.com/photo-1595502124338-950db27ea1c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
          url: "https://www.babystore.com/cambiador-portatil",
          store: "BabyStore",
          category: "Accesorios",
          registryId: demoRegistry.id,
        },
        {
          name: "Móvil musical para cuna",
          description:
            "Móvil con figuras de animales y reproductor de música suave para ayudar al bebé a dormir.",
          price: 42.5,
          imageUrl:
            "https://images.unsplash.com/photo-1563782414584-0f3022708cb9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
          url: "https://www.toyworld.com/movil-musical",
          store: "ToyWorld",
          category: "Juguetes",
          registryId: demoRegistry.id,
        },
        {
          name: "Bañera ergonómica",
          description:
            "Bañera con soporte antideslizante y ergonómico que crece con el bebé.",
          price: 55.0,
          imageUrl:
            "https://images.unsplash.com/photo-1544140708-54b416b4b307?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300&q=80",
          url: "https://www.babystore.com/banera-ergonomica",
          store: "BabyStore",
          category: "Accesorios",
          registryId: demoRegistry.id,
        },
      ];

      for (const giftData of sampleGifts) {
        const gift = await storage.createGift(giftData);
        console.log(`Created gift: ${gift.name}`);
      }

      // Reserve one gift to show how it looks
      const giftToReserve = await db.query.gifts.findFirst({
        where: eq(schema.gifts.name, "Set de sonajeros coloridos"),
      });

      if (giftToReserve) {
        await storage.reserveGift(
          giftToReserve.id,
          "Ana G.",
          "anag@gmail.com",
          "¡Felicidades por vuestro bebé!"
        );
        console.log("Reserved a sample gift");
      }

      console.log("Database seed completed successfully");
    } else {
      console.log("Database already seeded, skipping...");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
