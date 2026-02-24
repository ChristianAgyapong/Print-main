import { supabase } from "./supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ServiceFeature {
    title: string;
    description: string;
    icon: string;
}

export interface ServicePricing {
    quantity: string;
    price: string;
}

export interface ServiceFAQ {
    question: string;
    answer: string;
}

export interface PrintService {
    id: string;
    title: string;
    icon: string;
    description: string;
    color: string;
    longDescription: string;
    items: string[];
    features: ServiceFeature[];
    pricing: ServicePricing[];
    faqs: ServiceFAQ[];
}

// ─── Supabase row → PrintService ─────────────────────────────────────────────

function rowToService(row: any): PrintService {
    return {
        id: row.slug,           // app routing uses slug ("1", "2" …)
        title: row.title,
        icon: row.icon,
        description: row.description,
        color: row.color,
        longDescription: row.long_description,
        items: row.items ?? [],
        features: row.features ?? [],
        pricing: row.pricing ?? [],
        faqs: row.faqs ?? [],
    };
}

// ─── Default fallback (used if Supabase table is empty or unreachable) ────────

export const DEFAULT_SERVICES: PrintService[] = [
    {
        id: "1",
        title: "Business Printing",
        icon: "briefcase",
        description: "Professional business cards, letterheads, and more",
        color: "#3B82F6",
        longDescription:
            "Elevate your business presence with our professional printing services. From business cards that make a lasting impression to elegant letterheads that convey credibility, we deliver top-quality materials that represent your brand perfectly.",
        items: ["Business Cards", "Letterheads", "Envelopes", "Folders"],
        features: [
            { title: "Premium Paper Stock", description: "Choose from various premium paper options including matte, glossy, and textured finishes", icon: "layers" },
            { title: "Custom Designs", description: "Work with our designers or upload your own design", icon: "brush" },
            { title: "Fast Production", description: "Most orders ready in 2-3 business days", icon: "flash" },
            { title: "Bulk Discounts", description: "Save more with larger quantity orders", icon: "pricetag" },
        ],
        pricing: [
            { quantity: "100 cards", price: "₵45.00" },
            { quantity: "500 cards", price: "₵180.00" },
            { quantity: "1000 cards", price: "₵320.00" },
        ],
        faqs: [
            { question: "What file format should I use?", answer: "We accept PDF, AI, EPS, and high-resolution PNG/JPG files." },
            { question: "Can I see a proof before printing?", answer: "Yes! We provide digital proofs for all orders before production." },
            { question: "What's the turnaround time?", answer: "Standard turnaround is 2-3 business days. Rush options available." },
        ],
    },
    {
        id: "2",
        title: "Marketing Materials",
        icon: "megaphone",
        description: "Eye-catching promotional materials for your brand",
        color: "#8B5CF6",
        longDescription:
            "Make your marketing campaigns stand out with vibrant, professional print materials. Whether you need flyers for an event, brochures to showcase your products, or catalogs to display your full range, we've got you covered.",
        items: ["Flyers", "Brochures", "Catalogs", "Postcards"],
        features: [
            { title: "Vibrant Colors", description: "Full-color printing with accurate color matching", icon: "color-palette" },
            { title: "Multiple Formats", description: "Various sizes and folding options available", icon: "resize" },
            { title: "High-Quality Images", description: "Crisp, clear printing for photos and graphics", icon: "image" },
            { title: "Distribution Ready", description: "Professional finishing for immediate use", icon: "checkmark-done" },
        ],
        pricing: [
            { quantity: "250 flyers", price: "₵85.00" },
            { quantity: "500 flyers", price: "₵150.00" },
            { quantity: "1000 flyers", price: "₵265.00" },
        ],
        faqs: [
            { question: "What paper weight do you use?", answer: "We offer 100lb, 130lb glossy, and 14pt cardstock options." },
            { question: "Can you help with design?", answer: "Yes! Our design team can create custom designs for your materials." },
            { question: "Do you offer mailing services?", answer: "Yes, we provide direct mail services for bulk orders." },
        ],
    },
    {
        id: "3",
        title: "Large Format",
        icon: "resize",
        description: "Banners, posters, and signage in any size",
        color: "#EC4899",
        longDescription:
            "Go big with our large format printing services. Perfect for trade shows, retail displays, outdoor advertising, and special events. We print on various materials to suit indoor and outdoor applications.",
        items: ["Banners", "Posters", "Wall Graphics", "Vehicle Wraps"],
        features: [
            { title: "Weather Resistant", description: "Durable materials for outdoor use", icon: "shield-checkmark" },
            { title: "Custom Sizes", description: "Any size up to 10ft wide", icon: "expand" },
            { title: "Multiple Materials", description: "Vinyl, fabric, mesh, and rigid substrates", icon: "apps" },
            { title: "Installation Available", description: "Professional installation services offered", icon: "construct" },
        ],
        pricing: [
            { quantity: "2x4 ft banner", price: "₵120.00" },
            { quantity: "3x6 ft banner", price: "₵240.00" },
            { quantity: "4x8 ft banner", price: "₵350.00" },
        ],
        faqs: [
            { question: "Are these suitable for outdoor use?", answer: "Yes! We use UV-resistant inks and weatherproof materials." },
            { question: "Can you add grommets or pole pockets?", answer: "Yes, we offer various finishing options for easy installation." },
            { question: "How long do outdoor prints last?", answer: "With proper care, outdoor prints can last 3-5 years." },
        ],
    },
    {
        id: "4",
        title: "Custom Apparel",
        icon: "shirt",
        description: "T-shirts, hoodies, and more with your design",
        color: "#10B981",
        longDescription:
            "Create custom branded apparel for your team, event, or business. Choose from premium quality garments and multiple printing methods including screen printing, direct-to-garment, and embroidery.",
        items: ["T-Shirts", "Hoodies", "Caps", "Tote Bags"],
        features: [
            { title: "Quality Garments", description: "Premium brands like Gildan, Hanes, and Bella+Canvas", icon: "star" },
            { title: "Multiple Print Methods", description: "Screen print, DTG, vinyl, and embroidery", icon: "print" },
            { title: "No Minimums", description: "Order as few or as many as you need", icon: "infinite" },
            { title: "Color Options", description: "Wide range of garment and print colors", icon: "color-filter" },
        ],
        pricing: [
            { quantity: "12 t-shirts", price: "₵180.00" },
            { quantity: "24 t-shirts", price: "₵320.00" },
            { quantity: "50 t-shirts", price: "₵600.00" },
        ],
        faqs: [
            { question: "What's the difference between DTG and screen printing?", answer: "DTG is better for detailed designs and small orders. Screen printing is ideal for simple designs and bulk orders." },
            { question: "Can I mix sizes in one order?", answer: "Yes! You can order multiple sizes at the same price tier." },
            { question: "How should I care for printed apparel?", answer: "Wash inside-out in cold water, tumble dry low. Avoid bleach and ironing directly on prints." },
        ],
    },
    {
        id: "5",
        title: "Photo Services",
        icon: "camera",
        description: "Professional photo printing and framing",
        color: "#F59E0B",
        longDescription:
            "Preserve your precious memories with professional photo printing services. From standard prints to custom canvas art and beautifully designed photo books, we bring your photos to life with stunning clarity and color.",
        items: ["Photo Prints", "Canvas Prints", "Photo Books", "Framing"],
        features: [
            { title: "Professional Quality", description: "Lab-quality prints with accurate color reproduction", icon: "images" },
            { title: "Multiple Surfaces", description: "Print on paper, canvas, metal, and acrylic", icon: "file-tray-full" },
            { title: "Custom Framing", description: "Professional framing options available", icon: "square-outline" },
            { title: "Photo Books", description: "Create custom albums and photo books", icon: "book" },
        ],
        pricing: [
            { quantity: "4x6 prints (25)", price: "₵45.00" },
            { quantity: "16x20 canvas", price: "₵180.00" },
            { quantity: "20-page photo book", price: "₵250.00" },
        ],
        faqs: [
            { question: "What resolution should my photos be?", answer: "For best results, use 300 DPI at the desired print size." },
            { question: "Can you print from my phone?", answer: "Yes! Upload photos directly from your phone through our app." },
            { question: "Do you offer color correction?", answer: "Yes, we provide basic color correction for all photo prints." },
        ],
    },
    {
        id: "6",
        title: "Packaging",
        icon: "cube",
        description: "Custom boxes, labels, and packaging solutions",
        color: "#06B6D4",
        longDescription:
            "Stand out on the shelf with custom packaging solutions. From product boxes to shipping labels, stickers to branded bags, we help you create packaging that protects your product and promotes your brand.",
        items: ["Boxes", "Labels", "Stickers", "Bags"],
        features: [
            { title: "Custom Die-Cutting", description: "Unique shapes and sizes for boxes and labels", icon: "cut" },
            { title: "Various Materials", description: "Cardboard, kraft, vinyl, and premium papers", icon: "folder-open" },
            { title: "Finishing Options", description: "Gloss, matte, spot UV, foil, and embossing", icon: "sparkles" },
            { title: "Bulk Pricing", description: "Competitive pricing for large quantities", icon: "cash" },
        ],
        pricing: [
            { quantity: "100 labels", price: "₵35.00" },
            { quantity: "250 stickers", price: "₵90.00" },
            { quantity: "100 custom boxes", price: "₵450.00" },
        ],
        faqs: [
            { question: "What's the minimum order quantity?", answer: "Minimums vary by product. Labels start at 25, boxes at 50." },
            { question: "Can you create structural designs?", answer: "Yes! Our team can design custom box structures." },
            { question: "Are your materials recyclable?", answer: "Yes, we offer eco-friendly and recyclable packaging options." },
        ],
    },
];

