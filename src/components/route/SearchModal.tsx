"use client";

import { UnifiedInput } from "@/components/home/UnifiedInput";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
        <UnifiedInput onComplete={onClose} />
      </div>
    </div>
  );
}
