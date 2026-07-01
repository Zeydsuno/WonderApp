"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface LinkInputProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export function LinkInput({ onSubmit, loading }: LinkInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const validate = (val: string) => {
    if (!val.trim()) return "Paste a link to get started.";
    if (!val.match(/tiktok\.com|instagram\.com|ig\.me/i)) {
      return "We support TikTok and Instagram links for now.";
    }
    return "";
  };

  const handleSubmit = () => {
    const err = validate(url);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    onSubmit(url);
  };

  return (
    <div className="px-5">
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
        <label className="text-sm font-medium text-zinc-800 mb-2 block">
          Drop a social media link
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); }}
              placeholder="https://www.tiktok.com/@user/video/..."
              className="w-full h-10 px-3 pr-9 border border-zinc-200 rounded-lg text-sm text-zinc-900 placeholder:text-zinc-400 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-coral-100 focus:border-coral-500 transition-all"
            />
            {url && (
              <button
                onClick={() => { setUrl(""); setError(""); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-zinc-200 flex items-center justify-center cursor-pointer hover:bg-zinc-300"
              >
                <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <Button onClick={handleSubmit} loading={loading} disabled={!url.trim()}>
            Go
          </Button>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        <p className="text-xs text-zinc-400 mt-2">
          We will read the caption and find every place mentioned.
        </p>
      </div>
    </div>
  );
}
