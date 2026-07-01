"use client";


import { useI18n } from "@/i18n/I18nProvider";
import { usePreferences } from "@/hooks/usePreferences";

export function PreferencesSetup({ onComplete }: { onComplete: () => void }) {
  const { lang, toggleLanguage } = useI18n();
  const { preferences, updatePreferences } = usePreferences();

  return (
    <div className="flex-1 flex flex-col p-6 animate-fade-in pb-24">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="w-16 h-16 bg-zinc-100 rounded-3xl flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-zinc-900 tracking-tight leading-tight mb-3">
          App Settings
        </h1>
        <p className="text-base text-zinc-500 mb-10 leading-relaxed">
          Let&apos;s personalize your trips! You can always change these later.
        </p>

        <div className="space-y-4">
          {/* Language Toggle */}
          <div className="bg-white p-4 rounded-3xl border border-zinc-100 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-coral-50 rounded-2xl flex items-center justify-center text-coral-500">
                <span className="font-bold text-sm">{lang.toUpperCase()}</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-zinc-900">Language</p>
                <p className="text-xs text-zinc-500">{lang === "th" ? "Thai" : "English"}</p>
              </div>
            </div>
            <button 
              onClick={toggleLanguage}
              className="px-4 py-2 bg-zinc-100 text-zinc-900 text-xs font-bold rounded-full active:scale-95 transition-transform"
            >
              Change
            </button>
          </div>

          {/* Notifications Toggle */}
          <div 
            onClick={() => updatePreferences({ notificationsEnabled: !preferences.notificationsEnabled })}
            className="bg-white p-4 rounded-3xl border border-zinc-100 flex items-center justify-between shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-zinc-900">Notifications</p>
                <p className="text-xs text-zinc-500">Allow reminders</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative shadow-inner transition-colors duration-300 ${preferences.notificationsEnabled ? 'bg-coral-500' : 'bg-zinc-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-300 ${preferences.notificationsEnabled ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-zinc-50 via-zinc-50 to-transparent pb-8">
        <button
          onClick={() => {
            updatePreferences({ hasOnboarded: true });
            onComplete();
          }}
          className="w-full bg-coral-500 text-white font-bold py-4 rounded-full active:scale-95 transition-transform flex items-center justify-center shadow-lg shadow-coral-500/30 hover:bg-coral-600"
        >
          Let&apos;s Explore
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
