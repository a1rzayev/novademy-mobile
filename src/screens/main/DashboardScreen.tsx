import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';
import { useAppSelector } from '../../store';

const DashboardScreen = () => {
  const user = useAppSelector((state) => state.auth.user);
  const theme = useTheme();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Welcome, {user?.firstName || 'User'}!
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Your Progress
          </Text>
          <View style={styles.progressContainer}>
            <Text variant="bodyLarge">No active courses yet</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Start learning by selecting a package
            </Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.actionsContainer}>
            <Text variant="bodyLarge">• Browse available packages</Text>
            <Text variant="bodyLarge">• View your profile</Text>
            <Text variant="bodyLarge">• Check your progress</Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    textAlign: 'center',
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  progressContainer: {
    alignItems: 'center',
    padding: 16,
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 8,
  },
  actionsContainer: {
    padding: 8,
  },
});

export default DashboardScreen; 