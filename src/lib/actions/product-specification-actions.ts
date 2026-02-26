"use server";

import { createClient } from "@/lib/db/client";
import { getCurrentUserProfile } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

type ActionResult = { error?: string; success?: boolean };

const STAFF_ROLES = ["admin", "editor"] as const;

async function requireStaff(): Promise<{ error?: string; success?: true }> {
  const profile = await getCurrentUserProfile();
  if (!profile) return { error: "Unauthorized" };
  if (!STAFF_ROLES.includes((profile.role ?? "") as any)) {
    return { error: "Forbidden" };
  }
  return { success: true };
}

function toInt(value: FormDataEntryValue | null): number | null {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

export async function createProductSpecification(
  productId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireStaff();
  if (auth.error) return { error: auth.error };

  const spec_group =
    (formData.get("spec_group") as string | null)?.trim() || "General";
  const spec_key = (formData.get("spec_key") as string | null)?.trim() || "";
  const spec_value =
    (formData.get("spec_value") as string | null)?.trim() || "";
  const group_order = toInt(formData.get("group_order"));
  const spec_order = toInt(formData.get("spec_order"));

  if (!spec_key) return { error: "Specification key is required" };
  if (!spec_value) return { error: "Specification value is required" };

  const supabase = await createClient();
  const { error } = await supabase.from("product_specifications").insert({
    product_id: productId,
    spec_group,
    spec_key,
    spec_value,
    group_order,
    spec_order,
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/products/${productId}`);
  return { success: true };
}

export async function deleteProductSpecification(
  productId: string,
  specificationId: string
): Promise<ActionResult> {
  const auth = await requireStaff();
  if (auth.error) return { error: auth.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("product_specifications")
    .delete()
    .eq("id", specificationId)
    .eq("product_id", productId);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/products/${productId}`);
  return { success: true };
}
