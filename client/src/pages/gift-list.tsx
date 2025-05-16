import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PublicHeader } from "@/components/layout/public-header";
import { GiftCard } from "@/components/gift-card";
import { GiftFilter } from "@/components/gift-filter";
import { InfoModal } from "@/components/info-modal";
import { ReservationModal } from "@/components/reservation-modal";
import { SuccessModal } from "@/components/success-modal";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ChevronDown, Grid, List } from "lucide-react";
import { Gift } from "@/types";
import { apiRequest } from "@/lib/queryClient";

// Definición del tipo Registry si no existe uno global adecuado
// Este debería ser el mismo tipo usado en AdminDashboard.tsx
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

export default function GiftList() {
  const { id } = useParams();
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [reserverEmail, setReserverEmail] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [filter, setFilter] = useState({ query: "", category: "all" });
  const [visibleGifts, setVisibleGifts] = useState(12); // Number of initially visible gifts

  // Record a visit to the registry
  useEffect(() => {
    if (id) {
      apiRequest("POST", `/api/registry/${id}/visit`, {});
    }
  }, [id]);

  // Get registry data
  const {
    data: registry,
    isLoading: registryLoading,
    error: registryError,
  } = useQuery<Registry | undefined>({
    queryKey: [`/api/registry/${id}`],
    select: (data: unknown) => {
      // Asumimos que la API devuelve un objeto Registry o null/undefined si no se encuentra
      // Aquí podrías añadir validación con Zod si es necesario
      return data ? (data as Registry) : undefined;
    },
  });

  // Get gifts for the registry
  const {
    data: gifts,
    isLoading: giftsLoading,
    error: giftsError,
  } = useQuery<Gift[]>({
    queryKey: [`/api/registry/${id}/gifts`],
    select: (data: unknown) => {
      if (Array.isArray(data)) {
        return data as Gift[];
      }
      return [];
    },
  });

  // Usar un array vacío por defecto si gifts es undefined para las derivaciones
  const currentGifts = gifts ?? [];

  // Filter gifts based on search query and category
  const filteredGifts = currentGifts.filter((gift: Gift) => {
    const matchesQuery =
      !filter.query ||
      gift.name.toLowerCase().includes(filter.query.toLowerCase()) ||
      (gift.description &&
        gift.description.toLowerCase().includes(filter.query.toLowerCase())) ||
      (gift.store &&
        gift.store.toLowerCase().includes(filter.query.toLowerCase()));

    const matchesCategory =
      filter.category === "all" || gift.category === filter.category;

    return matchesQuery && matchesCategory;
  });

  // Get unique categories from gifts
  const categories: string[] = [
    ...new Set(currentGifts.map((gift: Gift) => String(gift.category))),
  ];

  // Count of available and reserved gifts
  const availableCount = currentGifts.filter(
    (gift: Gift) => !gift.reservedBy
  ).length;
  const reservedCount = currentGifts.filter(
    (gift: Gift) => gift.reservedBy
  ).length;

  // Handle gift reservation
  const handleReserveGift = (gift: Gift) => {
    setSelectedGift(gift);
    setReservationModalOpen(true);
  };

  // Handle reservation success
  const handleReservationSuccess = (name: string, email: string) => {
    setReservationModalOpen(false);
    setReserverEmail(email);
    setSuccessModalOpen(true);
  };

  // Handle load more gifts
  const handleLoadMore = () => {
    setVisibleGifts((prev) => prev + 12);
  };

  // Show error if registry not found
  if (registryError || giftsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-soft-gray-800 mb-4">
            Lista no encontrada
          </h1>
          <p className="text-soft-gray-600 mb-6">
            Lo sentimos, la lista de regalos que buscas no existe o no está
            disponible.
          </p>
          <Button variant="baby-blue" asChild>
            <a href="/">Volver al inicio</a>
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (registryLoading || giftsLoading || !registry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-baby-blue-500 mb-4"></div>
          <p className="text-soft-gray-600">Cargando lista de regalos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <PublicHeader
        babyName={registry.babyName}
        onInfoClick={() => setInfoModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Gift Counter */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
          <p className="text-soft-gray-700">
            <span className="font-bold text-baby-blue-600">
              {availableCount}
            </span>{" "}
            regalos disponibles |
            <span className="font-bold text-baby-pink-600">
              {reservedCount}
            </span>{" "}
            regalos reservados
          </p>
          <div>
            <Button
              variant="ghost"
              className="p-2 text-soft-gray-500 hover:text-soft-gray-700 rounded-md"
              onClick={() => setIsGridView(!isGridView)}
            >
              {isGridView ? (
                <List className="h-5 w-5" />
              ) : (
                <Grid className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Gift Filter */}
        <GiftFilter categories={categories} onFilterChange={setFilter} />

        {/* Gift Grid/List */}
        {filteredGifts.length > 0 ? (
          <div
            className={`${
              isGridView
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            } mb-8`}
          >
            {filteredGifts.slice(0, visibleGifts).map((gift: Gift) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                onReserve={handleReserveGift}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm mb-8">
            <p className="text-soft-gray-600">
              No se encontraron regalos que coincidan con tu búsqueda.
            </p>
          </div>
        )}

        {/* Load More Button */}
        {filteredGifts.length > visibleGifts && (
          <div className="text-center mb-8">
            <Button
              variant="outline"
              className="bg-white border border-soft-gray-300 text-soft-gray-700 px-6 py-2 rounded-md hover:bg-soft-gray-100 transition"
              onClick={handleLoadMore}
            >
              <span className="flex items-center justify-center">
                <ChevronDown className="mr-2 h-4 w-4" />
                Ver más regalos
              </span>
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <InfoModal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        babyName={registry.babyName}
      />

      <ReservationModal
        gift={selectedGift}
        isOpen={reservationModalOpen}
        onClose={() => setReservationModalOpen(false)}
        onSuccess={handleReservationSuccess}
      />

      <SuccessModal
        gift={selectedGift}
        reserverEmail={reserverEmail}
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
      />
    </div>
  );
}
