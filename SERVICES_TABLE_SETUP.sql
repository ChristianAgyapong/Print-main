-- ============================================================
-- PrintCraft: Services Table Setup  (FIXED for Supabase UUID)
-- Run this ONCE in your Supabase SQL Editor
-- ============================================================

-- 1. Drop old attempt if needed (safe to run)
DROP TABLE IF EXISTS services;

-- 2. Create the services table
--    • id   = proper UUID primary key (Supabase standard)
--    • slug = the short routing key used in the app ("1" … "6")
CREATE TABLE services (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT        NOT NULL UNIQUE,   -- routing key e.g. "1","2"
  title            TEXT        NOT NULL,
  icon             TEXT        NOT NULL DEFAULT 'print',
  description      TEXT        NOT NULL DEFAULT '',
  color            TEXT        NOT NULL DEFAULT '#FF006E',
  long_description TEXT        NOT NULL DEFAULT '',
  items            JSONB       NOT NULL DEFAULT '[]',
  features         JSONB       NOT NULL DEFAULT '[]',
  pricing          JSONB       NOT NULL DEFAULT '[]',
  faqs             JSONB       NOT NULL DEFAULT '[]',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Row-Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read services
CREATE POLICY "Public read services"
  ON services FOR SELECT
  USING (true);

-- Only admin emails can write  (adjust to match your adminService.isAdmin list)
CREATE POLICY "Admin can insert services"
  ON services FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' IN ('admin@printcraft.com', 'owner@printcraft.com')
  );

CREATE POLICY "Admin can update services"
  ON services FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN ('admin@printcraft.com', 'owner@printcraft.com')
  );

CREATE POLICY "Admin can delete services"
  ON services FOR DELETE
  USING (
    auth.jwt() ->> 'email' IN ('admin@printcraft.com', 'owner@printcraft.com')
  );

-- 4. Auto-bump updated_at on every UPDATE
CREATE OR REPLACE FUNCTION update_services_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_services_timestamp();

-- 5. Seed with the 6 default services
--    ON CONFLICT DO NOTHING = safe to re-run without wiping edits
INSERT INTO services (slug, title, icon, description, color, long_description, items, features, pricing, faqs) VALUES

('1', 'Business Printing', 'briefcase',
 'Professional business cards, letterheads, and more',
 '#3B82F6',
 'Elevate your business presence with our professional printing services. From business cards that make a lasting impression to elegant letterheads that convey credibility, we deliver top-quality materials that represent your brand perfectly.',
 '["Business Cards","Letterheads","Envelopes","Folders"]',
 '[{"title":"Premium Paper Stock","description":"Choose from various premium paper options including matte, glossy, and textured finishes","icon":"layers"},{"title":"Custom Designs","description":"Work with our designers or upload your own design","icon":"brush"},{"title":"Fast Production","description":"Most orders ready in 2-3 business days","icon":"flash"},{"title":"Bulk Discounts","description":"Save more with larger quantity orders","icon":"pricetag"}]',
 '[{"quantity":"100 cards","price":"₵45.00"},{"quantity":"500 cards","price":"₵180.00"},{"quantity":"1000 cards","price":"₵320.00"}]',
 '[{"question":"What file format should I use?","answer":"We accept PDF, AI, EPS, and high-resolution PNG/JPG files."},{"question":"Can I see a proof before printing?","answer":"Yes! We provide digital proofs for all orders before production."},{"question":"What''s the turnaround time?","answer":"Standard turnaround is 2-3 business days. Rush options available."}]'),

('2', 'Marketing Materials', 'megaphone',
 'Eye-catching promotional materials for your brand',
 '#8B5CF6',
 'Make your marketing campaigns stand out with vibrant, professional print materials. Whether you need flyers for an event, brochures to showcase your products, or catalogs to display your full range, we''ve got you covered.',
 '["Flyers","Brochures","Catalogs","Postcards"]',
 '[{"title":"Vibrant Colors","description":"Full-color printing with accurate color matching","icon":"color-palette"},{"title":"Multiple Formats","description":"Various sizes and folding options available","icon":"resize"},{"title":"High-Quality Images","description":"Crisp, clear printing for photos and graphics","icon":"image"},{"title":"Distribution Ready","description":"Professional finishing for immediate use","icon":"checkmark-done"}]',
 '[{"quantity":"250 flyers","price":"₵85.00"},{"quantity":"500 flyers","price":"₵150.00"},{"quantity":"1000 flyers","price":"₵265.00"}]',
 '[{"question":"What paper weight do you use?","answer":"We offer 100lb, 130lb glossy, and 14pt cardstock options."},{"question":"Can you help with design?","answer":"Yes! Our design team can create custom designs for your materials."},{"question":"Do you offer mailing services?","answer":"Yes, we provide direct mail services for bulk orders."}]'),

