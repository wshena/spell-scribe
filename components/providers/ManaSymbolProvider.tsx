"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { getManaColorSymbolMap } from "@/lib/scryfall/manaSymbols";

interface ManaSymbolContextType {
  colorSymbolMap: Map<string, string>;
  isLoading: boolean;
}

const ManaSymbolContext = createContext<ManaSymbolContextType | null>(null);

export function ManaSymbolProvider({ children }: { children: ReactNode }) {
  const [colorSymbolMap, setColorSymbolMap] = useState<Map<string, string>>(
    new Map(),
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadManaSymbols = async () => {
      try {
        const symbols = await getManaColorSymbolMap();
        setColorSymbolMap(symbols);
      } catch (error) {
        console.error("Failed to load mana symbols:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadManaSymbols();
  }, []);

  const value = useMemo(
    () => ({
      colorSymbolMap,
      isLoading,
    }),
    [colorSymbolMap, isLoading],
  );

  return (
    <ManaSymbolContext.Provider value={value}>
      {children}
    </ManaSymbolContext.Provider>
  );
}

export function useManaSymbols() {
  const context = useContext(ManaSymbolContext);

  if (!context) {
    throw new Error("useManaSymbols must be used inside ManaSymbolProvider");
  }

  return context;
}
