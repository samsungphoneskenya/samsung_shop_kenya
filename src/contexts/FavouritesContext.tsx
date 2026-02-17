"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

const STORAGE_KEY = "samsung_shop_favourites";

type FavouritesContextType = {
  favouriteIds: string[];
  addFavourite: (productId: string) => void;
  removeFavourite: (productId: string) => void;
  isFavourite: (productId: string) => boolean;
};

const FavouritesContext = createContext<FavouritesContextType | undefined>(
  undefined
);

function loadFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function saveToStorage(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

export function FavouritesProvider({ children }: { children: ReactNode }) {
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavouriteIds(loadFromStorage());
  }, []);

  const addFavourite = useCallback((productId: string) => {
    setFavouriteIds((prev) => {
      if (prev.includes(productId)) return prev;
      const next = [...prev, productId];
      saveToStorage(next);
      return next;
    });
  }, []);

  const removeFavourite = useCallback((productId: string) => {
    setFavouriteIds((prev) => {
      const next = prev.filter((id) => id !== productId);
      saveToStorage(next);
      return next;
    });
  }, []);

  const isFavourite = useCallback(
    (productId: string) => favouriteIds.includes(productId),
    [favouriteIds]
  );

  return (
    <FavouritesContext.Provider
      value={{ favouriteIds, addFavourite, removeFavourite, isFavourite }}
    >
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const ctx = useContext(FavouritesContext);
  if (!ctx) throw new Error("useFavourites must be used within FavouritesProvider");
  return ctx;
}
