import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Gift } from "@/types";

interface CancelReservationData {
  valid: boolean;
  gift: Gift;
  registry: {
    id: number;
    babyName: string;
    description?: string;
  };
}

export default function CancelReservation() {
  const { token } = useParams<{ token: string }>();
  const [isConfirming, setIsConfirming] = useState(false);
  const [cancellationSuccess, setCancellationSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Query to validate token and get reservation details
  const {
    data: reservationData,
    isLoading,
    error: queryError,
  } = useQuery<CancelReservationData>({
    queryKey: [`/api/cancel-reservation/${token}`],
    enabled: !!token,
  });

  // Mutation to cancel the reservation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(
        "POST",
        `/api/cancel-reservation/${token}`,
        {}
      );
      return response;
    },
    onSuccess: () => {
      setCancellationSuccess(true);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || "Error al cancelar la reserva");
      setCancellationSuccess(false);
    },
  });

  const handleCancelReservation = () => {
    setIsConfirming(true);
  };

  const confirmCancellation = () => {
    cancelMutation.mutate();
    setIsConfirming(false);
  };

  const cancelConfirmation = () => {
    setIsConfirming(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-safari-green-500 mx-auto mb-4" />
          <p className="text-soft-gray-600">Verificando reserva...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (queryError || !reservationData?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-soft-gray-800 mb-2">
                Reserva no encontrada
              </h1>
              <p className="text-soft-gray-600 mb-6">
                El enlace de cancelación no es válido o la reserva ya ha sido
                cancelada.
              </p>
              <Button variant="safari-green" asChild>
                <a href="/">Volver al inicio</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { gift, registry } = reservationData;

  // Success state
  if (cancellationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-soft-gray-800 mb-2">
                ¡Reserva cancelada!
              </h1>
              <p className="text-soft-gray-600 mb-4">
                Tu reserva de <strong>{gift.name}</strong> para{" "}
                <strong>{registry.babyName}</strong> ha sido cancelada
                exitosamente.
              </p>
              <p className="text-sm text-soft-gray-500 mb-6">
                El regalo ahora está disponible para que otras personas lo
                reserven. Recibirás un email de confirmación en breve.
              </p>
              <div className="space-y-3">
                <Button variant="safari-green" className="w-full" asChild>
                  <a href={`/registry/${registry.id}`}>Ver lista de regalos</a>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/">Volver al inicio</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Confirmation dialog
  if (isConfirming) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soft-gray-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-soft-gray-800">
              Confirmar cancelación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-soft-gray-600 mb-6">
                ¿Estás seguro de que quieres cancelar tu reserva de{" "}
                <strong>{gift.name}</strong>?
              </p>
              <p className="text-sm text-soft-gray-500 mb-6">
                Esta acción no se puede deshacer. El regalo quedará disponible
                para que otras personas lo reserven.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={cancelConfirmation}
                  disabled={cancelMutation.isPending}
                >
                  No, mantener reserva
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={confirmCancellation}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Cancelando...
                    </>
                  ) : (
                    "Sí, cancelar"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main cancellation page
  return (
    <div className="min-h-screen bg-soft-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <a href="/" className="flex items-center text-soft-gray-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio
            </a>
          </Button>
          <h1 className="text-2xl font-bold text-soft-gray-800 text-center">
            Cancelar Reserva
          </h1>
          <p className="text-soft-gray-600 text-center mt-2">
            Lista de regalos para <strong>{registry.babyName}</strong>
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Gift Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-soft-gray-800">
              Detalles de tu reserva
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Gift Image */}
              <div className="flex-shrink-0">
                <img
                  src={gift.imageUrl}
                  alt={gift.name}
                  className="w-32 h-32 object-cover rounded-lg border border-soft-gray-200"
                />
              </div>

              {/* Gift Info */}
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-soft-gray-800 mb-2">
                  {gift.name}
                </h3>
                {gift.description && (
                  <p className="text-soft-gray-600 mb-3">{gift.description}</p>
                )}
                <div className="space-y-1 text-sm">
                  <p className="text-soft-gray-700">
                    <span className="font-medium">Precio:</span>{" "}
                    {gift.price.toFixed(2)} €
                  </p>
                  {gift.store && (
                    <p className="text-soft-gray-700">
                      <span className="font-medium">Tienda:</span> {gift.store}
                    </p>
                  )}
                  {gift.reservedByName && (
                    <p className="text-soft-gray-700">
                      <span className="font-medium">Reservado por:</span>{" "}
                      {gift.reservedByName}
                    </p>
                  )}
                  {gift.reservationDate && (
                    <p className="text-soft-gray-700">
                      <span className="font-medium">Fecha de reserva:</span>{" "}
                      {new Date(gift.reservationDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Product Link */}
                {gift.url && (
                  <div className="mt-3">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={gift.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver producto en tienda
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertDescription className="text-amber-700">
              Si cancelas esta reserva, el regalo quedará disponible para que
              otras personas lo reserven. Esta acción no se puede deshacer.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" asChild>
              <a href={`/registry/${registry.id}`}>Ver lista completa</a>
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelReservation}
              disabled={cancelMutation.isPending}
            >
              Cancelar mi reserva
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
