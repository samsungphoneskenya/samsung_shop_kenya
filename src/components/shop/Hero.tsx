import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-white py-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-100 rounded-full filter blur-3xl opacity-30 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-100 rounded-full filter blur-3xl opacity-30 -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div className="order-2 md:order-1">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-5 leading-tight">
              Welcome to our <span className="text-black">Samsung</span> Online
              Store!
            </h1>

            <p className="text-gray-600 text-base mb-8 leading-relaxed">
              Experience the power of innovation with the latest Samsung
              smartphones and accessories. From cutting-edge Galaxy devices to
              smart accessories, we have everything you need to stay connected
              and productive.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/shop"
                className="bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 transition-all font-semibold flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Shop Now</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/about-us"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-black hover:bg-gray-50 transition-all font-semibold text-center"
              >
                About Us
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-10 pt-6 border-t border-gray-200">
              <div>
                <div className="text-2xl font-bold text-black">500+</div>
                <div className="text-xs text-gray-600">Products</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black">50K+</div>
                <div className="text-xs text-gray-600">Happy Customers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-black">4.9★</div>
                <div className="text-xs text-gray-600">Rating</div>
              </div>
            </div>
          </div>

          {/* Right - Image */}
          <div className="order-1 md:order-2 relative">
            <div className="relative">
              {/* Main phone image */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl h-[500px] shadow-2xl flex items-center justify-center relative overflow-hidden">
                <Image
                  src="/images/products/s25.jpg"
                  alt="Galaxy S25 Ultra"
                  width={1200}
                  height={1200}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-black text-white px-5 py-2.5 rounded-2xl shadow-xl transform rotate-6">
                <div className="text-xs font-semibold">Save up to</div>
                <div className="text-xl font-bold">30% OFF</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
