"use client";

import { Heart } from "lucide-react";
import { useFavourites } from "@/contexts/FavouritesContext";

type Props = { productId: string };

export function FavouriteButton({ productId }: Props) {
  const { isFavourite, addFavourite, removeFavourite } = useFavourites();
  const active = isFavourite(productId);

  return (
    <button
      type="button"
      onClick={() => (active ? removeFavourite(productId) : addFavourite(productId))}
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      }`}
      aria-label={active ? "Remove from favourites" : "Add to favourites"}
    >
      <Heart className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
      {active ? "Saved" : "Save for later"}
    </button>
  );
}
