"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import FloatingButtons from "@/components/shop/FloatingButtons";
import type { ContactSections } from "@/lib/types/page-sections";

const METHOD_ICONS = [Phone, MessageCircle, Mail, MapPin];

const DEFAULT_METHODS = [
  {
    title: "Call Us",
    details: "0768378439",
    description: "Mon-Sat: 9AM-7PM",
    link: "tel:+254768378439",
    color: "from-gray-700 to-gray-900",
  },
  {
    title: "WhatsApp",
    details: "+254 758 313 512",
    description: "Quick responses, 24/7",
    link: "https://wa.me/254758313512",
    color: "from-green-500 to-green-600",
  },
  {
    title: "Email Us",
    details: "support@samsungstore.ke",
    description: "We reply within 24 hours",
    link: "mailto:support@samsungstore.ke",
    color: "from-purple-500 to-purple-600",
  },
  {
    title: "Visit Store",
    details: "Lotus Plaza 1st Floor",
    description: "Chiromo Lane 15",
    link: "https://maps.google.com",
    color: "from-orange-500 to-orange-600",
  },
];

type Props = {
  sections: ContactSections;
};

export function ContactContent({ sections }: Props) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const hero = sections.hero ?? {};
  const contactMethods = sections.contact_methods?.length
    ? sections.contact_methods
    : DEFAULT_METHODS;
  const formIntro = sections.form_intro ?? {};
  const storeHours = sections.store_hours ?? {};
  const location = sections.location ?? {};
  const faqs = sections.faqs ?? {};
  const faqItems = faqs.items ?? [];
  const whatsapp = sections.whatsapp_block ?? {};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="relative bg-black text-white py-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              {hero.title ?? "Get in Touch"}
            </h1>
            <p
              className="text-xl text-white/90 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html:
                  hero.subtitle ??
                  "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
              }}
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => {
              const Icon = METHOD_ICONS[index % METHOD_ICONS.length];
              return (
                <a
                  key={index}
                  href={method.link}
                  target={method.link.startsWith("http") ? "_blank" : undefined}
                  rel={
                    method.link.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div
                    className={`w-14 h-14 bg-linear-to-br ${method.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {method.title}
                  </h3>
                  <p className="text-gray-700 font-semibold mb-1">
                    {method.details}
                  </p>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {formIntro.title ?? "Send us a Message"}
              </h2>
              <p className="text-gray-600 mb-8">
                {formIntro.subtitle ??
                  "Fill out the form below and our team will get back to you within 24 hours."}
              </p>

              {submitted ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-600">
                    Thank you for contacting us. We&apos;ll get back to you
                    soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+254 700 123 456"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Subject *
                    </label>
                    <select
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a subject</option>
                      <option value="product-inquiry">Product Inquiry</option>
                      <option value="order-status">Order Status</option>
                      <option value="technical-support">
                        Technical Support
                      </option>
                      <option value="warranty">Warranty Claim</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-4 rounded-xl hover:bg-gray-800 transition-all font-semibold flex items-center justify-center space-x-2 shadow-lg"
                  >
                    <Send className="h-5 w-5" />
                    <span>Send Message</span>
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-8">
              <div className="bg-gray-50 rounded-2xl p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-black p-3 rounded-xl">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {storeHours.title ?? "Store Hours"}
                  </h3>
                </div>
                <div className="space-y-3">
                  {(storeHours.rows?.length
                    ? storeHours.rows
                    : [
                        {
                          days: "Monday - Saturday",
                          hours: "9:00 AM - 7:00 PM",
                        },
                        { days: "Sunday", hours: "10:00 AM - 6:00 PM" },
                      ]
                  ).map((row, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center py-2 border-b border-gray-200"
                    >
                      <span className="font-semibold text-gray-900">
                        {row.days}
                      </span>
                      <span className="text-gray-600">{row.hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-orange-600 p-3 rounded-xl">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {location.title ?? "Our Location"}
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      {location.name ?? "Samsung Phones Kenya"}
                    </p>
                    <p className="text-gray-600 whitespace-pre-line">
                      {location.address_lines ??
                        "Lotus Plaza 1st Floor\nChiromo Lane 15\nOpposite Club K1, Nairobi"}
                    </p>
                  </div>
                  <a
                    href={location.map_link ?? "https://maps.google.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all font-semibold"
                  >
                    {location.map_link_text ?? "Get Directions"}
                  </a>
                </div>
              </div>

              <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {whatsapp.title ?? "Need Immediate Help?"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {whatsapp.subtitle ??
                    "Chat with us on WhatsApp for instant support"}
                </p>
                <Link
                  href={whatsapp.link ?? "https://wa.me/254758313512"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl transition-all font-semibold"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>{whatsapp.btn_text ?? "Chat on WhatsApp"}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {faqs.section_title ?? "Frequently Asked Questions"}
            </h2>
            <p className="text-gray-600 text-lg">
              {faqs.section_subtitle ?? "Quick answers to common questions"}
            </p>
          </div>
          <div className="space-y-4">
            {faqItems.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              {faqs.cta_text ?? "Still have questions?"}
            </p>
            <a
              href="#contact-form"
              className="inline-block bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-all font-semibold"
            >
              {faqs.cta_btn ?? "Contact Us"}
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingButtons />
    </div>
  );
}
