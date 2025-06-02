import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, useTheme, ActivityIndicator, Searchbar } from 'react-native-paper';
import packageService, { Package } from '../../api/services/packageService';

const PackageSelectionScreen = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  const fetchPackages = async (query?: string) => {
    try {
      setError(null);
      const fetchedPackages = await packageService.getPackages(query);
      if (!Array.isArray(fetchedPackages)) {
        console.error('Invalid packages response:', fetchedPackages);
        throw new Error('Invalid response format from server');
      }
      setPackages(fetchedPackages);
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

  const handlePurchase = async (packageId: string) => {
    setPurchasing(packageId);
    try {
      const result = await packageService.purchasePackage(packageId);
      Alert.alert(
        'Success',
        'Package purchased successfully!',
        [{ text: 'OK', onPress: () => fetchPackages() }]
      );
    } catch (error: any) {
      console.error('Purchase error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to purchase package';
      Alert.alert('Error', errorMessage);
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

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button mode="contained" onPress={() => fetchPackages()}>
            Retry
          </Button>
        </View>
      )}

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
                  {pkg.courseCount} Courses
                </Text>
                <Text variant="titleMedium" style={styles.price}>
                  ${pkg.price}
                </Text>
              </View>
              {pkg.courses && pkg.courses.length > 0 && (
                <View style={styles.coursesContainer}>
                  <Text variant="bodySmall" style={styles.coursesTitle}>
                    Included Courses:
                  </Text>
                  {pkg.courses.map((course) => (
                    <Text key={course.id} variant="bodySmall" style={styles.course}>
                      • {course.title}
                    </Text>
                  ))}
                </View>
              )}
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

        {!error && packages.length === 0 && !loading && (
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
  coursesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
  },
  coursesTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  course: {
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
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    margin: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default PackageSelectionScreen; 