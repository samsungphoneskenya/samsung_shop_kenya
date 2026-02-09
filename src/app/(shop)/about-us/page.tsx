import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import FloatingButtons from "@/components/shop/FloatingButtons";
import { Award, Users, Target, Heart, Shield, Zap } from "lucide-react";
import Image from "next/image";

export default function About() {
  const values = [
    {
      icon: Award,
      title: "Quality Products",
      description:
        "We offer only authentic Samsung products with official warranties and quality guarantees.",
      color: "from-gray-700 to-gray-900",
    },
    {
      icon: Users,
      title: "Customer First",
      description:
        "Your satisfaction is our priority. We provide exceptional customer service and support.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Target,
      title: "Best Prices",
      description:
        "Competitive pricing with regular deals and discounts to give you the best value.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Heart,
      title: "Trusted Service",
      description:
        "Over 50,000 satisfied customers trust us for their Samsung product needs.",
      color: "from-red-500 to-red-600",
    },
    {
      icon: Shield,
      title: "Secure Shopping",
      description:
        "Safe and secure payment options with buyer protection on all purchases.",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Zap,
      title: "Fast Delivery",
      description:
        "Quick and reliable delivery across Kenya with free shipping on orders over KES 15,000.",
      color: "from-yellow-500 to-yellow-600",
    },
  ];

  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "500+", label: "Products Available" },
    { number: "5 Years", label: "In Business" },
    { number: "4.9★", label: "Customer Rating" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-black text-white py-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>

        {/* Phone illustration */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10 hidden lg:block">
          <svg className="w-64 h-64" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About Samsung Phones Kenya
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Your trusted destination for authentic Samsung smartphones,
              tablets, wearables, and accessories in Kenya.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Founded in 2019, Samsung Phones Kenya began with a simple
                  mission: to make authentic Samsung products accessible to
                  everyone across Kenya. What started as a small shop in Nairobi
                  has grown into one of the most trusted Samsung retailers in
                  the country.
                </p>
                <p>
                  We understand the importance of technology in today&apos;s
                  world. Whether you&apos;re a professional, student, or tech
                  enthusiast, we believe everyone deserves access to quality
                  Samsung products that enhance their daily lives.
                </p>
                <p>
                  Our commitment to authenticity, competitive pricing, and
                  exceptional customer service has earned us the trust of over
                  50,000 satisfied customers. We&apos;re not just selling
                  products; we&apos;re building lasting relationships with our
                  community.
                </p>
                <p>
                  Today, we continue to expand our offerings, bringing you the
                  latest Samsung innovations while maintaining the personalized
                  service that our customers love.
                </p>
              </div>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-96">
              {/* Use one of your product images */}
              <Image
                src="/images/products/s25.jpg"
                alt="Samsung Phones"
                width={1200}
                height={1200}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-8 text-white">
                  <div className="text-4xl font-bold mb-2">Since 2019</div>
                  <div className="text-lg">Serving Kenya with Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We&apos;re committed to providing the best shopping experience for
              Samsung products in Kenya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visit Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-black rounded-3xl p-12 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">Visit Our Store</h2>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Address</div>
                      <div className="text-white/90">
                        Lotus Plaza 1st Floor
                        <br />
                        Chiromo Lane 15
                        <br />
                        Opposite Club K1, Nairobi
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Hours</div>
                      <div className="text-white/90">
                        Mon-Sat: 9AM - 7PM
                        <br />
                        Sun: 10AM - 6PM
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Contact</div>
                      <div className="text-white/90">
                        0768378439
                        <br />
                        support@samsungstore.ke
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
                <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="h-10 w-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4">Get Directions</h3>
                <p className="text-white/90 mb-6">
                  We&apos;re located in the heart of Westlands, easily
                  accessible by public transport or car.
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-white text-black px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  Open in Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingButtons />
    </div>
  );
}
