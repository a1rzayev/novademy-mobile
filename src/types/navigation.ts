export type RootStackParamList = {
  // Auth Stack
  Login: undefined;
  Register: undefined;
  VerifyEmail: { userId: string };
  
  // Main App Stack
  MainApp: undefined;
  
  // Course Stack
  CourseDetails: { courseId: string };
  LessonDetails: { lessonId: string };
  
  // Package Stack
  PackageDetails: { packageId: string };
  
  // Profile Stack
  EditProfile: undefined;
  MySubscriptions: undefined;
};

export type TabParamList = {
  Home: undefined;
  Courses: undefined;
  Packages: undefined;
  Profile: undefined;
}; 