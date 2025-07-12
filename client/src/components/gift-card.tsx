import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift } from "@/types";
import { Store } from "lucide-react";

interface GiftCardProps {
  gift: Gift;
  onReserve: (gift: Gift) => void;
}

export function GiftCard({ gift, onReserve }: GiftCardProps) {
  const isReserved = gift.reservedBy !== null;

  return (
    <div
      className={`bg-white rounded-lg overflow-hidden shadow-sm border border-soft-gray-200 transition ${
        !isReserved ? "hover:shadow-md" : "opacity-80"
      }`}
    >
      <div className="relative">
        <img
          src={gift.imageUrl}
          alt={gift.name}
          className={`w-full h-48 object-cover ${
            isReserved ? "grayscale" : ""
          }`}
        />
        <div className="absolute top-2 right-2">
          <Badge
            variant={isReserved ? "baby-pink" : "baby-blue"}
            className="px-2 py-1 text-xs"
          >
            {gift.category}
          </Badge>
        </div>

        {isReserved && (
          <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center">
            <div className="bg-baby-pink-500 text-white px-3 py-2 rounded-full font-bold transform rotate-12">
              Ya reservado
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3
          className={`font-bold ${
            isReserved ? "text-soft-gray-700" : "text-soft-gray-800"
          } mb-2`}
        >
          {gift.name}
        </h3>
        <p
          className={`${
            isReserved ? "text-soft-gray-500" : "text-soft-gray-600"
          } text-sm mb-3 line-clamp-2`}
        >
          {gift.description}
        </p>

        {isReserved ? (
          <div className="mt-4 text-center text-soft-gray-500 text-sm">
            Regalo ya reservado
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Store
                  className={`h-4 w-4 ${
                    isReserved ? "text-baby-pink-500" : "text-baby-blue-500"
                  } mr-1`}
                />
                <span className="text-xs text-soft-gray-600">{gift.store}</span>
              </div>
              <span className="text-sm font-semibold text-soft-gray-800">
                {gift.price.toFixed(2)} €
              </span>
            </div>

            <Button
              variant="baby-blue"
              className="mt-4 w-full"
              onClick={() => onReserve(gift)}
            >
              Reservar este regalo
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
