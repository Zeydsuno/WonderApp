"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";

const getTabs = (t: Record<string, string>) => [
  {
    label: t.discover,
    href: "/",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={active ? "currentColor" : "currentColor"} strokeWidth={active ? 2.5 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    label: t.myRoute,
    href: "/route",
    icon: (active: boolean) => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.5 : 1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  }
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation("common");
  const tabs = getTabs(t);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-zinc-200 safe-area-pb">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                if (isActive) {
                  e.preventDefault();
                }
              }}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? "text-coral-500" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {tab.icon(isActive)}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
      <style jsx>{`
        .safe-area-pb { padding-bottom: env(safe-area-inset-bottom, 0px); }
      `}</style>
    </nav>
  );
}
