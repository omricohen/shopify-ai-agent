"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { StoreCredentials } from "@/types/shopify";

interface StoreContextType {
  credentials: StoreCredentials | null;
  setCredentials: (creds: StoreCredentials) => void;
  clearCredentials: () => void;
  isConnected: boolean;
}

const StoreContext = createContext<StoreContextType>({
  credentials: null,
  setCredentials: () => {},
  clearCredentials: () => {},
  isConnected: false,
});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentialsState] = useState<StoreCredentials | null>(
    null
  );

  useEffect(() => {
    const saved = localStorage.getItem("shopify_credentials");
    if (saved) {
      try {
        setCredentialsState(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const setCredentials = (creds: StoreCredentials) => {
    setCredentialsState(creds);
    localStorage.setItem("shopify_credentials", JSON.stringify(creds));
  };

  const clearCredentials = () => {
    setCredentialsState(null);
    localStorage.removeItem("shopify_credentials");
  };

  return (
    <StoreContext.Provider
      value={{
        credentials,
        setCredentials,
        clearCredentials,
        isConnected: !!credentials,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