('3', 'Large Format', 'resize',
 'Banners, posters, and signage in any size',
 '#EC4899',
 'Go big with our large format printing services. Perfect for trade shows, retail displays, outdoor advertising, and special events. We print on various materials to suit indoor and outdoor applications.',
 '["Banners","Posters","Wall Graphics","Vehicle Wraps"]',
 '[{"title":"Weather Resistant","description":"Durable materials for outdoor use","icon":"shield-checkmark"},{"title":"Custom Sizes","description":"Any size up to 10ft wide","icon":"expand"},{"title":"Multiple Materials","description":"Vinyl, fabric, mesh, and rigid substrates","icon":"apps"},{"title":"Installation Available","description":"Professional installation services offered","icon":"construct"}]',
 '[{"quantity":"2x4 ft banner","price":"₵120.00"},{"quantity":"3x6 ft banner","price":"₵240.00"},{"quantity":"4x8 ft banner","price":"₵350.00"}]',
 '[{"question":"Are these suitable for outdoor use?","answer":"Yes! We use UV-resistant inks and weatherproof materials."},{"question":"Can you add grommets or pole pockets?","answer":"Yes, we offer various finishing options for easy installation."},{"question":"How long do outdoor prints last?","answer":"With proper care, outdoor prints can last 3-5 years."}]'),

('4', 'Custom Apparel', 'shirt',
 'T-shirts, hoodies, and more with your design',
 '#10B981',
 'Create custom branded apparel for your team, event, or business. Choose from premium quality garments and multiple printing methods including screen printing, direct-to-garment, and embroidery.',
 '["T-Shirts","Hoodies","Caps","Tote Bags"]',
 '[{"title":"Quality Garments","description":"Premium brands like Gildan, Hanes, and Bella+Canvas","icon":"star"},{"title":"Multiple Print Methods","description":"Screen print, DTG, vinyl, and embroidery","icon":"print"},{"title":"No Minimums","description":"Order as few or as many as you need","icon":"infinite"},{"title":"Color Options","description":"Wide range of garment and print colors","icon":"color-filter"}]',
 '[{"quantity":"12 t-shirts","price":"₵180.00"},{"quantity":"24 t-shirts","price":"₵320.00"},{"quantity":"50 t-shirts","price":"₵600.00"}]',
 '[{"question":"What''s the difference between DTG and screen printing?","answer":"DTG is better for detailed designs and small orders. Screen printing is ideal for simple designs and bulk orders."},{"question":"Can I mix sizes in one order?","answer":"Yes! You can order multiple sizes at the same price tier."},{"question":"How should I care for printed apparel?","answer":"Wash inside-out in cold water, tumble dry low. Avoid bleach and ironing directly on prints."}]'),

('5', 'Photo Services', 'camera',
 'Professional photo printing and framing',
 '#F59E0B',
 'Preserve your precious memories with professional photo printing services. From standard prints to custom canvas art and beautifully designed photo books, we bring your photos to life with stunning clarity and color.',
 '["Photo Prints","Canvas Prints","Photo Books","Framing"]',
 '[{"title":"Professional Quality","description":"Lab-quality prints with accurate color reproduction","icon":"images"},{"title":"Multiple Surfaces","description":"Print on paper, canvas, metal, and acrylic","icon":"file-tray-full"},{"title":"Custom Framing","description":"Professional framing options available","icon":"square-outline"},{"title":"Photo Books","description":"Create custom albums and photo books","icon":"book"}]',
 '[{"quantity":"4x6 prints (25)","price":"₵45.00"},{"quantity":"16x20 canvas","price":"₵180.00"},{"quantity":"20-page photo book","price":"₵250.00"}]',
 '[{"question":"What resolution should my photos be?","answer":"For best results, use 300 DPI at the desired print size."},{"question":"Can you print from my phone?","answer":"Yes! Upload photos directly from your phone through our app."},{"question":"Do you offer color correction?","answer":"Yes, we provide basic color correction for all photo prints."}]'),

('6', 'Packaging', 'cube',
 'Custom boxes, labels, and packaging solutions',
 '#06B6D4',
 'Stand out on the shelf with custom packaging solutions. From product boxes to shipping labels, stickers to branded bags, we help you create packaging that protects your product and promotes your brand.',
 '["Boxes","Labels","Stickers","Bags"]',
 '[{"title":"Custom Die-Cutting","description":"Unique shapes and sizes for boxes and labels","icon":"cut"},{"title":"Various Materials","description":"Cardboard, kraft, vinyl, and premium papers","icon":"folder-open"},{"title":"Finishing Options","description":"Gloss, matte, spot UV, foil, and embossing","icon":"sparkles"},{"title":"Bulk Pricing","description":"Competitive pricing for large quantities","icon":"cash"}]',
 '[{"quantity":"100 labels","price":"₵35.00"},{"quantity":"250 stickers","price":"₵90.00"},{"quantity":"100 custom boxes","price":"₵450.00"}]',
 '[{"question":"What''s the minimum order quantity?","answer":"Minimums vary by product. Labels start at 25, boxes at 50."},{"question":"Can you create structural designs?","answer":"Yes! Our team can design custom box structures."},{"question":"Are your materials recyclable?","answer":"Yes, we offer eco-friendly and recyclable packaging options."}]')

ON CONFLICT (slug) DO NOTHING;

-- Done! Verify with:
-- SELECT slug, title, color FROM services ORDER BY slug;
