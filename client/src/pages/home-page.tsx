import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { BabyIcon, Gift, Users } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If user is logged in, redirect to admin page
    if (user) {
      setLocation("/admin");
    }
  }, [user, setLocation]);

  // Ya no consultamos las listas públicas directamente

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-safari-green-300 to-safari-beige-300 py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col items-center text-center text-white">
            <BabyIcon className="h-20 w-20 mb-4" />
            <h1 className="text-4xl font-bold mb-4">
              Lista de Regalos para Bebé
            </h1>
            <p className="text-xl mb-8 max-w-2xl">
              Crea una lista de regalos para tu bebé y compártela con amigos y
              familiares. Ellos podrán elegir los regalos que quieran hacer, sin
              duplicados.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="default"
                className="bg-white text-safari-green-600 hover:bg-opacity-90"
                asChild
              >
                <Link href="/auth">Iniciar sesión</Link>
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:bg-opacity-20"
                asChild
              >
                <Link href="/auth">Crear una lista</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-soft-gray-800">
            Características
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-safari-green-100 rounded-full flex items-center justify-center mb-4">
                  <Gift className="h-6 w-6 text-safari-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Lista personalizada</h3>
                <p className="text-soft-gray-600">
                  Añade los regalos que realmente necesitas para tu bebé, con
                  fotos, descripción y enlaces a tiendas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-safari-brown-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-safari-brown-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Reserva de regalos</h3>
                <p className="text-soft-gray-600">
                  Los invitados pueden reservar regalos con su email, evitando
                  duplicados y recibiendo confirmación.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="h-6 w-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Fácil de compartir</h3>
                <p className="text-soft-gray-600">
                  Comparte tu lista con un simple enlace a través de WhatsApp,
                  email o redes sociales.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Search Registry Section */}
      <section className="py-16 px-4 bg-soft-gray-100">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-6 text-soft-gray-800">
            Buscar Lista de Regalos
          </h2>
          <p className="text-center text-soft-gray-600 mb-10 max-w-2xl mx-auto">
            ¿Has recibido un enlace a una lista de regalos? Puedes acceder
            directamente a ella visitando el enlace que te han compartido.
          </p>

          <div className="bg-white p-8 rounded-lg shadow-sm max-w-md mx-auto text-center">
            <h3 className="text-xl font-semibold mb-4 text-soft-gray-800">
              Información de Privacidad
            </h3>
            <p className="text-soft-gray-600 mb-6">
              Las listas de regalos son privadas y solo pueden ser vistas por
              las personas que tienen el enlace directo.
            </p>
            <Button variant="safari-green" className="mx-auto" asChild>
              <Link href="/auth">Crear mi lista de regalos</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
