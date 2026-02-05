import Image from "next/image";
import Link from "next/link";

export default function CategoryBanner() {
  const categories = [
    {
      name: "Phones",
      image: "/images/categoryimages/phones.jpeg",
      link: "/shop?category=smartphones",
    },
    {
      name: "Tablets",
      image: "/images/categoryimages/tablets.jpeg",
      link: "/shop?category=tablets",
    },
    {
      name: "Watches",
      image: "/images/categoryimages/watches.jpeg",
      link: "/shop?category=watches",
    },
    {
      name: "Buds & Earphones",
      image: "/images/categoryimages/budsandearphones.jpeg",
      link: "/shop?category=buds",
    },
    {
      name: "Other Accessories",
      image: "/images/categoryimages/otheraccessories.jpeg",
      link: "/shop?category=accessories",
    },
  ];

  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => {
            return (
              <Link
                key={category.name}
                href={category.link}
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200 hover:border-black"
              >
                <div className="flex flex-col">
                  <div className="relative h-40 overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      height={100}
                      width={100}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
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
