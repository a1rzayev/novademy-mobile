import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Button, useTheme, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/AppNavigator';
import packageService, { Package } from '../api/services/packageService';
import { useAppSelector } from '../store';
import Chatbot from '../components/Chatbot';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<MainStackParamList, 'PackageDetails'>;

const PackageDetailsScreen = ({ route, navigation }: Props) => {
  const { packageId } = route.params;
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    fetchPackageDetails();
  }, [packageId]);

  const fetchPackageDetails = async () => {
    try {
      setError(null);
      const data = await packageService.getPackageById(packageId);
      setPackageData(data);
    } catch (error: any) {
      console.error('Error fetching package details:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load package details');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'Please log in to purchase this package.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Log In',
            onPress: () => navigation.navigate('Auth', { screen: 'Login' })
          }
        ]
      );
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Are you sure you want to purchase "${packageData?.title}" for $${packageData?.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase',
          onPress: async () => {
            setPurchasing(true);
            try {
              const result = await packageService.purchasePackage(packageId);
              Alert.alert(
                'Success',
                'Package purchased successfully! You can now access all included courses.',
                [
                  {
                    text: 'View Courses',
                    onPress: () => {
                      if (packageData?.courses && packageData.courses.length > 0) {
                        // Navigate to the first course
                        navigation.navigate('LessonDetails', {
                          lessonId: packageData.courses[0].id
                        });
                      }
                    }
                  },
                  { text: 'Stay Here', style: 'cancel' }
                ]
              );
            } catch (error: any) {
              console.error('Purchase error:', error);
              let errorMessage = 'Failed to purchase package. ';
              
              if (error.message.includes('Validation failed')) {
                errorMessage += error.message;
              } else if (error.response?.data?.message) {
                errorMessage += error.response.data.message;
              } else if (error.message) {
                errorMessage += error.message;
              }
              
              Alert.alert('Purchase Failed', errorMessage);
            } finally {
              setPurchasing(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !packageData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || 'Failed to load package details'}
        </Text>
        <Button mode="contained" onPress={fetchPackageDetails}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            {packageData.title}
          </Text>
          <Text variant="bodyLarge" style={styles.description}>
            {packageData.description}
          </Text>
          <View style={styles.priceContainer}>
            <Text variant="headlineSmall" style={styles.price}>
              ${packageData.price}
            </Text>
            <Text variant="bodyMedium" style={styles.courseCount}>
              {packageData.courseCount} Courses
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Included Courses
          </Text>
          {packageData.courses.map((course) => (
            <View key={course.id} style={styles.courseItem}>
              <Text variant="titleMedium">{course.title}</Text>
              <Text variant="bodyMedium" style={styles.courseDescription}>
                {course.description}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      <View style={styles.purchaseContainer}>
        <Button
          mode="contained"
          onPress={handlePurchase}
          loading={purchasing}
          disabled={purchasing}
          style={styles.purchaseButton}
        >
          {purchasing ? 'Processing...' : 'Purchase Package'}
        </Button>
      </View>

      <Card style={styles.chatbotCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Need Help?
          </Text>
          <Chatbot
            packageId={packageId}
            mode="embedded"
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
    opacity: 0.8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  courseCount: {
    opacity: 0.8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  courseItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  courseDescription: {
    marginTop: 4,
    opacity: 0.8,
  },
  purchaseContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  purchaseButton: {
    paddingVertical: 8,
  },
  chatbotCard: {
    margin: 16,
    marginTop: 8,
  },
});

export default PackageDetailsScreen; 