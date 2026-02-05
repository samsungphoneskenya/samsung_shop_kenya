"use client";

import { TrendingUp, Star } from "lucide-react";
// import { useCart } from "../context/CartContext";
import Image from "next/image";

export default function Bestsellers() {
  // const { addToCart } = useCart();
  const products = [
    {
      id: 4,
      name: "Galaxy A55 5G",
      price: 49999,
      description:
        "Elevate your 5G experience with great features at a great price",
      rating: 4.6,
      sales: "2.5K+ sold",
      image: "/images/products/a555g.jpg",
    },
    {
      id: 5,
      name: "Galaxy Buds Pro",
      price: 19999,
      description: "Premium sound quality with active noise cancellation",
      rating: 4.8,
      sales: "5K+ sold",
      image: "/images/products/galaxybudspro.jpg",
    },
    {
      id: 1,
      name: "Galaxy S25 Ultra",
      price: 149999,
      description: "The ultimate Samsung device with cutting-edge technology",
      rating: 4.9,
      sales: "10K+ sold",
      image: "/images/products/s25.jpg",
    },
    {
      id: 3,
      name: "Galaxy A54",
      price: 44999,
      description: "Affordable excellence with premium features",
      rating: 4.7,
      sales: "8K+ sold",
      image: "/images/products/a54.jpg",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Try our bestsellers
            </h2>
          </div>
          <p className="text-gray-600 text-lg max-w-3xl">
            At our shop, we believe in the power of technology to enhance your
            life. That&apos;s why we offer the latest Samsung smartphones and
            accessories for work, gaming, entertainment, and everyday use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
            >
              <a href={`/product/${product.id}`} className="block">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-56 flex items-center justify-center relative overflow-hidden p-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={1200}
                    height={1200}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-orange-500" />
                    <span className="text-xs font-bold text-gray-900">
                      {product.sales}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      {product.rating}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="mb-4">
                    <span className="text-xl font-bold text-gray-900">
                      KES {product.price.toLocaleString()}
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
                  className="w-full bg-black text-white py-2.5 rounded-xl hover:bg-gray-800 transition-all font-semibold text-sm shadow-lg"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
