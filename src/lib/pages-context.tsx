"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface SavedLiquidPage {
  id: string;
  title: string;
  pageType: string;
  style?: string;
  description?: string;
  code: string;
  createdAt: string;
}

interface PagesContextType {
  pages: SavedLiquidPage[];
  savePage: (page: Omit<SavedLiquidPage, "id" | "createdAt">) => void;
  deletePage: (id: string) => void;
}

const PagesContext = createContext<PagesContextType>({
  pages: [],
  savePage: () => {},
  deletePage: () => {},
});

const STORAGE_KEY = "shopify_saved_pages";

export function PagesProvider({ children }: { children: ReactNode }) {
  const [pages, setPages] = useState<SavedLiquidPage[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPages(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const persist = (updated: SavedLiquidPage[]) => {
    setPages(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const savePage = useCallback(
    (page: Omit<SavedLiquidPage, "id" | "createdAt">) => {
      const newPage: SavedLiquidPage = {
        ...page,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      persist([newPage, ...pages]);
    },
    [pages]
  );

  const deletePage = useCallback(
    (id: string) => {
      persist(pages.filter((p) => p.id !== id));
    },
    [pages]
  );

  return (
    <PagesContext.Provider value={{ pages, savePage, deletePage }}>
      {children}
    </PagesContext.Provider>
  );
}

export const usePages = () => useContext(PagesContext);
