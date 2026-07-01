import { Badge } from "@/components/ui/Badge";
import type { Place } from "@/data/places";
import { motion, useAnimation } from "framer-motion";
import { useTranslation } from "@/i18n/useTranslation";
import { useTripContext } from "@/context/TripContext";

interface TimelineSlotProps {
  place: Place;
  startTime: string;
  endTime: string;
  index: number;
  total: number;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

export function TimelineSlot({
  place,
  startTime,
  endTime,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDelete,
  onClick,
}: TimelineSlotProps) {
  const controls = useAnimation();
  const { t } = useTranslation("trip");
  const { updatePlaceDuration } = useTripContext();

  // Operating Hours Validation
  let warningText = null;
  if (place.operatingHours) {
    // Matches patterns like "06:00 - 18:00"
    const hoursMatch = place.operatingHours.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
    if (hoursMatch) {
      const closeTime = hoursMatch[2];
      if (startTime >= closeTime) {
        warningText = t.mightBeClosed;
      } else if (endTime > closeTime) {
        warningText = t.mightCloseEarly;
      }
    }
  }

  const getPriceLabel = (level: string) => {
    if (level === "Free" || level === "ไม่มีค่าเข้า") return t.free;
    return level;
  };

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
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <div className="relative inline-flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full border border-zinc-200/50 transition-colors">
              <span>{place.estDuration} min</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              <select
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                value={place.estDuration}
                onChange={(e) => {
                  e.stopPropagation();
                  updatePlaceDuration(place.id, parseInt(e.target.value, 10));
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {[15, 30, 45, 60, 90, 120, 180].map(mins => (
                  <option key={mins} value={mins}>{mins} min</option>
                ))}
              </select>
            </div>
            
            <Badge variant="outline" className="text-[10px] font-medium tracking-tight text-zinc-500 bg-zinc-50">{getPriceLabel(place.priceLevel)}</Badge>
            
            {warningText && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {warningText}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Move Buttons */}
      <div className="flex flex-col justify-center items-center shrink-0 border-l border-zinc-100 pl-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (index > 0) onMoveUp(index);
          }}
          disabled={index === 0}
          className={`p-1.5 rounded-lg transition-colors ${index === 0 ? 'text-zinc-200' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (index < total - 1) onMoveDown(index);
          }}
          disabled={index === total - 1}
          className={`p-1.5 rounded-lg transition-colors ${index === total - 1 ? 'text-zinc-200' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      </motion.div>
    </div>
  );
}
