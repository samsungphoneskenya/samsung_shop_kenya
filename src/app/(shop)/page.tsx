import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import Bestsellers from "@/components/shop/Bestsellers";
import CategoryBanner from "@/components/shop/CategoryBanner";
import FloatingButtons from "@/components/shop/FloatingButtons";
import Hero from "@/components/shop/Hero";
import NewArrivals from "@/components/shop/NewArrivals";
import OnSale from "@/components/shop/OnSale";
import {
  getBestSellers,
  getNewArrivals,
  getOnSaleProducts,
} from "@/lib/actions/storefront-actions";

export default async function Home() {
  const [newArrivals, onSale, bestSellers] = await Promise.all([
    getNewArrivals(8),
    getOnSaleProducts(8),
    getBestSellers(8),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <CategoryBanner />
      <NewArrivals products={newArrivals} />
      <OnSale products={onSale} />
      <Bestsellers products={bestSellers} />
      <Footer />
      <FloatingButtons />
    </div>
  );
}
