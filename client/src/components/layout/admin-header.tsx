import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { BabyIcon, ChevronDown, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminHeaderProps {
  registryName: string;
}

export function AdminHeader({ registryName }: AdminHeaderProps) {
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm border-b border-soft-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <BabyIcon className="text-baby-blue-500 text-3xl" />
            <div>
              <h1 className="text-xl font-bold text-soft-gray-800">Lista de Regalos para {registryName}</h1>
              <p className="text-soft-gray-500 text-sm">Panel de administración</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="mr-4 hidden md:block">
              <p className="text-soft-gray-700 text-sm">¡Hola, {user?.username}!</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1 text-soft-gray-700 hover:text-soft-gray-900">
                  <User className="h-5 w-5" />
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Link href="/admin/profile" className="w-full">
                    Mi cuenta
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
