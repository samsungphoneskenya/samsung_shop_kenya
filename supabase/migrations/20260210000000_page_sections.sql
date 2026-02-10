-- =====================================================
-- PAGE SECTIONS: Dynamic content for fixed site pages
-- =====================================================
-- Adds sections JSONB to pages and seeds home, about-us, contact-us
-- =====================================================

-- Add sections column (JSONB for flexible section content)
ALTER TABLE pages
ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '{}';

-- Create index for section key lookups if needed
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);

-- =====================================================
-- SEED FIXED SITE PAGES (upsert by slug)
-- =====================================================

-- Home page (slug: home) – used by /
INSERT INTO pages (id, title, slug, content, excerpt, template, meta_title, meta_description, status, sections)
VALUES (
  gen_random_uuid(),
  'Home',
  'home',
  NULL,
  'Samsung Online Store - Latest phones and accessories',
  'home',
  'Samsung Phones Kenya | Official Store',
  'Shop the latest Samsung smartphones, tablets, and accessories in Kenya. Authentic products, best prices.',
  'published',
  '{
    "hero": {
      "heading": "Welcome to our Samsung Online Store!",
      "heading_highlight": "Samsung",
      "subtext": "Experience the power of innovation with the latest Samsung smartphones and accessories. From cutting-edge Galaxy devices to smart accessories, we have everything you need to stay connected and productive.",
      "cta_primary_text": "Shop Now",
      "cta_primary_href": "/shop",
      "cta_secondary_text": "About Us",
      "cta_secondary_href": "/about-us",
      "image_url": "/images/products/s25.jpg",
      "image_alt": "Galaxy S25 Ultra",
      "badge_text": "Save up to",
      "badge_value": "30% OFF",
      "stats": [
        { "value": "500+", "label": "Products" },
        { "value": "50K+", "label": "Happy Customers" },
        { "value": "4.9★", "label": "Rating" }
      ]
    }
  }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  template = EXCLUDED.template,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  sections = CASE WHEN pages.sections IS NULL OR pages.sections = '{}'::jsonb THEN EXCLUDED.sections ELSE pages.sections END;

-- About Us page (slug: about-us)
INSERT INTO pages (id, title, slug, content, excerpt, template, meta_title, meta_description, status, sections)
VALUES (
  gen_random_uuid(),
  'About Us',
  'about-us',
  NULL,
  'Your trusted Samsung retailer in Kenya',
  'about',
  'About Samsung Phones Kenya',
  'Learn about Samsung Phones Kenya - trusted for authentic Samsung smartphones, tablets, and accessories.',
  'published',
  '{
    "hero": {
      "title": "About Samsung Phones Kenya",
      "subtitle": "Your trusted destination for authentic Samsung smartphones, tablets, wearables, and accessories in Kenya."
    },
    "stats": [
      { "number": "50K+", "label": "Happy Customers" },
      { "number": "500+", "label": "Products Available" },
      { "number": "5 Years", "label": "In Business" },
      { "number": "4.9★", "label": "Customer Rating" }
    ],
    "story": {
      "title": "Our Story",
      "paragraphs": [
        "Founded in 2019, Samsung Phones Kenya began with a simple mission: to make authentic Samsung products accessible to everyone across Kenya. What started as a small shop in Nairobi has grown into one of the most trusted Samsung retailers in the country.",
        "We understand the importance of technology in today''s world. Whether you''re a professional, student, or tech enthusiast, we believe everyone deserves access to quality Samsung products that enhance their daily lives.",
        "Our commitment to authenticity, competitive pricing, and exceptional customer service has earned us the trust of over 50,000 satisfied customers. We''re not just selling products; we''re building lasting relationships with our community.",
        "Today, we continue to expand our offerings, bringing you the latest Samsung innovations while maintaining the personalized service that our customers love."
      ],
      "image_url": "/images/products/s25.jpg",
      "image_alt": "Samsung Phones",
      "caption_title": "Since 2019",
      "caption_subtitle": "Serving Kenya with Excellence"
    },
    "values": {
      "section_title": "Why Choose Us",
      "section_subtitle": "We''re committed to providing the best shopping experience for Samsung products in Kenya",
      "items": [
        { "title": "Quality Products", "description": "We offer only authentic Samsung products with official warranties and quality guarantees.", "color": "from-gray-700 to-gray-900" },
        { "title": "Customer First", "description": "Your satisfaction is our priority. We provide exceptional customer service and support.", "color": "from-purple-500 to-purple-600" },
        { "title": "Best Prices", "description": "Competitive pricing with regular deals and discounts to give you the best value.", "color": "from-green-500 to-green-600" },
        { "title": "Trusted Service", "description": "Over 50,000 satisfied customers trust us for their Samsung product needs.", "color": "from-red-500 to-red-600" },
        { "title": "Secure Shopping", "description": "Safe and secure payment options with buyer protection on all purchases.", "color": "from-orange-500 to-orange-600" },
        { "title": "Fast Delivery", "description": "Quick and reliable delivery across Kenya with free shipping on orders over KES 15,000.", "color": "from-yellow-500 to-yellow-600" }
      ]
    },
    "visit_us": {
      "title": "Visit Our Store",
      "address_label": "Address",
      "address_lines": "Lotus Plaza 1st Floor\nChiromo Lane 15\nOpposite Club K1, Nairobi",
      "hours_label": "Hours",
      "hours_lines": "Mon-Sat: 9AM - 7PM\nSun: 10AM - 6PM",
      "contact_label": "Contact",
      "contact_lines": "0768378439\nsupport@samsungstore.ke",
      "directions_title": "Get Directions",
      "directions_text": "We''re located in the heart of Westlands, easily accessible by public transport or car.",
      "directions_btn": "Open in Maps",
      "map_link": "https://maps.google.com"
    }
  }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  template = EXCLUDED.template,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  sections = CASE WHEN pages.sections IS NULL OR pages.sections = '{}'::jsonb THEN EXCLUDED.sections ELSE pages.sections END;

