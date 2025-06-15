import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';
import { packageApi, subscriptionApi } from '../../services/api';
import { useAppSelector } from '../../store';

type Props = NativeStackScreenProps<TabParamList, 'Packages'>;

export const PackagesScreen = ({ navigation }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  const filteredPackages = packages.filter(pkg =>
    pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <Ionicons name="alert-circle" size={48} color="#ff4d4f" />
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

  const renderPackageItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.packageCard}
      onPress={() => navigation.navigate('PackageDetails', { packageId: item.id })}
    >
      <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={styles.packageImage} />
      <View style={styles.packageContent}>
        <View style={styles.packageHeader}>
          <Text style={styles.packageTitle}>{item.title}</Text>
          <View style={styles.courseCountBadge}>
            <Text style={styles.courseCountText}>{item.courseCount || 0} Courses</Text>
          </View>
        </View>
        <Text style={styles.packageDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.packageFooter}>
          <Text style={styles.price}>{item.price} AZN</Text>
          <TouchableOpacity style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Package</Text>
            <Ionicons name="arrow-forward" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search packages..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredPackages}
        renderItem={renderPackageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No packages found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  listContent: {
    padding: 15,
  },
  packageCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  packageImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  packageContent: {
    padding: 15,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  courseCountBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  courseCountText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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