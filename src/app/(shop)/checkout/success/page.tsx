import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { CheckCircle } from "lucide-react";

export const metadata = {
  title: "Order confirmed | Samsung Shop Kenya",
  description: "Your order has been placed successfully",
};

type Props = {
  searchParams: Promise<{ order?: string; number?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { number: orderNumber } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Header />
      <main className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Order confirmed
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We will process it shortly.
          </p>
          {orderNumber && (
            <p className="text-sm font-mono font-medium text-gray-700 bg-gray-100 rounded-lg py-2 px-4 inline-block mb-6">
              Order #{decodeURIComponent(orderNumber)}
            </p>
          )}
          <p className="text-sm text-gray-500 mb-8">
            Payment on delivery: pay when your order arrives.
            <br />
            M-Pesa orders: complete the prompt on your phone; we will confirm
            once received.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-black text-white py-3 px-6 rounded-xl hover:bg-gray-800 font-semibold"
          >
            Continue shopping
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
