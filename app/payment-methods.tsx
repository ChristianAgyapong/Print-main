import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PaymentCard {
  id: string;
  type: "visa" | "mastercard" | "amex";
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  holderName: string;
  isDefault: boolean;
}

export default function PaymentMethodsScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const [cards, setCards] = useState<PaymentCard[]>([
    {
      id: "1",
      type: "visa",
      last4: "4242",
      expiryMonth: "12",
      expiryYear: "2027",
      holderName: "John Doe",
      isDefault: true,
    },
    {
      id: "2",
      type: "mastercard",
      last4: "5555",
      expiryMonth: "06",
      expiryYear: "2026",
      holderName: "John Doe",
      isDefault: false,
    },
  ]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const getCardIcon = (type: string) => {
    switch (type) {
      case "visa":
        return "card";
      case "mastercard":
        return "card";
      case "amex":
        return "card";
      default:
        return "card-outline";
    }
  };

  const getCardColor = (type: string) => {
    switch (type) {
      case "visa":
        return "#1A1F71";
      case "mastercard":
        return "#EB001B";
      case "amex":
        return "#006FCF";
      default:
        return "#6B7280";
    }
  };

  const handleSetDefault = (cardId: string) => {
    setCards((prev) =>
      prev.map((card) => ({ ...card, isDefault: card.id === cardId })),
    );
    Alert.alert("Success", "Default payment method updated");
  };

  const handleDeleteCard = (cardId: string) => {
    Alert.alert(
      "Remove Card",
      "Are you sure you want to remove this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setCards((prev) => prev.filter((card) => card.id !== cardId));
            Alert.alert("Success", "Payment method removed");
          },
        },
      ],
    );
  };

  const handleAddCard = () => {
    if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Simple validation
    if (cardNumber.replace(/\s/g, "").length < 15) {
      Alert.alert("Error", "Please enter a valid card number");
      return;
    }

    if (expiryDate.length !== 5) {
      Alert.alert("Error", "Please enter expiry date as MM/YY");
      return;
    }

    if (cvv.length < 3) {
      Alert.alert("Error", "Please enter a valid CVV");
      return;
    }

    // In a real app, you would send this to a payment processor
    const [month, year] = expiryDate.split("/");
    const last4 = cardNumber.replace(/\s/g, "").slice(-4);

    const newCard: PaymentCard = {
      id: Date.now().toString(),
      type: "visa", // Would be detected from card number
      last4,
      expiryMonth: month,
      expiryYear: `20${year}`,
      holderName: cardHolder,
      isDefault: cards.length === 0,
    };

    setCards((prev) => [...prev, newCard]);
    setShowAddCard(false);
    setCardNumber("");
    setCardHolder("");
    setExpiryDate("");
    setCvv("");

    Alert.alert("Success", "Payment method added successfully");
  };

  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    header: {
      backgroundColor: colors.backgroundSecondary,
      borderBottomColor: colors.border,
    },
    headerTitle: { color: colors.text },
    cardContainer: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
    },
    cardHolderName: { color: colors.text },
    cardDetails: { color: colors.textSecondary },
    sectionTitle: { color: colors.text },
    addButtonText: { color: colors.text },
    modalContainer: { backgroundColor: colors.background },
    modalHeader: {
      backgroundColor: colors.card,
      borderBottomColor: colors.border,
    },
    modalTitle: { color: colors.text },
    inputLabel: { color: colors.text },
    input: {
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.border,
      color: colors.text,
    },
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
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
          Payment Methods
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          <Text style={styles.infoText}>
            Your payment information is encrypted and secure
          </Text>
        </View>

        {/* Saved Cards */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            Saved Cards
          </Text>
          {cards.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No payment methods saved</Text>
            </View>
          ) : (
            <View style={styles.cardsContainer}>
              {cards.map((card) => (
                <View
                  key={card.id}
                  style={[styles.cardItem, dynamicStyles.cardContainer]}
                >
                  <View style={styles.cardInfo}>
                    <View
                      style={[
                        styles.cardIconContainer,
                        { backgroundColor: `${getCardColor(card.type)}20` },
                      ]}
                    >
                      <Ionicons
                        name={getCardIcon(card.type) as any}
                        size={24}
                        color={getCardColor(card.type)}
                      />
                    </View>
                    <View style={styles.cardDetails}>
                      <View style={styles.cardRow}>
                        <Text
                          style={[
                            styles.cardType,
                            dynamicStyles.cardHolderName,
                          ]}
                        >
                          {card.type.toUpperCase()}
                        </Text>
                        {card.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.cardNumber,
                          dynamicStyles.cardHolderName,
                        ]}
                      >
                        •••• {card.last4}
                      </Text>
                      <Text
                        style={[styles.cardExpiry, dynamicStyles.cardDetails]}
                      >
                        Expires {card.expiryMonth}/{card.expiryYear.slice(2)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    {!card.isDefault && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleSetDefault(card.id)}
                      >
                        <Text style={styles.actionButtonText}>Set Default</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteCard(card.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Add Card Button */}
        <TouchableOpacity
          style={styles.addCardButton}
          onPress={() => setShowAddCard(true)}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FF006E" />
          <Text style={[styles.addCardButtonText, dynamicStyles.addButtonText]}>
            Add New Card
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Card Modal */}
      <Modal
        visible={showAddCard}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddCard(false)}
      >
        <SafeAreaView
          style={[styles.modalContainer, dynamicStyles.modalContainer]}
        >
          <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
            <TouchableOpacity onPress={() => setShowAddCard(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>
              Add Payment Method
            </Text>
            <TouchableOpacity onPress={handleAddCard}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
                Card Number *
              </Text>
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor={colors.textSecondary}
                value={cardNumber}
                onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                keyboardType="number-pad"
                maxLength={19}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
                Cardholder Name *
              </Text>
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                placeholder="John Doe"
                placeholderTextColor={colors.textSecondary}
                value={cardHolder}
                onChangeText={setCardHolder}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
                  Expiry Date *
                </Text>
                <TextInput
                  style={[styles.input, dynamicStyles.input]}
                  placeholder="MM/YY"
                  placeholderTextColor={colors.textSecondary}
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, dynamicStyles.inputLabel]}>
                  CVV *
                </Text>
                <TextInput
                  style={[styles.input, dynamicStyles.input]}
                  placeholder="123"
                  placeholderTextColor={colors.textSecondary}
                  value={cvv}
                  onChangeText={(text) => setCvv(text.replace(/\D/g, ""))}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.securityNote}>
              <Ionicons name="lock-closed" size={16} color="#10B981" />
              <Text style={styles.securityNoteText}>
                Your card information is encrypted and secure
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#10B981",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#047857",
    lineHeight: 20,
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
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 12,
  },
  cardsContainer: {
    gap: 16,
  },
  cardItem: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInfo: {
    flexDirection: "row",
    marginBottom: 12,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  cardType: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: "#FF006E",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 13,
    color: "#6B7280",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  deleteButton: {
    flex: 0,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FF006E",
    borderStyle: "dashed",
    gap: 8,
  },
  addCardButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF006E",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF006E",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
  },
  row: {
    flexDirection: "row",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    padding: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 8,
  },
  securityNoteText: {
    flex: 1,
    fontSize: 13,
    color: "#047857",
  },
});
