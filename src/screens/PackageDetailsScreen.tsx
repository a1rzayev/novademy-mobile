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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { packageApi } from '../services/api';

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
    fetchPackageDetails();
  }, [packageId]);

  const fetchPackageDetails = async () => {
    if (!packageId) {
      setError('Package ID is missing');
      setLoading(false);
      return;
    }

    try {
      const response = await packageApi.getPackage(packageId);
      setPackageData(response.data);
      
      // Check if package is already purchased
      if (user) {
        const isPurchased = await packageApi.isPackagePurchased(packageId);
        setPackageData(prev => prev ? { ...prev, isPurchased } : null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch package details');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    if (!packageData) {
      Alert.alert('Error', 'Package details are not available');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please login to purchase a package');
      navigation.navigate('Login');
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Are you sure you want to purchase ${packageData.title} for ${packageData.price} AZN?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Purchase',
          onPress: () => {
            navigation.navigate('Payment', {
              packageId: packageData.id,
              packageName: packageData.title,
              amount: packageData.price
            });
          }
        }
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading package details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color="#ff4d4f" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('MainTabs' as never, { screen: 'Packages' } as never)}
          >
            <Text style={styles.buttonText}>Back to Packages</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!packageData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorMessage}>Package not found</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Packages')}
        >
          <Text style={styles.buttonText}>Back to Packages</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{packageData.title}</Text>
        <Text style={styles.description}>{packageData.description}</Text>
        <Text style={styles.price}>{packageData.price} AZN</Text>

        {packageData.isPurchased ? (
          <View style={styles.purchasedContainer}>
            <Icon name="check-circle" size={24} color="#52c41a" />
            <Text style={styles.purchasedText}>You have purchased this package</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, purchasing && styles.buttonDisabled]}
            onPress={handlePurchase}
            disabled={purchasing}
          >
            {purchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="shopping" size={20} color="#fff" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Purchase Package</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff4d4f',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  purchasedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6ffed',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b7eb8f',
  },
  purchasedText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#52c41a',
  },
});

export default PackageDetailsScreen; 