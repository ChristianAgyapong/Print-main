import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

// Shared shimmer hook — one animation shared across all bones in a card
const useShimmer = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ).start();
  }, []);
  return shimmerAnim;
};

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
      style={[styles.skeleton, { width, height, borderRadius, opacity }, style]}
    />
  );
};

// A single shimmer "bone" that sweeps light left-to-right
const ShimmerBone: React.FC<{
  shimmer: Animated.Value;
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}> = ({ shimmer, width = "100%", height, borderRadius = 8, style }) => {
  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View
      style={[
        styles.bone,
        { width: width as any, height, borderRadius },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.shimmerOverlay,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
};

export const ProductCardSkeleton = () => {
  const shimmer = useShimmer();
  return (
    <View style={styles.productCard}>
      {/* Image area */}
      <ShimmerBone shimmer={shimmer} height={140} borderRadius={0} style={styles.productCardImage} />

      {/* Info area */}
      <View style={styles.productCardInfo}>
        {/* Category label */}
        <ShimmerBone
          shimmer={shimmer}
          width="45%"
          height={10}
          borderRadius={5}
          style={{ marginBottom: 8 }}
        />
        {/* Title */}
        <ShimmerBone
          shimmer={shimmer}
          width="90%"
          height={14}
          borderRadius={6}
          style={{ marginBottom: 6 }}
        />
        <ShimmerBone
          shimmer={shimmer}
          width="70%"
          height={14}
          borderRadius={6}
          style={{ marginBottom: 12 }}
        />
        {/* Footer: price + button */}
        <View style={styles.productCardFooter}>
          <ShimmerBone
            shimmer={shimmer}
            width={56}
            height={18}
            borderRadius={6}
          />
          <View style={styles.addButtonSkeleton} />
        </View>
      </View>
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
            <SkeletonLoader
              width={40}
              height={24}
              style={{ marginBottom: 4 }}
            />
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
  // Shimmer bone
  bone: {
    backgroundColor: "#EBEBEB",
    overflow: "hidden",
  },
  shimmerOverlay: {
    width: "60%",
    backgroundColor: "rgba(255,255,255,0.65)",
    transform: [{ skewX: "-20deg" }],
  },
  // Product card skeleton — mirrors the real 200 px card
  productCard: {
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  productCardImage: {
    width: "100%",
  },
  productCardInfo: {
    padding: 12,
  },
  productCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addButtonSkeleton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EBEBEB",
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
