import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface OrderStatusTrackerProps {
  status: string;
}

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  status,
}) => {
  const statuses = [
    { key: "pending", label: "Pending", icon: "time-outline" },
    { key: "processing", label: "Processing", icon: "construct-outline" },
    { key: "printing", label: "Printing", icon: "print-outline" },
    { key: "shipped", label: "Shipped", icon: "airplane-outline" },
    { key: "delivered", label: "Delivered", icon: "checkmark-circle" },
  ];

  const currentIndex = statuses.findIndex((s) => s.key === status);

  return (
    <View style={styles.container}>
      {statuses.map((item, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <React.Fragment key={item.key}>
            <View style={styles.statusItem}>
              <View
                style={[
                  styles.iconContainer,
                  isCompleted && styles.iconContainerActive,
                  isCurrent && styles.iconContainerCurrent,
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={isCompleted ? "#fff" : "#9CA3AF"}
                />
              </View>
              <Text
                style={[
                  styles.statusLabel,
                  isCompleted && styles.statusLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </View>
            {index < statuses.length - 1 && (
              <View
                style={[
                  styles.connector,
                  isCompleted && styles.connectorActive,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  statusItem: {
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  iconContainerActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  iconContainerCurrent: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  statusLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    textAlign: "center",
  },
  statusLabelActive: {
    color: "#1F2937",
  },
  connector: {
    height: 2,
    backgroundColor: "#E5E7EB",
    marginBottom: 32,
    flex: 0.5,
  },
  connectorActive: {
    backgroundColor: "#10B981",
  },
});
