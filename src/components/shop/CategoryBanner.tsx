import Link from "next/link";
import { createClient } from "@/lib/db/client";
import { SafeImage } from "@/components/shared/SafeImage";

const FALLBACK_IMAGE = "/images/logo.png";

export default async function CategoryBanner() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id,name,slug,image_url,display_order")
    .is("parent_id", null)
    .eq("status", "published")
    .order("display_order", { ascending: true });

  const categories =
    data?.map((c) => ({
      id: c.id,
      name: c.name,
      image: c.image_url || FALLBACK_IMAGE,
      link: `/shop?category=${c.slug}`,
    })) ?? [];

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => {
            return (
              <Link
                key={category.id}
                href={category.link}
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 hover:border-black"
              >
                <div className="flex flex-col">
                  <div className="relative h-40 overflow-hidden">
                    <SafeImage
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(min-width: 1024px) 16rem, (min-width: 768px) 25vw, 50vw"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-gray-900 group-hover:text-black transition-colors mb-2">
                      {category.name}
                    </h3>
                    <span className="text-sm text-gray-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Shop Now →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
