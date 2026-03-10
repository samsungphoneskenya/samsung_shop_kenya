export default function SchemaMarkup() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    name: "Samsung Official Website Kenya",
    alternateName: "Samsung Kenya Online Store",
    url: "https://samsungphones.co.ke",
    logo: "https://samsungphones.co.ke/images/logo.png",
    image: "https://samsungphones.co.ke/images/logo.png",
    description:
      "Authorized Samsung dealer providing original smartphones, tablets, and wearables with official manufacturer warranty in Kenya.",
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Lotus Plaza 1st Floor, Chiromo Lane 15, Opposite Club K1, Nairobi",
      addressLocality: "Nairobi",
      addressCountry: "KE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "-1.286389",
      longitude: "36.817223",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+254-704-381982",
      contactType: "sales",
      areaServed: "KE",
      availableLanguage: "English",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "08:00",
      closes: "20:00",
    },
    sameAs: [
      "https://www.facebook.com/SamsungKenya",
      "https://www.instagram.com/samsungkenya",
    ],
    brand: {
      "@type": "Brand",
      name: "Samsung",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
