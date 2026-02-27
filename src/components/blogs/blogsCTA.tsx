import Link from "next/link";

interface BlogCtaProps {
  title?: string;
  description?: string;
  features?: string[];
  shopHref?: string;
  shopLabel?: string;
  whatsappHref?: string;
  whatsappLabel?: string;
}

export default function BlogCta({
  title = "Looking for a Samsung Device?",
  description = "Browse our full range of Samsung smartphones, tablets, and accessories with competitive pricing and fast delivery across Kenya.",
  features = [
    "Genuine Samsung Products",
    "Countrywide Delivery",
    "Warranty Included",
  ],
  shopHref = "/shop",
  shopLabel = "Shop Now",
  whatsappHref = "https://wa.me/254700000000",
  whatsappLabel = "Chat with an Expert",
}: BlogCtaProps) {
  return (
    <aside className="w-full">
      <div className="sticky top-24 rounded-2xl border border-slate-200 bg-slate-100 p-6 shadow-sm">
        {/* Heading */}
        <h2 className="text-lg font-bold text-slate-900 leading-snug mb-2">
          {title}
        </h2>

        {/* Description */}
        <p className="text-sm text-slate-600 mb-5 leading-relaxed">
          {description}
        </p>

        {/* Feature list */}
        <p className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">
          Why Choose Us:
        </p>
        <ul className="space-y-2 mb-6">
          {features.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2 text-sm text-slate-700"
            >
              <svg
                className="shrink-0 w-4 h-4 text-green-600"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                  clipRule="evenodd"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        {/* Primary CTA */}
        <Link
          href={shopHref}
          className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#1428A0] hover:bg-[#0f1e80] text-white text-sm font-semibold py-3 px-4 transition-colors mb-3"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
          {shopLabel}
        </Link>

        {/* Secondary CTA — WhatsApp */}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-green-600 text-green-700 hover:bg-green-50 text-sm font-semibold py-3 px-4 transition-colors"
        >
          {/* WhatsApp icon */}
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
          {whatsappLabel}
        </a>
      </div>
    </aside>
  );
}
