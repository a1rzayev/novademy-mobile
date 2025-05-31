import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabParamList } from '../types/navigation';

type Props = NativeStackScreenProps<TabParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  // TODO: Fetch featured courses and packages from API
  const featuredCourses = [
    // Placeholder data
    { id: '1', title: 'Course 1', description: 'Description 1', image: 'https://via.placeholder.com/150' },
    { id: '2', title: 'Course 2', description: 'Description 2', image: 'https://via.placeholder.com/150' },
  ];

  const featuredPackages = [
    // Placeholder data
    { id: '1', title: 'Package 1', description: 'Description 1', price: 99.99, image: 'https://via.placeholder.com/150' },
    { id: '2', title: 'Package 2', description: 'Description 2', price: 149.99, image: 'https://via.placeholder.com/150' },
  ];

  const renderCourseItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CourseDetails', { courseId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderPackageItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PackageDetails', { packageId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.price}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to Novademy</Text>
        <Text style={styles.subtitle}>Start your learning journey today</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Courses</Text>
        <FlatList
          data={featuredCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Packages</Text>
        <FlatList
          data={featuredPackages}
          renderItem={renderPackageItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  listContent: {
    paddingRight: 20,
  },
  card: {
    width: 280,
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});

export default HomeScreen; 