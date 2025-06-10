import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Text, Card, Button, useTheme, Divider, Chip } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import packageService, { Package } from '../api/services/packageService';
import { useAppSelector } from '../store';
import Chatbot from '../components/Chatbot';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'PackageDetails'>;

const PackageDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const packageId = route?.params?.packageId;
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (!packageId) {
      setError('Package ID is missing');
      setLoading(false);
      return;
    }
    fetchPackageDetails();
  }, [packageId]);

  const fetchPackageDetails = async () => {
    if (!packageId) return;
    
    try {
      setError(null);
      console.log('Fetching package details for ID:', packageId);
      
      const [data, purchased] = await Promise.all([
        packageService.getPackageById(packageId),
        packageService.isPackagePurchased(packageId)
      ]);

      console.log('Package data received:', {
        id: data.id,
        title: data.title,
        courseCount: data.courses?.length || 0,
        isPurchased: purchased
      });

      if (!data || !data.id) {
        throw new Error('Invalid package data received');
      }

      // Ensure courses array exists
      const packageData = {
        ...data,
        courses: data.courses || [],
        courseCount: data.courses?.length || 0
      };

      setPackageData(packageData);
      setIsPurchased(purchased);
    } catch (error: any) {
      console.error('Error in fetchPackageDetails:', {
        message: error.message,
        packageId,
        error
      });
      
      let errorMessage = 'Failed to load package details';
      if (error.response?.status === 404) {
        errorMessage = 'Package not found';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      Alert.alert(
        'Authentication Required',
        'Please log in to purchase packages.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () => navigation.navigate('Auth', { screen: 'Login' }),
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Are you sure you want to purchase "${packageData?.title}" for $${packageData?.price}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Purchase',
          onPress: async () => {
            try {
              setPurchasing(true);
              await packageService.purchasePackage(packageId);
              Alert.alert(
                'Success',
                'Package purchased successfully!',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.navigate('MainTabs');
                      navigation.navigate('Packages');
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error('Purchase error:', error);
              Alert.alert(
                'Purchase Failed',
                error.message || 'Failed to purchase package. Please try again.'
              );
            } finally {
              setPurchasing(false);
            }
          },
        },
      ]
    );
  };

  const handleOpenPackage = () => {
    if (packageData?.courses && packageData.courses.length > 0) {
      navigation.navigate('LessonDetails', {
        lessonId: packageData.courses[0].id
      });
    }
  };

  if (!packageId) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid package ID</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

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
          <View style={styles.titleContainer}>
            <Text variant="headlineMedium" style={styles.title}>
              {packageData?.title || 'Loading...'}
            </Text>
            {isPurchased && (
              <Chip
                icon="check-circle"
                style={styles.purchasedChip}
                textStyle={styles.purchasedChipText}
              >
                Purchased
              </Chip>
            )}
          </View>
          <Text variant="bodyLarge" style={styles.description}>
            {packageData?.description || 'No description available'}
          </Text>
          <View style={styles.priceContainer}>
            <Text variant="headlineSmall" style={styles.price}>
              ${packageData?.price || 0}
            </Text>
            <Text variant="bodyMedium" style={styles.courseCount}>
              {packageData?.courses?.length || 0} Courses
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Included Courses
          </Text>
          {packageData?.courses && packageData.courses.length > 0 ? (
            packageData.courses.map((course) => (
              <View key={course.id} style={styles.courseItem}>
                <Text variant="titleMedium">{course.title}</Text>
                <Text variant="bodyMedium" style={styles.courseDescription}>
                  {course.description}
                </Text>
              </View>
            ))
          ) : (
            <Text variant="bodyMedium" style={styles.noCoursesText}>
              No courses available in this package
            </Text>
          )}
        </Card.Content>
      </Card>

      <View style={styles.actionContainer}>
        {isPurchased ? (
          <Button
            mode="contained"
            onPress={handleOpenPackage}
            icon="play-circle"
            style={styles.openButton}
          >
            Open Package
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handlePurchase}
            loading={purchasing}
            disabled={purchasing}
            style={styles.purchaseButton}
          >
            {purchasing ? 'Processing...' : 'Purchase Package'}
          </Button>
        )}
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
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  purchasedChip: {
    backgroundColor: '#E8F5E9',
  },
  purchasedChipText: {
    color: '#2E7D32',
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
  actionContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  purchaseButton: {
    paddingVertical: 8,
  },
  openButton: {
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
  },
  chatbotCard: {
    margin: 16,
    marginTop: 8,
  },
  noCoursesText: {
    color: '#808080',
    textAlign: 'center',
  },
});

export default PackageDetailsScreen; 