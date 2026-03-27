"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "홈", icon: HomeIcon },
  { href: "/subscriptions", label: "청약", icon: ListIcon },
  { href: "/settings", label: "내 조건", icon: UserIcon },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-toss-gray-100 z-50">
      <div className="flex justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 text-xs ${
                active ? "text-toss-blue font-semibold" : "text-toss-gray-500"
              }`}
            >
              <Icon active={active} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path
        d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z"
        stroke={active ? "#3182F6" : "#8B95A1"}
        strokeWidth="2"
        strokeLinejoin="round"
        fill={active ? "#E8F3FF" : "none"}
      />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="5" rx="1.5" stroke={active ? "#3182F6" : "#8B95A1"} strokeWidth="2" fill={active ? "#E8F3FF" : "none"} />
      <rect x="3" y="12" width="18" height="5" rx="1.5" stroke={active ? "#3182F6" : "#8B95A1"} strokeWidth="2" fill={active ? "#E8F3FF" : "none"} />
    </svg>
  );
}

function UserIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="8" r="4" stroke={active ? "#3182F6" : "#8B95A1"} strokeWidth="2" fill={active ? "#E8F3FF" : "none"} />
      <path
        d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"
        stroke={active ? "#3182F6" : "#8B95A1"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
