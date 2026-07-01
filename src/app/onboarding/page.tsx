"use client";

import { useState } from "react";
import { LocationPermission } from "@/components/onboarding/LocationPermission";
import { VibeSelector } from "@/components/onboarding/VibeSelector";
import { PreferencesSetup } from "@/components/onboarding/PreferencesSetup";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Progress indicator */}
      <div className="px-6 pt-6">
        <div className="flex gap-2">
          <div className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-coral-500" : "bg-zinc-200"}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-coral-500" : "bg-zinc-200"}`} />
          <div className={`h-1 flex-1 rounded-full ${step >= 3 ? "bg-coral-500" : "bg-zinc-200"}`} />
        </div>
        <p className="text-xs text-zinc-400 mt-2">Step {step} of 3</p>
      </div>

      {step === 1 && (
        <LocationPermission
          onComplete={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <VibeSelector
          onComplete={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <PreferencesSetup
          onComplete={() => router.push("/")}
        />
      )}
    </div>
  );
}
