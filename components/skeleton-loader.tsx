import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const ProductCardSkeleton = () => {
  return (
    <View style={styles.productCard}>
      <SkeletonLoader height={120} borderRadius={12} style={{ marginBottom: 12 }} />
      <SkeletonLoader width="80%" height={16} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="60%" height={14} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="40%" height={18} />
    </View>
  );
};

export const OrderCardSkeleton = () => {
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <SkeletonLoader width={80} height={16} />
        <SkeletonLoader width={60} height={24} borderRadius={12} />
      </View>
      <SkeletonLoader width="100%" height={14} style={{ marginVertical: 8 }} />
      <SkeletonLoader width="70%" height={14} style={{ marginBottom: 12 }} />
      <View style={styles.orderFooter}>
        <SkeletonLoader width={100} height={16} />
        <SkeletonLoader width={80} height={16} />
      </View>
    </View>
  );
};

export const ProfileSkeleton = () => {
  return (
    <View style={styles.profileContainer}>
      <View style={styles.profileHeader}>
        <SkeletonLoader width={100} height={100} borderRadius={50} />
        <SkeletonLoader width="60%" height={20} style={{ marginTop: 16 }} />
        <SkeletonLoader width="40%" height={14} style={{ marginTop: 8 }} />
      </View>
      <View style={styles.statsContainer}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.statItem}>
            <SkeletonLoader width={40} height={24} style={{ marginBottom: 4 }} />
            <SkeletonLoader width={60} height={14} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#E5E7EB",
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileContainer: {
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
  },
  statItem: {
    alignItems: "center",
  },
});
