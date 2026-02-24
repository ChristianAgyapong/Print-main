import {
  PrintService,
  ServiceFAQ,
  ServiceFeature,
  ServicePricing,
  servicesDataService,
} from "@/lib/services-data";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Constants ────────────────────────────────────────────────────────────────
const COLOR_OPTIONS = [
  { hex: "#3B82F6", name: "Blue" },
  { hex: "#8B5CF6", name: "Purple" },
  { hex: "#EC4899", name: "Pink" },
  { hex: "#10B981", name: "Emerald" },
  { hex: "#F59E0B", name: "Amber" },
  { hex: "#06B6D4", name: "Cyan" },
  { hex: "#EF4444", name: "Red" },
  { hex: "#F97316", name: "Orange" },
  { hex: "#84CC16", name: "Lime" },
  { hex: "#6366F1", name: "Indigo" },
];

const ICON_OPTIONS = [
  "briefcase", "megaphone", "resize", "shirt", "camera", "cube",
  "print", "color-palette", "layers", "image", "sparkles", "star",
  "flash", "ribbon", "gift", "storefront", "brush", "construct",
];

type EditSection = "basic" | "items" | "features" | "pricing" | "faqs";

const SECTIONS: { id: EditSection; label: string; icon: string }[] = [
  { id: "basic", label: "Basic Info", icon: "information-circle" },
  { id: "items", label: "Items", icon: "list" },
  { id: "features", label: "Features", icon: "star" },
  { id: "pricing", label: "Pricing", icon: "pricetag" },
  { id: "faqs", label: "FAQs", icon: "help-circle" },
];

