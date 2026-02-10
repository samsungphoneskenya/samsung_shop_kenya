import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { CheckoutForm } from "@/components/shop/CheckoutForm";

export const metadata = {
  title: "Checkout | Samsung Shop Kenya",
  description: "Enter delivery details and complete your order",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>
        <CheckoutForm />
      </main>
      <Footer />
    </div>
  );
}
