import { Badge } from "@/components/ui/Badge";
import type { Place } from "@/data/places";
import { motion, useAnimation } from "framer-motion";

interface TimelineSlotProps {
  place: Place;
  startTime: string;
  endTime: string;
  index: number;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

export function TimelineSlot({
  place,
  startTime,
  endTime,
  index,
  onDragStart,
  onDragOver,
  onDrop,
  onDelete,
  onClick,
}: TimelineSlotProps) {
  const controls = useAnimation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (e: any, info: any) => {
    if (info.offset.x < -40) {
      controls.start({ x: -72 });
    } else {
      controls.start({ x: 0 });
    }
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-red-500 shadow-sm border border-red-500">
      {/* Delete Background Button */}
      <button 
        onClick={() => onDelete(place.id)}
        className="absolute right-0 top-0 bottom-0 w-[72px] flex flex-col items-center justify-center text-white hover:bg-red-600 transition-colors"
      >
        <svg className="w-5 h-5 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span className="text-[10px] font-medium">Delete</span>
      </button>

      <motion.div
        drag="x"
        dragConstraints={{ left: -72, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="bg-white rounded-xl border border-zinc-200 p-3 flex gap-3 relative z-10 w-full"
      >
      {/* Time column */}
      <div className="flex flex-col items-center shrink-0 w-12">
        <span className="text-xs font-semibold text-coral-500">{startTime}</span>
        <div className="w-px flex-1 bg-zinc-200 my-1" />
        <span className="text-[10px] text-zinc-400">{endTime}</span>
      </div>

      {/* Clickable Content */}
      <div 
        className="flex-1 flex gap-3 min-w-0 cursor-pointer"
        onClick={onClick}
      >
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
      </div>

      {/* Drag handle */}
      <div 
        draggable
        onDragStart={(e: React.DragEvent<HTMLDivElement>) => onDragStart(e, index)}
        onDragOver={onDragOver}
        onDrop={(e: React.DragEvent<HTMLDivElement>) => onDrop(e, index)}
        className="flex items-center shrink-0 text-zinc-300 hover:text-zinc-500 cursor-grab active:cursor-grabbing px-2 -mr-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </div>
      </motion.div>
    </div>
  );
}
