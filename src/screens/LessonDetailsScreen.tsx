import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text, Card, Button, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Chatbot } from '../components/Chatbot';
import courseService, { Lesson } from '../api/services/courseService';
import { useAppSelector } from '../store';

type Props = NativeStackScreenProps<RootStackParamList, 'LessonDetails'>;

export const LessonDetailsScreen = ({ route, navigation }: Props) => {
  const { lessonId } = route.params;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      setLoading(true);
      setError(null);
      const lessonData = await courseService.getLessonById(lessonId);
      setLesson(lessonData);
    } catch (error: any) {
      console.error('Error fetching lesson:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load lesson';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !lesson) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || 'Failed to load lesson details'}
        </Text>
        <Button mode="contained" onPress={fetchLesson} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <Card style={styles.lessonCard}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              {lesson.title}
            </Text>
            <Text variant="bodyLarge" style={styles.description}>
              {lesson.description}
            </Text>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Text variant="bodyMedium" style={styles.detailLabel}>
                  Duration
                </Text>
                <Text variant="bodyLarge" style={styles.detailValue}>
                  {lesson.duration} minutes
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text variant="bodyMedium" style={styles.detailLabel}>
                  Status
                </Text>
                <Text
                  variant="bodyLarge"
                  style={[
                    styles.detailValue,
                    { color: lesson.isFree ? theme.colors.primary : theme.colors.error },
                  ]}
                >
                  {lesson.isFree ? 'Free' : 'Premium'}
                </Text>
              </View>
            </View>

            {lesson.videoUrl && (
              <View style={styles.videoContainer}>
                <Text variant="titleMedium" style={styles.videoTitle}>
                  Lesson Video
                </Text>
                {/* Add video player component here */}
                <Text style={styles.videoPlaceholder}>
                  Video player will be implemented here
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.chatbotCard}>
          <Card.Content>
            <Chatbot
              lessonId={lessonId}
              title="Lesson Assistant"
              subtitle="Ask questions about this lesson"
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  lessonCard: {
    margin: 16,
    marginBottom: 8,
  },
  title: {
    marginBottom: 12,
  },
  description: {
    marginBottom: 16,
    opacity: 0.8,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    opacity: 0.7,
    marginBottom: 4,
  },
  detailValue: {
    fontWeight: 'bold',
  },
  videoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  videoTitle: {
    marginBottom: 8,
  },
  videoPlaceholder: {
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    color: '#6C757D',
  },
  chatbotCard: {
    margin: 16,
    marginTop: 8,
    height: 400, // Fixed height for the chatbot
  },
});

export default LessonDetailsScreen; 