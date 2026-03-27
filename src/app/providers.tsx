"use client";

import { ProfileProvider } from "@/lib/filter-context";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <ProfileProvider>{children}</ProfileProvider>;
}
