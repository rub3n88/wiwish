import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift } from "@/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const reservationSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  email: z.string().email("Debe ser un email válido"),
  message: z.string().optional(),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

interface ReservationModalProps {
  gift: Gift | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name: string, email: string) => void;
}

export function ReservationModal({
  gift,
  isOpen,
  onClose,
  onSuccess,
}: ReservationModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(values: ReservationFormValues) {
    if (!gift) return;

    setIsSubmitting(true);
    try {
      await apiRequest("POST", `/api/gifts/${gift.id}/reserve`, {
        ...values,
        giftId: gift.id,
      });

      // Invalidate the gifts query to refresh the list
      queryClient.invalidateQueries({
        queryKey: [`/api/registry/${gift.registryId}/gifts`],
      });

      toast({
        title: "Reserva realizada con éxito",
        description: "Hemos enviado un email de confirmación con los detalles",
      });

      onSuccess(values.name, values.email);
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al reservar",
        description:
          "Ha ocurrido un error al realizar la reserva. Por favor, inténtalo de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!gift) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-soft-gray-800">
            Reservar regalo
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center mb-6">
          <img
            src={gift.imageUrl}
            alt={gift.name}
            className="w-16 h-16 object-cover rounded-md mr-4"
          />
          <div>
            <h3 className="font-bold text-soft-gray-800">{gift.name}</h3>
            <p className="text-soft-gray-600 text-sm">
              {gift.price.toFixed(2)} €
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-soft-gray-700 font-medium">
                    Tu nombre
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: María García"
                      {...field}
                      className="w-full px-4 py-2 border border-soft-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-safari-green-500 focus:border-safari-green-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-soft-gray-700 font-medium">
                    Tu email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="correo@ejemplo.com"
                      {...field}
                      className="w-full px-4 py-2 border border-soft-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-safari-green-500 focus:border-safari-green-500"
                    />
                  </FormControl>
                  <p className="text-xs text-soft-gray-500 mt-1">
                    Recibirás un email de confirmación con detalles del regalo.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-soft-gray-700 font-medium">
                    Mensaje (opcional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Añade un mensaje a los padres si lo deseas"
                      rows={2}
                      {...field}
                      className="w-full px-4 py-2 border border-soft-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-safari-green-500 focus:border-safari-green-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex justify-end space-x-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="px-4 py-2 border border-soft-gray-300 text-soft-gray-700 rounded-md hover:bg-soft-gray-100"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="safari-green"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md"
              >
                Confirmar reserva
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
