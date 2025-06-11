import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const LandingScreen = () => {
  const navigation = useNavigation();

  const handleGetStarted = () => {
    navigation.navigate('Register' as never);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Welcome to Novademy</Text>
        <Text style={styles.heroSubtitle}>
          Your gateway to professional development and career growth
        </Text>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.getStartedButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>

      {/* Promo Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Choose Novademy?</Text>
        <View style={styles.promoGrid}>
          <View style={styles.promoItem}>
            <Icon name="school" size={32} color="#007AFF" />
            <Text style={styles.promoTitle}>Expert Instructors</Text>
            <Text style={styles.promoText}>
              Learn from industry professionals with years of experience
            </Text>
          </View>
          <View style={styles.promoItem}>
            <Icon name="book-open-variant" size={32} color="#007AFF" />
            <Text style={styles.promoTitle}>Comprehensive Courses</Text>
            <Text style={styles.promoText}>
              Access a wide range of courses designed for your success
            </Text>
          </View>
          <View style={styles.promoItem}>
            <Icon name="clock-outline" size={32} color="#007AFF" />
            <Text style={styles.promoTitle}>Flexible Learning</Text>
            <Text style={styles.promoText}>
              Study at your own pace, anytime and anywhere
            </Text>
          </View>
        </View>
      </View>

      {/* Pricing Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Packages</Text>
        <View style={styles.pricingContainer}>
          <View style={styles.pricingCard}>
            <Text style={styles.pricingTitle}>Basic</Text>
            <Text style={styles.pricingPrice}>49 AZN</Text>
            <Text style={styles.pricingPeriod}>per month</Text>
            <View style={styles.pricingFeatures}>
              <Text style={styles.pricingFeature}>• Access to basic courses</Text>
              <Text style={styles.pricingFeature}>• Community support</Text>
              <Text style={styles.pricingFeature}>• Basic resources</Text>
            </View>
            <TouchableOpacity 
              style={styles.pricingButton}
              onPress={() => navigation.navigate('Packages' as never)}
            >
              <Text style={styles.pricingButtonText}>Choose Plan</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.pricingCard, styles.pricingCardFeatured]}>
            <Text style={styles.pricingTitle}>Premium</Text>
            <Text style={styles.pricingPrice}>99 AZN</Text>
            <Text style={styles.pricingPeriod}>per month</Text>
            <View style={styles.pricingFeatures}>
              <Text style={styles.pricingFeature}>• All basic features</Text>
              <Text style={styles.pricingFeature}>• Premium courses</Text>
              <Text style={styles.pricingFeature}>• 1-on-1 mentoring</Text>
              <Text style={styles.pricingFeature}>• Priority support</Text>
            </View>
            <TouchableOpacity 
              style={[styles.pricingButton, styles.pricingButtonFeatured]}
              onPress={() => navigation.navigate('Packages' as never)}
            >
              <Text style={styles.pricingButtonText}>Choose Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* FAQ Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqContainer}>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What is Novademy?</Text>
            <Text style={styles.faqAnswer}>
              Novademy is an online learning platform that offers professional development courses and career guidance.
            </Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I get started?</Text>
            <Text style={styles.faqAnswer}>
              Simply create an account, choose a package that suits your needs, and start learning!
            </Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Can I cancel my subscription?</Text>
            <Text style={styles.faqAnswer}>
              Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 Novademy. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroSection: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  heroSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  getStartedButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  getStartedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  promoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  promoItem: {
    width: width - 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: '#333',
  },
  promoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  pricingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  pricingCard: {
    width: width - 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pricingCardFeatured: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  pricingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  pricingPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  pricingPeriod: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  pricingFeatures: {
    width: '100%',
    marginBottom: 20,
  },
  pricingFeature: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  pricingButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  pricingButtonFeatured: {
    backgroundColor: '#007AFF',
  },
  pricingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  faqContainer: {
    gap: 16,
  },
  faqItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
});

export default LandingScreen; 