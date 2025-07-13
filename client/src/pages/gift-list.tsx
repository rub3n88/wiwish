import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PublicHeader } from "@/components/layout/public-header";
import { GiftCard } from "@/components/gift-card";
import { InfoModal } from "@/components/info-modal";
import { ReservationModal } from "@/components/reservation-modal";
import { SuccessModal } from "@/components/success-modal";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";
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
  const [filter, setFilter] = useState({ query: "" });
  const [sortBy, setSortBy] = useState<"name" | "price">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

  // Filter and separate gifts based on search query and reservation status
  const filteredGifts = currentGifts.filter((gift: Gift) => {
    const matchesQuery =
      !filter.query ||
      gift.name.toLowerCase().includes(filter.query.toLowerCase()) ||
      (gift.description &&
        gift.description.toLowerCase().includes(filter.query.toLowerCase())) ||
      (gift.store &&
        gift.store.toLowerCase().includes(filter.query.toLowerCase()));

    const isVisible = !gift.isHidden;

    return matchesQuery && isVisible;
  });

  // Separate available and reserved gifts
  const availableGifts = filteredGifts
    .filter((gift: Gift) => !gift.reservedBy)
    .sort((a, b) => {
      if (sortBy === "name") {
        const comparison = a.name.localeCompare(b.name);
        return sortOrder === "asc" ? comparison : -comparison;
      } else if (sortBy === "price") {
        const comparison = a.price - b.price;
        return sortOrder === "asc" ? comparison : -comparison;
      }
      return 0;
    });

  const reservedGifts = filteredGifts
    .filter((gift: Gift) => gift.reservedBy)
    .sort((a, b) => {
      if (sortBy === "name") {
        const comparison = a.name.localeCompare(b.name);
        return sortOrder === "asc" ? comparison : -comparison;
      } else if (sortBy === "price") {
        const comparison = a.price - b.price;
        return sortOrder === "asc" ? comparison : -comparison;
      }
      return 0;
    });

  // Count of available and reserved gifts (from filtered results)
  const availableCount = availableGifts.length;
  const reservedCount = reservedGifts.length;

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
          <Button variant="safari-green" asChild>
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-safari-green-500 mb-4"></div>
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
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
          <p className="text-soft-gray-700">
            <span className="font-bold text-safari-green-600">
              {availableCount}
            </span>{" "}
            regalos disponibles |
            <span className="font-bold text-safari-brown-600">
              {reservedCount}
            </span>{" "}
            regalos reservados
          </p>
        </div>

        {/* Sort Controls */}
        <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-soft-gray-600">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "price")}
                className="px-3 py-1 border border-soft-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-safari-green-500"
              >
                <option value="name">Nombre</option>
                <option value="price">Precio</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-3 py-1 border border-soft-gray-300 rounded-md text-sm hover:bg-soft-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-safari-green-500"
              >
                {sortOrder === "asc" ? "↑ Menor a mayor" : "↓ Mayor a menor"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-soft-gray-600">Vista:</span>
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
        </div>

        {/* Available Gifts Section */}
        {availableGifts.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-soft-gray-800 mb-4 flex items-center">
              <span className="inline-block w-3 h-3 bg-safari-green-500 rounded-full mr-2"></span>
              Regalos disponibles ({availableGifts.length})
            </h3>
            <div
              className={`${
                isGridView
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-4"
              }`}
            >
              {availableGifts.map((gift: Gift) => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  onReserve={handleReserveGift}
                />
              ))}
            </div>
          </div>
        )}

        {/* Reserved Gifts Section */}
        {reservedGifts.length > 0 && (
          <div className="mb-8">
            {/* Separator */}
            {availableGifts.length > 0 && (
              <div className="flex items-center my-8">
                <div className="flex-1 border-t border-soft-gray-200"></div>
                <div className="px-4 text-sm text-soft-gray-500 bg-soft-gray-100 rounded-full py-1">
                  Ya reservados
                </div>
                <div className="flex-1 border-t border-soft-gray-200"></div>
              </div>
            )}

            <h3 className="text-lg font-semibold text-soft-gray-600 mb-4 flex items-center">
              <span className="inline-block w-3 h-3 bg-safari-brown-500 rounded-full mr-2"></span>
              Regalos reservados ({reservedGifts.length})
            </h3>
            <div
              className={`${
                isGridView
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-4"
              } opacity-75`}
            >
              {reservedGifts.map((gift: Gift) => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  onReserve={handleReserveGift}
                />
              ))}
            </div>
          </div>
        )}

        {/* No results message */}
        {availableGifts.length === 0 && reservedGifts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm mb-8">
            <p className="text-soft-gray-600">
              No se encontraron regalos que coincidan con tu búsqueda.
            </p>
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
