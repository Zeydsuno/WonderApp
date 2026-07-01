"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePreferences } from "@/hooks/usePreferences";
import { useI18n } from "@/i18n/I18nProvider";

export default function ProfilePage() {
  const router = useRouter();
  const { lang, toggleLanguage } = useI18n();
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const { preferences, updatePreferences } = usePreferences();

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-8 rounded-b-[40px] shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-zinc-900">Profile</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="flex flex-col items-center">
          {user ? (
            <>
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-coral-50 shadow-md mb-4 relative group">
                <img
                  src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || "Guest")}&background=f43f5e&color=fff&size=200`}
                  alt={user.user_metadata?.full_name || "User"}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 tracking-tight">{user.user_metadata?.full_name || "User"}</h2>
              <p className="text-sm text-zinc-500 mt-1">{user.email}</p>
            </>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full bg-zinc-100 border-4 border-zinc-50 shadow-md mb-4 flex items-center justify-center text-zinc-300">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-zinc-900 tracking-tight mb-4">Join WanderApp</h2>
              <button 
                onClick={signInWithGoogle}
                disabled={loading}
                className="flex items-center gap-3 bg-white border border-zinc-200 px-6 py-3 rounded-full shadow-sm hover:bg-zinc-50 active:scale-95 transition-all"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span className="font-semibold text-zinc-700 text-sm">Continue with Google</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Settings Sections */}
      <div className="px-5 mt-8 space-y-6">
        
        {/* Section 1 */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 ml-2">Preferences</h3>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-zinc-100">
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className="w-full flex items-center justify-between p-4 active:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-coral-50 rounded-2xl flex items-center justify-center text-coral-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-zinc-900">Language</p>
                  <p className="text-xs text-zinc-500">Current: {lang === "th" ? "Thai" : "English"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-coral-500">Change</span>
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            <div className="h-[1px] bg-zinc-100 ml-16" />
            
            {/* Push Notifications Toggle */}
            <div 
              onClick={() => updatePreferences({ notificationsEnabled: !preferences.notificationsEnabled })}
              className="w-full flex items-center justify-between p-4 cursor-pointer active:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-zinc-900">Notifications</p>
                  <p className="text-xs text-zinc-500">Trip reminders</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative shadow-inner transition-colors duration-300 ${preferences.notificationsEnabled ? 'bg-coral-500' : 'bg-zinc-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all duration-300 ${preferences.notificationsEnabled ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 ml-2">Data & Storage</h3>
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-zinc-100">
            {/* Saved Trips */}
            <button 
              onClick={() => router.push('/trips')}
              className="w-full flex items-center justify-between p-4 active:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-zinc-900">Saved Trips</p>
                  <p className="text-xs text-zinc-500">Syncs with Supabase</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="h-[1px] bg-zinc-100 ml-16" />
            
            {/* Travel Preferences */}
            <button 
              onClick={() => router.push('/onboarding')}
              className="w-full flex items-center justify-between p-4 active:bg-zinc-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-zinc-900">Travel Profile</p>
                  <p className="text-xs text-zinc-500">Retake onboarding</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </section>

        {/* Section 3: Logout */}
        {user && (
          <section className="pt-4">
            <button 
              onClick={signOut}
              className="w-full bg-red-50 text-red-500 font-bold py-4 rounded-3xl active:scale-95 transition-transform"
            >
              Sign Out
            </button>
          </section>
        )}

      </div>
    </div>
  );
}
