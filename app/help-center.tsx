import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function HelpCenterScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I place an order?",
      answer:
        "To place an order, browse our services, select the product you want, customize it with your design or text, add it to your cart, and proceed to checkout. You'll need to provide delivery details and payment information.",
    },
    {
      question: "What file formats do you accept?",
      answer:
        "We accept most common image formats including JPG, PNG, PDF, AI, PSD, and SVG. For best results, we recommend high-resolution images (at least 300 DPI) for printing.",
    },
    {
      question: "How long does delivery take?",
      answer:
        "Standard delivery takes 3-5 business days. Express delivery (1-2 business days) is available for an additional fee. Custom orders may require additional processing time.",
    },
    {
      question: "Can I track my order?",
      answer:
        "Yes! Once your order ships, you'll receive a tracking number via email. You can also track your order status in the Orders tab of the app.",
    },
    {
      question: "What is your return policy?",
      answer:
        "We offer a 14-day return policy for defective or damaged items. Custom-printed items cannot be returned unless there's a printing error on our end. Please contact support to initiate a return.",
    },
    {
      question: "How do I change or cancel my order?",
      answer:
        "Orders can be modified or cancelled within 2 hours of placement. After that, your order enters production and cannot be changed. Contact support immediately if you need to make changes.",
    },
    {
      question: "Do you offer bulk discounts?",
      answer:
        "Yes! We offer discounts for bulk orders. Contact our sales team through the 'Contact Support' option for custom quotes on orders of 50+ items.",
    },
    {
      question: "How do I update my payment methods?",
      answer:
        "Go to Account > Payment Methods to add, remove, or update your saved payment cards. All payment information is securely encrypted.",
    },
  ];

  const quickLinks = [
    {
      icon: "chatbubble-ellipses-outline",
      title: "Contact Support",
      subtitle: "Get help from our team",
      action: () => router.push("/(tabs)/messages"),
    },
    {
      icon: "mail-outline",
      title: "Email Us",
      subtitle: "support@printcraft.com",
      action: () => Linking.openURL("mailto:support@printcraft.com"),
    },
    {
      icon: "call-outline",
      title: "Call Us",
      subtitle: "+1 (555) 123-4567",
      action: () => Linking.openURL("tel:+15551234567"),
    },
    {
      icon: "document-text-outline",
      title: "Terms & Privacy",
      subtitle: "Read our policies",
      action: () => router.push("/terms-privacy"),
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
    welcomeTitle: {
      color: colors.text,
    },
    welcomeSubtitle: {
      color: colors.textSecondary,
    },
    sectionTitle: {
      color: colors.text,
    },
    quickLinkCard: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
    },
    quickLinkTitle: {
      color: colors.text,
    },
    quickLinkSubtitle: {
      color: colors.textSecondary,
    },
    faqItem: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
    },
    faqQuestionText: {
      color: colors.text,
    },
    faqAnswerText: {
      color: colors.textSecondary,
    },
  };

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <StatusBar style={colors.statusBarStyle} />

      {/* Header */}
      <View style={[styles.header, dynamicStyles.header]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, dynamicStyles.headerTitle]}>
          Help Center
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="help-circle" size={48} color="#FF006E" />
          </View>
          <Text style={[styles.welcomeTitle, dynamicStyles.welcomeTitle]}>
            How can we help you?
          </Text>
          <Text style={[styles.welcomeSubtitle, dynamicStyles.welcomeSubtitle]}>
            Find answers to common questions or contact our support team
          </Text>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            Quick Links
          </Text>
          <View style={styles.quickLinksContainer}>
            {quickLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickLinkCard, dynamicStyles.quickLinkCard]}
                onPress={link.action}
                activeOpacity={0.7}
              >
                <View style={styles.quickLinkIconContainer}>
                  <Ionicons name={link.icon as any} size={24} color="#FF006E" />
                </View>
                <View style={styles.quickLinkText}>
                  <Text
                    style={[
                      styles.quickLinkTitle,
                      dynamicStyles.quickLinkTitle,
                    ]}
                  >
                    {link.title}
                  </Text>
                  <Text
                    style={[
                      styles.quickLinkSubtitle,
                      dynamicStyles.quickLinkSubtitle,
                    ]}
                  >
                    {link.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            Frequently Asked Questions
          </Text>
          <View style={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <View key={index} style={[styles.faqItem, dynamicStyles.faqItem]}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() =>
                    setExpandedFaq(expandedFaq === index ? null : index)
                  }
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.faqQuestionText,
                      dynamicStyles.faqQuestionText,
                    ]}
                  >
                    {faq.question}
                  </Text>
                  <Ionicons
                    name={expandedFaq === index ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
                {expandedFaq === index && (
                  <View style={styles.faqAnswer}>
                    <Text
                      style={[
                        styles.faqAnswerText,
                        dynamicStyles.faqAnswerText,
                      ]}
                    >
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  welcomeSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 0, 110, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  quickLinksContainer: {
    gap: 12,
  },
  quickLinkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quickLinkIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 0, 110, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  quickLinkText: {
    flex: 1,
  },
  quickLinkTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  quickLinkSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  faqContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginRight: 12,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#F9FAFB",
  },
  faqAnswerText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },
});
