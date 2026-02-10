import { getPageBySlug } from "@/lib/actions/page-actions";
import { ContactContent } from "@/components/shop/ContactContent";
import type { ContactSections } from "@/lib/types/page-sections";

export async function generateMetadata() {
  const page = await getPageBySlug("contact-us");
  return {
    title: page?.meta_title ?? "Contact Us | Samsung Phones Kenya",
    description: page?.meta_description ?? "Contact Samsung Phones Kenya. Call, WhatsApp, email or visit our store.",
  };
}

export default async function Contact() {
  const page = await getPageBySlug("contact-us");
  const sections = (page?.sections ?? {}) as ContactSections;

  return <ContactContent sections={sections} />;
}
