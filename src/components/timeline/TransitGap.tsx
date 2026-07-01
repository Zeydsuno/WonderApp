import { useTranslation } from "@/i18n/useTranslation";

interface TransitGapProps {
  duration: number;
  mode: "walk" | "drive";
  isInitial?: boolean;
}

export function TransitGap({ duration, mode, isInitial = false }: TransitGapProps) {
  const { t } = useTranslation("trip");
  return (
    <div className={`flex items-center gap-2 py-1.5 ${isInitial ? 'pl-5 pb-3 pt-2' : 'pl-16'}`}>
      {!isInitial && <div className="w-px h-4 bg-zinc-200" />}
      <div className="flex items-center gap-1.5 text-xs text-zinc-400">
        {mode === "walk" ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
          </svg>
        )}
        <span className={isInitial ? "text-zinc-500 font-medium" : ""}>
          {duration} min {mode === "walk" ? t.walk : t.drive} {isInitial ? t.fromLocation : ""}
        </span>
      </div>
    </div>
  );
}
