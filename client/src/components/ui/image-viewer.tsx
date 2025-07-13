import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
  title?: string;
}

export function ImageViewer({
  isOpen,
  onClose,
  imageUrl,
  alt,
  title,
}: ImageViewerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        {/* Header con título */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <h3 className="text-lg font-semibold text-soft-gray-800 truncate">
            {title || alt}
          </h3>
        </div>

        {/* Contenedor de imagen */}
        <div className="flex-1 overflow-auto bg-soft-gray-50 flex items-center justify-center p-4">
          <img
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
