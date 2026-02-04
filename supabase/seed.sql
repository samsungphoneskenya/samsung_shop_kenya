-- =====================================================
-- SAMSUNG STORE REAL SEED DATA WITH DESCRIPTIONS
-- =====================================================

TRUNCATE public.seo_metadata,
         public.product_images,
         public.products,
         public.categories
RESTART IDENTITY CASCADE;

-- =====================================================
-- CATEGORIES WITH DESCRIPTIONS
-- =====================================================

INSERT INTO public.categories (name,slug,description,status) VALUES
('Galaxy A Series','galaxy-a-series','Affordable Samsung smartphones offering excellent battery life, cameras and performance for everyday use.','published'),

('Samsung Smartphones','samsung-smartphones','Latest Samsung flagship phones, foldables, tablets and wearables including Galaxy S, Z and premium devices.','published'),

('Chargers & Adapters','chargers-adapters','Original Samsung fast charging adapters supporting Super Fast Charging 25W, 45W and 65W technologies.','published'),

('Cases & Covers','cases-covers','Protective Samsung cases including clear cases, silicone covers and rugged protection covers.','published'),

('Cables','cables','Official Samsung USB-C fast charging and data cables supporting high wattage charging and fast transfer speeds.','published'),

('Power Banks','power-banks','Samsung battery packs and portable chargers with fast charging and multi-device support.','published'),

('SmartTags','smarttags','Samsung SmartTag trackers to easily locate keys, bags and valuables using Galaxy Find Network.','published'),

('Accessories','accessories','Original Samsung accessories including earbuds, watches and connected ecosystem devices.','published');

-- =====================================================
-- PRODUCTS WITH DESCRIPTIONS
-- =====================================================

-- GALAXY A SERIES
INSERT INTO public.products (title,slug,description,price,sku,quantity,category_id,status)
SELECT 'GALAXY A06 64GB|4GB','galaxy-a06-64gb-4gb',
'Samsung Galaxy A06 entry-level smartphone featuring a large display, long-lasting battery and reliable performance for calls, WhatsApp and everyday apps.',
10248,'A057F/DS',0,id,'published'
FROM public.categories WHERE slug='galaxy-a-series';

INSERT INTO public.products (title,slug,description,price,sku,quantity,category_id,status)
SELECT 'GALAXY A06 128GB|4GB','galaxy-a06-128gb-4gb',
'Galaxy A06 with expanded 128GB storage allowing more photos, videos and apps while maintaining excellent battery endurance.',
12096,'A067F/DS',0,id,'published'
FROM public.categories WHERE slug='galaxy-a-series';

INSERT INTO public.products (title,slug,description,price,sku,quantity,category_id,status)
SELECT 'GALAXY A07 64GB|4GB','galaxy-a07-64gb-4gb',
'Samsung Galaxy A07 designed for everyday users needing a reliable smartphone with strong network reception and smooth Android experience.',
11200,'A067F64/DS',0,id,'published'
FROM public.categories WHERE slug='galaxy-a-series';

INSERT INTO public.products (title,slug,description,price,sku,quantity,category_id,status)
SELECT 'GALAXY A16 128GB|4GB','galaxy-a16-128gb-4gb',
'Galaxy A16 offers a modern design, improved cameras and balanced performance ideal for students and daily multitasking.',
16800,'A165F/DS',0,id,'published'
FROM public.categories WHERE slug='galaxy-a-series';

INSERT INTO public.products (title,slug,description,price,sku,quantity,category_id,status)
SELECT 'GALAXY A17 256GB|8GB','galaxy-a17-256gb-8gb',
'Powerful Galaxy A17 featuring large RAM and storage capacity suitable for gaming, heavy apps and long-term usage.',
30240,'A175F/DS',0,id,'published'
FROM public.categories WHERE slug='galaxy-a-series';


