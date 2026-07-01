import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Place } from "@/data/places";

interface PlaceCardProps {
  place: Place;
  distance?: number;
  onClick?: () => void;
}

import { useTripContext } from "@/context/TripContext";

export function PlaceCard({ place, distance, onClick }: PlaceCardProps) {
  const { isPlaceLiked, toggleLikePlace } = useTripContext();
  const isLiked = isPlaceLiked(place.id);

  return (
    <Card hoverable onClick={onClick} className="overflow-hidden relative">
      <div className="flex gap-3 p-3 relative">
        <div className="relative shrink-0 w-20 h-20">
          <img
            src={place.imageUrl}
            alt={place.nameTh}
            className="w-full h-full rounded-lg object-cover"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLikePlace(place);
            }}
            className="absolute -top-1 -right-1 w-6 h-6 bg-white/90 shadow-sm rounded-full flex items-center justify-center cursor-pointer transition-colors"
          >
            <svg className={`w-3.5 h-3.5 transition-colors ${isLiked ? 'text-coral-500 fill-coral-500' : 'text-zinc-400 hover:text-coral-400'}`} fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isLiked ? 0 : 2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-zinc-900 truncate">{place.nameTh}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{place.zone}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {place.theme.slice(0, 2).map((t) => (
              <Badge key={t} variant="neutral">{t}</Badge>
            ))}
            {place.status.includes("Hidden Gem") && (
              <Badge variant="coral">Hidden Gem</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {place.estDuration} min
            </span>
            <span>{place.priceLevel}</span>
            {distance !== undefined && (
              <span className="text-coral-500 font-medium">{distance.toFixed(1)} km</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
