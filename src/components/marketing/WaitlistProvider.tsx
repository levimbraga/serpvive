"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import WaitlistModal from "./WaitlistModal";

type WaitlistContextValue = {
  open: (source?: string) => void;
};

const WaitlistContext = createContext<WaitlistContextValue | null>(null);

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<string>("landing");

  const open = useCallback((s?: string) => {
    if (s) setSource(s);
    setIsOpen(true);
  }, []);

  return (
    <WaitlistContext.Provider value={{ open }}>
      {children}
      <WaitlistModal open={isOpen} onOpenChange={setIsOpen} source={source} />
    </WaitlistContext.Provider>
  );
}

export function useWaitlist() {
  const ctx = useContext(WaitlistContext);
  if (!ctx) {
    throw new Error("useWaitlist must be used inside <WaitlistProvider>");
  }
  return ctx;
}
