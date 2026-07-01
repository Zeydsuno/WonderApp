import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { TripTheme } from "@/data/themes";

interface ThemeDetailProps {
  theme: TripTheme | null;
  onClose: () => void;
  onAddAll: (theme: TripTheme) => void;
}

export function ThemeDetail({ theme, onClose, onAddAll }: ThemeDetailProps) {
  if (!theme) return null;

  return (
    <AnimatePresence>
      <div key="theme-modal" className="fixed inset-0 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
          onClick={onClose}
        />

        {/* Drawer */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl relative z-10 pointer-events-auto max-h-[90vh] flex flex-col"
        >
          {/* Header Image */}
          <div className="relative h-48 sm:h-56 shrink-0">
            <img src={theme.coverImage} alt={theme.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="absolute bottom-4 left-5 pr-5 text-left">
              <span className="text-3xl mb-1 block">{theme.emoji}</span>
              <h2 className="text-2xl font-black text-white">{theme.title}</h2>
              <p className="text-white/80 text-sm mt-1">{theme.subtitle}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 overflow-y-auto hide-scrollbar">
            <h3 className="text-sm font-bold text-zinc-900 mb-3">
              Included Places ({theme.places.length})
            </h3>
            <div className="flex flex-col gap-3">
              {theme.places.map((place, idx) => (
                <div key={place.id} className="flex gap-3 bg-zinc-50 p-3 rounded-2xl items-center">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 text-zinc-500 flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <img src={place.imageUrl} alt={place.nameTh} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{place.nameTh}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{place.zone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          <div className="p-4 bg-white border-t border-zinc-100 shrink-0">
            <button
              onClick={() => onAddAll(theme)}
              className="w-full py-3.5 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-coral-500/25 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add All to Trip
            </button>
          </div>
        </motion.div>
      </div>
      
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </AnimatePresence>
  );
}
