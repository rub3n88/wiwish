import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LinkSharingProps {
  registryId: number;
  registrySlug: string;
}

export function LinkSharing({ registryId, registrySlug }: LinkSharingProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Get current domain
  const domain = typeof window !== 'undefined' ? window.location.origin : '';
  const registryUrl = `${domain}/registry/${registrySlug}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(registryUrl);
      setCopied(true);
      
      toast({
        title: "Enlace copiado",
        description: "El enlace ha sido copiado al portapapeles",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error al copiar",
        description: "No se pudo copiar el enlace. Inténtalo de nuevo.",
      });
    }
  };
  
  const shareByEmail = () => {
    const subject = encodeURIComponent("Lista de regalos para bebé");
    const body = encodeURIComponent(`Hola,\n\nAquí está el enlace a mi lista de regalos para bebé: ${registryUrl}\n\n¡Gracias!`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };
  
  const shareByWhatsapp = () => {
    const text = encodeURIComponent(`¡Hola! Aquí está el enlace a mi lista de regalos para bebé: ${registryUrl}`);
    window.open(`https://wa.me/?text=${text}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
      <h3 className="font-bold text-soft-gray-800 mb-3">Enlace público de la lista</h3>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-grow">
          <div className="relative">
            <input 
              type="text" 
              value={registryUrl}
              readOnly
              className="w-full px-4 py-2 pr-10 border border-soft-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-baby-blue-500 focus:border-baby-blue-500 bg-soft-gray-50" 
            />
            <button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-soft-gray-500 hover:text-soft-gray-700"
              onClick={copyToClipboard}
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="whatsapp"
            className="flex items-center justify-center px-4 py-2 rounded-md"
            onClick={shareByWhatsapp}
          >
            <span className="mr-1">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="hidden md:inline">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </span>
            <span className="hidden md:inline">WhatsApp</span>
            <span className="md:hidden">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </span>
          </Button>
          <Button
            variant="baby-blue"
            className="flex items-center justify-center px-4 py-2 rounded-md"
            onClick={shareByEmail}
          >
            <Mail className="h-5 w-5 mr-1 hidden md:inline" />
            <span className="hidden md:inline">Email</span>
            <Mail className="h-5 w-5 md:hidden" />
          </Button>
        </div>
      </div>
    </div>
  );
}
