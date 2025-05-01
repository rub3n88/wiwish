import express, { type Express, type Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { sendReservationEmail, sendCancellationEmail } from "./email";
import { z } from "zod";
import { db } from "../db";
import { gifts } from "../shared/schema";
import { eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configurar multer para almacenar los archivos
const uploadDir = path.join(process.cwd(), "public", "uploads");

// Asegurarnos de que existe el directorio de uploads
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage_config });

// Util functions
const generateErrorResponse = (error: unknown) => {
  if (error instanceof z.ZodError) {
    return { message: error.message, errors: error.format() };
  }
  
  if (error instanceof Error) {
    return { message: error.message };
  }
  
  return { message: "Unknown error occurred" };
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Servir archivos estáticos desde la carpeta uploads
  app.use('/uploads', express.static(uploadDir));
  
  // Set up authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Registry Routes
  app.get("/api/registries", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const registries = await storage.getUserRegistries(req.user.id);
      return res.json(registries);
    } catch (error) {
      console.error("Error fetching registries:", error);
      return res.status(500).json(generateErrorResponse(error));
    }
  });

  app.get("/api/registries/public", async (req, res) => {
    try {
      const registries = await storage.getPublicRegistries();
      return res.json(registries);
    } catch (error) {
      console.error("Error fetching public registries:", error);
      return res.status(500).json(generateErrorResponse(error));
    }
  });

  app.post("/api/registries", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const schema = z.object({
        babyName: z.string().min(2, "El nombre del bebé es obligatorio"),
        description: z.string().optional(),
        isPublic: z.boolean().default(true),
      });
      
      const validatedData = schema.parse(req.body);
      
      const registry = await storage.createRegistry({
        ...validatedData,
        userId: req.user.id
      });
      
      return res.status(201).json(registry);
    } catch (error) {
      console.error("Error creating registry:", error);
      return res.status(400).json(generateErrorResponse(error));
    }
  });

  app.get("/api/registry/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      let registry;
      
      // Check if the ID is a slug
      if (isNaN(parseInt(id))) {
        registry = await storage.getRegistryBySlug(id);
      } else {
        registry = await storage.getRegistryById(parseInt(id));
      }
      
      if (!registry) {
        return res.status(404).json({ message: "Lista de regalos no encontrada" });
      }
      
      // If registry is not public, check authentication
      if (!registry.isPublic) {
        if (!req.isAuthenticated() || req.user.id !== registry.userId) {
          return res.status(403).json({ message: "No tienes permiso para ver esta lista" });
        }
      }
      
      return res.json(registry);
    } catch (error) {
      console.error("Error fetching registry:", error);
      return res.status(500).json(generateErrorResponse(error));
    }
  });

  app.post("/api/registry/:id/visit", async (req, res) => {
    try {
      const { id } = req.params;
      
      let registry;
      
      // Check if the ID is a slug
      if (isNaN(parseInt(id))) {
        registry = await storage.getRegistryBySlug(id);
        if (registry) {
          await storage.updateRegistryVisitCount(registry.id);
        }
      } else {
        const registryId = parseInt(id);
        registry = await storage.getRegistryById(registryId);
        if (registry) {
          await storage.updateRegistryVisitCount(registryId);
        }
      }
      
      if (!registry) {
        return res.status(404).json({ message: "Lista de regalos no encontrada" });
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error recording registry visit:", error);
      return res.status(500).json(generateErrorResponse(error));
    }
  });

  // Gift Routes
  app.get("/api/registry/:id/gifts", async (req, res) => {
    try {
      const { id } = req.params;
      
      let registryId;
      
      // Check if the ID is a slug
      if (isNaN(parseInt(id))) {
        const registry = await storage.getRegistryBySlug(id);
        if (!registry) {
          return res.status(404).json({ message: "Lista de regalos no encontrada" });
        }
        registryId = registry.id;
      } else {
        registryId = parseInt(id);
        const registry = await storage.getRegistryById(registryId);
        if (!registry) {
          return res.status(404).json({ message: "Lista de regalos no encontrada" });
        }
      }
      
      const gifts = await storage.getGiftsByRegistryId(registryId);
      return res.json(gifts);
    } catch (error) {
      console.error("Error fetching gifts:", error);
      return res.status(500).json(generateErrorResponse(error));
    }
  });

  app.post("/api/gifts", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const schema = z.object({
        name: z.string().min(2, "El nombre del regalo es obligatorio"),
        description: z.string().default(""),
        price: z.coerce.number().min(0, "El precio debe ser un número positivo"),
        imageUrl: z.string().min(10, "La URL de la imagen es obligatoria"),
        url: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
        store: z.string().default(""),
        category: z.string().min(1, "La categoría es obligatoria"),
        registryId: z.number().int("El ID de la lista de regalos es obligatorio"),
      });
      
      const validatedData = schema.parse(req.body);
      
      // Verify the registry belongs to the authenticated user
      const registry = await storage.getRegistryById(validatedData.registryId);
      if (!registry || registry.userId !== req.user.id) {
        return res.status(403).json({ message: "No tienes permiso para añadir regalos a esta lista" });
      }
      
      const gift = await storage.createGift({
        ...validatedData,
        description: validatedData.description || "",
        url: validatedData.url || "",
        store: validatedData.store || "",
      });
      
      return res.status(201).json(gift);
    } catch (error) {
      console.error("Error creating gift:", error);
      return res.status(400).json(generateErrorResponse(error));
    }
  });

  app.patch("/api/gifts/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { id } = req.params;
      const giftId = parseInt(id);
      
      const gift = await storage.getGiftById(giftId);
      if (!gift) {
        return res.status(404).json({ message: "Regalo no encontrado" });
      }
      
      // Verify the gift belongs to a registry that belongs to the authenticated user
      const registry = await storage.getRegistryById(gift.registryId);
      if (!registry || registry.userId !== req.user.id) {
        return res.status(403).json({ message: "No tienes permiso para modificar este regalo" });
      }
      
      const schema = z.object({
        name: z.string().min(2, "El nombre del regalo es obligatorio").optional(),
        description: z.string().optional(),
        price: z.coerce.number().min(0, "El precio debe ser un número positivo").optional(),
        imageUrl: z.string().min(10, "La URL de la imagen es obligatoria").optional(),
        url: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
        store: z.string().optional(),
        category: z.string().min(1, "La categoría es obligatoria").optional(),
      });
      
      const validatedData = schema.parse(req.body);
      
      const updatedGift = await storage.updateGift(giftId, validatedData);
      
      return res.json(updatedGift);
    } catch (error) {
      console.error("Error updating gift:", error);
      return res.status(400).json(generateErrorResponse(error));
    }
  });

  app.delete("/api/gifts/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { id } = req.params;
      const giftId = parseInt(id);
      
      const gift = await storage.getGiftById(giftId);
      if (!gift) {
        return res.status(404).json({ message: "Regalo no encontrado" });
      }
      
      // Verify the gift belongs to a registry that belongs to the authenticated user
      const registry = await storage.getRegistryById(gift.registryId);
      if (!registry || registry.userId !== req.user.id) {
        return res.status(403).json({ message: "No tienes permiso para eliminar este regalo" });
      }
      
      const success = await storage.deleteGift(giftId);
      
      if (success) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(500).json({ message: "Error al eliminar el regalo" });
      }
    } catch (error) {
      console.error("Error deleting gift:", error);
      return res.status(500).json(generateErrorResponse(error));
    }
  });

  app.post("/api/gifts/:id/reserve", async (req, res) => {
    try {
      const { id } = req.params;
      const giftId = parseInt(id);
      
      const schema = z.object({
        name: z.string().min(2, "El nombre es obligatorio"),
        email: z.string().email("Debe ser un email válido"),
        message: z.string().optional().nullable(),
      });
      
      const validatedData = schema.parse(req.body);
      
      const gift = await storage.getGiftById(giftId);
      if (!gift) {
        return res.status(404).json({ message: "Regalo no encontrado" });
      }
      
      if (gift.reservedBy) {
        return res.status(400).json({ message: "Este regalo ya ha sido reservado" });
      }
      
      const updatedGift = await storage.reserveGift(
        giftId,
        validatedData.name,
        validatedData.email,
        validatedData.message || null
      );
      
      // Get registry info for the email
      const registry = await storage.getRegistryById(gift.registryId);
      
      // Send confirmation email
      if (registry && updatedGift.cancellationToken) {
        try {
          await sendReservationEmail(
            validatedData.email,
            validatedData.name,
            updatedGift,
            registry.babyName,
            updatedGift.cancellationToken
          );
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
          // Don't fail the request if email fails
        }
      }
      
      return res.status(200).json(updatedGift);
    } catch (error) {
      console.error("Error reserving gift:", error);
      return res.status(400).json(generateErrorResponse(error));
    }
  });

  app.post("/api/cancel-reservation/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ message: "Token de cancelación no proporcionado" });
      }
      
      // Find the gift with this cancellation token
      const giftWithToken = await db.query.gifts.findFirst({
        where: eq(gifts.cancellationToken, token)
      });
      
      const updatedGift = await storage.cancelReservation(token);
      
      if (!updatedGift) {
        return res.status(404).json({ message: "Reserva no encontrada o ya cancelada" });
      }
      
      // Get registry info for the email
      const registry = await storage.getRegistryById(updatedGift.registryId);
      
      // Send cancellation confirmation email
      if (registry && giftWithToken && giftWithToken.reservedBy) {
        try {
          await sendCancellationEmail(
            giftWithToken.reservedBy,
            giftWithToken,
            registry.babyName
          );
        } catch (emailError) {
          console.error("Error sending cancellation email:", emailError);
          // Don't fail the request if email fails
        }
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      return res.status(500).json(generateErrorResponse(error));
    }
  });

  // Activity Routes
  app.get("/api/registry/:id/activities", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { id } = req.params;
      const registryId = parseInt(id);
      
      // Verify the registry belongs to the authenticated user
      const registry = await storage.getRegistryById(registryId);
      if (!registry || registry.userId !== req.user.id) {
        return res.status(403).json({ message: "No tienes permiso para ver las actividades de esta lista" });
      }
      
      const activities = await storage.getActivitiesByRegistryId(registryId);
      return res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      return res.status(500).json(generateErrorResponse(error));
    }
  });
  
  // Ruta para subir imágenes de regalos
  app.post("/api/gifts/upload", upload.single('image'), async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No se ha proporcionado ninguna imagen" });
      }
      
      // Extraer los datos del formulario
      const schema = z.object({
        name: z.string().min(2, "El nombre del regalo es obligatorio"),
        description: z.string().default(""),
        price: z.coerce.number().min(0, "El precio debe ser un número positivo"),
        url: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
        store: z.string().default(""),
        category: z.string().min(1, "La categoría es obligatoria"),
        registryId: z.coerce.number().int("El ID de la lista de regalos es obligatorio"),
      });
      
      const validatedData = schema.parse(req.body);
      
      // Verificar que la lista de regalos pertenece al usuario autenticado
      const registry = await storage.getRegistryById(validatedData.registryId);
      if (!registry || registry.userId !== req.user.id) {
        return res.status(403).json({ message: "No tienes permiso para añadir regalos a esta lista" });
      }
      
      // Crear la URL de la imagen (accesible desde la web)
      const imageUrl = `/uploads/${req.file.filename}`;
      
      // Crear el regalo con la URL de la imagen
      const gift = await storage.createGift({
        ...validatedData,
        description: validatedData.description || "",
        url: validatedData.url || "",
        store: validatedData.store || "",
        imageUrl: imageUrl,
      });
      
      return res.status(201).json(gift);
    } catch (error) {
      console.error("Error uploading image:", error);
      return res.status(400).json(generateErrorResponse(error));
    }
  });

  app.get("/api/cancel-reservation/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ message: "Token de cancelación no proporcionado" });
      }
      
      // Find gift with this cancellation token
      const gift = await db.query.gifts.findFirst({
        where: eq(gifts.cancellationToken, token)
      });
      
      if (!gift) {
        return res.status(404).json({ message: "Reserva no encontrada o ya cancelada" });
      }
      
      // Get registry info for the confirmation page
      const registry = await storage.getRegistryById(gift.registryId);
      
      if (!registry) {
        return res.status(404).json({ message: "Lista de regalos no encontrada" });
      }
      
      return res.json({
        valid: true,
        gift,
        registry
      });
    } catch (error) {
      console.error("Error validating cancellation token:", error);
      return res.status(500).json(generateErrorResponse(error));
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
