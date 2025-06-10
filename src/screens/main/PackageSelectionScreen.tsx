import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, useTheme, ActivityIndicator, Searchbar, Chip, Divider } from 'react-native-paper';
import packageService, { Package } from '../../api/services/packageService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PackageSelectionScreen = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [purchasedPackages, setPurchasedPackages] = useState<Package[]>([]);
  const [availablePackages, setAvailablePackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const fetchPackages = async (query?: string) => {
    try {
      setError(null);
      const fetchedPackages = await packageService.getPackages(query);
      
      // Check purchase status for each package
      const packagesWithStatus = await Promise.all(
        fetchedPackages.map(async (pkg) => {
          const isPurchased = await packageService.isPackagePurchased(pkg.id);
          return { ...pkg, isPurchased };
        })
      );
      
      // Sort packages into purchased and available
      const purchased = packagesWithStatus.filter(pkg => pkg.isPurchased);
      const available = packagesWithStatus.filter(pkg => !pkg.isPurchased);
      
      setPackages(packagesWithStatus);
      setPurchasedPackages(purchased);
      setAvailablePackages(available);
    } catch (error: any) {
      console.error('Error fetching packages:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load packages';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPackages(searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    fetchPackages(query);
  };

  const handlePackagePress = (packageId: string) => {
    if (!packageId) {
      console.error('Package ID is missing');
      return;
    }
    navigation.navigate('PackageDetails', { packageId });
  };

  const renderPackageCard = (pkg: Package) => (
    <Card 
      key={pkg.id} 
      style={styles.packageCard}
      onPress={() => handlePackagePress(pkg.id)}
    >
      <Card.Content>
        <View style={styles.packageHeader}>
          <View style={styles.titleContainer}>
            <Text variant="titleLarge" style={styles.packageTitle}>
              {pkg.title}
            </Text>
            {pkg.isPurchased && (
              <Chip
                icon="check-circle"
                style={[styles.purchasedChip, { backgroundColor: theme.colors.primary }]}
                textStyle={{ color: 'white' }}
              >
                Purchased
              </Chip>
            )}
          </View>
          <Text variant="titleMedium" style={styles.price}>
            ${pkg.price}
          </Text>
        </View>
        <Text variant="bodyMedium" style={styles.description}>
          {pkg.description}
        </Text>
        <View style={styles.footer}>
          <View style={styles.courseCount}>
            <MaterialCommunityIcons name="book-open-variant" size={16} color={theme.colors.primary} />
            <Text variant="bodySmall" style={styles.courseCountText}>
              {pkg.courseCount} Courses
            </Text>
          </View>
          <Button
            mode="contained"
            onPress={() => handlePackagePress(pkg.id)}
            style={styles.viewButton}
          >
            {pkg.isPurchased ? 'View Package' : 'View Details'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search packages..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={() => fetchPackages()}>
            Retry
          </Button>
        </View>
      ) : (
        <>
          {purchasedPackages.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Your Packages
              </Text>
              {purchasedPackages.map(renderPackageCard)}
            </View>
          )}

          {availablePackages.length > 0 && (
            <View style={styles.section}>
              <Text variant="titleLarge" style={styles.sectionTitle}>
                Available Packages
              </Text>
              {availablePackages.map(renderPackageCard)}
            </View>
          )}

          {packages.length === 0 && !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No packages found</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  packageCard: {
    marginBottom: 16,
    elevation: 2,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  packageTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  purchasedChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  price: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  description: {
    marginBottom: 16,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  courseCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseCountText: {
    marginLeft: 4,
    color: '#666',
  },
  viewButton: {
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});

export default PackageSelectionScreen; 