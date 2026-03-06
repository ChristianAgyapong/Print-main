import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const { width } = Dimensions.get("window");

// Service data
const serviceData: { [key: string]: any } = {
  "1": {
    id: "1",
    title: "Business Printing",
    icon: "briefcase",
    description: "Professional business cards, letterheads, and more",
    color: "#3B82F6",
    items: ["Business Cards", "Letterheads", "Envelopes", "Folders"],
    longDescription:
      "Elevate your business presence with our professional printing services. From business cards that make a lasting impression to elegant letterheads that convey credibility, we deliver top-quality materials that represent your brand perfectly.",
    features: [
      {
        title: "Premium Paper Stock",
        description:
          "Choose from various premium paper options including matte, glossy, and textured finishes",
        icon: "layers",
      },
      {
        title: "Custom Designs",
        description: "Work with our designers or upload your own design",
        icon: "brush",
      },
      {
        title: "Fast Production",
        description: "Most orders ready in 2-3 business days",
        icon: "flash",
      },
      {
        title: "Bulk Discounts",
        description: "Save more with larger quantity orders",
        icon: "pricetag",
      },
    ],
    pricing: [
      { quantity: "100 cards", price: "₵45.00" },
      { quantity: "500 cards", price: "₵180.00" },
      { quantity: "1000 cards", price: "₵320.00" },
    ],
    faqs: [
      {
        question: "What file format should I use?",
        answer: "We accept PDF, AI, EPS, and high-resolution PNG/JPG files.",
      },
      {
        question: "Can I see a proof before printing?",
        answer:
          "Yes! We provide digital proofs for all orders before production.",
      },
      {
        question: "What's the turnaround time?",
        answer:
          "Standard turnaround is 2-3 business days. Rush options available.",
      },
    ],
  },
  "2": {
    id: "2",
    title: "Marketing Materials",
    icon: "megaphone",
    description: "Eye-catching promotional materials for your brand",
    color: "#8B5CF6",
    items: ["Flyers", "Brochures", "Catalogs", "Postcards"],
    longDescription:
      "Make your marketing campaigns stand out with vibrant, professional print materials. Whether you need flyers for an event, brochures to showcase your products, or catalogs to display your full range, we've got you covered.",
    features: [
      {
        title: "Vibrant Colors",
        description: "Full-color printing with accurate color matching",
        icon: "color-palette",
      },
      {
        title: "Multiple Formats",
        description: "Various sizes and folding options available",
        icon: "resize",
      },
      {
        title: "High-Quality Images",
        description: "Crisp, clear printing for photos and graphics",
        icon: "image",
      },
      {
        title: "Distribution Ready",
        description: "Professional finishing for immediate use",
        icon: "checkmark-done",
      },
    ],
    pricing: [
      { quantity: "250 flyers", price: "₵85.00" },
      { quantity: "500 flyers", price: "₵150.00" },
      { quantity: "1000 flyers", price: "₵265.00" },
    ],
    faqs: [
      {
        question: "What paper weight do you use?",
        answer: "We offer 100lb, 130lb glossy, and 14pt cardstock options.",
      },
      {
        question: "Can you help with design?",
        answer:
          "Yes! Our design team can create custom designs for your materials.",
      },
      {
        question: "Do you offer mailing services?",
        answer: "Yes, we provide direct mail services for bulk orders.",
      },
    ],
  },
  "3": {
    id: "3",
    title: "Large Format",
    icon: "resize",
    description: "Banners, posters, and signage in any size",
    color: "#EC4899",
    items: ["Banners", "Posters", "Wall Graphics", "Vehicle Wraps"],
    longDescription:
      "Go big with our large format printing services. Perfect for trade shows, retail displays, outdoor advertising, and special events. We print on various materials to suit indoor and outdoor applications.",
    features: [
      {
        title: "Weather Resistant",
        description: "Durable materials for outdoor use",
        icon: "shield-checkmark",
      },
      {
        title: "Custom Sizes",
        description: "Any size up to 10ft wide",
        icon: "expand",
      },
      {
        title: "Multiple Materials",
        description: "Vinyl, fabric, mesh, and rigid substrates",
        icon: "apps",
      },
      {
        title: "Installation Available",
        description: "Professional installation services offered",
        icon: "construct",
      },
    ],
    pricing: [
      { quantity: "2x4 ft banner", price: "₵120.00" },
      { quantity: "3x6 ft banner", price: "₵240.00" },
      { quantity: "4x8 ft banner", price: "₵350.00" },
    ],
    faqs: [
      {
        question: "Are these suitable for outdoor use?",
        answer: "Yes! We use UV-resistant inks and weatherproof materials.",
      },
      {
        question: "Can you add grommets or pole pockets?",
        answer:
          "Yes, we offer various finishing options for easy installation.",
      },
      {
        question: "How long do outdoor prints last?",
        answer: "With proper care, outdoor prints can last 3-5 years.",
      },
    ],
  },
  "4": {
    id: "4",
    title: "Custom Apparel",
    icon: "shirt",
    description: "T-shirts, hoodies, and more with your design",
    color: "#10B981",
    items: ["T-Shirts", "Hoodies", "Caps", "Tote Bags"],
    longDescription:
      "Create custom branded apparel for your team, event, or business. Choose from premium quality garments and multiple printing methods including screen printing, direct-to-garment, and embroidery.",
    features: [
      {
        title: "Quality Garments",
        description: "Premium brands like Gildan, Hanes, and Bella+Canvas",
        icon: "star",
      },
      {
        title: "Multiple Print Methods",
        description: "Screen print, DTG, vinyl, and embroidery",
        icon: "print",
      },
      {
        title: "No Minimums",
        description: "Order as few or as many as you need",
        icon: "infinite",
      },
      {
        title: "Color Options",
        description: "Wide range of garment and print colors",
        icon: "color-filter",
      },
    ],
    pricing: [
      { quantity: "12 t-shirts", price: "₵180.00" },
      { quantity: "24 t-shirts", price: "₵320.00" },
      { quantity: "50 t-shirts", price: "₵600.00" },
    ],
    faqs: [
      {
        question: "What's the difference between DTG and screen printing?",
        answer:
          "DTG is better for detailed designs and small orders. Screen printing is ideal for simple designs and bulk orders.",
      },
      {
        question: "Can I mix sizes in one order?",
        answer: "Yes! You can order multiple sizes at the same price tier.",
      },
      {
        question: "How should I care for printed apparel?",
        answer:
          "Wash inside-out in cold water, tumble dry low. Avoid bleach and ironing directly on prints.",
      },
    ],
  },
  "5": {
    id: "5",
    title: "Photo Services",
    icon: "camera",
    description: "Professional photo printing and framing",
    color: "#F59E0B",
    items: ["Photo Prints", "Canvas Prints", "Photo Books", "Framing"],
    longDescription:
      "Preserve your precious memories with professional photo printing services. From standard prints to custom canvas art and beautifully designed photo books, we bring your photos to life with stunning clarity and color.",
    features: [
      {
        title: "Professional Quality",
        description: "Lab-quality prints with accurate color reproduction",
        icon: "images",
      },
      {
        title: "Multiple Surfaces",
        description: "Print on paper, canvas, metal, and acrylic",
        icon: "file-tray-full",
      },
      {
        title: "Custom Framing",
        description: "Professional framing options available",
        icon: "square-outline",
      },
      {
        title: "Photo Books",
        description: "Create custom albums and photo books",
        icon: "book",
      },
    ],
    pricing: [
      { quantity: "4x6 prints (25)", price: "₵45.00" },
      { quantity: "16x20 canvas", price: "₵180.00" },
      { quantity: "20-page photo book", price: "₵250.00" },
    ],
    faqs: [
      {
        question: "What resolution should my photos be?",
        answer: "For best results, use 300 DPI at the desired print size.",
      },
      {
        question: "Can you print from my phone?",
        answer: "Yes! Upload photos directly from your phone through our app.",
      },
      {
        question: "Do you offer color correction?",
        answer: "Yes, we provide basic color correction for all photo prints.",
      },
    ],
  },
  "6": {
    id: "6",
    title: "Packaging",
    icon: "cube",
    description: "Custom boxes, labels, and packaging solutions",
    color: "#06B6D4",
    items: ["Boxes", "Labels", "Stickers", "Bags"],
    longDescription:
      "Stand out on the shelf with custom packaging solutions. From product boxes to shipping labels, stickers to branded bags, we help you create packaging that protects your product and promotes your brand.",
    features: [
      {
        title: "Custom Die-Cutting",
        description: "Unique shapes and sizes for boxes and labels",
        icon: "cut",
      },
      {
        title: "Various Materials",
        description: "Cardboard, kraft, vinyl, and premium papers",
        icon: "folder-open",
      },
      {
        title: "Finishing Options",
        description: "Gloss, matte, spot UV, foil, and embossing",
        icon: "sparkles",
      },
      {
        title: "Bulk Pricing",
        description: "Competitive pricing for large quantities",
        icon: "cash",
      },
    ],
    pricing: [
      { quantity: "100 labels", price: "₵35.00" },
      { quantity: "250 stickers", price: "₵90.00" },
      { quantity: "100 custom boxes", price: "₵450.00" },
    ],
    faqs: [
      {
        question: "What's the minimum order quantity?",
        answer: "Minimums vary by product. Labels start at 25, boxes at 50.",
      },
      {
        question: "Can you create structural designs?",
        answer: "Yes! Our team can design custom box structures.",
      },
      {
        question: "Are your materials recyclable?",
        answer: "Yes, we offer eco-friendly and recyclable packaging options.",
      },
    ],
  },
};

