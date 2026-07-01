import { Badge } from "@/components/ui/Badge";
import type { Place } from "@/data/places";

interface TimelineSlotProps {
  place: Place;
  startTime: string;
  endTime: string;
  index: number;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

export function TimelineSlot({
  place,
  startTime,
  endTime,
  index,
  onDragStart,
  onDragOver,
  onDrop,
}: TimelineSlotProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className="bg-white rounded-xl border border-zinc-200 shadow-sm p-3 flex gap-3 cursor-grab active:cursor-grabbing active:shadow-md active:border-coral-200 transition-all duration-200 select-none"
    >
      {/* Time column */}
      <div className="flex flex-col items-center shrink-0 w-12">
        <span className="text-xs font-semibold text-coral-500">{startTime}</span>
        <div className="w-px flex-1 bg-zinc-200 my-1" />
        <span className="text-[10px] text-zinc-400">{endTime}</span>
      </div>

      {/* Image */}
      <img
        src={place.imageUrl}
        alt={place.nameTh}
        className="w-14 h-14 rounded-lg object-cover shrink-0"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-900 truncate">{place.nameTh}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{place.zone}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="neutral">{place.estDuration} min</Badge>
          <Badge variant="outline">{place.priceLevel}</Badge>
        </div>
      </div>

      {/* Drag handle */}
      <div className="flex items-center shrink-0 text-zinc-300">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </div>
    </div>
  );
}
