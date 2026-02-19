import { View, Text, StyleSheet, Pressable, Dimensions, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;
const isMediumDevice = width >= 375 && width < 414;

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/auth');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background with gradient effect */}
      <View style={styles.backgroundGradient}>
        {/* Decorative circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Ionicons name="color-palette" size={isSmallDevice ? 38 : 45} color="#FF006E" />
            </View>
            <Text style={styles.logoText}>PrintCraft</Text>
            <Text style={styles.tagline}>Design • Print • Perfect</Text>
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Text style={styles.title}>Transform Your</Text>
            <Text style={styles.titleAccent}>Creative Vision</Text>

            <Text style={styles.description}>
              Premium quality printing services for all your design needs. From business cards to large format prints, we bring your ideas to life.
            </Text>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="flash" size={isSmallDevice ? 20 : 24} color="#FF006E" />
              </View>
              <Text style={styles.featureTitle}>Fast Delivery</Text>
              <Text style={styles.featureDescription}>24-48 hours</Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="sparkles" size={isSmallDevice ? 20 : 24} color="#FF006E" />
              </View>
              <Text style={styles.featureTitle}>Top Quality</Text>
              <Text style={styles.featureDescription}>Premium materials</Text>
            </View>

            <View style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="locate" size={isSmallDevice ? 20 : 24} color="#FF006E" />
              </View>
              <Text style={styles.featureTitle}>Custom Design</Text>
              <Text style={styles.featureDescription}>Tailored for you</Text>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed
              ]}
              onPress={handleGetStarted}
            >
              <Text style={styles.buttonText}>Get Started Now</Text>
              <Ionicons name="arrow-forward" size={isSmallDevice ? 18 : 22} color="#FFFFFF" />
            </Pressable>

            <View style={styles.trustIndicator}>
              <View style={styles.trustRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.trustText}> 4.9 rating • 10,000+ happy customers</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1E',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F0F1E',
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.15,
  },
  circle1: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: '#FF006E',
    top: -width * 0.4,
    right: -width * 0.3,
  },
  circle2: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: '#8338EC',
    bottom: -width * 0.3,
    left: -width * 0.2,
  },
  circle3: {
    width: width * 0.5,
    height: width * 0.5,
    backgroundColor: '#3A86FF',
    top: height * 0.4,
    left: width * 0.6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: isSmallDevice ? 20 : isMediumDevice ? 24 : 32,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: isSmallDevice ? 10 : 20,
  },
  logoWrapper: {
    width: isSmallDevice ? 70 : 85,
    height: isSmallDevice ? 70 : 85,
    borderRadius: isSmallDevice ? 35 : 42.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  logoText: {
    fontSize: isSmallDevice ? 28 : isMediumDevice ? 32 : 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#FF006E',
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heroSection: {
    alignItems: 'center',
    marginTop: isSmallDevice ? 20 : 30,
  },
  title: {
    fontSize: isSmallDevice ? 32 : isMediumDevice ? 38 : 44,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: isSmallDevice ? 40 : isMediumDevice ? 46 : 52,
  },
  titleAccent: {
    fontSize: isSmallDevice ? 32 : isMediumDevice ? 38 : 44,
    fontWeight: '700',
    color: '#FF006E',
    textAlign: 'center',
    marginBottom: isSmallDevice ? 16 : 24,
    lineHeight: isSmallDevice ? 40 : isMediumDevice ? 46 : 52,
  },
  description: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#B8B8D1',
    textAlign: 'center',
    lineHeight: isSmallDevice ? 22 : 26,
    paddingHorizontal: isSmallDevice ? 0 : 10,
    maxWidth: 480,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: isSmallDevice ? 30 : 40,
    gap: isSmallDevice ? 8 : 12,
  },
  featureCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: isSmallDevice ? 14 : 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIconContainer: {
    width: isSmallDevice ? 44 : 52,
    height: isSmallDevice ? 44 : 52,
    borderRadius: isSmallDevice ? 22 : 26,
    backgroundColor: 'rgba(255, 0, 110, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  featureTitle: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: isSmallDevice ? 10 : 11,
    color: '#B8B8D1',
    textAlign: 'center',
    fontWeight: '500',
  },
  ctaContainer: {
    marginTop: 'auto',
  },
  button: {
    backgroundColor: '#FF006E',
    paddingVertical: isSmallDevice ? 16 : 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF006E',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 10,
    letterSpacing: 0.5,
  },
  trustIndicator: {
    marginTop: isSmallDevice ? 20 : 24,
    alignItems: 'center',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustText: {
    fontSize: isSmallDevice ? 12 : 13,
    color: '#B8B8D1',
    fontWeight: '500',
  },
});
