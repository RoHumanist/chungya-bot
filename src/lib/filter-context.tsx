"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { UserProfile } from "@/types/subscription";
import { DEFAULT_PROFILE } from "@/types/subscription";

const KEY = "userProfile";

function read(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

interface ProfileCtx {
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  save: () => void;
  dirty: boolean;
  hasSetup: boolean; // 최초 설정 완료 여부
}

const Ctx = createContext<ProfileCtx>({
  profile: DEFAULT_PROFILE,
  setProfile: () => {},
  save: () => {},
  dirty: false,
  hasSetup: false,
});

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [saved, setSaved] = useState("");
  const [hasSetup, setHasSetup] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const loaded = read();
    setProfile(loaded);
    setSaved(JSON.stringify(loaded));
    setHasSetup(!!localStorage.getItem(KEY));
    setMounted(true);
  }, []);

  const save = useCallback(() => {
    const json = JSON.stringify(profile);
    localStorage.setItem(KEY, json);
    setSaved(json);
    setHasSetup(true);
  }, [profile]);

  const dirty = mounted && JSON.stringify(profile) !== saved;

  return (
    <Ctx.Provider value={{ profile, setProfile, save, dirty, hasSetup }}>
      {children}
    </Ctx.Provider>
  );
}

export function useProfile() {
  return useContext(Ctx);
}
