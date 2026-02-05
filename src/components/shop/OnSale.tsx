"use client";

import { Tag, Star, ShoppingCart } from "lucide-react";
// import { useCart } from "../context/CartContext";
import Link from "next/link";
import Image from "next/image";

export default function OnSale() {
  // const { addToCart } = useCart();
  const products = [
    {
      id: 3,
      name: "Galaxy A54",
      price: 44999,
      originalPrice: 54999,
      discount: "18%",
      description: "Affordable excellence with premium features",
      rating: 4.7,
      reviews: 456,
      image: "/images/products/a54.jpg",
    },
    {
      id: 1,
      name: "Galaxy S25 Ultra",
      price: 149999,
      originalPrice: 179999,
      discount: "17%",
      description: "The ultimate Samsung flagship device",
      rating: 4.9,
      reviews: 234,
      image: "/images/products/s25.jpg",
    },
    {
      id: 5,
      name: "Galaxy Buds Pro",
      price: 19999,
      originalPrice: 24999,
      discount: "20%",
      description: "Premium sound with active noise cancellation",
      rating: 4.8,
      reviews: 567,
      image: "/images/products/galaxybudspro.jpg",
    },
    {
      id: 2,
      name: "Galaxy Z Fold 6",
      price: 189999,
      originalPrice: 219999,
      discount: "14%",
      description: "Foldable innovation at its finest",
      rating: 4.8,
      reviews: 189,
      image: "/images/products/zfld6.png",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-full text-sm font-bold mb-4">
            <Tag className="h-5 w-5" />
            <span>LIMITED TIME OFFERS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            On Sale Now!
          </h2>
          <p className="text-gray-600 text-lg">
            Grab these amazing deals before they&apos;re gone
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
            >
              <a href={`/product/${product.id}`} className="block">
                <div className="relative">
                  <div className="absolute top-3 left-3 bg-red-500 text-white rounded-full px-3 py-1 text-sm font-bold shadow-lg z-10">
                    {product.discount} OFF
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-56 flex items-center justify-center relative overflow-hidden p-4">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={100}
                      height={100}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      {product.rating}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({product.reviews})
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="mb-4">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xl font-bold text-black">
                        KES {product.price.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400 line-through">
                      KES {product.originalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </a>
              <div className="px-5 pb-5">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Feature coming soon");
                    // addToCart({
                    //   id: product.id,
                    //   name: product.name,
                    //   price: product.price,
                    //   image: product.image,
                    // });
                  }}
                  className="w-full bg-black text-white py-2.5 rounded-xl hover:bg-gray-800 transition-all font-semibold text-sm shadow-lg flex items-center justify-center space-x-1"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center space-x-2 bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-all font-bold text-lg shadow-lg"
          >
            <span>View All Deals</span>
            <Tag className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
