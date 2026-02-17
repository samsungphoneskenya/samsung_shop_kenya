import { Metadata } from "next";
import { FavouritesList } from "@/components/account/FavouritesList";

export const metadata: Metadata = {
  title: "Favourites | Samsung Shop Kenya",
  description: "Your favourite products",
};

export default function AccountFavouritesPage() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Favourites</h2>
      <FavouritesList />
    </div>
  );
}
