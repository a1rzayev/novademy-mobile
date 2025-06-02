import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, useTheme, ActivityIndicator, Searchbar } from 'react-native-paper';
import packageService from '../../api/services/packageService';

interface Package {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  features: string[];
}

const PackageSelectionScreen = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const theme = useTheme();

  const fetchPackages = async (query?: string) => {
    try {
      const fetchedPackages = await packageService.getPackages(query);
      setPackages(fetchedPackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      Alert.alert('Error', 'Failed to load packages. Please try again.');
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

  const handlePurchase = async (packageId: string) => {
    setPurchasing(packageId);
    try {
      const result = await packageService.purchasePackage(packageId);
      Alert.alert(
        'Success',
        'Package purchased successfully!',
        [{ text: 'OK', onPress: () => fetchPackages() }]
      );
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'Failed to purchase package. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Available Packages
        </Text>
        <Searchbar
          placeholder="Search packages..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {packages.map((pkg) => (
          <Card key={pkg.id} style={styles.packageCard}>
            <Card.Content>
              <Text variant="titleLarge" style={styles.packageTitle}>
                {pkg.title}
              </Text>
              <Text variant="bodyMedium" style={styles.packageDescription}>
                {pkg.description}
              </Text>
              <View style={styles.packageDetails}>
                <Text variant="bodyMedium">
                  Duration: {pkg.duration} months
                </Text>
                <Text variant="titleMedium" style={styles.price}>
                  ${pkg.price}
                </Text>
              </View>
              <View style={styles.featuresContainer}>
                {pkg.features.map((feature, index) => (
                  <Text key={index} variant="bodySmall" style={styles.feature}>
                    • {feature}
                  </Text>
                ))}
              </View>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => handlePurchase(pkg.id)}
                loading={purchasing === pkg.id}
                disabled={purchasing !== null}
                style={styles.purchaseButton}
              >
                Purchase
              </Button>
            </Card.Actions>
          </Card>
        ))}

        {packages.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={styles.emptyStateText}>
              No packages found
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  searchBar: {
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  packageCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  packageTitle: {
    marginBottom: 8,
  },
  packageDescription: {
    marginBottom: 12,
    opacity: 0.8,
  },
  packageDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontWeight: 'bold',
  },
  featuresContainer: {
    marginTop: 8,
  },
  feature: {
    marginBottom: 4,
    opacity: 0.8,
  },
  purchaseButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    opacity: 0.7,
  },
});

export default PackageSelectionScreen; 