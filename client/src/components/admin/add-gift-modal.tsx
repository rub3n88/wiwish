import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CloudUpload } from "lucide-react";

const giftFormSchema = z.object({
  name: z.string().min(2, "El nombre del regalo es obligatorio"),
  category: z.string().min(1, "La categoría es obligatoria"),
  price: z.coerce.number().min(0, "El precio debe ser un número positivo"),
  store: z.string().optional(),
  url: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  description: z.string().optional(),
  imageUrl: z.string().min(10, "La URL de la imagen es obligatoria")
});

type GiftFormValues = z.infer<typeof giftFormSchema>;

interface AddGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  registryId?: number;
  categories: string[];
}

export function AddGiftModal({ isOpen, onClose, registryId, categories }: AddGiftModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<GiftFormValues>({
    resolver: zodResolver(giftFormSchema),
    defaultValues: {
      name: "",
      category: "",
      price: 0,
      store: "",
      url: "",
      description: "",
      imageUrl: ""
    },
  });

  async function onSubmit(values: GiftFormValues) {
    if (!registryId) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest("POST", "/api/gifts", {
        ...values,
        registryId
      });
      
      queryClient.invalidateQueries({ queryKey: [`/api/registry/${registryId}/gifts`] });
      
      toast({
        title: "Regalo añadido con éxito",
        description: "El regalo ha sido añadido a la lista"
      });
      
      form.reset();
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al añadir el regalo",
        description: "Ha ocurrido un error al añadir el regalo. Por favor, inténtalo de nuevo."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-soft-gray-800">Añadir nuevo regalo</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-soft-gray-700 font-medium">Nombre del regalo *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-soft-gray-700 font-medium">Categoría *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-soft-gray-700 font-medium">Precio (€) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        min="0" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="store"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-soft-gray-700 font-medium">Tienda</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-soft-gray-700 font-medium">URL de compra</FormLabel>
                    <FormControl>
                      <Input type="url" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-soft-gray-700 font-medium">Descripción</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-soft-gray-700 font-medium">URL de la imagen *</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <Input {...field} placeholder="https://ejemplo.com/imagen.jpg" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch("imageUrl") && (
                <div className="md:col-span-2">
                  <p className="text-sm text-soft-gray-600 mb-2">Vista previa:</p>
                  <div className="border rounded-md p-2 max-w-xs">
                    <img 
                      src={form.watch("imageUrl")} 
                      alt="Vista previa" 
                      className="h-32 w-full object-cover rounded"
                      onError={() => {
                        toast({
                          variant: "destructive",
                          title: "Error de imagen",
                          description: "La URL de la imagen no es válida o no está disponible"
                        });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex justify-end space-x-3 mt-6">
              <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
                className="px-4 py-2 border border-soft-gray-300 text-soft-gray-700 rounded-md hover:bg-soft-gray-100 transition"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="baby-blue"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-md"
              >
                Guardar regalo
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
