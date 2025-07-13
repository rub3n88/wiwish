import { Badge } from "@/components/ui/badge";
import { CircleDot } from "lucide-react";

interface GiftStatusBadgeProps {
  status: "available" | "reserved";
}

export function GiftStatusBadge({ status }: GiftStatusBadgeProps) {
  return (
    <div className="flex items-center">
      <CircleDot
        className={`h-2 w-2 mr-2 ${
          status === "available" ? "text-green-500" : "text-safari-brown-500"
        }`}
      />
      <span className="text-soft-gray-800">
        {status === "available" ? "Disponible" : "Reservado"}
      </span>
    </div>
  );
}
