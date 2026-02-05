"use client";

import { useState, useEffect } from "react";
import {
  Star,
  ShoppingCart,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
  Smartphone,
  Search,
} from "lucide-react";
// import { useCart } from "../context/CartContext";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Database } from "@/types/database.types";
import Footer from "@/components/shared/Footer";
import FloatingButtons from "@/components/shop/FloatingButtons";
import Header from "@/components/shared/Header";

type Product = Database["public"]["Tables"]["products"]["Row"];

export default function Shop() {
  // const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [selectedSeries, setSelectedSeries] = useState<string>("all");
  const [selectedFeature, setSelectedFeature] = useState<string>("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    phones: false,
    phonePrices: false,
    phoneSeries: false,
    phoneFeatures: false,
    tablets: false,
    tabletPrices: false,
    tabletSeries: false,
    tabletFeatures: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle URL parameters on component mount
  useEffect(() => {
    console.log(searchParams);
    // const categoryParam =  searchParams.get("category");
    // if (categoryParam) {
    //   setSelectedCategory(categoryParam);
    // }
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      console.log("fetching products coming soon");
      // const { data, error } = await supabase
      //   .from("products")
      //   .select("*")
      //   .eq("in_stock", true)
      //   .order("created_at", { ascending: false });

      // if (error) throw error;
      // setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get category type
  const getCategoryType = (category: string) => {
    const phoneCategories = [
      "galaxy-s-series",
      "galaxy-a-series",
      "galaxy-m-series",
      "foldable-phones",
    ];
    const tabletCategories = ["galaxy-tab-a", "galaxy-tab-s"];
    const accessoryCategories = [
      "cases",
      "adaptors",
      "chargers",
      "screen-protectors",
      "powerbank",
      "holders",
      "accessories",
    ];

    if (phoneCategories.includes(category)) return "smartphones";
    if (tabletCategories.includes(category)) return "tablets";
    if (accessoryCategories.includes(category)) return "accessories";
    return category;
  };

  const filteredProducts = products.filter((product) => {
    const price = parseFloat(product.price.toString());
    const name = "product.name".toLowerCase();
    const description = product.description?.toLowerCase() || "";
    // const features =
    //   product.features?.map((f: string) => f.toLowerCase()) || [];
    // const specs = Object.values(product.specs || {})
    //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   .map((s: any) => s.toLowerCase())
    //   .join(" ");

    // Category filter
    if (selectedCategory !== "all") {
      // Handle group categories (smartphones, tablets, accessories)
      if (selectedCategory === "smartphones") {
        const phoneCategories = [
          "galaxy-s-series",
          "galaxy-a-series",
          "galaxy-m-series",
          "foldable-phones",
        ];
        if (!phoneCategories.includes("product.category")) return false;
      } else if (selectedCategory === "tablets") {
        const tabletCategories = ["galaxy-tab-a", "galaxy-tab-s"];
        if (!tabletCategories.includes("product.category")) return false;
      } else if (selectedCategory === "accessories") {
        const accessoryCategories = [
          "cases",
          "adaptors",
          "chargers",
          "screen-protectors",
          "powerbank",
          "holders",
          "accessories",
        ];
        if (!accessoryCategories.includes("product.category")) return false;
      } else if ("product.category" !== selectedCategory) {
        return false;
      }
    }

    // Price range filter
    if (priceRange === "under50k" && price >= 50000) return false;
    if (priceRange === "50k-100k" && (price < 50000 || price >= 100000))
      return false;
    if (priceRange === "100k-150k" && (price < 100000 || price >= 150000))
      return false;
    if (priceRange === "over150k" && price < 150000) return false;

    // Series filter (only for smartphones)
    const productCategoryType = getCategoryType("product.category");
    if (selectedSeries !== "all" && productCategoryType === "smartphones") {
      switch (selectedSeries) {
        case "galaxy-s-series":
          // if (
          //   product.category !== "galaxy-s-series" &&
          //   !(
          //     name.includes("galaxy s") ||
          //     name.includes("s24") ||
          //     name.includes("s23") ||
          //     name.includes("s22") ||
          //     name.includes("s21")
          //   )
          // )
          return false;
        case "galaxy-a-series":
          // if (
          //   product.category !== "galaxy-a-series" &&
          //   !(
          //     name.includes("galaxy a") ||
          //     name.includes("a54") ||
          //     name.includes("a34") ||
          //     name.includes("a24") ||
          //     name.includes("a14")
          //   )
          // )
          return false;
        case "galaxy-m-series":
          // if (
          //   product.category !== "galaxy-m-series" &&
          //   !(
          //     name.includes("galaxy m") ||
          //     name.includes("m54") ||
          //     name.includes("m34") ||
          //     name.includes("m14")
          //   )
          // )
          return false;
      }
    }

    // Feature filter (only for smartphones)
    if (selectedFeature !== "all" && productCategoryType === "smartphones") {
      switch (selectedFeature) {
        case "5g-phones":
          if (
            !(
              (name.includes("5g") || description.includes("5g"))
              // features.some((f: string) => f.includes("5g")) ||
              // specs.includes("5g")
            )
          )
            return false;
          break;
        case "foldable-phones":
          if (
            !(
              (
                name.includes("fold") ||
                name.includes("flip") ||
                description.includes("foldable")
              )
              // features.some(
              //   (f: string) => f.includes("fold") || f.includes("flip")
              // )
            )
          )
            return false;
          break;
        case "dual-sim":
          if (
            !(
              (
                description.includes("dual sim") ||
                description.includes("dual-sim")
              )
              // features.some(
              //   (f: string) => f.includes("dual sim") || f.includes("dual-sim")
              // ) ||
              // specs.includes("dual sim")
            )
          )
            return false;
          break;
        case "waterproof":
          if (
            !(
              (
                description.includes("waterproof") ||
                description.includes("ip68") ||
                description.includes("water resistant")
              )
              // features.some(
              //   (f: string) => f.includes("waterproof") || f.includes("ip68")
              // ) ||
              // specs.includes("ip68")
            )
          )
            return false;
          break;
      }
    }

    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = parseFloat(a.price.toString());
    const priceB = parseFloat(b.price.toString());
    if (sortBy === "price-low") return priceA - priceB;
    if (sortBy === "price-high") return priceB - priceA;
    // if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  const FilterSection = () => (
    <div className="space-y-6">
      {/* Price Range Filter */}
      <div>
        <h3 className="font-bold text-lg mb-4">Price Range</h3>
        <div className="space-y-2">
          {[
            { value: "all", label: "All Prices" },
            { value: "under50k", label: "Under KES 50,000" },
            { value: "50k-100k", label: "KES 50,000 - 100,000" },
            { value: "100k-150k", label: "KES 100,000 - 150,000" },
            { value: "over150k", label: "Over KES 150,000" },
          ].map((range) => (
            <label
              key={range.value}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="price"
                value={range.value}
                checked={priceRange === range.value}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="font-bold text-lg mb-4">Category</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="radio"
              name="category"
              value="all"
              checked={selectedCategory === "all"}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-gray-700 group-hover:text-blue-600 transition-colors font-medium">
              All Products
            </span>
          </label>

          {/* Phones & Tablets */}
          <div>
            <button
              onClick={() =>
                setExpandedSections((prev) => ({
                  ...prev,
                  phones: !prev.phones,
                }))
              }
              className="flex items-center justify-between w-full font-semibold text-gray-900 mb-2 text-sm hover:text-blue-600 transition-colors"
            >
              <span>Phones & Tablets</span>
              {expandedSections.phones ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

            {expandedSections.phones && (
              <div className="space-y-2 ml-4 mb-4">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    value="smartphones"
                    checked={selectedCategory === "smartphones"}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                    All Smartphones
                  </span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category"
                    value="tablets"
                    checked={selectedCategory === "tablets"}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                    Tablets
                  </span>
                </label>

                {/* Phone Categories Dropdown */}
                <div className="mt-4 pt-3 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 -mx-1">
                  <div className="flex items-center mb-3">
                    <Smartphone className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      Phone Categories
                    </span>
                  </div>

                  {/* By Price Range */}
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setExpandedSections((prev) => ({
                          ...prev,
                          phonePrices: !prev.phonePrices,
                        }))
                      }
                      className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors mb-2"
                    >
                      <span>By Price Range</span>
                      {expandedSections.phonePrices ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </button>
                    {expandedSections.phonePrices && (
                      <div className="space-y-1 ml-3">
                        <Link
                          href="/shop/phones/under-10k"
                          className="block text-xs text-gray-600 hover:text-blue-600 transition-colors py-1"
                        >
                          Under KES 10,000
                        </Link>
                        <Link
                          href="/shop/phones/under-15k"
                          className="block text-xs text-gray-600 hover:text-blue-600 transition-colors py-1"
                        >
                          Under KES 15,000
                        </Link>
                        <Link
                          href="/shop/phones/under-20k"
                          className="block text-xs text-gray-600 hover:text-blue-600 transition-colors py-1"
                        >
                          Under KES 20,000
                        </Link>
                        <Link
                          href="/shop/phones/under-30k"
                          className="block text-xs text-gray-600 hover:text-blue-600 transition-colors py-1"
                        >
                          Under KES 30,000
                        </Link>
                        <Link
                          href="/shop/phones/under-40k"
                          className="block text-xs text-gray-600 hover:text-blue-600 transition-colors py-1"
                        >
                          Under KES 40,000
                        </Link>
                        <Link
                          href="/shop/phones/above-40k"
                          className="block text-xs text-gray-600 hover:text-blue-600 transition-colors py-1"
                        >
                          Above KES 40,000
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* By Series */}
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setExpandedSections((prev) => ({
                          ...prev,
                          phoneSeries: !prev.phoneSeries,
                        }))
                      }
                      className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors mb-2"
                    >
                      <span>By Series</span>
                      {expandedSections.phoneSeries ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </button>
                    {expandedSections.phoneSeries && (
                      <div className="space-y-1 ml-3">
                        <Link
                          href="/shop/phones/galaxy-s-series"
                          className="block text-xs text-gray-600 hover:text-blue-600 transition-colors py-1"
                        >
                          Galaxy S Series
                        </Link>
                        <Link
                          href="/shop/phones/galaxy-a-series"
                          className="block text-xs text-gray-600 hover:text-blue-600 transition-colors py-1"
                        >
                          Galaxy A Series
                        </Link>
                        <Link
                          href="/shop/phones/galaxy-m-series"
                          className="block text-xs text-gray-600 hover:text-blue-600 transition-colors py-1"
                        >
                          Galaxy M Series
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* By Features */}
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setExpandedSections((prev) => ({
                          ...prev,
                          phoneFeatures: !prev.phoneFeatures,
                        }))
                      }
                      className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors mb-2"
                    >
                      <span>By Features</span>
                      {expandedSections.phoneFeatures ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </button>
                    {expandedSections.phoneFeatures && (
                      <div className="space-y-1 ml-3">
                        <Link
                          href="/shop/phones/5g-phones"
                          className="block text-xs text-gray-600 hover:text-blue-600 transition-colors py-1"
                        >
                          5G Phones
                        </Link>
                        <Link
                          href="/shop/phones/foldable-phones"
                          className="block text-xs text-gray-600 hover:text-blue-600 transition-colors py-1"
                        >
                          Foldable Phones
                        </Link>
                        <Link
                          href="/shop/phones/dual-sim"
                          className="block text-xs text-gray-600 hover:text-blue-600 transition-colors py-1"
                        >
                          Dual SIM
                        </Link>
                        <Link
                          href="/shop/phones/waterproof"
                          className="block text-xs text-gray-600 hover:text-blue-600 transition-colors py-1"
                        >
                          Waterproof
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tablet Categories Dropdown */}
                <div className="mt-4 pt-3 border-t border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 -mx-1">
                  <div className="flex items-center mb-3">
                    <Smartphone className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                      Tablet Categories
                    </span>
                  </div>

                  {/* By Price Range */}
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setExpandedSections((prev) => ({
                          ...prev,
                          tabletPrices: !prev.tabletPrices,
                        }))
                      }
                      className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-green-600 transition-colors mb-2"
                    >
                      <span>By Price Range</span>
                      {expandedSections.tabletPrices ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </button>
                    {expandedSections.tabletPrices && (
                      <div className="space-y-1 ml-3">
                        <Link
                          href="/shop/tablets/under-30k"
                          className="block text-xs text-gray-600 hover:text-green-600 transition-colors py-1"
                        >
                          Under KES 30,000
                        </Link>
                        <Link
                          href="/shop/tablets/under-50k"
                          className="block text-xs text-gray-600 hover:text-green-600 transition-colors py-1"
                        >
                          Under KES 50,000
                        </Link>
                        <Link
                          href="/shop/tablets/above-50k"
                          className="block text-xs text-gray-600 hover:text-green-600 transition-colors py-1"
                        >
                          Above KES 50,000
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* By Series */}
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setExpandedSections((prev) => ({
                          ...prev,
                          tabletSeries: !prev.tabletSeries,
                        }))
                      }
                      className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-green-600 transition-colors mb-2"
                    >
                      <span>By Series</span>
                      {expandedSections.tabletSeries ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </button>
                    {expandedSections.tabletSeries && (
                      <div className="space-y-1 ml-3">
                        <Link
                          href="/shop/tablets/galaxy-tab-a"
                          className="block text-xs text-gray-600 hover:text-green-600 transition-colors py-1"
                        >
                          Galaxy Tab A Series
                        </Link>
                        <Link
                          href="/shop/tablets/galaxy-tab-s"
                          className="block text-xs text-gray-600 hover:text-green-600 transition-colors py-1"
                        >
                          Galaxy Tab S Series
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* By Features */}
                  <div className="mb-4">
                    <button
                      onClick={() =>
                        setExpandedSections((prev) => ({
                          ...prev,
                          tabletFeatures: !prev.tabletFeatures,
                        }))
                      }
                      className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-green-600 transition-colors mb-2"
                    >
                      <span>By Features</span>
                      {expandedSections.tabletFeatures ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </button>
                    {expandedSections.tabletFeatures && (
                      <div className="space-y-1 ml-3">
                        <Link
                          href="/shop/tablets/with-pen"
                          className="block text-xs text-gray-600 hover:text-green-600 transition-colors py-1"
                        >
                          With S Pen
                        </Link>
                        <Link
                          href="/shop/tablets/with-keyboard"
                          className="block text-xs text-gray-600 hover:text-green-600 transition-colors py-1"
                        >
                          With Keyboard
                        </Link>
                        <Link
                          href="/shop/tablets/for-drawing"
                          className="block text-xs text-gray-600 hover:text-green-600 transition-colors py-1"
                        >
                          For Drawing
                        </Link>
                        <Link
                          href="/shop/tablets/for-gaming"
                          className="block text-xs text-gray-600 hover:text-green-600 transition-colors py-1"
                        >
                          For Gaming
                        </Link>
                        <Link
                          href="/shop/tablets/with-sim"
                          className="block text-xs text-gray-600 hover:text-green-600 transition-colors py-1"
                        >
                          With SIM
                        </Link>
                        <Link
                          href="/shop/tablets/wifi-only"
                          className="block text-xs text-gray-600 hover:text-green-600 transition-colors py-1"
                        >
                          WiFi Only
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Wearables */}
          <div>
            <div className="font-semibold text-gray-900 mb-2 text-sm">
              Wearables
            </div>
            <div className="space-y-2 ml-4">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value="watches"
                  checked={selectedCategory === "watches"}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  Watches
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value="fitness-bands"
                  checked={selectedCategory === "fitness-bands"}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  Fitness Bands
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value="smart-rings"
                  checked={selectedCategory === "smart-rings"}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  Smart Rings
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value="smarttags"
                  checked={selectedCategory === "smarttags"}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  Smart Tags
                </span>
              </label>
            </div>
          </div>

          {/* Audio */}
          <div>
            <div className="font-semibold text-gray-900 mb-2 text-sm">
              Audio
            </div>
            <div className="space-y-2 ml-4">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value="buds"
                  checked={selectedCategory === "buds"}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  Buds & Earphones
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value="sound-towers"
                  checked={selectedCategory === "sound-towers"}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  Sound Towers
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value="soundbars"
                  checked={selectedCategory === "soundbars"}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  Soundbars
                </span>
              </label>
            </div>
          </div>

          {/* Accessories */}
          <div>
            <div className="font-semibold text-gray-900 mb-2 text-sm">
              Accessories
            </div>
            <div className="space-y-2 ml-4">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value="accessories"
                  checked={selectedCategory === "accessories"}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  All Accessories
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value="adaptors"
                  checked={selectedCategory === "adaptors"}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  Adapters & Cables
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value="chargers"
                  checked={selectedCategory === "chargers"}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  Chargers
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value="cases"
                  checked={selectedCategory === "cases"}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  Cases
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value="screen-protectors"
                  checked={selectedCategory === "screen-protectors"}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  Screen Protectors
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value="powerbank"
                  checked={selectedCategory === "powerbank"}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  Power Banks
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value="holders"
                  checked={selectedCategory === "holders"}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                  Phone Holders
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-6 border-t border-gray-200 space-y-3">
        <button
          onClick={() => {
            setSelectedCategory("all");
            setPriceRange("all");
            setSelectedSeries("all");
            setSelectedFeature("all");
          }}
          className="w-full py-3 border-2 border-gray-300 rounded-xl hover:border-blue-600 hover:text-blue-600 transition-colors font-semibold"
        >
          Reset Filters
        </button>

        <button
          onClick={() => {
            const allExpanded = Object.values(expandedSections).every(Boolean);
            setExpandedSections({
              phones: !allExpanded,
              phonePrices: !allExpanded,
              phoneSeries: !allExpanded,
              phoneFeatures: !allExpanded,
              tablets: !allExpanded,
              tabletPrices: !allExpanded,
              tabletSeries: !allExpanded,
              tabletFeatures: !allExpanded,
            });
          }}
          className="w-full py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
        >
          {Object.values(expandedSections).every(Boolean)
            ? "Collapse All"
            : "Expand All"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shop</h1>
          <p className="text-gray-600">
            Discover our complete collection of Samsung products
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 rounded-xl py-3 font-semibold hover:border-blue-600 transition-colors"
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <SlidersHorizontal className="h-5 w-5 text-gray-400" />
              </div>
              <FilterSection />
            </div>
          </aside>

          {/* Mobile Filters Modal */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
              <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <FilterSection />
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <p className="text-gray-600">
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {sortedProducts.length}
                  </span>{" "}
                  products
                </p>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                  {/* Sort By */}
                  <div className="flex items-center space-x-2">
                    <label className="text-gray-600 text-sm whitespace-nowrap">
                      Sort by:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>

                  {/* Series Filter - Only show for smartphones */}
                  {(selectedCategory === "smartphones" ||
                    selectedCategory === "all") && (
                    <div className="flex items-center space-x-2">
                      <label className="text-gray-600 text-sm whitespace-nowrap">
                        Series:
                      </label>
                      <select
                        value={selectedSeries}
                        onChange={(e) => setSelectedSeries(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="all">All Series</option>
                        <option value="galaxy-s-series">Galaxy S Series</option>
                        <option value="galaxy-a-series">Galaxy A Series</option>
                        <option value="galaxy-m-series">Galaxy M Series</option>
                      </select>
                    </div>
                  )}

                  {/* Features Filter - Only show for smartphones */}
                  {(selectedCategory === "smartphones" ||
                    selectedCategory === "all") && (
                    <div className="flex items-center space-x-2">
                      <label className="text-gray-600 text-sm whitespace-nowrap">
                        Features:
                      </label>
                      <select
                        value={selectedFeature}
                        onChange={(e) => setSelectedFeature(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="all">All Features</option>
                        <option value="5g-phones">5G Phones</option>
                        <option value="foldable-phones">Foldable Phones</option>
                        <option value="dual-sim">Dual SIM</option>
                        <option value="waterproof">Waterproof</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 mt-4">Loading products...</p>
              </div>
            )}

            {/* Products Grid */}
            {!loading && (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {sortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                  >
                    <a href={`/product/${product.id}`} className="block">
                      <div className="relative">
                        {/* {product.badge && ( */}
                        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full px-2 py-0.5 sm:px-3 sm:py-1 text-xs font-bold shadow-lg z-10">
                          {"product.badge"}
                        </div>
                        {/* )} */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 h-40 sm:h-64 flex items-center justify-center relative overflow-hidden p-2 sm:p-4">
                          <Image
                            src={"/images/products/s25.jpg"}
                            alt={"product.name"}
                            width={1200}
                            height={1200}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </div>
                      <div className="p-3 sm:p-5">
                        <div className="flex items-center space-x-1 mb-1 sm:mb-2">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">
                            {"product.rating"}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            ({"product.reviews"})
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-2">
                          {"product.name"}
                        </h3>

                        <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-2 mb-2 sm:mb-4">
                          <span className="text-base sm:text-2xl font-bold text-gray-900">
                            KES 00
                            {/* {parseFloat(
                              product.price.toString()
                            ).toLocaleString()} */}
                          </span>
                          {/* {product.original_price && (
                            <span className="text-xs sm:text-sm text-gray-400 line-through">
                              KES{" "}
                              {parseFloat(
                                product.original_price.toString()
                              ).toLocaleString()}
                            </span>
                          )} */}
                        </div>
                      </div>
                    </a>
                    <div className="px-3 pb-3 sm:px-5 sm:pb-5">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          // addToCart({
                          //   id: product.id,
                          //   name: "product.name",
                          //   price: parseFloat(product.price.toString()),
                          //   image: product.image_url,
                          // });
                        }}
                        className="w-full bg-black text-white py-2 sm:py-3 rounded-xl hover:bg-gray-800 transition-all font-semibold flex items-center justify-center space-x-1 sm:space-x-2 shadow-lg text-xs sm:text-base"
                      >
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && sortedProducts.length === 0 && (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters to see more results
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setPriceRange("all");
                    setSelectedSeries("all");
                    setSelectedFeature("all");
                  }}
                  className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-all font-semibold"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <FloatingButtons />
    </div>
  );
}