-- Contact Us page (slug: contact-us)
INSERT INTO pages (id, title, slug, content, excerpt, template, meta_title, meta_description, status, sections)
VALUES (
  gen_random_uuid(),
  'Contact Us',
  'contact-us',
  NULL,
  'Get in touch with Samsung Phones Kenya',
  'contact',
  'Contact Us | Samsung Phones Kenya',
  'Contact Samsung Phones Kenya. Call, WhatsApp, email or visit our store in Nairobi.',
  'published',
  '{
    "hero": {
      "title": "Get in Touch",
      "subtitle": "Have questions? We''d love to hear from you. Send us a message and we''ll respond as soon as possible."
    },
    "contact_methods": [
      { "title": "Call Us", "details": "0768378439", "description": "Mon-Sat: 9AM-7PM, Sun: 10AM-6PM", "link": "tel:+254768378439", "color": "from-gray-700 to-gray-900" },
      { "title": "WhatsApp", "details": "+254 758 313 512", "description": "Quick responses, 24/7", "link": "https://wa.me/254758313512", "color": "from-green-500 to-green-600" },
      { "title": "Email Us", "details": "support@samsungstore.ke", "description": "We reply within 24 hours", "link": "mailto:support@samsungstore.ke", "color": "from-purple-500 to-purple-600" },
      { "title": "Visit Store", "details": "Lotus Plaza 1st Floor", "description": "Chiromo Lane 15, Opposite Club K1", "link": "https://maps.google.com", "color": "from-orange-500 to-orange-600" }
    ],
    "form_intro": {
      "title": "Send us a Message",
      "subtitle": "Fill out the form below and our team will get back to you within 24 hours."
    },
    "store_hours": {
      "title": "Store Hours",
      "rows": [
        { "days": "Monday - Saturday", "hours": "9:00 AM - 7:00 PM" },
        { "days": "Sunday", "hours": "10:00 AM - 6:00 PM" }
      ]
    },
    "location": {
      "title": "Our Location",
      "name": "Samsung Phones Kenya",
      "address_lines": "Lotus Plaza 1st Floor\nChiromo Lane 15\nOpposite Club K1, Nairobi",
      "map_link_text": "Get Directions",
      "map_link": "https://maps.google.com"
    },
    "faqs": {
      "section_title": "Frequently Asked Questions",
      "section_subtitle": "Quick answers to common questions",
      "items": [
        { "question": "What are your store hours?", "answer": "We are open Monday to Saturday from 9AM to 7PM, and Sunday from 10AM to 6PM." },
        { "question": "Do you offer warranty on products?", "answer": "Yes, all our products come with official Samsung warranty. Warranty period varies by product." },
        { "question": "Can I return or exchange a product?", "answer": "Yes, we offer a 30-day return policy for unopened products in original condition." },
        { "question": "Do you deliver outside Nairobi?", "answer": "Yes, we deliver nationwide. Delivery time and cost vary by location." }
      ],
      "cta_text": "Still have questions?",
      "cta_btn": "Contact Us"
    },
    "whatsapp_block": {
      "title": "Need Immediate Help?",
      "subtitle": "Chat with us on WhatsApp for instant support",
      "btn_text": "Chat on WhatsApp",
      "link": "https://wa.me/254758313512"
    }
  }'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  template = EXCLUDED.template,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  sections = CASE WHEN pages.sections IS NULL OR pages.sections = '{}'::jsonb THEN EXCLUDED.sections ELSE pages.sections END;
