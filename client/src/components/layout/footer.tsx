import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-soft-gray-100 border-t border-soft-gray-200 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-soft-gray-600 text-sm mb-2 md:mb-0">Lista de regalos para bebé | {new Date().getFullYear()}</p>
          <div className="flex space-x-4">
            <Link href="/terminos" className="text-soft-gray-600 hover:text-baby-blue-500 text-sm">
              Términos y condiciones
            </Link>
            <Link href="/privacidad" className="text-soft-gray-600 hover:text-baby-blue-500 text-sm">
              Política de privacidad
            </Link>
            <Link href="/auth" className="text-soft-gray-600 hover:text-baby-blue-500 text-sm">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
