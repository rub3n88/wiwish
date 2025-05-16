import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "@/components/layout/admin-header";
import { GiftSummary } from "@/components/admin/gift-summary";
import { LinkSharing } from "@/components/admin/link-sharing";
import { GiftTable } from "@/components/admin/gift-table";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { AddGiftModal } from "@/components/admin/add-gift-modal";
import { useQuery } from "@tanstack/react-query";
import { Gift, Activity } from "@/types";
import { Loader2, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Definición del tipo Registry si no existe uno global adecuado
// Si tienes un tipo Registry global en @/types, impórtalo en su lugar.
interface Registry {
  id: number;
  babyName: string;
  description?: string;
  isPublic?: boolean;
  slug?: string;
  visitorCount?: number;
  // Añade cualquier otra propiedad que tus registros puedan tener
}

const registrySchema = z.object({
  babyName: z.string().min(2, "El nombre del bebé es obligatorio"),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
});

type RegistryFormValues = z.infer<typeof registrySchema>;

export default function AdminDashboard() {
  const { toast } = useToast();
  const [addGiftModalOpen, setAddGiftModalOpen] = useState(false);
  const [createRegistryModalOpen, setCreateRegistryModalOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);

  // Get user's registries
  const { data: registries, isLoading: registriesLoading } = useQuery<
    Registry[]
  >({
    queryKey: ["/api/registries"],
    select: (data: unknown) => {
      if (Array.isArray(data)) {
        return data as Registry[];
      }
      return [];
    },
  });

  // Get default/active registry
  const [activeRegistryId, setActiveRegistryId] = useState<number | null>(null);

  useEffect(() => {
    if (
      registries &&
      Array.isArray(registries) &&
      registries.length > 0 &&
      !activeRegistryId
    ) {
      setActiveRegistryId(registries[0].id);
    }

    if (
      !registriesLoading &&
      registries &&
      Array.isArray(registries) &&
      registries.length === 0
    ) {
      setCreateRegistryModalOpen(true);
    }
  }, [registries, activeRegistryId, registriesLoading]);

  // Get registry gifts
  const { data: gifts, isLoading: giftsLoading } = useQuery<Gift[]>({
    queryKey: [`/api/registry/${activeRegistryId}/gifts`],
    enabled: !!activeRegistryId,
    select: (data: unknown) => {
      if (!data || !Array.isArray(data)) {
        return [];
      }
      return data as Gift[];
    },
  });

  // Get registry activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<
    Activity[]
  >({
    queryKey: [`/api/registry/${activeRegistryId}/activities`],
    enabled: !!activeRegistryId,
    select: (data: unknown) => {
      if (!data || !Array.isArray(data)) {
        return [];
      }
      return data as Activity[];
    },
  });

  // Get active registry data
  const activeRegistry: Registry | undefined = registries?.find(
    (registry: Registry) => registry.id === activeRegistryId
  );

  // Form for creating registry
  const form = useForm<RegistryFormValues>({
    resolver: zodResolver(registrySchema),
    defaultValues: {
      babyName: "",
      description: "",
      isPublic: true,
    },
  });

  // Create registry handler
  const handleCreateRegistry = async (values: RegistryFormValues) => {
    try {
      const res = await apiRequest("POST", "/api/registries", values);
      const newRegistry = await res.json();

      queryClient.invalidateQueries({ queryKey: ["/api/registries"] });

      toast({
        title: "Lista creada con éxito",
        description: `La lista de regalos para ${values.babyName} ha sido creada`,
      });

      setActiveRegistryId(newRegistry.id);
      form.reset();
      setCreateRegistryModalOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al crear la lista",
        description: "Ha ocurrido un error al crear la lista de regalos",
      });
    }
  };

  // Handle gift edit
  const handleGiftEdit = (gift: Gift) => {
    setSelectedGift(gift);
    setAddGiftModalOpen(true);
  };

  // Get unique categories from gifts
  const categories: string[] = gifts
    ? [...new Set(gifts.map((gift: Gift) => String(gift.category)))]
    : [];

  if (registriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-baby-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-gray-100">
      {activeRegistry && <AdminHeader registryName={activeRegistry.babyName} />}

      <main className="container mx-auto px-4 py-6">
        {/* Dashboard Overview */}
        {activeRegistry && (
          <>
            <GiftSummary
              gifts={gifts || []}
              visitors={activeRegistry.visitorCount || 0}
            />

            <LinkSharing
              registryId={activeRegistry.id}
              registrySlug={activeRegistry.slug || ""}
            />

            {/* Gift Management */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-soft-gray-800">
                  Gestión de Regalos
                </h2>
                <Button
                  variant="baby-blue"
                  className="flex items-center"
                  onClick={() => {
                    setSelectedGift(null);
                    setAddGiftModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir regalo
                </Button>
              </div>

              {giftsLoading ? (
                <div className="bg-white rounded-lg shadow-sm p-10 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-baby-blue-500" />
                </div>
              ) : (
                <GiftTable gifts={gifts || []} onEdit={handleGiftEdit} />
              )}
            </div>

            {/* Recent Activity */}
            <ActivityFeed activities={activities || []} />
          </>
        )}
      </main>

      {/* Add Gift Modal */}
      <AddGiftModal
        isOpen={addGiftModalOpen}
        onClose={() => {
          setAddGiftModalOpen(false);
          setSelectedGift(null);
        }}
        registryId={activeRegistryId || undefined}
        categories={
          categories.length > 0
            ? categories
            : ["Ropa", "Juguetes", "Accesorios", "Muebles", "Otros"]
        }
        gift={selectedGift}
      />

      {/* Create Registry Modal */}
      <Dialog
        open={createRegistryModalOpen}
        onOpenChange={setCreateRegistryModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear una lista de regalos</DialogTitle>
            <DialogDescription>
              Crea una lista de regalos para tu bebé. Podrás compartirla con
              amigos y familiares.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreateRegistry)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="babyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del bebé</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Lucas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Una pequeña descripción de tu lista"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" variant="baby-blue">
                  Crear lista
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
