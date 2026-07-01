"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface SaveTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  defaultName?: string;
}

export function SaveTripModal({ isOpen, onClose, onSave, defaultName = "My Awesome Trip" }: SaveTripModalProps) {
  const [tripName, setTripName] = useState(defaultName);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!tripName.trim()) return;
    setIsSaving(true);
    await onSave(tripName);
    setIsSaving(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setTripName(defaultName);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-sm bg-white rounded-3xl p-6 shadow-2xl z-[1001]"
          >
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.div 
                  key="input-state"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-coral-50 text-coral-500 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <h2 className="text-xl font-black text-zinc-900 mb-2">Save Your Trip</h2>
                  <p className="text-sm text-zinc-500 mb-6">
                    Give your itinerary a memorable name so you can easily find it later.
                  </p>
                  
                  <input
                    type="text"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    placeholder="E.g., Weekend Getaway"
                    className="w-full bg-zinc-100 border-none rounded-xl px-4 py-3.5 text-zinc-900 font-medium placeholder:text-zinc-400 focus:ring-2 focus:ring-coral-500 outline-none transition-all mb-6"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                    }}
                  />
                  
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={handleClose}
                      disabled={isSaving}
                      className="flex-1 py-3.5 rounded-xl font-bold text-zinc-500 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !tripName.trim()}
                      className="flex-1 py-3.5 rounded-xl font-bold text-white bg-coral-500 hover:bg-coral-600 active:scale-95 transition-all shadow-lg shadow-coral-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Trip"
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="success-state"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", bounce: 0.4 }}
                  className="flex flex-col items-center text-center py-2"
                >
                  <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-5">
                    <motion.svg 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  </div>
                  
                  <h2 className="text-xl font-black text-zinc-900 mb-2">Trip Saved Successfully!</h2>
                  <p className="text-sm text-zinc-500 mb-8">
                    &quot;{tripName}&quot; has been securely saved to your profile.
                  </p>

                  <div className="flex flex-col gap-3 w-full">
                    <button
                      onClick={() => {
                        handleClose();
                        router.push("/profile?tab=trips");
                      }}
                      className="w-full py-3.5 rounded-xl font-bold text-white bg-coral-500 hover:bg-coral-600 active:scale-95 transition-all shadow-md shadow-coral-500/30"
                    >
                      View in Profile
                    </button>
                    <button
                      onClick={handleClose}
                      className="w-full py-3.5 rounded-xl font-bold text-zinc-500 bg-zinc-100 hover:bg-zinc-200 active:scale-95 transition-all"
                    >
                      Keep Exploring
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