export default function ServiceDetailScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const service = serviceData[id as string];

  if (!service) {
    return (
      <View style={styles.errorContainer}>
        <Text>Service not found</Text>
      </View>
    );
  }

  const dynamicStyles = {
    container: {
      backgroundColor: colors.background,
    },
    backButton: {
      backgroundColor: colors.card,
    },
    sectionTitle: {
      color: colors.text,
    },
    sectionContent: {
      color: colors.textSecondary,
    },
    featureCard: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
    },
    featureTitle: {
      color: colors.text,
    },
    featureDescription: {
      color: colors.textSecondary,
    },
    pricingCard: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
    },
    pricingQuantity: {
      color: colors.text,
    },
    pricingPrice: {
      color: colors.text,
    },
    faqCard: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
    },
    faqQuestion: {
      color: colors.text,
    },
    faqAnswer: {
      color: colors.textSecondary,
    },
  };

  return (
    <>
      <StatusBar style={colors.statusBarStyle} />
      <ScrollView
        style={[styles.container, dynamicStyles.container]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[service.color, service.color + "CC"]}
          style={styles.hero}
        >
          <TouchableOpacity
            style={[styles.backButton, dynamicStyles.backButton]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <View style={styles.heroIconContainer}>
              <Ionicons name={service.icon as any} size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>{service.title}</Text>
            <Text style={styles.heroSubtitle}>{service.description}</Text>
          </View>
        </LinearGradient>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            About This Service
          </Text>
          <Text style={[styles.sectionContent, dynamicStyles.sectionContent]}>
            {service.longDescription}
          </Text>
        </View>

        {/* Items Offered */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            What We Offer
          </Text>
          <View style={styles.itemsContainer}>
            {service.items.map((item: string, index: number) => (
              <View
                key={index}
                style={[
                  styles.itemTag,
                  { backgroundColor: service.color + "20" },
                ]}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={service.color}
                />
                <Text style={[styles.itemText, { color: service.color }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            Key Features
          </Text>
          <View style={styles.featuresGrid}>
            {service.features.map((feature: any, index: number) => (
              <View
                key={index}
                style={[styles.featureCard, dynamicStyles.featureCard]}
              >
                <View
                  style={[
                    styles.featureIconContainer,
                    { backgroundColor: service.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={feature.icon as any}
                    size={24}
                    color={service.color}
                  />
                </View>
                <Text style={[styles.featureTitle, dynamicStyles.featureTitle]}>
                  {feature.title}
                </Text>
                <Text
                  style={[
                    styles.featureDescription,
                    dynamicStyles.featureDescription,
                  ]}
                >
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            Sample Pricing
          </Text>
          {service.pricing.map((price: any, index: number) => (
            <View
              key={index}
              style={[styles.pricingCard, dynamicStyles.pricingCard]}
            >
              <View style={styles.pricingLeft}>
                <Ionicons
                  name="pricetag"
                  size={20}
                  color={service.color}
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={[
                    styles.pricingQuantity,
                    dynamicStyles.pricingQuantity,
                  ]}
                >
                  {price.quantity}
                </Text>
              </View>
              <Text style={[styles.pricingPrice, dynamicStyles.pricingPrice]}>
                {price.price}
              </Text>
            </View>
          ))}
          <Text style={styles.pricingNote}>
            * Prices may vary based on specifications and customization options
          </Text>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            Frequently Asked Questions
          </Text>
          {service.faqs.map((faq: any, index: number) => (
            <View key={index} style={[styles.faqCard, dynamicStyles.faqCard]}>
              <View style={styles.faqHeader}>
                <Ionicons name="help-circle" size={20} color={service.color} />
                <Text style={[styles.faqQuestion, dynamicStyles.faqQuestion]}>
                  {faq.question}
                </Text>
              </View>
              <Text style={[styles.faqAnswer, dynamicStyles.faqAnswer]}>
                {faq.answer}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[styles.ctaButton, { backgroundColor: service.color }]}
            onPress={() => router.push("/" as any)}
          >
            <Ionicons name="cart" size={20} color="#FFFFFF" />
            <Text style={styles.ctaButtonText}>Browse Products</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ctaButtonOutline, { borderColor: service.color }]}
            onPress={() => router.push("/help-center")}
          >
            <Ionicons name="chatbubble" size={20} color={service.color} />
            <Text
              style={[styles.ctaButtonOutlineText, { color: service.color }]}
            >
              Get a Quote
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  hero: {
    paddingTop: 50,
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  heroContent: {
    alignItems: "center",
    marginTop: 20,
  },
  heroIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.95)",
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  sectionContent: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 24,
  },
  itemsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  itemTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  itemText: {
    fontSize: 14,
    fontWeight: "600",
  },
  featuresGrid: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
    flex: 1,
  },
  featureDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 19,
    flex: 1,
  },
  pricingCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
  },
  pricingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  pricingQuantity: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  pricingPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  pricingNote: {
    fontSize: 12,
    color: "#9CA3AF",
    fontStyle: "italic",
    marginTop: 8,
  },
  faqCard: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 21,
  },
  ctaSection: {
    paddingHorizontal: 20,
    marginTop: 32,
    gap: 12,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF006E",
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  ctaButtonOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    gap: 10,
  },
  ctaButtonOutlineText: {
    fontSize: 17,
    fontWeight: "bold",
  },
});
