"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { submitProductReview } from "@/lib/actions/account-actions";

type Props = {
  productId: string;
  productTitle: string;
  productSlug: string;
  alreadyReviewed: boolean;
};

export function ReviewButton({
  productId,
  productTitle,
  productSlug,
  alreadyReviewed,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setError(null);
    setPending(true);
    const result = await submitProductReview(productId, formData);
    setPending(false);
    if (result.error) setError(result.error);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 1500);
    }
  }

  if (alreadyReviewed) {
    return (
      <span className="text-sm text-gray-500 font-medium shrink-0">Reviewed</span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors"
      >
        <Star className="h-4 w-4" />
        Leave review
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Review: {productTitle}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Share your experience (verified purchase)
            </p>
            <form action={handleSubmit} className="space-y-4">
              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              {success && (
                <p className="text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
                  Thank you! Your review has been submitted for moderation.
                </p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (1–5)
                </label>
                <select
                  name="rating"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} star{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (optional)
                </label>
                <input
                  name="title"
                  type="text"
                  placeholder="Short summary"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment *
                </label>
                <textarea
                  name="comment"
                  required
                  minLength={10}
                  rows={4}
                  placeholder="At least 10 characters"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => !pending && setOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg disabled:opacity-50 transition-colors"
                >
                  {pending ? "Submitting…" : "Submit review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
