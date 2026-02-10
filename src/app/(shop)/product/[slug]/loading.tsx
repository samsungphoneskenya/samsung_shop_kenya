import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import FloatingButtons from "@/components/shop/FloatingButtons";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="animate-pulse space-y-8">
          {/* Breadcrumb skeleton */}
          <div className="h-4 w-40 bg-gray-200 rounded-full" />

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
            <div className="space-y-4">
              <div className="h-80 rounded-3xl bg-gray-200" />
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-2xl bg-gray-200"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="h-8 w-2/3 bg-gray-200 rounded-lg" />
              <div className="h-4 w-1/2 bg-gray-200 rounded-lg" />

              <div className="h-10 w-40 bg-gray-900/10 rounded-2xl" />

              <div className="h-12 w-full bg-gray-200 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 rounded-full" />
                <div className="h-3 w-11/12 bg-gray-200 rounded-full" />
                <div className="h-3 w-5/6 bg-gray-200 rounded-full" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-20 rounded-2xl bg-gray-200" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingButtons />
    </div>
  );
}