-- FLAGSHIP / PREMIUM
INSERT INTO public.products (title,slug,description,price,sku,quantity,category_id,status)
SELECT 'S25 ULTRA 512GB|12GB','s25-ultra-512gb-12gb',
'Samsung Galaxy S25 Ultra premium flagship with advanced AI camera system, S-Pen support and ultra-bright AMOLED display.',
147840,'S938BDS',0,id,'published'
FROM public.categories WHERE slug='samsung-smartphones';

INSERT INTO public.products (title,slug,description,price,sku,quantity,category_id,status)
SELECT 'Z FOLD 7 256GB|12GB','z-fold-7-256gb-12gb',
'Galaxy Z Fold 7 foldable smartphone combining tablet productivity with smartphone portability and multitasking capabilities.',
212800,'F966B/DS',0,id,'published'
FROM public.categories WHERE slug='samsung-smartphones';

INSERT INTO public.products (title,slug,description,price,sku,quantity,category_id,status)
SELECT 'WATCH 8 CLASSIC 46MM','watch-8-classic-46mm',
'Samsung Galaxy Watch 8 Classic smartwatch with health tracking, fitness monitoring and seamless Galaxy ecosystem integration.',
42336,'L500',0,id,'published'
FROM public.categories WHERE slug='samsung-smartphones';

INSERT INTO public.products (title,slug,description,price,sku,quantity,category_id,status)
SELECT 'GALAXY BUDS 3 PRO','galaxy-buds-3-pro',
'Samsung Galaxy Buds 3 Pro wireless earbuds with ANC noise cancellation and immersive Hi-Fi sound quality.',
16016,'R630',0,id,'published'
FROM public.categories WHERE slug='samsung-smartphones';


-- CHARGERS
INSERT INTO public.products (title,slug,description,price,sku,quantity,category_id,status)
SELECT '45W ADAPTER USB-C','45w-adapter-usb-c',
'Original Samsung 45W Super Fast Charging adapter for ultra-fast charging compatible with supported Galaxy devices.',
2688,'45W-USB-C',0,id,'published'
FROM public.categories WHERE slug='chargers-adapters';

INSERT INTO public.products (title,slug,description,price,sku,quantity,category_id,status)
SELECT '65W TRAVEL ADAPTER TRIO','65w-travel-adapter-trio',
'65W multi-port Samsung charger capable of charging phone, tablet and accessories simultaneously.',
4480,'65W-TRIO',0,id,'published'
FROM public.categories WHERE slug='chargers-adapters';


-- POWER BANK
INSERT INTO public.products (title,slug,description,price,sku,quantity,category_id,status)
SELECT '20000MAH 45W BATTERY PACK','20000mah-45w-battery-pack',
'High capacity Samsung 20000mAh battery pack with 45W fast charging for travel and heavy users.',
7280,'PB-20000-45W',0,id,'published'
FROM public.categories WHERE slug='power-banks';


-- CASE
INSERT INTO public.products (title,slug,description,price,sku,quantity,category_id,status)
SELECT 'S25 ULTRA CLEAR CASE','s25-ultra-clear-case',
'Transparent protective case designed for Galaxy S25 Ultra offering scratch protection while showing original design.',
1680,'CASE-S25U',0,id,'published'
FROM public.categories WHERE slug='cases-covers';


-- CABLE
INSERT INTO public.products (title,slug,description,price,sku,quantity,category_id,status)
SELECT 'USB-C TO CABLE 5A 1M','usb-c-to-cable-5a-1m',
'Durable Samsung USB-C cable supporting high wattage fast charging and fast data transfer.',
2016,'CABLE-5A',0,id,'published'
FROM public.categories WHERE slug='cables';


-- SMARTTAG
INSERT INTO public.products (title,slug,description,price,sku,quantity,category_id,status)
SELECT 'SMART TAG 2 4PACK','smart-tag-2-4pack',
'Samsung SmartTag 2 trackers bundle for locating keys, luggage and valuables using Galaxy Find Network.',
8064,'TAG2-4',0,id,'published'
FROM public.categories WHERE slug='smarttags';
