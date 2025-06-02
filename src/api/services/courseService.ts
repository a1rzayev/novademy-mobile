import apiClient from '../client';

export interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  image: string;
  lessons: Lesson[];
  instructor: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl: string;
  order: number;
  isFree: boolean;
}

class CourseService {
  async getCourses(searchQuery?: string): Promise<Course[]> {
    const params = searchQuery ? { search: searchQuery } : undefined;
    const response = await apiClient.get<Course[]>('/course', { params });
    return response.data;
  }

  async getFeaturedCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>('/courses/featured');
    return response.data;
  }

  async getCourseById(courseId: string): Promise<Course> {
    const response = await apiClient.get<Course>(`/course/${courseId}`);
    return response.data;
  }

  async getLessonsByCourseId(courseId: string): Promise<Lesson[]> {
    const response = await apiClient.get<Lesson[]>(`/lesson/course/${courseId}`);
    return response.data;
  }

  async getLessonById(lessonId: string): Promise<Lesson> {
    const response = await apiClient.get<Lesson>(`/lesson/${lessonId}`);
    return response.data;
  }

  // Note: Course enrollment is handled through package subscription
  // This method is kept for future use if direct course enrollment is added
  async enrollInCourse(courseId: string): Promise<void> {
    await apiClient.post(`/course/${courseId}/enroll`);
  }

  async getEnrolledCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>('/courses/enrolled');
    return response.data;
  }
}

export default new CourseService(); 