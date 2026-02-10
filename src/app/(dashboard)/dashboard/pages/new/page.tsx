import { requireRole } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function NewPagePage() {
  await requireRole(["admin", "editor"]);

  // Site uses fixed pages (home, about-us, contact-us). Redirect to list.
  redirect("/dashboard/pages");
}
