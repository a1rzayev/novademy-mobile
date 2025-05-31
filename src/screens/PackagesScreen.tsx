import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<TabParamList, 'Packages'>;

export const PackagesScreen = ({ navigation }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // TODO: Fetch packages from API
  const packages = [
    // Placeholder data
    {
      id: '1',
      title: 'Math Package',
      description: 'Complete mathematics course package',
      price: 99.99,
      image: 'https://via.placeholder.com/150',
      courseCount: 5,
    },
    {
      id: '2',
      title: 'Science Package',
      description: 'Comprehensive science courses',
      price: 149.99,
      image: 'https://via.placeholder.com/150',
      courseCount: 8,
    },
  ];

  const filteredPackages = packages.filter(pkg =>
    pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPackageItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.packageCard}
      onPress={() => navigation.navigate('PackageDetails', { packageId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.packageImage} />
      <View style={styles.packageContent}>
        <View style={styles.packageHeader}>
          <Text style={styles.packageTitle}>{item.title}</Text>
          <View style={styles.courseCountBadge}>
            <Text style={styles.courseCountText}>{item.courseCount} Courses</Text>
          </View>
        </View>
        <Text style={styles.packageDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.packageFooter}>
          <Text style={styles.price}>${item.price}</Text>
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
});

export default PackagesScreen; 