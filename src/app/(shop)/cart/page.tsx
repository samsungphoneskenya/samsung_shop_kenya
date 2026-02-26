import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import CartCheckoutClient from "./CartCheckoutClient";

export default function CartCheckoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-50 to-slate-200 text-gray-900">
      <Header />
      <CartCheckoutClient />
      <Footer />
    </div>
  );
}
