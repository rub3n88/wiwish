export type Gift = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  url: string;
  store: string;
  category: string;
  registryId: number;
  reservedBy: string | null;
  reservedByName: string | null;
  reservationDate: string | null;
  cancellationToken: string | null;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Registry = {
  id: number;
  babyName: string;
  description: string | null;
  slug: string;
  userId: number;
  isPublic: boolean;
  visitorCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Activity = {
  id: number;
  registryId: number;
  type:
    | "GIFT_RESERVED"
    | "GIFT_ADDED"
    | "REGISTRY_VIEWED"
    | "RESERVATION_CANCELLED";
  userDisplayName: string;
  targetName: string;
  description: string;
  createdAt: string;
};
