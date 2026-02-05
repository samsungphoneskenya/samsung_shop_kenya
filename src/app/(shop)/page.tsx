import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import Bestsellers from "@/components/shop/Bestsellers";
import CategoryBanner from "@/components/shop/CategoryBanner";
import FloatingButtons from "@/components/shop/FloatingButtons";
import Hero from "@/components/shop/Hero";
import NewArrivals from "@/components/shop/NewArrivals";
import OnSale from "@/components/shop/OnSale";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <CategoryBanner />
      <NewArrivals />
      <OnSale />
      <Bestsellers />
      <Footer />
      <FloatingButtons />
    </div>
  );
}
