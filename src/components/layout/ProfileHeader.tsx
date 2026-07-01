"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n/I18nProvider";
import { useTranslation } from "@/i18n/useTranslation";

function getGreeting(t: Record<string, string>): string {
  const hour = new Date().getHours();
  if (hour < 12) return t.goodMorning;
  if (hour < 17) return t.goodAfternoon;
  return t.goodEvening;
}

export function ProfileHeader() {
  const router = useRouter();
  const { lang, toggleLanguage } = useI18n();
  const { t } = useTranslation("home");
  const { user } = useAuth();
  
  const displayName = user?.user_metadata?.full_name || "Guest";
  const avatarUrl = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=Guest&background=f43f5e&color=fff`;

  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-4">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => router.push('/profile')}
          className="w-11 h-11 rounded-full overflow-hidden border-2 border-coral-100 shadow-sm transition-transform active:scale-95"
        >
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=f43f5e&color=fff`;
            }}
          />
        </button>
        <div>
          <p className="text-sm text-zinc-500">{getGreeting(t)},</p>
          <p className="text-base font-semibold text-zinc-900 tracking-tight">
            {displayName}
          </p>
        </div>
      </div>
      
      <button 
        onClick={toggleLanguage}
        className="px-3 py-1.5 rounded-full bg-white border border-zinc-200 text-xs font-semibold text-zinc-700 shadow-sm transition-all hover:border-zinc-300 active:scale-95"
      >
        {lang === "en" ? "EN" : "TH"}
      </button>
    </div>
  );
}
