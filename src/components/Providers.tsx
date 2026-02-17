"use client";

import { ReactNode } from "react";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { FavouritesProvider } from "@/contexts/FavouritesContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <FavouritesProvider>
        <CartProvider>{children}</CartProvider>
      </FavouritesProvider>
    </AuthProvider>
  );
}
