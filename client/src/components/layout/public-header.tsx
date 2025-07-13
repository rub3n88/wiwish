import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BabyIcon, Info } from "lucide-react";

interface PublicHeaderProps {
  babyName: string;
  onInfoClick: () => void;
}

export function PublicHeader({ babyName, onInfoClick }: PublicHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-safari-green-300 to-safari-beige-300 shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BabyIcon className="text-white text-3xl" />
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Lista de Regalos para {babyName}
            </h1>
          </div>

          <Button
            variant="ghost"
            className="bg-white bg-opacity-30 rounded-full p-2 text-white hover:bg-opacity-40 transition"
            onClick={onInfoClick}
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-white text-sm mt-2">
          ¡Gracias por ser parte de nuestra alegría!
        </p>
      </div>
    </header>
  );
}