export default function AdminServicesScreen() {
  const router = useRouter();
  const [services, setServices] = useState<PrintService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<PrintService | null>(null);
  const [activeSection, setActiveSection] = useState<EditSection>("basic");

  // Form fields
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLongDescription, setEditLongDescription] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editItems, setEditItems] = useState<string[]>([]);
  const [editFeatures, setEditFeatures] = useState<ServiceFeature[]>([]);
  const [editPricing, setEditPricing] = useState<ServicePricing[]>([]);
  const [editFaqs, setEditFaqs] = useState<ServiceFAQ[]>([]);

  useEffect(() => { loadServices(); }, []);

  const loadServices = async () => {
    setLoading(true);
    setServices(await servicesDataService.getAll());
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  };

  const openEdit = (service: PrintService) => {
    setEditingService(service);
    setEditTitle(service.title);
    setEditDescription(service.description);
    setEditLongDescription(service.longDescription);
    setEditColor(service.color);
    setEditIcon(service.icon);
    setEditItems([...service.items]);
    setEditFeatures(service.features.map((f) => ({ ...f })));
    setEditPricing(service.pricing.map((p) => ({ ...p })));
    setEditFaqs(service.faqs.map((f) => ({ ...f })));
    setActiveSection("basic");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!editingService || !editTitle.trim()) {
      Alert.alert("Error", "Service title is required.");
      return;
    }
    setSaving(true);
    const ok = await servicesDataService.update(editingService.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      longDescription: editLongDescription.trim(),
      color: editColor,
      icon: editIcon,
      items: editItems.filter((i) => i.trim()),
      features: editFeatures.filter((f) => f.title.trim()),
      pricing: editPricing.filter((p) => p.quantity.trim()),
      faqs: editFaqs.filter((f) => f.question.trim()),
    });
    setSaving(false);
    if (ok) {
      Alert.alert("✅ Saved", "Service updated successfully.");
      setModalVisible(false);
      loadServices();
    } else {
      Alert.alert("Error", "Failed to save. Check your connection or admin permissions.");
    }
  };

  const handleReset = () =>
    Alert.alert(
      "Reset All Services",
      "This will restore all 6 services back to their original default content. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            await servicesDataService.reset();
            await loadServices();
            Alert.alert("Done", "Services reset to defaults.");
          },
        },
      ]
    );

  // ─── Item helpers ───────────────────────────────────────────────────────────
  const addItem = () => setEditItems((p) => [...p, ""]);
  const updateItem = (i: number, v: string) => setEditItems((p) => p.map((x, j) => j === i ? v : x));
  const removeItem = (i: number) => setEditItems((p) => p.filter((_, j) => j !== i));

  // ─── Feature helpers ────────────────────────────────────────────────────────
  const addFeature = () => setEditFeatures((p) => [...p, { title: "", description: "", icon: "star" }]);
  const updateFeature = (i: number, k: keyof ServiceFeature, v: string) =>
    setEditFeatures((p) => p.map((f, j) => j === i ? { ...f, [k]: v } : f));
  const removeFeature = (i: number) => setEditFeatures((p) => p.filter((_, j) => j !== i));

  // ─── Pricing helpers ────────────────────────────────────────────────────────
  const addPricing = () => setEditPricing((p) => [...p, { quantity: "", price: "" }]);
  const updatePricing = (i: number, k: keyof ServicePricing, v: string) =>
    setEditPricing((p) => p.map((x, j) => j === i ? { ...x, [k]: v } : x));
  const removePricing = (i: number) => setEditPricing((p) => p.filter((_, j) => j !== i));

  // ─── FAQ helpers ────────────────────────────────────────────────────────────
  const addFaq = () => setEditFaqs((p) => [...p, { question: "", answer: "" }]);
  const updateFaq = (i: number, k: keyof ServiceFAQ, v: string) =>
    setEditFaqs((p) => p.map((f, j) => j === i ? { ...f, [k]: v } : f));
  const removeFaq = (i: number) => setEditFaqs((p) => p.filter((_, j) => j !== i));

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <StatusBar style="dark" />
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={s.loadingText}>Loading services…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedColorHex = COLOR_OPTIONS.find((c) => c.hex === editColor)?.hex ?? "#8B5CF6";

  return (
    <SafeAreaView style={s.container}>
      <StatusBar style="dark" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBack} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#374151" />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <LinearGradient
            colors={["#8B5CF6", "#6D28D9"]}
            style={s.headerGradientBadge}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Ionicons name="construct" size={14} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={s.headerTitle}>Manage Services</Text>
            <Text style={s.headerSub}>Admin · Service Catalog</Text>
          </View>
        </View>

        <TouchableOpacity style={s.resetBtn} onPress={handleReset}>
          <Ionicons name="refresh" size={16} color="#8B5CF6" />
          <Text style={s.resetBtnText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* ── Stats bar ──────────────────────────────────────────────────────── */}
      <View style={s.statsBar}>
        <View style={s.statItem}>
          <Text style={s.statNum}>{services.length}</Text>
          <Text style={s.statLabel}>Services</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statNum}>{services.reduce((a, s) => a + s.items.length, 0)}</Text>
          <Text style={s.statLabel}>Total Items</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statNum}>{services.reduce((a, s) => a + s.pricing.length, 0)}</Text>
          <Text style={s.statLabel}>Pricing Tiers</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statNum}>{services.reduce((a, s) => a + s.faqs.length, 0)}</Text>
          <Text style={s.statLabel}>FAQs</Text>
        </View>
      </View>

      {/* ── Service list ───────────────────────────────────────────────────── */}
      <ScrollView
        style={s.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={s.listHint}>Tap any service card to edit its content</Text>

        {services.map((service, idx) => (
          <TouchableOpacity
            key={service.id}
            style={s.card}
            activeOpacity={0.88}
            onPress={() => openEdit(service)}
          >
            {/* Left gradient strip */}
            <LinearGradient
              colors={[service.color, service.color + "99"]}
              style={s.cardStrip}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
            />

            <View style={s.cardBody}>
              {/* Top row */}
              <View style={s.cardTopRow}>
                {/* Icon bubble */}
                <View style={[s.cardIconWrap, { backgroundColor: service.color + "18" }]}>
                  <Ionicons name={service.icon as any} size={28} color={service.color} />
                </View>

                {/* Title & desc */}
                <View style={s.cardTextBlock}>
                  <Text style={s.cardTitle}>{service.title}</Text>
                  <Text style={s.cardDesc} numberOfLines={2}>{service.description}</Text>
                </View>

                {/* Edit caret */}
                <View style={[s.cardEditBtn, { backgroundColor: service.color + "12" }]}>
                  <Ionicons name="create-outline" size={18} color={service.color} />
                </View>
              </View>

              {/* Divider */}
              <View style={s.cardDivider} />

              {/* Stat chips row */}
              <View style={s.cardChips}>
                <Chip icon="list" label={`${service.items.length} items`} color={service.color} />
                <Chip icon="star" label={`${service.features.length} features`} color={service.color} />
                <Chip icon="pricetag" label={`${service.pricing.length} tiers`} color={service.color} />
                <Chip icon="help-circle" label={`${service.faqs.length} FAQs`} color={service.color} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* ══════════════════════════════════════════════════════════════════════
          EDIT MODAL
         ══════════════════════════════════════════════════════════════════════ */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={s.modalContainer}>
          <StatusBar style="dark" />

          {/* Modal header */}
          <View style={s.modalHeader}>
            <TouchableOpacity style={s.modalCloseBtn} onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={20} color="#374151" />
            </TouchableOpacity>

            <View style={s.modalHeaderCenter}>
              {/* Live colour preview */}
              <View style={[s.modalPreviewIcon, { backgroundColor: editColor + "22" }]}>
                <Ionicons name={editIcon as any} size={20} color={editColor} />
              </View>
              <Text style={s.modalTitle} numberOfLines={1}>{editTitle || "Editing Service"}</Text>
            </View>

            <TouchableOpacity
              style={[s.modalSaveBtn, { backgroundColor: editColor }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <><Ionicons name="checkmark" size={16} color="#fff" /><Text style={s.modalSaveBtnText}>Save</Text></>
              }
            </TouchableOpacity>
          </View>

          {/* Section tabs — compact icon + short label */}
          <View style={s.tabsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabsContent}>
              {SECTIONS.map((sec) => {
                const active = activeSection === sec.id;
                return (
                  <TouchableOpacity
                    key={sec.id}
                    style={[s.tab, active && { backgroundColor: editColor }]}
                    onPress={() => setActiveSection(sec.id)}
                  >
                    <Ionicons name={sec.icon as any} size={12} color={active ? "#fff" : "#9CA3AF"} />
                    <Text style={[s.tabText, active && s.tabTextActive]}>
                      {sec.id === "basic" ? "Basic" :
                        sec.id === "items" ? "Items" :
                          sec.id === "features" ? "Features" :
                            sec.id === "pricing" ? "Pricing" : "FAQs"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Section body */}
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView
              style={s.modalScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >

              {/* ── BASIC INFO ─────────────────────────────────────────────── */}
              {activeSection === "basic" && (
                <View style={s.section}>
                  <SectionHeader icon="text" title="Service Identity" color={editColor} />

                  <FormField label="Service Title" required>
                    <TextInput
                      style={s.input}
                      value={editTitle}
                      onChangeText={setEditTitle}
                      placeholder="e.g. Business Printing"
                      placeholderTextColor="#C4C4CF"
                    />
                  </FormField>

                  <FormField label="Short Description">
                    <TextInput
                      style={s.input}
                      value={editDescription}
                      onChangeText={setEditDescription}
                      placeholder="One-line summary shown on the card"
                      placeholderTextColor="#C4C4CF"
                    />
                  </FormField>

                  <FormField label="Full Description">
                    <TextInput
                      style={[s.input, s.textArea]}
                      value={editLongDescription}
                      onChangeText={setEditLongDescription}
                      placeholder="Detailed description shown on the service detail page…"
                      placeholderTextColor="#C4C4CF"
                      multiline
                      numberOfLines={5}
                    />
                  </FormField>

                  <SectionHeader icon="color-palette" title="Theme Colour" color={editColor} />
                  <View style={s.colorGrid}>
                    {COLOR_OPTIONS.map((c) => {
                      const active = editColor === c.hex;
                      return (
                        <TouchableOpacity
                          key={c.hex}
                          style={[s.colorSwatch, { backgroundColor: c.hex }, active && s.colorSwatchRing]}
                          onPress={() => setEditColor(c.hex)}
                        >
                          {active && <Ionicons name="checkmark" size={18} color="#fff" />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {/* Colour label */}
                  <Text style={[s.colorLabel, { color: editColor }]}>
                    {COLOR_OPTIONS.find((c) => c.hex === editColor)?.name ?? "Custom"} — {editColor}
                  </Text>

                  <SectionHeader icon="apps" title="Service Icon" color={editColor} />
                  <View style={s.iconGrid}>
                    {ICON_OPTIONS.map((ic) => {
                      const active = editIcon === ic;
                      return (
                        <TouchableOpacity
                          key={ic}
                          style={[
                            s.iconOption,
                            active
                              ? { backgroundColor: editColor, borderColor: editColor }
                              : { backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" },
                          ]}
                          onPress={() => setEditIcon(ic)}
                        >
                          <Ionicons name={ic as any} size={22} color={active ? "#fff" : "#6B7280"} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* ── ITEMS ──────────────────────────────────────────────────── */}
              {activeSection === "items" && (
                <View style={s.section}>
                  <SectionHeader icon="list" title="Offered Items" color={editColor} />
                  <Text style={s.sectionHint}>
                    These badges appear on the service card and detail page.
                  </Text>

                  {editItems.map((item, i) => (
                    <View key={i} style={s.rowInputWrap}>
                      <View style={[s.rowBullet, { backgroundColor: editColor }]}>
                        <Text style={s.rowBulletText}>{i + 1}</Text>
                      </View>
                      <TextInput
                        style={[s.input, s.rowInput]}
                        value={item}
                        onChangeText={(v) => updateItem(i, v)}
                        placeholder={`Item ${i + 1}`}
                        placeholderTextColor="#C4C4CF"
                      />
                      <TouchableOpacity style={s.deleteBtn} onPress={() => removeItem(i)}>
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}

                  <AddButton label="Add Item" color={editColor} onPress={addItem} />
                </View>
              )}

              {/* ── FEATURES ───────────────────────────────────────────────── */}
              {activeSection === "features" && (
                <View style={s.section}>
                  <SectionHeader icon="star" title="Key Features" color={editColor} />
                  <Text style={s.sectionHint}>
                    Highlight the top benefits displayed in the feature grid.
                  </Text>

                  {editFeatures.map((feat, i) => (
                    <View key={i} style={s.groupCard}>
                      <View style={s.groupCardHeader}>
                        <View style={[s.groupBadge, { backgroundColor: editColor }]}>
                          <Text style={s.groupBadgeText}>F{i + 1}</Text>
                        </View>
                        <Text style={s.groupTitle}>Feature {i + 1}</Text>
                        <TouchableOpacity onPress={() => removeFeature(i)}>
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                      <FormField label="Title">
                        <TextInput style={s.input} value={feat.title}
                          onChangeText={(v) => updateFeature(i, "title", v)}
                          placeholder="e.g. Fast Production" placeholderTextColor="#C4C4CF" />
                      </FormField>
                      <FormField label="Description">
                        <TextInput style={[s.input, s.textAreaSm]} value={feat.description}
                          onChangeText={(v) => updateFeature(i, "description", v)}
                          placeholder="Short benefit description" placeholderTextColor="#C4C4CF"
                          multiline numberOfLines={2} />
                      </FormField>
                      <FormField label="Ionicon Name">
                        <TextInput style={s.input} value={feat.icon}
                          onChangeText={(v) => updateFeature(i, "icon", v)}
                          placeholder="e.g. flash, star, layers" placeholderTextColor="#C4C4CF"
                          autoCapitalize="none" />
                      </FormField>
                    </View>
                  ))}

                  <AddButton label="Add Feature" color={editColor} onPress={addFeature} />
                </View>
              )}

              {/* ── PRICING ────────────────────────────────────────────────── */}
              {activeSection === "pricing" && (
                <View style={s.section}>
                  <SectionHeader icon="pricetag" title="Pricing Tiers" color={editColor} />
                  <Text style={s.sectionHint}>
                    Sample pricing displayed at the bottom of the service detail page.
                  </Text>

                  {editPricing.map((tier, i) => (
                    <View key={i} style={s.groupCard}>
                      <View style={s.groupCardHeader}>
                        <View style={[s.groupBadge, { backgroundColor: editColor }]}>
                          <Text style={s.groupBadgeText}>T{i + 1}</Text>
                        </View>
                        <Text style={s.groupTitle}>Tier {i + 1}</Text>
                        <TouchableOpacity onPress={() => removePricing(i)}>
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                      <View style={s.pricingRow}>
                        <View style={{ flex: 2 }}>
                          <FormField label="Description">
                            <TextInput style={s.input} value={tier.quantity}
                              onChangeText={(v) => updatePricing(i, "quantity", v)}
                              placeholder="e.g. 500 cards" placeholderTextColor="#C4C4CF" />
                          </FormField>
                        </View>
                        <View style={{ width: 12 }} />
                        <View style={{ flex: 1 }}>
                          <FormField label="Price">
                            <TextInput style={s.input} value={tier.price}
                              onChangeText={(v) => updatePricing(i, "price", v)}
                              placeholder="₵45.00" placeholderTextColor="#C4C4CF" />
                          </FormField>
                        </View>
                      </View>
                    </View>
                  ))}

                  <AddButton label="Add Pricing Tier" color={editColor} onPress={addPricing} />
                </View>
              )}

              {/* ── FAQs ───────────────────────────────────────────────────── */}
              {activeSection === "faqs" && (
                <View style={s.section}>
                  <SectionHeader icon="help-circle" title="Frequently Asked Questions" color={editColor} />
                  <Text style={s.sectionHint}>
                    Common questions shown at the bottom of the service page.
                  </Text>

                  {editFaqs.map((faq, i) => (
                    <View key={i} style={s.groupCard}>
                      <View style={s.groupCardHeader}>
                        <View style={[s.groupBadge, { backgroundColor: editColor }]}>
                          <Text style={s.groupBadgeText}>Q{i + 1}</Text>
                        </View>
                        <Text style={s.groupTitle}>FAQ {i + 1}</Text>
                        <TouchableOpacity onPress={() => removeFaq(i)}>
                          <Ionicons name="trash-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                      <FormField label="Question">
                        <TextInput style={s.input} value={faq.question}
                          onChangeText={(v) => updateFaq(i, "question", v)}
                          placeholder="What is…?" placeholderTextColor="#C4C4CF" />
                      </FormField>
                      <FormField label="Answer">
                        <TextInput style={[s.input, s.textAreaSm]} value={faq.answer}
                          onChangeText={(v) => updateFaq(i, "answer", v)}
                          placeholder="Your answer…" placeholderTextColor="#C4C4CF"
                          multiline numberOfLines={3} />
                      </FormField>
                    </View>
                  ))}

                  <AddButton label="Add FAQ" color={editColor} onPress={addFaq} />
                </View>
              )}

              {/* Floating save button */}
              <TouchableOpacity
                style={[s.bigSaveBtn, { backgroundColor: editColor }, saving && { opacity: 0.65 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving
                  ? <ActivityIndicator color="#fff" />
                  : <><Ionicons name="save-outline" size={20} color="#fff" />
                    <Text style={s.bigSaveBtnText}>Save Changes to Supabase</Text></>
                }
              </TouchableOpacity>

              <View style={{ height: 60 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Reusable mini-components ────────────────────────────────────────────────

function Chip({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <View style={[chipS.wrap, { backgroundColor: color + "14" }]}>
      <Ionicons name={icon as any} size={11} color={color} />
      <Text style={[chipS.text, { color }]}>{label}</Text>
    </View>
  );
}
const chipS = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 },
  text: { fontSize: 11, fontWeight: "600" },
});

function SectionHeader({ icon, title, color }: { icon: string; title: string; color: string }) {
  return (
    <View style={shS.wrap}>
      <View style={[shS.iconWrap, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon as any} size={15} color={color} />
      </View>
      <Text style={shS.title}>{title}</Text>
    </View>
  );
}
const shS = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14, marginTop: 20 },
  iconWrap: { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
});

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <View style={ffS.wrap}>
      <Text style={ffS.label}>
        {label}
        {required && <Text style={ffS.req}> *</Text>}
      </Text>
      {children}
    </View>
  );
}
const ffS = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  req: { color: "#EF4444" },
});

function AddButton({ label, color, onPress }: { label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[abS.wrap, { borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="add-circle" size={20} color={color} />
      <Text style={[abS.text, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}
const abS = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderWidth: 1.5, borderRadius: 12, borderStyle: "dashed", marginTop: 8 },
  text: { fontSize: 15, fontWeight: "600" },
});

// ─── Stylesheet ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6FB" },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16 },
  loadingText: { fontSize: 16, color: "#6B7280", fontWeight: "500" },

  // Header — light refined style
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1, borderBottomColor: "#EDEEF2",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  headerBack: {
    width: 32, height: 32, borderRadius: 9,
    backgroundColor: "#F3F4F6",
    justifyContent: "center", alignItems: "center",
  },
  headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerGradientBadge: {
    width: 28, height: 28, borderRadius: 8,
    justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 15, fontWeight: "600", color: "#1F2937", letterSpacing: 0.1 },
  headerSub: { fontSize: 10, fontWeight: "400", color: "#9CA3AF", letterSpacing: 0.4 },
  resetBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    backgroundColor: "#EDE9FE",
  },
  resetBtnText: { fontSize: 12, fontWeight: "600", color: "#8B5CF6" },

  // Stats bar
  statsBar: {
    flexDirection: "row", backgroundColor: "#FFFFFF",
    paddingVertical: 14, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: "#EDEEF2",
  },
  statItem: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 20, fontWeight: "800", color: "#1F2937" },
  statLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: "500", marginTop: 2 },
  statDivider: { width: 1, backgroundColor: "#E5E7EB", marginVertical: 4 },

  // List
  listContent: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  listHint: { fontSize: 12, color: "#9CA3AF", textAlign: "center", marginVertical: 12, fontStyle: "italic" },

  // Service card
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardStrip: { width: 5 },
  cardBody: { flex: 1, padding: 14 },
  cardTopRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  cardIconWrap: { width: 52, height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  cardTextBlock: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 4 },
  cardDesc: { fontSize: 13, color: "#6B7280", lineHeight: 18 },
  cardEditBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  cardDivider: { height: 1, backgroundColor: "#F3F4F6", marginBottom: 12 },
  cardChips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },

  // Modal
  modalContainer: { flex: 1, backgroundColor: "#F4F6FB" },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1, borderBottomColor: "#EDEEF2",
  },
  modalCloseBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: "#F3F4F6",
    justifyContent: "center", alignItems: "center",
  },
  modalHeaderCenter: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, justifyContent: "center" },
  modalPreviewIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#1F2937", flexShrink: 1 },
  modalSaveBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  modalSaveBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },

  // Tabs — compact
  tabsRow: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#EDEEF2" },
  tabsContent: { paddingHorizontal: 10, paddingVertical: 7, gap: 6 },
  tab: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 11, paddingVertical: 6,
    borderRadius: 16, backgroundColor: "#F3F4F6",
  },
  tabText: { fontSize: 11, fontWeight: "600", color: "#9CA3AF" },
  tabTextActive: { color: "#FFFFFF" },

  // Modal scroll & section
  modalScroll: { flex: 1, paddingHorizontal: 16 },
  section: { paddingTop: 4 },
  sectionHint: { fontSize: 13, color: "#9CA3AF", marginBottom: 16, fontStyle: "italic", lineHeight: 19 },

  // Inputs
  input: {
    backgroundColor: "#FFFFFF", borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: "#1F2937",
    borderWidth: 1, borderColor: "#E5E7EB",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 3, elevation: 1,
  },
  textArea: { minHeight: 110, textAlignVertical: "top" },
  textAreaSm: { minHeight: 72, textAlignVertical: "top" },

  // Colour picker
  colorGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
  colorSwatch: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  colorSwatchRing: { borderWidth: 3, borderColor: "#1F2937" },
  colorLabel: { fontSize: 13, fontWeight: "600", marginBottom: 4 },

  // Icon picker
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  iconOption: { width: 48, height: 48, borderRadius: 12, borderWidth: 2, justifyContent: "center", alignItems: "center" },

  // Item row
  rowInputWrap: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  rowBullet: { width: 26, height: 26, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  rowBulletText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  rowInput: { flex: 1 },
  deleteBtn: { padding: 8 },

  // Group card
  groupCard: {
    backgroundColor: "#FFFFFF", borderRadius: 14, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: "#EDEEF2",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  groupCardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  groupBadge: { width: 26, height: 26, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  groupBadgeText: { fontSize: 11, fontWeight: "800", color: "#fff" },
  groupTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: "#1F2937" },

  // Pricing row
  pricingRow: { flexDirection: "row" },

  // Big save btn
  bigSaveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    borderRadius: 14, paddingVertical: 16, marginTop: 24,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  bigSaveBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
