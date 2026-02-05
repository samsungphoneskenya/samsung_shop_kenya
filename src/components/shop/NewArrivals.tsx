"use client";

import { Star, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
// import { useCart } from "../context/CartContext";

export default function NewArrivals() {
  // const { addToCart } = useCart();
  const products = [
    {
      id: 1,
      name: "Galaxy S25 Ultra",
      price: 149999,
      originalPrice: 179999,
      description:
        "The ultimate Samsung device features the latest in mobile technology, with a stunning display, powerful processor, and all-day battery life.",
      badge: "NEW ARRIVAL",
      rating: 4.9,
      reviews: 234,
      image: "/images/products/s25.jpg",
    },
    {
      id: 2,
      name: "Galaxy Z Fold 6",
      price: 189999,
      originalPrice: null,
      description:
        "This phone is built to offer a unique foldable experience, perfect for multitasking and productivity. Enjoy big, bold displays.",
      badge: null,
      rating: 4.8,
      reviews: 189,
      image: "/images/products/zfld6.png",
    },
    {
      id: 3,
      name: "Galaxy A54",
      price: 44999,
      originalPrice: 54999,
      description:
        "The affordable, feature-rich phone offers great features, from the camera to premium design choices, for everyday use.",
      badge: "NEW ARRIVAL",
      rating: 4.7,
      reviews: 456,
      image: "/images/products/a54.jpg",
    },
    {
      id: 4,
      name: "Galaxy A55 5G",
      price: 49999,
      originalPrice: null,
      description:
        "Elevate your 5G experience with great features at a great price",
      badge: "NEW ARRIVAL",
      rating: 4.6,
      reviews: 320,
      image: "/images/products/a555g.jpg",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Just in!
          </h2>
          <p className="text-gray-600 text-lg">Browse our newest arrivals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
            >
              <Link href={`/product/${product.id}`} className="block">
                <div className="relative">
                  {product.badge && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full px-4 py-2 text-xs font-bold shadow-lg z-10">
                      {product.badge}
                    </div>
                  )}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-72 flex items-center justify-center relative overflow-hidden p-4">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={1200}
                      height={1200}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-1 mb-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      {product.rating}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({product.reviews} reviews)
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-baseline space-x-2 mb-6">
                    <span className="text-2xl font-bold text-gray-900">
                      KES {product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        KES {product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              <div className="px-6 pb-6">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    alert("feature coming soon");
                    // addToCart({
                    //   id: product.id,
                    //   name: product.name,
                    //   price: product.price,
                    //   image: product.image,
                    // });
                  }}
                  className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-all font-semibold flex items-center justify-center space-x-2 shadow-lg"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
