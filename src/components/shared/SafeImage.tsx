import Image, { ImageProps } from "next/image";

/**
 * Use for images that may come from Supabase storage.
 * Next.js image optimization fetches the URL server-side; Supabase storage
 * can resolve to IPs that Next treats as private, causing "resolved to private ip".
 * Passing unoptimized for Supabase URLs avoids the server fetch.
 */
export function SafeImage({ src, ...props }: ImageProps) {
  const srcStr = typeof src === "string" ? src : (src as { src: string })?.src ?? "";
  const isSupabase = srcStr.includes("supabase.co");
  return <Image src={src} unoptimized={isSupabase} {...props} />;
}
