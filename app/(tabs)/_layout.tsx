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
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: true,
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerBackground: () => (
          <LinearGradient
            colors={['#2563EB', '#3B82F6', '#60A5FA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        ),
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          letterSpacing: 0.5,
        },
        headerShadowVisible: true,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 80,
          backgroundColor: 'rgba(30, 30, 35, 0.95)',
          borderRadius: 40,
          paddingBottom: 5,
          paddingTop: 5,
          paddingHorizontal: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
          elevation: 20,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={[StyleSheet.absoluteFill, { borderRadius: 40 }]}
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
              <Ionicons name="cart" size={22} color="#FFFFFF" />
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
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
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
    backgroundColor: '#60A5FA',
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
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
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
    backgroundColor: '#FBBF24',
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2.5,
    borderColor: '#2563EB',
    shadowColor: '#FBBF24',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  cartBadgeText: {
    color: '#1F2937',
    fontSize: 11,
    fontWeight: '900',
  },
});

