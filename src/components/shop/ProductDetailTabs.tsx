"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type {
  StorefrontProduct,
  ProductSpecification,
  ProductReview,
} from "@/lib/actions/storefront-actions";
import { SafeImage } from "@/components/shared/SafeImage";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  product: StorefrontProduct;
  specifications: ProductSpecification[];
  reviews: ProductReview[];
};

type TabId = "description" | "specs" | "reviews";

export function ProductDetailTabs({ product, specifications, reviews }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("description");
  const { toast } = useToast();

  const hasDescription = !!product.description;
  const hasSpecs = specifications.length > 0;
  const hasReviews = reviews.length > 0;

  const tabs: { id: TabId; label: string; disabled?: boolean }[] = [
    {
      id: "description",
      label: "Description",
      disabled: !hasDescription,
    },
    {
      id: "specs",
      label: "Specifications",
      disabled: !hasSpecs,
    },
    {
      id: "reviews",
      label: `Reviews${
        product.review_count ? ` (${product.review_count})` : ""
      }`,
      disabled: !hasReviews,
    },
  ];

  const groupedSpecs = specifications.reduce<
    Record<string, ProductSpecification[]>
  >((acc, spec) => {
    const group = spec.spec_group || "General";
    if (!acc[group]) acc[group] = [];
    acc[group].push(spec);
    return acc;
  }, {});

  return (
    <section className="mb-16">
      <div className="border-b border-gray-200 mb-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.disabled) {
                  const label =
                    tab.id === "specs"
                      ? "Specifications aren’t available yet."
                      : tab.id === "reviews"
                      ? "No reviews yet for this product."
                      : "This section isn’t available yet.";
                  toast({
                    title: "Coming soon",
                    description: label,
                  });
                  return;
                }
                setActiveTab(tab.id);
              }}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                tab.disabled
                  ? "text-gray-400 border-transparent cursor-not-allowed"
                  : activeTab === tab.id
                  ? "text-gray-900 border-gray-900"
                  : "text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        {activeTab === "description" && (
          <div className="space-y-4">
            {product.video_url && (
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
                <iframe
                  src={product.video_url}
                  title={product.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            )}
            {product.description ? (
              <div
                className="prose prose-sm sm:prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-sm text-gray-500">
                Detailed description will be available soon.
              </p>
            )}
          </div>
        )}

        {activeTab === "specs" && (
          <div className="space-y-6">
            {Object.entries(groupedSpecs).map(([group, specs]) => (
              <div key={group}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  {group}
                </h3>
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <dl className="divide-y divide-gray-100">
                    {specs.map((spec) => (
                      <div
                        key={spec.id}
                        className="grid grid-cols-[minmax(0,160px)_minmax(0,1fr)] gap-3 px-4 py-2.5 text-sm"
                      >
                        <dt className="text-gray-500">{spec.spec_key}</dt>
                        <dd className="text-gray-900 font-medium">
                          {spec.spec_value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            ))}

            {/* Fallback if no structured specs but some metadata exists */}
            {specifications.length === 0 && (
              <p className="text-sm text-gray-500">
                Specifications will be available soon.
              </p>
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="space-y-4">
            {!hasReviews && (
              <p className="text-sm text-gray-500">
                There are no reviews for this product yet.
              </p>
            )}

            {hasReviews && (
              <ul className="space-y-4">
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="border border-gray-100 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {review.reviewer_name}
                        </p>
                        {review.is_verified_purchase && (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                            Verified purchase
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                    {review.title && (
                      <p className="text-sm font-medium text-gray-900">
                        {review.title}
                      </p>
                    )}
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">
                      {review.comment}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                      <span>
                        {review.created_at
                          ? new Date(review.created_at).toLocaleDateString()
                          : null}
                      </span>
                      {(review.helpful_count ?? 0) > 0 && (
                        <span>
                          {review.helpful_count}{" "}
                          {review.helpful_count === 1 ? "person" : "people"}{" "}
                          found this helpful
                        </span>
                      )}
                    </div>

                    {review.images && review.images.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {review.images.slice(0, 4).map((src, idx) => (
                          <div
                            key={src + idx}
                            className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100"
                          >
                            <SafeImage
                              src={src}
                              alt={`Review image ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
