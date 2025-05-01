import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift } from "@/types";
import { CheckCircle } from "lucide-react";

interface SuccessModalProps {
  gift: Gift | null;
  reserverEmail: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ gift, reserverEmail, isOpen, onClose }: SuccessModalProps) {
  if (!gift) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="text-green-600 text-3xl" />
          </div>
          <h2 className="text-xl font-bold text-soft-gray-800 mb-2">¡Reserva confirmada!</h2>
          <p className="text-soft-gray-600">
            Hemos enviado un email de confirmación a <strong>{reserverEmail}</strong> con los detalles del regalo.
          </p>
        </div>
        
        <div className="bg-soft-gray-100 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <img 
              src={gift.imageUrl} 
              alt={gift.name} 
              className="w-16 h-16 object-cover rounded-md mr-4" 
            />
            <div>
              <h3 className="font-bold text-soft-gray-800">{gift.name}</h3>
              <p className="text-soft-gray-600 text-sm">{gift.price.toFixed(2)} €</p>
              <p className="text-soft-gray-600 text-xs mt-1">{gift.store}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="text-center">
          <Button
            variant="baby-blue"
            onClick={onClose}
            className="w-full md:w-auto px-6 py-2 rounded-md"
          >
            Volver a la lista
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
