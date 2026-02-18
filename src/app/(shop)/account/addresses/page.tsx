import { Metadata } from "next";
import { getSavedAddresses } from "@/lib/actions/account-actions";

export const metadata: Metadata = {
  title: "Saved Addresses | Samsung Shop Kenya",
  description: "Your delivery addresses from past orders",
};

export default async function AccountAddressesPage() {
  const addresses = await getSavedAddresses();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Saved addresses</h2>
      <p className="text-sm text-gray-500 mb-4">
        Delivery addresses from your previous orders. You can reuse these at checkout.
      </p>
      {addresses.length === 0 ? (
        <p className="text-gray-500">No saved addresses yet. Place an order to see them here.</p>
      ) : (
        <ul className="space-y-3">
          {addresses.map((addr, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4"
            >
              <span className="text-gray-400 shrink-0">📍</span>
              <div>
                <p className="font-medium text-gray-900">{addr.delivery_location}</p>
                {addr.delivery_notes && (
                  <p className="text-sm text-gray-500 mt-0.5">{addr.delivery_notes}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
