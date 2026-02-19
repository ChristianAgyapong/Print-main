import { useAuth } from "@/contexts/AuthContext";
import { storageService, Upload } from "@/lib/storage-service";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function SavedDesignsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadUploads();
  }, []);

  const loadUploads = async () => {
    if (!user) return;
    setLoading(true);
    const data = await storageService.getUserUploads(user.id);
    setUploads(data);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUploads();
    setRefreshing(false);
  };

  const handleDelete = (upload: Upload) => {
    Alert.alert(
      "Delete Design",
      "Are you sure you want to delete this design?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const success = await storageService.deleteUpload(
              upload.id,
              upload.file_url,
            );
            if (success) {
              setUploads(uploads.filter((u) => u.id !== upload.id));
              Alert.alert("Success", "Design deleted successfully");
            } else {
              Alert.alert("Error", "Failed to delete design");
            }
          },
        },
      ],
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return "image";
    if (fileType === "application/pdf") return "document-text";
    return "document";
  };

  const renderUpload = ({ item }: { item: Upload }) => (
    <TouchableOpacity style={styles.uploadCard} activeOpacity={0.7}>
      <View style={styles.uploadIcon}>
        <Ionicons
          name={getFileIcon(item.file_type) as any}
          size={32}
          color="#3B82F6"
        />
      </View>
      <View style={styles.uploadInfo}>
        <Text style={styles.uploadName} numberOfLines={1}>
          {item.filename}
        </Text>
        <Text style={styles.uploadMeta}>
          {storageService.formatFileSize(item.file_size)} •{" "}
          {formatDate(item.created_at)}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item)}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/profile");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Designs</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading designs...</Text>
        </View>
      ) : uploads.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={80} color="#E5E7EB" />
          <Text style={styles.emptyTitle}>No Designs Yet</Text>
          <Text style={styles.emptyText}>
            Upload your first design from the product page
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.browseButtonText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.statsBar}>
            <Text style={styles.statsText}>
              {uploads.length} {uploads.length === 1 ? "design" : "designs"}{" "}
              saved
            </Text>
          </View>
          <FlatList
            data={uploads}
            renderItem={renderUpload}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        </>
      )}
    </SafeAreaView>
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
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  statsBar: {
    padding: 16,
    backgroundColor: "#fff",
  },
  statsText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  listContainer: {
    padding: 20,
  },
  uploadCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  uploadInfo: {
    flex: 1,
  },
  uploadName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  uploadMeta: {
    fontSize: 13,
    color: "#6B7280",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});
