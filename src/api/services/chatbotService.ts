import apiClient from '../client';
import { decodeToken } from '../../utils/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AskQuestionRequest {
  lessonId: string;
  question: string;
}

export interface AskQuestionResponse {
  answer: string;
}

export class ChatbotError extends Error {
  constructor(message: string, public status?: number, public details?: any) {
    super(message);
    this.name = 'ChatbotError';
  }
}

class ChatbotService {
  async askQuestion(request: AskQuestionRequest): Promise<AskQuestionResponse> {
    try {
      // Check if token is expired
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        const decoded = decodeToken(token);
        if (decoded && decoded.exp) {
          const expirationTime = decoded.exp * 1000; // Convert to milliseconds
          if (Date.now() >= expirationTime) {
            throw new ChatbotError('Your session has expired. Please log in again.', 401);
          }
        }
      }

      // Get a valid lesson ID from the first available course
      let lessonId = request.lessonId;
      if (lessonId === 'demo') {
        try {
          const coursesResponse = await apiClient.get('/course');
          if (coursesResponse.data && coursesResponse.data.length > 0) {
            const courseId = coursesResponse.data[0].id;
            const lessonsResponse = await apiClient.get(`/lesson/course/${courseId}`);
            if (lessonsResponse.data && lessonsResponse.data.length > 0) {
              lessonId = lessonsResponse.data[0].id;
            }
          }
        } catch (error) {
          console.error('Error fetching lesson ID:', error);
          throw new ChatbotError('Could not find a valid lesson. Please try again later.', 500);
        }
      }

      const formData = new FormData();
      formData.append('lessonId', lessonId);
      formData.append('question', request.question);
      
      const response = await apiClient.post<AskQuestionResponse>('/openai/ask', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Chatbot error:', error);
      
      if (error instanceof ChatbotError) {
        throw error;
      }

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 401:
            throw new ChatbotError('Your session has expired. Please log in again.', status);
          case 403:
            throw new ChatbotError('You do not have access to this lesson.', status);
          case 404:
            throw new ChatbotError('The lesson could not be found.', status);
          case 429:
            throw new ChatbotError('Too many requests. Please try again later.', status);
          default:
            throw new ChatbotError(
              data?.message || 'An error occurred while processing your question.',
              status,
              data
            );
        }
      } else if (error.request) {
        // The request was made but no response was received
        throw new ChatbotError('No response from server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new ChatbotError('An unexpected error occurred. Please try again.');
      }
    }
  }
}

export default new ChatbotService(); 