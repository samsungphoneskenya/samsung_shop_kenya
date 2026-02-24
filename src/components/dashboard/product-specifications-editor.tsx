"use client";

import { useActionState, useState } from "react";
import type { Database } from "@/types/database.types";
import {
  createProductSpecification,
  deleteProductSpecification,
} from "@/lib/actions/product-specification-actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

type SpecRow = Database["public"]["Tables"]["product_specifications"]["Row"];

type Props = {
  productId: string;
  specifications: SpecRow[];
};

type FormState = { error?: string; success?: boolean } | undefined;

export function ProductSpecificationsEditor({
  productId,
  specifications,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [group, setGroup] = useState("General");
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");

  const action = createProductSpecification.bind(null, productId);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (_prev, fd) => {
      const result = await action(undefined, fd);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Unable to add specification",
          description: result.error,
        });
        return { error: result.error };
      }
      toast({
        variant: "success",
        title: "Specification added",
        description: `${fd.get("spec_key")}`,
      });
      setKey("");
      setValue("");
      router.refresh();
      return { success: true };
    },
    undefined
  );

  const handleDelete = async (specId: string) => {
    if (!confirm("Delete this specification?")) return;
    const result = await deleteProductSpecification(productId, specId);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: result.error,
      });
      return;
    }
    toast({
      variant: "success",
      title: "Specification deleted",
    });
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Add specification
        </h3>

        <form action={formAction} className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Group
            </label>
            <input
              name="spec_group"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="General"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Key
            </label>
            <input
              name="spec_key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Display"
              required
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Value
            </label>
            <input
              name="spec_value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="6.7-inch AMOLED"
              required
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {pending ? "Adding…" : "Add"}
            </button>
          </div>
        </form>

        {state?.error ? (
          <p className="mt-2 text-xs text-red-600">{state.error}</p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-900">
            Specifications ({specifications.length})
          </h3>
        </div>

        {specifications.length === 0 ? (
          <div className="px-5 py-10 text-sm text-gray-500">
            No specifications yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {specifications.map((s) => (
              <div
                key={s.id}
                className="px-5 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-500">
                    {s.spec_group}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {s.spec_key}
                  </p>
                  <p className="text-sm text-gray-700 wrap-break-word">
                    {s.spec_value}
                  </p>
                </div>
                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDelete(s.id)}
                    className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
