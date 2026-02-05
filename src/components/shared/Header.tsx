"use client";

import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Menu,
  X,
  Phone,
  Search,
  User,
  ChevronDown,
} from "lucide-react";
import { Database } from "@/types/database.types";
import Link from "next/link";
import Image from "next/image";

type Product = Database["public"]["Tables"]["products"]["Row"];

export default function Header() {
  // const { getCartCount, getCartTotal } = useCart();
  // const { user, profile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showAccessoriesMenu, setShowAccessoriesMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const accessoriesRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
      if (
        accessoriesRef.current &&
        !accessoriesRef.current.contains(event.target as Node)
      ) {
        setShowAccessoriesMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        console.log("search functionality coming soon");
        // const { data, error } = await supabase
        //   .from("products")
        //   .select("*")
        //   .or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        //   .limit(5);

        // if (error) throw error;
        // setSearchResults(data || []);
        // setShowResults(true);
      } catch (error) {
        console.error("Error searching products:", error);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return (
    <>
      {/* Main Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        {/* Top Bar - Logo, Search, Icons */}
        <div className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/images/logo.png"
                    alt="Samsung Phones Logo"
                    width={100}
                    height={100}
                    className="h-12 w-auto"
                  />
                </Link>
              </div>

              {/* Search Bar */}
              <div
                className="flex-1 max-w-2xl mx-8 hidden lg:block"
                ref={searchRef}
              >
                <div className="relative flex">
                  <select className="px-4 py-3 border border-r-0 border-gray-300 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm font-medium text-gray-700">
                    <option>All Categories</option>
                    <option>Phones</option>
                    <option>Tablets</option>
                    <option>Wearables</option>
                    <option>Accessories</option>
                    <option>Audio</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search for products"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() =>
                      searchQuery.length >= 2 && setShowResults(true)
                    }
                    className="flex-1 px-4 py-3 border border-l-0 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-6 bg-black hover:bg-gray-800 text-white font-semibold rounded-r-xl transition-colors">
                    SEARCH
                  </button>

                  {/* Search Results Dropdown */}
                  {showResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={() => {
                            setShowResults(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <Image
                            src={"/images/products/s25.jpg"}
                            alt={"product.name"}
                            width={100}
                            height={100}
                            className="w-12 h-12 object-contain rounded-lg bg-gray-50"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {"product.name"}
                            </h4>
                            <p className="text-sm text-blue-600 font-semibold">
                              KES 00
                              {/* {parseFloat(
                                product.price.toString()
                              ).toLocaleString()} */}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {showResults &&
                    searchQuery.length >= 2 &&
                    searchResults.length === 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
                        <p className="text-sm text-gray-500 text-center">
                          No products found
                        </p>
                      </div>
                    )}
                </div>
              </div>

              {/* Right Icons */}
              <div className="flex items-center space-x-4">
                <div className="hidden lg:flex items-center space-x-2 text-sm">
                  <Phone className="h-5 w-5 text-gray-700" />
                  <div>
                    <div className="text-xs text-gray-500">Need Help?</div>
                    <div className="font-semibold text-gray-900">
                      0768378439
                    </div>
                  </div>
                </div>

                {/* <Link
                  href={
                    user
                      ? profile?.role === "admin"
                        ? "/admin"
                        : "/account"
                      : "/login"
                  }
                  className="hidden lg:flex items-center space-x-2 text-sm hover:text-blue-600 transition-colors"
                >
                  <User className="h-5 w-5 text-gray-700" />
                  <div className="text-right">
                    <div className="text-xs text-gray-500">My Account</div>
                    <div className="font-semibold text-gray-900">
                      {user
                        ? profile?.full_name?.split(" ")[0] || "Account"
                        : "Sign In"}
                    </div>
                  </div>
                </Link> */}

                {/* Mobile Search Icon */}
                <button
                  onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Search className="h-6 w-6 text-gray-700" />
                </button>

                <Link
                  href="/cart"
                  className="flex items-center space-x-2 hover:text-blue-600 transition-colors relative"
                >
                  <ShoppingCart className="h-6 w-6 text-gray-700" />
                  <div className="hidden lg:block text-sm">
                    <div className="text-xs text-gray-500">My Cart</div>
                    <div className="font-semibold text-gray-900">
                      KSh 1200
                      {/* {getCartTotal().toLocaleString()} */}
                    </div>
                  </div>
                  {/* {getCartCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                      {getCartCount()}
                    </span>
                  )} */}
                </Link>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {mobileMenuOpen ? (
                    <X className="h-6 w-6 text-gray-700" />
                  ) : (
                    <Menu className="h-6 w-6 text-gray-700" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Navigation Menu */}
        <div className="hidden lg:block bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-8 h-12">
              {/* Galaxy Series */}
              <Link
                href="/shop/phones/galaxy-s-series"
                className="text-gray-900 hover:text-blue-600 font-medium transition-colors"
              >
                Galaxy S Series
              </Link>

              <Link
                href="/shop/phones/galaxy-a-series"
                className="text-gray-900 hover:text-blue-600 font-medium transition-colors"
              >
                Galaxy A Series
              </Link>

              <Link
                href="/shop/phones/galaxy-m-series"
                className="text-gray-900 hover:text-blue-600 font-medium transition-colors"
              >
                Galaxy M Series
              </Link>

              {/* Foldable Phones */}
              <Link
                href="/shop/phones/foldable-phones"
                className="text-gray-900 hover:text-blue-600 font-medium transition-colors"
              >
                Foldable Phones
              </Link>

              {/* Galaxy Tab Series */}
              <Link
                href="/shop/tablets/galaxy-tab-a"
                className="text-gray-900 hover:text-blue-600 font-medium transition-colors"
              >
                Galaxy Tab A
              </Link>

              <Link
                href="/shop/tablets/galaxy-tab-s"
                className="text-gray-900 hover:text-blue-600 font-medium transition-colors"
              >
                Galaxy Tab S
              </Link>

              <Link
                href="/shop?category=watches"
                className="text-gray-900 hover:text-blue-600 font-medium transition-colors"
              >
                Wearables
              </Link>

              {/* Accessories Dropdown */}
              <div
                className="relative"
                ref={accessoriesRef}
                onMouseEnter={() => setShowAccessoriesMenu(true)}
                onMouseLeave={() => setShowAccessoriesMenu(false)}
              >
                <button className="flex items-center space-x-1 text-gray-900 hover:text-blue-600 font-medium transition-colors">
                  <span>Accessories</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      showAccessoriesMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showAccessoriesMenu && (
                  <div className="absolute left-0 top-full pt-2 w-48 z-50">
                    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden py-2">
                      <Link
                        href="/shop?category=accessories"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
                      >
                        All Accessories
                      </Link>
                      <Link
                        href="/shop?category=buds"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
                      >
                        Audio
                      </Link>
                      <Link
                        href="/shop?category=cases"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
                      >
                        Cases
                      </Link>
                      <Link
                        href="/shop?category=chargers"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
                      >
                        Chargers
                      </Link>
                      <Link
                        href="/shop?category=screen-protectors"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
                      >
                        Screen Protectors
                      </Link>
                      <Link
                        href="/shop?category=powerbank"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
                      >
                        Power Banks
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile Search */}
        {mobileSearchOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4" ref={mobileSearchRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() =>
                    searchQuery.length >= 2 && setShowResults(true)
                  }
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="absolute right-2 top-2 px-4 py-1.5 bg-black hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-colors">
                  Search
                </button>

                {/* Mobile Search Results */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => {
                          setShowResults(false);
                          setSearchQuery("");
                          setMobileSearchOpen(false);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <Image
                          src={"/images/products/s25.jpg"}
                          alt={"product.name"}
                          width={100}
                          height={100}
                          className="w-12 h-12 object-contain rounded-lg bg-gray-50"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {"product.name"}
                          </h4>
                          <p className="text-sm text-blue-600 font-semibold">
                            KES 00
                            {/* {parseFloat(
                              product.price.toString()
                            ).toLocaleString()} */}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {showResults &&
                  searchQuery.length >= 2 &&
                  searchResults.length === 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
                      <p className="text-sm text-gray-500 text-center">
                        No products found
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              {/* Search Bar Mobile */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search for phones, accessories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() =>
                    searchQuery.length >= 2 && setShowResults(true)
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />

                {/* Search Results Dropdown Mobile */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => {
                          setShowResults(false);
                          setSearchQuery("");
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <Image
                          src={"/images/products/s25.jpg"}
                          alt={"product.name"}
                          width={100}
                          height={100}
                          className="w-12 h-12 object-contain rounded-lg bg-gray-50"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {"product.name"}
                          </h4>
                          <p className="text-sm text-blue-600 font-semibold">
                            KES{" "}
                            {parseFloat(
                              product.price.toString()
                            ).toLocaleString()}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* No Results Mobile */}
                {showResults &&
                  searchQuery.length >= 2 &&
                  searchResults.length === 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50">
                      <p className="text-sm text-gray-500 text-center">
                        No products found
                      </p>
                    </div>
                  )}
              </div>

              {/* Navigation Links */}
              <Link
                href="/"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Shop
              </Link>
              <Link
                href="/shop/phones/galaxy-s-series"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Galaxy S Series
              </Link>
              <Link
                href="/shop/phones/galaxy-a-series"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Galaxy A Series
              </Link>
              <Link
                href="/shop/phones/galaxy-m-series"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Galaxy M Series
              </Link>
              <Link
                href="/shop/phones/foldable-phones"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Foldable Phones
              </Link>
              <Link
                href="/shop/tablets/galaxy-tab-a"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Galaxy Tab A
              </Link>
              <Link
                href="/shop/tablets/galaxy-tab-s"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Galaxy Tab S
              </Link>
              <Link
                href="/shop?category=watches"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Wearables
              </Link>
              <Link
                href="/shop?category=accessories"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Accessories
              </Link>
              <Link
                href="/shop?category=buds"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors ml-4"
              >
                Audio
              </Link>
              <Link
                href="/shop?category=cases"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors ml-4"
              >
                Cases
              </Link>
              <Link
                href="/shop?category=chargers"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors ml-4"
              >
                Chargers
              </Link>
              <Link
                href="/about"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Contact
              </Link>
              {/* <Link
                href={
                  user
                    ? profile?.role === "admin"
                      ? "/admin"
                      : "/account"
                    : "/login"
                }
                className="block py-3 px-4 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                {user ? "My Account" : "Sign In"}
              </Link> */}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
