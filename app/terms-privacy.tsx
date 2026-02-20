import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function TermsPrivacyScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");

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
    tabsContainer: {
      backgroundColor: colors.backgroundSecondary,
      borderBottomColor: colors.border,
    },
    tab: {
      borderBottomColor: colors.border,
    },
    tabText: {
      color: colors.textSecondary,
    },
    document: {
      backgroundColor: colors.card,
    },
    updatedText: {
      color: colors.textSecondary,
    },
    sectionTitle: {
      color: colors.text,
    },
    sectionText: {
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
          Legal
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, dynamicStyles.tabsContainer]}>
        <TouchableOpacity
          style={[
            styles.tab,
            dynamicStyles.tab,
            activeTab === "terms" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("terms")}
        >
          <Text
            style={[
              styles.tabText,
              dynamicStyles.tabText,
              activeTab === "terms" && styles.activeTabText,
            ]}
          >
            Terms of Service
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            dynamicStyles.tab,
            activeTab === "privacy" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("privacy")}
        >
          <Text
            style={[
              styles.tabText,
              dynamicStyles.tabText,
              activeTab === "privacy" && styles.activeTabText,
            ]}
          >
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === "terms" ? (
          <TermsOfService dynamicStyles={dynamicStyles} />
        ) : (
          <PrivacyPolicy dynamicStyles={dynamicStyles} />
        )}
      </ScrollView>
    </View>
  );
}

function TermsOfService({ dynamicStyles }: any) {
  return (
    <View style={[styles.document, dynamicStyles.document]}>
      <Text style={[styles.updatedText, dynamicStyles.updatedText]}>
        Last updated: February 20, 2026
      </Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          1. Acceptance of Terms
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          By accessing and using PrintCraft ("the Service"), you accept and
          agree to be bound by the terms and provision of this agreement. If you
          do not agree to these terms, please do not use the Service.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          2. Service Description
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          PrintCraft provides custom printing services including but not limited
          to business cards, flyers, banners, t-shirts, and other promotional
          materials. We reserve the right to modify or discontinue services at
          any time.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          3. User Accounts
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activities that occur under your
          account. You must notify us immediately of any unauthorized use of
          your account.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          4. Orders and Payments
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          All orders are subject to acceptance and availability. Prices are
          subject to change without notice. Payment is required at the time of
          order placement. We accept major credit cards and other payment
          methods as displayed in the app.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          5. Content and Copyright
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          You retain ownership of any content you upload. However, you grant us
          a license to use, reproduce, and modify your content solely for the
          purpose of fulfilling your orders. You must have all necessary rights
          and permissions for any content you submit.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          6. Prohibited Content
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          You may not submit content that is illegal, offensive, defamatory,
          infringes on intellectual property rights, or violates any applicable
          laws. We reserve the right to refuse any order at our discretion.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          7. Returns and Refunds
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          We offer a 14-day return policy for defective or damaged items.
          Custom-printed items cannot be returned unless there is a printing
          error on our end. Refunds will be processed within 7-10 business days
          of approval.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          8. Limitation of Liability
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          PrintCraft shall not be liable for any indirect, incidental, or
          consequential damages arising from the use of our services. Our total
          liability shall not exceed the amount paid for the specific order in
          question.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          9. Changes to Terms
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          We reserve the right to modify these terms at any time. Changes will
          be effective immediately upon posting. Your continued use of the
          Service constitutes acceptance of any changes.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          10. Contact Information
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          For questions about these Terms of Service, please contact us at
          legal@printcraft.com or through the Contact Support option in the app.
        </Text>
      </View>
    </View>
  );
}

function PrivacyPolicy({ dynamicStyles }: any) {
  return (
    <View style={[styles.document, dynamicStyles.document]}>
      <Text style={[styles.updatedText, dynamicStyles.updatedText]}>
        Last updated: February 20, 2026
      </Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          1. Information We Collect
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          We collect information you provide directly to us, including:
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Name and contact information
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Email address and phone number
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Delivery addresses
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Payment information (processed securely)
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Order history and preferences
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Files and designs you upload
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          2. How We Use Your Information
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          We use the information we collect to:
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Process and fulfill your orders
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Communicate with you about orders
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Provide customer support
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Improve our services
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Send promotional communications (with your consent)
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Detect and prevent fraud
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          3. Information Sharing
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          We do not sell your personal information. We may share your
          information with:
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Service providers who assist in order fulfillment
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Payment processors (who handle transactions securely)
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Delivery partners for shipping
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Law enforcement when required by law
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          4. Data Security
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          We implement industry-standard security measures to protect your
          personal information. However, no method of transmission over the
          internet is 100% secure. We cannot guarantee absolute security but
          continuously work to improve our protections.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          5. Data Retention
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          We retain your information for as long as your account is active or as
          needed to provide services. You can request deletion of your account
          and associated data at any time through the app or by contacting
          support.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          6. Your Rights
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          You have the right to:
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Access your personal information
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Correct inaccurate information
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Request deletion of your data
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Opt-out of marketing communications
        </Text>
        <Text style={[styles.bulletText, dynamicStyles.sectionText]}>
          • Export your data in a portable format
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          7. Cookies and Tracking
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          We use cookies and similar technologies to improve your experience,
          analyze usage patterns, and deliver personalized content. You can
          control cookie preferences in your device settings.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          8. Children's Privacy
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          Our services are not intended for children under 13. We do not
          knowingly collect information from children. If you believe we have
          collected information from a child, please contact us immediately.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          9. Changes to Privacy Policy
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          We may update this privacy policy from time to time. We will notify
          you of significant changes via email or in-app notification. Your
          continued use after changes constitutes acceptance.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
          10. Contact Us
        </Text>
        <Text style={[styles.sectionText, dynamicStyles.sectionText]}>
          For privacy-related questions or to exercise your rights, contact us
          at privacy@printcraft.com or through the Contact Support option in the
          app.
        </Text>
      </View>
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
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#FF006E",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  document: {
    padding: 20,
  },
  updatedText: {
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletText: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 24,
    marginLeft: 12,
  },
});
