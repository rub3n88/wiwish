import { useState, useEffect } from "react";
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
  imageUrl: z.string(), // No validamos longitud al inicio para evitar errores al abrir el modal
  image: z.instanceof(File).optional()
});

type GiftFormValues = z.infer<typeof giftFormSchema>;

interface AddGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  registryId?: number;
  categories: string[];
  gift?: any; // Regalo a editar (si es una edición)
}

export function AddGiftModal({ isOpen, onClose, registryId, categories, gift }: AddGiftModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  
  const form = useForm<GiftFormValues>({
    resolver: zodResolver(giftFormSchema),
    defaultValues: {
      name: "",
      category: "",
      price: 0,
      store: "",
      url: "",
      description: "",
      imageUrl: "https://via.placeholder.com/400x300?text=Imagen+del+Regalo"
    },
  });
  
  // Utilizamos useEffect para cargar los datos del regalo en edición
  useEffect(() => {
    if (gift) {
      // Si estamos en modo edición, cargamos los datos del regalo
      form.reset({
        name: gift.name || "",
        category: gift.category || "",
        price: gift.price || 0,
        store: gift.store || "",
        url: gift.url || "",
        description: gift.description || "",
        imageUrl: gift.imageUrl || "https://via.placeholder.com/400x300?text=Imagen+del+Regalo"
      });
      
      // Si hay imagen, mostramos la vista previa
      if (gift.imageUrl) {
        setImagePreview(gift.imageUrl);
      }
    } else {
      // Si no estamos en modo edición, reseteamos el formulario
      form.reset({
        name: "",
        category: "",
        price: 0,
        store: "",
        url: "",
        description: "",
        imageUrl: "https://via.placeholder.com/400x300?text=Imagen+del+Regalo"
      });
      setImagePreview(null);
    }
  }, [gift, form]);
  
  // Función para manejar la carga de archivos
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage(file);
      
      // Crear URL para vista previa
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        form.setValue("imageUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: GiftFormValues) {
    if (!registryId) return;
    
    // Validar que la URL de la imagen tiene una longitud mínima
    if (!uploadedImage && values.imageUrl.length < 10) {
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "La URL de la imagen es obligatoria y debe tener al menos 10 caracteres"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      let imageDataUrl = values.imageUrl;
      
      // Determinar si estamos en modo edición o creación
      const isEditMode = !!gift;
      
      // Si hay una imagen cargada, utilizamos FormData
      if (uploadedImage) {
        const formData = new FormData();
        formData.append('image', uploadedImage);
        formData.append('name', values.name);
        formData.append('category', values.category);
        formData.append('price', values.price.toString());
        formData.append('registryId', registryId.toString());
        
        if (values.store) formData.append('store', values.store);
        if (values.url) formData.append('url', values.url);
        if (values.description) formData.append('description', values.description);
        
        // Si estamos en modo edición, añadimos el ID del regalo
        if (isEditMode) {
          formData.append('id', gift.id.toString());
        }
        
        // Hacemos una petición para subir la imagen
        const endpoint = isEditMode ? `/api/gifts/${gift.id}/upload` : '/api/gifts/upload';
        const response = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Error al subir la imagen');
        }
        
        // La respuesta del servidor contiene los datos del regalo ya actualizado
        await response.json();
      } else {
        // Si no hay imagen cargada, enviamos los datos como antes
        if (isEditMode) {
          await apiRequest("PATCH", `/api/gifts/${gift.id}`, {
            ...values,
            registryId
          });
        } else {
          await apiRequest("POST", "/api/gifts", {
            ...values,
            registryId
          });
        }
      }
      
      // Actualizamos los regalos de la lista
      queryClient.invalidateQueries({ queryKey: [`/api/registry/${registryId}/gifts`] });
      
      // Mensaje según si es edición o creación
      toast({
        title: isEditMode ? "Regalo actualizado con éxito" : "Regalo añadido con éxito",
        description: isEditMode 
          ? "El regalo ha sido actualizado correctamente" 
          : "El regalo ha sido añadido a la lista"
      });
      
      // Limpiamos el estado y cerramos el modal
      setImagePreview(null);
      setUploadedImage(null);
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error al procesar el regalo:", error);
      toast({
        variant: "destructive",
        title: gift ? "Error al actualizar el regalo" : "Error al añadir el regalo",
        description: "Ha ocurrido un error. Por favor, inténtalo de nuevo."
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-soft-gray-800">
            {gift ? "Editar regalo" : "Añadir nuevo regalo"}
          </DialogTitle>
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
                    <FormLabel className="text-soft-gray-700 font-medium">Imagen del regalo *</FormLabel>
                    <div className="md:col-span-2 mb-4">
                      <div className="border-2 border-dashed border-soft-gray-300 rounded-lg p-6 text-center hover:border-baby-blue-500 transition-colors cursor-pointer">
                        <label htmlFor="image-upload" className="cursor-pointer w-full h-full block">
                          <div className="flex flex-col items-center">
                            <CloudUpload className="h-10 w-10 text-soft-gray-400 mb-2" />
                            <p className="text-soft-gray-600 mb-1">Subir imagen</p>
                            <p className="text-xs text-soft-gray-500">Arrastra una imagen o haz clic para seleccionar</p>
                          </div>
                          <input 
                            id="image-upload" 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                      </div>
                    </div>
                    <FormControl>
                      <div className="flex">
                        <Input 
                          {...field} 
                          placeholder="https://ejemplo.com/imagen.jpg"
                          className="text-xs text-soft-gray-500"
                        />
                      </div>
                    </FormControl>
                    <p className="text-sm text-soft-gray-500 mt-1">Puedes subir una imagen o usar una URL</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch("imageUrl") && (
                <div className="md:col-span-2">
                  <p className="text-sm text-soft-gray-600 mb-2">Vista previa:</p>
                  <div className="border rounded-md p-2 max-w-xs">
                    {/* Solo mostramos la imagen si hay un preview o si la URL no es la predeterminada */}
                    {(imagePreview || 
                     (form.watch("imageUrl") !== "https://via.placeholder.com/400x300?text=Imagen+del+Regalo")) ? (
                      <img 
                        src={imagePreview || form.watch("imageUrl")} 
                        alt="Vista previa" 
                        className="h-32 w-full object-cover rounded"
                        onError={() => {
                          if (!imagePreview) {
                            toast({
                              variant: "destructive",
                              title: "Error de imagen",
                              description: "La URL de la imagen no es válida o no está disponible"
                            });
                          }
                        }}
                      />
                    ) : (
                      <div className="h-32 w-full flex items-center justify-center bg-soft-gray-100 rounded">
                        <p className="text-xs text-soft-gray-500 text-center px-2">
                          Sube una imagen o introduce una URL válida para ver la vista previa
                        </p>
                      </div>
                    )}
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
