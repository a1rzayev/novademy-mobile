import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { subscriptionApi } from '../../services/api';
import { useAppSelector } from '../../store';

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  purchaseDate: string;
}

const MyPackagesScreen: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    fetchMyPackages();
  }, []);

  const fetchMyPackages = async () => {
    if (!user) {
      setError('Please login to view your packages');
      setLoading(false);
      return;
    }

    try {
      const subscriptions = await subscriptionApi.getActiveSubscriptions(user.id);
      setPackages(subscriptions);
    } catch (err: any) {
      console.error('Error fetching packages:', err);
      setError(err.message || 'Failed to fetch your packages');
    } finally {
      setLoading(false);
    }
  };

  const handlePackagePress = (packageId: string) => {
    navigation.navigate('PackageDetails' as never, { packageId } as never);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your packages...</Text>
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
        </View>
      </View>
    );
  }

  if (packages.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Icon name="package-variant" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No Packages Yet</Text>
          <Text style={styles.emptyText}>
            You haven't purchased any packages yet. Browse our available packages to get started!
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('MainTabs' as never, { screen: 'Packages' } as never)}
          >
            <Text style={styles.buttonText}>Browse Packages</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={packages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.packageCard}
            onPress={() => handlePackagePress(item.id)}
          >
            <View style={styles.packageHeader}>
              <Text style={styles.packageTitle}>{item.title}</Text>
              <Icon name="chevron-right" size={24} color="#666" />
            </View>
            <Text style={styles.packageDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.packageFooter}>
              <Text style={styles.purchaseDate}>
                Purchased on {new Date(item.purchaseDate).toLocaleDateString()}
              </Text>
              <Text style={styles.price}>{item.price} AZN</Text>
            </View>
          </TouchableOpacity>
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
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  purchaseDate: {
    fontSize: 12,
    color: '#999',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
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
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyPackagesScreen; 