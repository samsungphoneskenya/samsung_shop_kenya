import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import Bestsellers from "@/components/shop/Bestsellers";
import CategoryBanner from "@/components/shop/CategoryBanner";
import FloatingButtons from "@/components/shop/FloatingButtons";
import Hero from "@/components/shop/Hero";
import NewArrivals from "@/components/shop/NewArrivals";
import OnSale from "@/components/shop/OnSale";
import { getPageBySlug } from "@/lib/actions/page-actions";
import {
  getBestSellers,
  getNewArrivals,
  getOnSaleProducts,
} from "@/lib/actions/storefront-actions";
import type { HomeSections } from "@/lib/types/page-sections";

export async function generateMetadata() {
  const page = await getPageBySlug("home");
  return {
    title: page?.meta_title ?? "Samsung Phones Kenya | Official Store",
    description: page?.meta_description ?? "Shop the latest Samsung smartphones, tablets, and accessories in Kenya.",
  };
}

export default async function Home() {
  const [newArrivals, onSale, bestSellers] = await Promise.all([
    getNewArrivals(8),
    getOnSaleProducts(8),
    getBestSellers(8),
  ]);

  const page = await getPageBySlug("home");
  const sections = (page?.sections ?? {}) as HomeSections;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero sections={sections} />
      <CategoryBanner />
      <NewArrivals products={newArrivals} />
      <OnSale products={onSale} />
      <Bestsellers products={bestSellers} />
      <Footer />
      <FloatingButtons />
    </div>
  );
}
