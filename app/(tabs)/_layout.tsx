import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCart } from '@/contexts/CartContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { itemCount } = useCart();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF006E',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: true,
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerBackground: () => (
          <LinearGradient
            colors={['#FFF8F0', '#FAFAF8', '#FFF8F0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        ),
        headerTintColor: '#1F2937',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          letterSpacing: 0.5,
        },
        headerShadowVisible: true,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 85,
          backgroundColor: 'rgba(255, 248, 240, 0.97)',
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          paddingBottom: 8,
          paddingTop: 8,
          paddingHorizontal: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 25,
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.08)',
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={100}
              tint="light"
              style={[StyleSheet.absoluteFill, { borderTopLeftRadius: 32, borderTopRightRadius: 32 }]}
            />
          ) : null
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
          gap: 2,
          backgroundColor: 'transparent',
        },
        headerRight: () => (
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => router.push('/cart')}
          >
            <View style={styles.cartIconContainer}>
              <Ionicons name="cart" size={22} color="#FF006E" />
              {itemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{itemCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'PrintCraft',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused ? styles.iconContainerActive : styles.iconContainerInactive]}>
              {focused && <View style={styles.iconGlowEffect} />}
              <View style={styles.iconWrapper}>
                <Ionicons 
                  name={focused ? 'home' : 'home-outline'} 
                  size={focused ? 28 : 24} 
                  color={focused ? '#FFFFFF' : '#9CA3AF'} 
                />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Services',
          headerTitle: 'Our Services',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused ? styles.iconContainerActive : styles.iconContainerInactive]}>
              {focused && <View style={styles.iconGlowEffect} />}
              <View style={styles.iconWrapper}>
                <Ionicons 
                  name={focused ? 'grid' : 'grid-outline'} 
                  size={focused ? 28 : 24} 
                  color={focused ? '#FFFFFF' : '#9CA3AF'} 
                />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          headerTitle: 'My Orders',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused ? styles.iconContainerActive : styles.iconContainerInactive]}>
              {focused && <View style={styles.iconGlowEffect} />}
              <View style={styles.iconWrapper}>
                <Ionicons 
                  name={focused ? 'document-text' : 'document-text-outline'} 
                  size={focused ? 28 : 24} 
                  color={focused ? '#FFFFFF' : '#9CA3AF'} 
                />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused ? styles.iconContainerActive : styles.iconContainerInactive]}>
              {focused && <View style={styles.iconGlowEffect} />}
              <View style={styles.iconWrapper}>
                <Ionicons 
                  name={focused ? 'person' : 'person-outline'} 
                  size={focused ? 28 : 24} 
                  color={focused ? '#FFFFFF' : '#9CA3AF'} 
                />
              </View>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    position: 'relative',
    marginBottom: 0,
  },
  iconContainerInactive: {
    backgroundColor: 'transparent',
  },
  iconContainerActive: {
    backgroundColor: '#FF006E',
    shadowColor: '#FF006E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  iconGlowEffect: {
    position: 'absolute',
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#FF006E',
    opacity: 0.3,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  cartButton: {
    marginRight: 16,
  },
  cartIconContainer: {
    position: 'relative',
    padding: 10,
    backgroundColor: 'rgba(255, 0, 110, 0.08)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 0, 110, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF006E',
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2.5,
    borderColor: '#FFF8F0',
    shadowColor: '#FF006E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
});

