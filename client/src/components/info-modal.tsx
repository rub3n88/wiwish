import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  babyName: string;
}

export function InfoModal({ isOpen, onClose, babyName }: InfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-soft-gray-800">Sobre esta lista de regalos</DialogTitle>
        </DialogHeader>
        
        <div className="prose text-soft-gray-700 mb-6">
          <p>¡Bienvenidos a nuestra lista de regalos para el bebé! Aquí puedes elegir un regalo para nuestro pequeño {babyName}.</p>
          
          <p className="mt-2">
            Al seleccionar un regalo, solo necesitas proporcionar tu email. Te enviaremos un mensaje de agradecimiento con la información del regalo y un enlace por si necesitas cancelar tu selección.
          </p>
          
          <p className="mt-2">
            Los regalos marcados como "Ya reservado" han sido elegidos por otras personas.
          </p>
        </div>
        
        <DialogFooter>
          <Button
            variant="baby-blue"
            onClick={onClose}
            className="bg-baby-blue-500 text-white px-4 py-2 rounded-md hover:bg-baby-blue-600 transition"
          >
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
