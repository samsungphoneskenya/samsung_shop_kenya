import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { CartContent } from "@/components/shop/CartContent";

export const metadata = {
  title: "Cart | Samsung Shop Kenya",
  description: "Review your cart and proceed to checkout",
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>
        <CartContent />
      </main>
      <Footer />
    </div>
  );
}
