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
}

class CourseService {
  async getCourses(searchQuery?: string): Promise<Course[]> {
    const params = searchQuery ? { search: searchQuery } : undefined;
    const response = await apiClient.get<Course[]>('/courses', { params });
    return response.data;
  }

  async getFeaturedCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>('/courses/featured');
    return response.data;
  }

  async getCourseById(courseId: string): Promise<Course> {
    const response = await apiClient.get<Course>(`/courses/${courseId}`);
    return response.data;
  }

  async getLessonById(lessonId: string): Promise<Lesson> {
    const response = await apiClient.get<Lesson>(`/lessons/${lessonId}`);
    return response.data;
  }

  async enrollInCourse(courseId: string): Promise<void> {
    await apiClient.post(`/courses/${courseId}/enroll`);
  }

  async getEnrolledCourses(): Promise<Course[]> {
    const response = await apiClient.get<Course[]>('/courses/enrolled');
    return response.data;
  }
}

export default new CourseService(); 