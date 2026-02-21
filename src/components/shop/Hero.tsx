import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { HomeSections } from "@/lib/types/page-sections";

const DEFAULT_HERO = {
  heading: "Welcome to our Samsung Online Store!",
  heading_highlight: "Samsung",
  subtext:
    "Experience the power of innovation with the latest Samsung smartphones and accessories. From cutting-edge Galaxy devices to smart accessories, we have everything you need to stay connected and productive.",
  cta_primary_text: "Shop Now",
  cta_primary_href: "/shop",
  cta_secondary_text: "About Us",
  cta_secondary_href: "/about-us",
  image_url: "/images/products/s25.jpg",
  image_alt: "Galaxy S25 Ultra",
  badge_text: "Save up to",
  badge_value: "30% OFF",
  stats: [
    { value: "500+", label: "Products" },
    { value: "50K+", label: "Happy Customers" },
    { value: "4.9★", label: "Rating" },
  ],
};

type HeroProps = {
  sections?: HomeSections;
};

export default function Hero({ sections }: HeroProps) {
  const hero = { ...DEFAULT_HERO, ...sections?.hero };
  const stats = hero.stats?.length ? hero.stats : DEFAULT_HERO.stats;

  return (
    <section className="relative bg-linear-to-br from-gray-50 to-white py-20 overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-100 rounded-full filter blur-3xl opacity-30 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-100 rounded-full filter blur-3xl opacity-30 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
              {hero.heading ? (
                hero.heading_highlight &&
                hero.heading.includes(hero.heading_highlight) ? (
                  <>
                    {hero.heading.split(hero.heading_highlight)[0]}
                    <span className="text-black">{hero.heading_highlight}</span>
                    {hero.heading.split(hero.heading_highlight)[1]}
                  </>
                ) : (
                  hero.heading
                )
              ) : (
                <>
                  Welcome to our <span className="text-black">Samsung</span>{" "}
                  Online Store!
                </>
              )}
            </h1>

            <p
              className="text-gray-600 text-base mb-8 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: hero.subtext ?? "" }}
            />

            <div className="flex flex-col sm:flex-row gap-4">
              {hero.cta_primary_text && hero.cta_primary_href && (
                <Link
                  href={hero.cta_primary_href ?? "/shop"}
                  className="bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-all font-semibold flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>{hero.cta_primary_text}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              )}
              {hero.cta_secondary_text && hero.cta_secondary_href && (
                <Link
                  href={hero.cta_secondary_href ?? "/about-us"}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-black hover:bg-gray-50 transition-all font-semibold text-center"
                >
                  {hero.cta_secondary_text}
                </Link>
              )}
            </div>

            <div className="grid grid-cols-3 gap-6 mt-10 pt-6 border-t border-gray-200">
              {stats.map((s, i) => (
                <div key={i}>
                  <div className="text-2xl font-bold text-black">{s.value}</div>
                  <div className="text-xs text-gray-600">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="order-1 md:order-2 relative">
            <div className="relative">
              <div className="bg-linear-to-br from-gray-100 to-gray-200 rounded-3xl h-[500px] shadow-2xl flex items-center justify-center relative overflow-hidden">
                <Image
                  src={hero.image_url ?? "/images/products/s25.jpg"}
                  alt={hero.image_alt ?? "Galaxy S25 Ultra"}
                  width={1200}
                  height={1200}
                  className="w-full h-full object-cover"
                />
              </div>
              {(hero.badge_text || hero.badge_value) && (
                <div className="absolute -top-4 -right-4 bg-black text-white px-5 py-2.5 rounded-2xl shadow-xl transform rotate-6">
                  {hero.badge_text && (
                    <div className="text-xs font-semibold">
                      {hero.badge_text}
                    </div>
                  )}
                  {hero.badge_value && (
                    <div className="text-xl font-bold">{hero.badge_value}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
