import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { packageApi } from '../../services/api';
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
      const response = await packageApi.getPackages();
      setPackages(response.data);
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

  return (
    <View style={styles.container}>
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
});

export default PackageSelectionScreen; 