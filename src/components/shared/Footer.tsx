import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold mb-2">
                Stay Updated!
              </h3>
              <p className="text-white/90">
                Subscribe for exclusive deals and 10% off your first order
              </p>
            </div>
            <div className="w-full md:w-auto md:min-w-[400px]">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
                <button className="bg-white text-black px-6 py-3 rounded-xl hover:bg-gray-200 transition-all font-bold whitespace-nowrap">
                  Subscribe
                </button>
              </div>
              <p className="text-white/70 text-xs mt-2 text-center sm:text-left">
                🔒 We respect your privacy. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Column 1 - Shop */}
          <div>
            <h4 className="font-bold text-lg mb-6">Shop</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link
                  href="/shop?category=smartphones"
                  className="hover:text-white transition-colors"
                >
                  Phones & Tablets
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=watches"
                  className="hover:text-white transition-colors"
                >
                  Watches
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=buds"
                  className="hover:text-white transition-colors"
                >
                  Audio
                </Link>
              </li>
              <li>
                <Link
                  href="/shop?category=accessories"
                  className="hover:text-white transition-colors"
                >
                  Accessories
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="hover:text-white transition-colors"
                >
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2 - Support */}
          <div>
            <h4 className="font-bold text-lg mb-6">Support</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Warranty Info
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Payment Methods
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Our Company */}
          <div>
            <h4 className="font-bold text-lg mb-6">Our Company</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="hover:text-white transition-colors"
                >
                  Shop
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Visit Us */}
          <div>
            <h4 className="font-bold text-lg mb-6">Visit Us</h4>
            <div className="space-y-4 text-gray-400 text-sm">
              <div>
                <p className="font-semibold text-white mb-2">
                  Samsung Phones Nairobi
                </p>
                <div className="flex items-start space-x-3 mb-2">
                  <MapPin className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Lotus Plaza 1st Floor
                    <br />
                    Chiromo Lane 15
                    <br />
                    Opposite Club K1, Nairobi
                  </span>
                </div>
                <p className="text-xs mt-2">
                  Hours: Mon-Sat 9AM-7PM
                  <br />
                  Sun 10AM-6PM
                </p>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <p className="font-semibold text-white mb-3">Contact</p>
                <div className="space-y-3">
                  <a
                    href="tel:+254768378439"
                    className="flex items-center space-x-3 hover:text-white transition-colors"
                  >
                    <Phone className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span>0768378439</span>
                  </a>
                  <a
                    href="https://wa.me/254758313512"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href="mailto:support@samsungstore.ke"
                    className="flex items-center space-x-3 hover:text-white transition-colors"
                  >
                    <Mail className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span>support@samsungstore.ke</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Brand & Social */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="mb-4">
                <Image
                  src="/images/samsungphoneswhite.png"
                  alt="Samsung Phones Logo"
                  width={100}
                  height={100}
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-gray-400 text-sm max-w-md">
                Your trusted destination for the latest Samsung smartphones and
                accessories in Kenya.
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-sm mb-3 text-center md:text-right">
                Follow Us
              </p>
              <div className="flex space-x-3">
                <a
                  href="#"
                  className="bg-gray-800 p-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="bg-gray-800 p-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="bg-gray-800 p-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="bg-gray-800 p-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-gray-400 text-sm mb-3">
                Secure Payment Methods
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-gray-800 px-4 py-2 rounded-lg text-sm font-semibold">
                  M-Pesa
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-lg text-sm font-semibold">
                  Visa
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-lg text-sm font-semibold">
                  Mastercard
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <p>© 2025 Samsung Phones Kenya. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
