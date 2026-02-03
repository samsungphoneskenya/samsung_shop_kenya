"use client";

import { useState } from "react";

type SchemaGeneratorProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entityData: any;
};

export function SchemaGenerator({ entityData }: SchemaGeneratorProps) {
  const [schemaType, setSchemaType] = useState<
    "Product" | "Organization" | "WebSite" | "Article" | "FAQPage"
  >("Product");
  const [schema, setSchema] = useState("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateProductSchema = (product: any) => {
    const primaryImage =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      product?.images?.find((img: any) => img.is_primary) ||
      product?.images?.[0];

    return JSON.stringify(
      {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: product.title,
        image: primaryImage?.url || "",
        description:
          product.description || product.seo_metadata?.meta_description || "",
        sku: product.sku || "",
        brand: {
          "@type": "Brand",
          name: "Your Brand Name",
        },
        offers: {
          "@type": "Offer",
          url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
          priceCurrency: "USD",
          price: product.price,
          priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          itemCondition: "https://schema.org/NewCondition",
          availability:
            product.quantity > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
        },
      },
      null,
      2
    );
  };

  const generateOrganizationSchema = () => {
    return JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Your Company Name",
        url: process.env.NEXT_PUBLIC_APP_URL,
        logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+1-XXX-XXX-XXXX",
          contactType: "customer service",
          email: "support@yourcompany.com",
        },
        sameAs: [
          "https://www.facebook.com/yourcompany",
          "https://twitter.com/yourcompany",
          "https://www.instagram.com/yourcompany",
        ],
      },
      null,
      2
    );
  };

  const generateWebSiteSchema = () => {
    return JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Your Site Name",
        url: process.env.NEXT_PUBLIC_APP_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      null,
      2
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateArticleSchema = (page: any) => {
    return JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: page?.title || "Article Title",
        description:
          page?.seo_metadata?.meta_description ||
          page?.content?.substring(0, 160) ||
          "",
        author: {
          "@type": "Person",
          name: "Author Name",
        },
        publisher: {
          "@type": "Organization",
          name: "Your Company",
          logo: {
            "@type": "ImageObject",
            url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
          },
        },
        datePublished: page?.created_at || new Date().toISOString(),
        dateModified: page?.updated_at || new Date().toISOString(),
      },
      null,
      2
    );
  };

  const generateFAQSchema = () => {
    return JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Question 1?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Answer to question 1.",
            },
          },
          {
            "@type": "Question",
            name: "Question 2?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Answer to question 2.",
            },
          },
        ],
      },
      null,
      2
    );
  };

  const handleGenerate = () => {
    let generated = "";

    switch (schemaType) {
      case "Product":
        if (entityData && entityData.price) {
          generated = generateProductSchema(entityData);
        } else {
          generated = "// Select a product to generate schema";
        }
        break;
      case "Organization":
        generated = generateOrganizationSchema();
        break;
      case "WebSite":
        generated = generateWebSiteSchema();
        break;
      case "Article":
        if (entityData) {
          generated = generateArticleSchema(entityData);
        } else {
          generated = "// Select a page to generate schema";
        }
        break;
      case "FAQPage":
        generated = generateFAQSchema();
        break;
    }

    setSchema(generated);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(schema);
    alert("Schema copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              What is Schema Markup?
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Schema markup (JSON-LD) helps search engines understand your
                content and display rich results like star ratings, prices, and
                availability in search results.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schema Type Selection */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Select Schema Type
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              onClick={() => setSchemaType("Product")}
              className={`relative rounded-lg border p-4 text-left ${
                schemaType === "Product"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <h4 className="text-sm font-medium text-gray-900">Product</h4>
              <p className="text-xs text-gray-500 mt-1">
                For e-commerce products with price, availability, reviews
              </p>
            </button>

            <button
              onClick={() => setSchemaType("Organization")}
              className={`relative rounded-lg border p-4 text-left ${
                schemaType === "Organization"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <h4 className="text-sm font-medium text-gray-900">
                Organization
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                For company information, logo, contact details
              </p>
            </button>

            <button
              onClick={() => setSchemaType("WebSite")}
              className={`relative rounded-lg border p-4 text-left ${
                schemaType === "WebSite"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <h4 className="text-sm font-medium text-gray-900">WebSite</h4>
              <p className="text-xs text-gray-500 mt-1">
                For site-wide search box in search results
              </p>
            </button>

            <button
              onClick={() => setSchemaType("Article")}
              className={`relative rounded-lg border p-4 text-left ${
                schemaType === "Article"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <h4 className="text-sm font-medium text-gray-900">Article</h4>
              <p className="text-xs text-gray-500 mt-1">
                For blog posts and articles
              </p>
            </button>

            <button
              onClick={() => setSchemaType("FAQPage")}
              className={`relative rounded-lg border p-4 text-left ${
                schemaType === "FAQPage"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <h4 className="text-sm font-medium text-gray-900">FAQ Page</h4>
              <p className="text-xs text-gray-500 mt-1">
                For frequently asked questions pages
              </p>
            </button>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGenerate}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Generate Schema
            </button>
          </div>
        </div>
      </div>

      {/* Generated Schema */}
      {schema && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Generated JSON-LD
              </h3>
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
              >
                Copy to Clipboard
              </button>
            </div>

            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{schema}</code>
            </pre>

            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    How to implement
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Add this JSON-LD script to your page&apos;s &lt;head&gt;
                      section or update the structured_data field in the SEO
                      metadata.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testing Tools */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Testing Tools
          </h3>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Google Rich Results Test
              </h4>
              <a
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Test your schema markup →
              </a>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Schema Markup Validator
              </h4>
              <a
                href="https://validator.schema.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Validate your JSON-LD →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
