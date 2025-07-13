import { Gift } from "@/types";
import { Package, Gift as GiftIcon, Link2 } from "lucide-react";

interface GiftSummaryProps {
  gifts: Gift[];
  visitors: number;
}

export function GiftSummary({ gifts, visitors }: GiftSummaryProps) {
  const totalGifts = gifts.length;
  const reservedGifts = gifts.filter((gift) => gift.reservedBy !== null).length;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-soft-gray-800 mb-4">Resumen</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-safari-green-100 p-3 mr-4">
              <Package className="h-5 w-5 text-safari-green-500" />
            </div>
            <div>
              <p className="text-soft-gray-500 text-sm">Total de regalos</p>
              <p className="text-2xl font-bold text-soft-gray-800">
                {totalGifts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-safari-brown-100 p-3 mr-4">
              <GiftIcon className="h-5 w-5 text-safari-brown-500" />
            </div>
            <div>
              <p className="text-soft-gray-500 text-sm">Regalos reservados</p>
              <p className="text-2xl font-bold text-soft-gray-800">
                {reservedGifts}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <Link2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-soft-gray-500 text-sm">Visitas a la lista</p>
              <p className="text-2xl font-bold text-soft-gray-800">
                {visitors}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
