import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function ServicesScreen() {
  const colors = useThemeColors();
  const router = useRouter();

  const services = [
    {
      id: "1",
      title: "Business Printing",
      icon: "briefcase",
      description: "Professional business cards, letterheads, and more",
      color: "#3B82F6",
      items: ["Business Cards", "Letterheads", "Envelopes", "Folders"],
    },
    {
      id: "2",
      title: "Marketing Materials",
      icon: "megaphone",
      description: "Eye-catching promotional materials for your brand",
      color: "#8B5CF6",
      items: ["Flyers", "Brochures", "Catalogs", "Postcards"],
    },
    {
      id: "3",
      title: "Large Format",
      icon: "resize",
      description: "Banners, posters, and signage in any size",
      color: "#EC4899",
      items: ["Banners", "Posters", "Wall Graphics", "Vehicle Wraps"],
    },
    {
      id: "4",
      title: "Custom Apparel",
      icon: "shirt",
      description: "T-shirts, hoodies, and more with your design",
      color: "#10B981",
      items: ["T-Shirts", "Hoodies", "Caps", "Tote Bags"],
    },
    {
      id: "5",
      title: "Photo Services",
      icon: "camera",
      description: "Professional photo printing and framing",
      color: "#F59E0B",
      items: ["Photo Prints", "Canvas Prints", "Photo Books", "Framing"],
    },
    {
      id: "6",
      title: "Packaging",
      icon: "cube",
      description: "Custom boxes, labels, and packaging solutions",
      color: "#06B6D4",
      items: ["Boxes", "Labels", "Stickers", "Bags"],
    },
  ];

  const features = [
    {
      icon: "checkmark-circle",
      title: "High Quality",
      description: "Premium materials and printing technology",
    },
    {
      icon: "time",
      title: "Fast Turnaround",
      description: "Quick delivery without compromising quality",
    },
    {
      icon: "shield-checkmark",
      title: "Satisfaction Guaranteed",
      description: "100% satisfaction or your money back",
    },
    {
      icon: "people",
      title: "Expert Support",
      description: "Dedicated team to help with your project",
    },
  ];

  const dynamicStyles = {
    container: {
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.backgroundSecondary,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      color: colors.text,
    },
    headerSubtitle: {
      color: colors.textSecondary,
    },
    sectionTitle: {
      color: colors.text,
    },
    serviceCard: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
    },
    serviceTitle: {
      color: colors.text,
    },
    serviceDescription: {
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
    ctaCard: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
    },
    ctaTitle: {
      color: colors.text,
    },
    ctaDescription: {
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
        {/* Services Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            What We Offer
          </Text>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceCard, dynamicStyles.serviceCard]}
              activeOpacity={0.7}
              onPress={() => router.push(`/service/${service.id}` as any)}
            >
              <View
                style={[
                  styles.serviceIconContainer,
                  { backgroundColor: service.color + "20" },
                ]}
              >
                <Ionicons
                  name={service.icon as any}
                  size={32}
                  color={service.color}
                />
              </View>
              <View style={styles.serviceContent}>
                <Text style={[styles.serviceTitle, dynamicStyles.serviceTitle]}>
                  {service.title}
                </Text>
                <Text
                  style={[
                    styles.serviceDescription,
                    dynamicStyles.serviceDescription,
                  ]}
                >
                  {service.description}
                </Text>
                <View style={styles.serviceItems}>
                  {service.items.map((item, index) => (
                    <View key={index} style={styles.serviceItemTag}>
                      <Text style={styles.serviceItemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#B8B8D1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            Why Choose Us  
          </Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View
                key={index}
                style={[styles.featureCard, dynamicStyles.featureCard]}
              >
                <View style={styles.featureIconContainer}>
                  <Ionicons
                    name={feature.icon as any}
                    size={28}
                    color="#FF006E"
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

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <View style={[styles.ctaCard, dynamicStyles.ctaCard]}>
            <Ionicons name="help-circle" size={48} color="#FF006E" />
            <Text style={[styles.ctaTitle, dynamicStyles.ctaTitle]}>
              Need Help Choosing?
            </Text>
            <Text style={[styles.ctaDescription, dynamicStyles.ctaDescription]}>
              Our print experts are here to help you find the perfect solution
            </Text>
            <TouchableOpacity style={styles.ctaButton}>
              <Text style={styles.ctaButtonText}>Contact Us</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#6B7280",
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  serviceCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
  },
  serviceIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  serviceContent: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    lineHeight: 20,
  },
  serviceItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  serviceItemTag: {
    backgroundColor: "rgba(255, 0, 110, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  serviceItemText: {
    fontSize: 11,
    color: "#FF006E",
    fontWeight: "600",
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: (width - 52) / 2,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.95)",
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 0, 110, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
    textAlign: "center",
  },
  featureDescription: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  ctaSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  ctaCard: {
    backgroundColor: "rgba(255, 0, 110, 0.06)",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 0, 110, 0.2)",
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  ctaDescription: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF006E",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
