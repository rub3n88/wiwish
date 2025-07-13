import { useState, useMemo } from "react";
import { Gift } from "@/types";
import { DataTable } from "@/components/ui/data-table";
import { GiftStatusBadge } from "@/components/gift-status-badge";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { ImageViewer } from "@/components/ui/image-viewer";

interface GiftTableProps {
  gifts: Gift[];
  onEdit: (gift: Gift) => void;
}

export function GiftTable({ gifts, onEdit }: GiftTableProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [giftToDelete, setGiftToDelete] = useState<Gift | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const filteredGifts = useMemo(() => {
    if (activeTab === "all") return gifts;
    if (activeTab === "available")
      return gifts.filter((gift) => gift.reservedBy === null);
    if (activeTab === "reserved")
      return gifts.filter((gift) => gift.reservedBy !== null);
    return gifts;
  }, [gifts, activeTab]);

  const handleDeleteClick = (gift: Gift) => {
    setGiftToDelete(gift);
    setDeleteDialogOpen(true);
  };

  const handleImageClick = (imageUrl: string, name: string) => {
    setSelectedImage({ url: imageUrl, name });
    setImageViewerOpen(true);
  };

  const handleDelete = async () => {
    if (!giftToDelete) return;

    try {
      await apiRequest("DELETE", `/api/gifts/${giftToDelete.id}`);

      queryClient.invalidateQueries({
        queryKey: [`/api/registry/${giftToDelete.registryId}/gifts`],
      });

      toast({
        title: "Regalo eliminado",
        description: "El regalo ha sido eliminado de la lista",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: "No se pudo eliminar el regalo. Inténtalo de nuevo.",
      });
    } finally {
      setDeleteDialogOpen(false);
      setGiftToDelete(null);
    }
  };

  const columns: ColumnDef<Gift>[] = [
    {
      id: "gift",
      header: "Regalo",
      cell: ({ row }) => {
        const gift = row.original;
        return (
          <div className="flex items-center">
            <img
              src={gift.imageUrl}
              alt={gift.name}
              className="w-10 h-10 rounded object-cover mr-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => handleImageClick(gift.imageUrl, gift.name)}
            />
            <div className="truncate max-w-[200px]">
              <p className="text-soft-gray-800 font-medium">{gift.name}</p>
              <p className="text-soft-gray-500 text-xs">{gift.store}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: "category",
      header: "Categoría",
      cell: ({ row }) => {
        const gift = row.original;
        return (
          <Badge
            variant={gift.reservedBy ? "baby-pink" : "baby-blue"}
            className="px-2 py-1 text-xs"
          >
            {gift.category}
          </Badge>
        );
      },
    },
    {
      id: "price",
      header: "Precio",
      cell: ({ row }) => {
        return (
          <span className="text-soft-gray-800">
            {row.original.price.toFixed(2)} €
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Estado",
      cell: ({ row }) => {
        const isReserved = row.original.reservedBy !== null;
        return (
          <GiftStatusBadge status={isReserved ? "reserved" : "available"} />
        );
      },
    },
    {
      id: "reservedBy",
      header: "Reservado por",
      cell: ({ row }) => {
        const gift = row.original;
        if (!gift.reservedBy) {
          return <span className="text-soft-gray-500">-</span>;
        }

        return (
          <div>
            <p>{gift.reservedByName}</p>
            <p className="text-xs text-soft-gray-500">{gift.reservedBy}</p>
          </div>
        );
      },
    },
    {
      id: "hidden",
      header: "Oculto",
      cell: ({ row }) => {
        const gift = row.original;
        const toggleHidden = async () => {
          const newHidden = !gift.isHidden;
          await apiRequest("PATCH", `/api/gifts/${gift.id}`, {
            isHidden: newHidden,
          });
          queryClient.invalidateQueries({
            queryKey: [`/api/registry/${gift.registryId}/gifts`],
          });
        };
        return (
          <Switch checked={gift.isHidden} onCheckedChange={toggleHidden} />
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Acciones</div>,
      cell: ({ row }) => {
        const gift = row.original;

        return (
          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.open(gift.url, "_blank")}
            >
              <Eye className="h-4 w-4 text-soft-gray-500 hover:text-soft-gray-700" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(gift)}>
              <Edit className="h-4 w-4 text-soft-gray-500 hover:text-soft-gray-700" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteClick(gift)}
            >
              <Trash2 className="h-4 w-4 text-soft-gray-500 hover:text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  const availableCount = gifts.filter(
    (gift) => gift.reservedBy === null
  ).length;
  const reservedCount = gifts.filter((gift) => gift.reservedBy !== null).length;

  return (
    <>
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-soft-gray-200">
            <TabsList className="flex bg-transparent">
              <TabsTrigger
                value="all"
                className="px-4 py-3 data-[state=active]:text-baby-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-baby-blue-500 data-[state=active]:font-medium data-[state=inactive]:text-soft-gray-600 data-[state=inactive]:hover:text-soft-gray-800 bg-transparent"
              >
                Todos ({gifts.length})
              </TabsTrigger>
              <TabsTrigger
                value="available"
                className="px-4 py-3 data-[state=active]:text-baby-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-baby-blue-500 data-[state=active]:font-medium data-[state=inactive]:text-soft-gray-600 data-[state=inactive]:hover:text-soft-gray-800 bg-transparent"
              >
                Disponibles ({availableCount})
              </TabsTrigger>
              <TabsTrigger
                value="reserved"
                className="px-4 py-3 data-[state=active]:text-baby-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-baby-blue-500 data-[state=active]:font-medium data-[state=inactive]:text-soft-gray-600 data-[state=inactive]:hover:text-soft-gray-800 bg-transparent"
              >
                Reservados ({reservedCount})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="p-0 m-0">
            <DataTable columns={columns} data={filteredGifts} />
          </TabsContent>
        </div>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el regalo "
              {giftToDelete?.name}" y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ImageViewer
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        imageUrl={selectedImage?.url || ""}
        alt={selectedImage?.name || ""}
        title={selectedImage?.name || ""}
      />
    </>
  );
}
