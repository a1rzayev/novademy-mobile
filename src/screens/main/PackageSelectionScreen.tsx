import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { packageApi, subscriptionApi } from '../../services/api';
import { useAppSelector } from '../../store';

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
}

const PackageSelectionScreen: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState<{ [key: string]: boolean }>({});
  const navigation = useNavigation();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all packages
      const packagesResponse = await packageApi.getPackages();
      const allPackages = packagesResponse.data;

      // If user is logged in, fetch their active subscriptions
      if (user) {
        try {
          const subscriptionsResponse = await subscriptionApi.getActiveSubscriptions(user.id);
          const purchasedPackageIds = new Set(subscriptionsResponse.data.map((sub: any) => sub.packageId));
          
          // Filter out purchased packages
          const availablePackages = allPackages.filter(pkg => !purchasedPackageIds.has(pkg.id));
          setPackages(availablePackages);
        } catch (err: any) {
          // If there's an error fetching subscriptions, show all packages
          console.warn('Error fetching subscriptions:', err);
          setPackages(allPackages);
        }
      } else {
        // If user is not logged in, show all packages
        setPackages(allPackages);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPackage = (packageId: string, packageTitle: string, price: number) => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please login to purchase packages.', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Login',
          onPress: () => navigation.navigate('Auth' as never),
        },
      ]);
      return;
    }

    setPurchasing((prev) => ({ ...prev, [packageId]: true }));
    try {
      navigation.navigate('Payment' as never, {
        packageId,
        packageName: packageTitle,
        amount: price,
      });
    } catch (err) {
      console.error('Failed to process package selection:', err);
    } finally {
      setPurchasing((prev) => ({ ...prev, [packageId]: false }));
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading packages...</Text>
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
            onPress={fetchPackages}
          >
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (packages.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="package-variant" size={48} color="#666" />
          <Text style={styles.emptyTitle}>No Packages Available</Text>
          <Text style={styles.emptyMessage}>
            {user ? "You've purchased all available packages!" : "Please login to see available packages."}
          </Text>
          <TouchableOpacity
            style={styles.reloadButton}
            onPress={fetchPackages}
          >
            <Icon name="refresh" size={20} color="#007AFF" style={styles.reloadButtonIcon} />
            <Text style={styles.reloadButtonText}>Reload</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.reloadButton}
          onPress={fetchPackages}
        >
          <Icon name="refresh" size={20} color="#007AFF" style={styles.reloadButtonIcon} />
          <Text style={styles.reloadButtonText}>Reload</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={packages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.packageCard}>
            <Text style={styles.packageTitle}>{item.title}</Text>
            <Text style={styles.packageDescription}>{item.description}</Text>
            <Text style={styles.price}>{item.price} AZN</Text>
            <TouchableOpacity
              style={[styles.button, purchasing[item.id] && styles.buttonDisabled]}
              onPress={() => handleSelectPackage(item.id, item.title, item.price)}
              disabled={purchasing[item.id]}
            >
              {purchasing[item.id] ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="shopping" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Buy Now</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reloadButtonIcon: {
    marginRight: 4,
  },
  reloadButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default PackageSelectionScreen; 