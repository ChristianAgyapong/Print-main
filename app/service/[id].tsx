import { useThemeColors } from "@/hooks/use-theme-colors";
import { PrintService, servicesDataService } from "@/lib/services-data";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");


export default function ServiceDetailScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [service, setService] = useState<PrintService | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await servicesDataService.getById(id as string);
      setService(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator size="large" color="#FF006E" />
      </View>
    );
  }

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
                  style={[styles.pricingQuantity, dynamicStyles.pricingQuantity]}
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
                <Ionicons
                  name="help-circle"
                  size={20}
                  color={service.color}
                />
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
            style={[
              styles.ctaButtonOutline,
              { borderColor: service.color },
            ]}
            onPress={() => router.push("/help-center")}
          >
            <Ionicons name="chatbubble" size={20} color={service.color} />
            <Text style={[styles.ctaButtonOutlineText, { color: service.color }]}>
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
