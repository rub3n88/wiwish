import { Activity } from "@/types";
import { ExternalLink, Gift as GiftIcon, Eye, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "GIFT_RESERVED":
        return (
          <span className="flex h-8 w-8 rounded-full bg-baby-pink-100 items-center justify-center">
            <GiftIcon className="h-4 w-4 text-baby-pink-500" />
          </span>
        );
      case "GIFT_ADDED":
        return (
          <span className="flex h-8 w-8 rounded-full bg-baby-blue-100 items-center justify-center">
            <Plus className="h-4 w-4 text-baby-blue-500" />
          </span>
        );
      case "REGISTRY_VIEWED":
        return (
          <span className="flex h-8 w-8 rounded-full bg-green-100 items-center justify-center">
            <Eye className="h-4 w-4 text-green-500" />
          </span>
        );
      default:
        return (
          <span className="flex h-8 w-8 rounded-full bg-soft-gray-100 items-center justify-center">
            <ExternalLink className="h-4 w-4 text-soft-gray-500" />
          </span>
        );
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case "GIFT_RESERVED":
        return (
          <p className="text-soft-gray-800">
            <span className="font-medium">{activity.userDisplayName}</span> ha reservado{" "}
            <span className="font-medium">{activity.targetName}</span>
          </p>
        );
      case "GIFT_ADDED":
        return (
          <p className="text-soft-gray-800">
            <span className="font-medium">{activity.userDisplayName}</span> ha añadido{" "}
            <span className="font-medium">{activity.targetName}</span> a la lista
          </p>
        );
      case "REGISTRY_VIEWED":
        return (
          <p className="text-soft-gray-800">
            <span className="font-medium">{activity.userDisplayName}</span> han visitado la lista
          </p>
        );
      default:
        return (
          <p className="text-soft-gray-800">{activity.description}</p>
        );
    }
  };

  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-soft-gray-800 mb-4">Actividad reciente</h2>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <ul className="divide-y divide-soft-gray-200">
          {activities.slice(0, 5).map((activity) => (
            <li key={activity.id} className="p-4">
              <div className="flex items-start">
                <div className="mr-4">
                  {getActivityIcon(activity.type)}
                </div>
                <div>
                  {getActivityText(activity)}
                  <p className="text-soft-gray-500 text-sm mt-1">{formatDate(activity.createdAt)}</p>
                </div>
              </div>
            </li>
          ))}
          
          {activities.length === 0 && (
            <li className="p-4 text-center text-soft-gray-500">
              No hay actividad reciente
            </li>
          )}
        </ul>
        
        {activities.length > 5 && (
          <div className="bg-soft-gray-50 px-4 py-3 text-center">
            <a href="#" className="text-baby-blue-600 hover:text-baby-blue-700 text-sm font-medium">
              Ver toda la actividad
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