// ─── Services Data Service (Supabase-backed) ──────────────────────────────────

export const servicesDataService = {
    /**
     * Fetch all services from Supabase.
     * Falls back to DEFAULT_SERVICES if the table is empty or unreachable.
     */
    async getAll(): Promise<PrintService[]> {
        try {
            const { data, error } = await supabase
                .from("services")
                .select("*")
                .order("slug", { ascending: true });

            if (error) {
                console.warn("⚠️  services table error – using defaults:", error.message);
                return DEFAULT_SERVICES;
            }

            if (!data || data.length === 0) {
                console.warn("⚠️  services table is empty – using defaults");
                return DEFAULT_SERVICES;
            }

            return data.map(rowToService);
        } catch (err) {
            console.error("❌ getAll services failed:", err);
            return DEFAULT_SERVICES;
        }
    },

    /**
     * Fetch a single service by its slug (routing key e.g. "1", "2").
     */
    async getById(id: string): Promise<PrintService | null> {
        try {
            const { data, error } = await supabase
                .from("services")
                .select("*")
                .eq("slug", id)
                .single();

            if (error || !data) {
                // fallback to in-memory default for that id
                return DEFAULT_SERVICES.find((s) => s.id === id) ?? null;
            }

            return rowToService(data);
        } catch (err) {
            console.error("❌ getById service failed:", err);
            return DEFAULT_SERVICES.find((s) => s.id === id) ?? null;
        }
    },

    /**
     * Update a service by its slug.
     * Requires the currently-signed-in user to have an admin email
     * (enforced by Supabase RLS policies in SERVICES_TABLE_SETUP.sql).
     */
    async update(id: string, updates: Partial<PrintService>): Promise<boolean> {
        try {
            // Map camelCase → snake_case for the columns that differ
            const row: Record<string, any> = {};
            if (updates.title !== undefined) row.title = updates.title;
            if (updates.icon !== undefined) row.icon = updates.icon;
            if (updates.description !== undefined) row.description = updates.description;
            if (updates.color !== undefined) row.color = updates.color;
            if (updates.longDescription !== undefined) row.long_description = updates.longDescription;
            if (updates.items !== undefined) row.items = updates.items;
            if (updates.features !== undefined) row.features = updates.features;
            if (updates.pricing !== undefined) row.pricing = updates.pricing;
            if (updates.faqs !== undefined) row.faqs = updates.faqs;

            const { error } = await supabase
                .from("services")
                .update(row)
                .eq("slug", id);     // ← query by slug, not uuid id

            if (error) {
                console.error("❌ update service failed:", error.message);
                return false;
            }

            console.log(`✅ service slug=${id} updated in Supabase`);
            return true;
        } catch (err) {
            console.error("❌ update service error:", err);
            return false;
        }
    },

    /**
     * Re-seed the services table with the default data (upsert by slug).
     */
    async reset(): Promise<boolean> {
        try {
            const rows = DEFAULT_SERVICES.map((s) => ({
                slug: s.id,           // slug stores the routing key
                title: s.title,
                icon: s.icon,
                description: s.description,
                color: s.color,
                long_description: s.longDescription,
                items: s.items,
                features: s.features,
                pricing: s.pricing,
                faqs: s.faqs,
            }));

            const { error } = await supabase
                .from("services")
                .upsert(rows, { onConflict: "slug" });   // ← conflict on slug column

            if (error) {
                console.error("❌ reset services failed:", error.message);
                return false;
            }

            console.log("✅ services reset to defaults in Supabase");
            return true;
        } catch (err) {
            console.error("❌ reset services error:", err);
            return false;
        }
    },
};
