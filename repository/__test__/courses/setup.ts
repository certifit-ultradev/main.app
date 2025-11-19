/**
 * Shared test setup and utilities for repository/courses.ts tests
 */

// Mock data factories
export const mockCourse = (overrides: any = {}) => ({
  id: 1,
  canonicalId: 'test-course',
  title: 'Test Course',
  description: 'Test Description',
  price: 100,
  courseImage: 'https://example.com/image.jpg',
  categoryId: 1,
  instructorName: 'Test Instructor',
  instructorPhoto: 'https://example.com/photo.jpg',
  expiresAt: new Date('2025-12-31'),
  isActive: true,
  deleted: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  category: {
    id: 1,
    name: 'Test Category',
  },
  ...overrides,
});

export const mockCourseModule = (overrides: any = {}) => ({
  id: 1,
  courseId: 1,
  title: 'Test Module',
  minRequiredPoints: 70,
  deleted: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockModuleClass = (overrides: any = {}) => ({
  id: 1,
  courseModuleId: 1,
  title: 'Test Class',
  description: 'Test Class Description',
  videoPath: 'https://example.com/video.mp4',
  videoSize: 1024000,
  videoDuration: 300,
  deleted: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockModuleQuiz = (overrides: any = {}) => ({
  id: 1,
  courseModuleId: 1,
  title: 'Test Quiz',
  description: 'Test Quiz Description',
  deleted: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockQuizQuestion = (overrides: any = {}) => ({
  id: 1,
  quizId: 1,
  title: 'Test Question',
  type: 'MULTIPLE_CHOICE',
  points: 10,
  deleted: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockPossibleAnswer = (overrides: any = {}) => ({
  id: 1,
  questionId: 1,
  value: 'Test Answer',
  isCorrect: true,
  deleted: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockUserCourse = (overrides: any = {}) => ({
  id: 1,
  userId: 'user-123',
  courseId: 1,
  completedAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockUserClassesState = (overrides: any = {}) => ({
  id: 1,
  userCourseId: 1,
  classId: 1,
  completed: false,
  currentVideoTime: 150,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockUserModuleState = (overrides: any = {}) => ({
  id: 1,
  userCourseId: 1,
  moduleId: 1,
  completed: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockUserQuizState = (overrides: any = {}) => ({
  id: 1,
  quizId: 1,
  userCourseId: 1,
  courseModuleId: 1,
  retries: 0,
  result: 85,
  passed: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockUserQuizAnswer = (overrides: any = {}) => ({
  userCourseId: 1,
  quizId: 1,
  questionId: 1,
  correct: 'Answer A',
  answer: 'Answer A',
  isCorrect: true,
  points: 10,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const mockCourseData = (overrides: any = {}) => ({
  title: 'New Course',
  description: 'New Course Description',
  price: 200,
  courseImage: new File([''], 'course.jpg', { type: 'image/jpeg' }),
  instructorName: 'New Instructor',
  instructorPhoto: new File([''], 'instructor.jpg', { type: 'image/jpeg' }),
  expiresAt: '2025-12-31',
  category: { id: 1 },
  modules: [
    {
      title: 'Module 1',
      minRequiredPoints: 70,
      classes: [
        {
          title: 'Class 1',
          description: 'Class 1 Description',
          videoSize: 1024000,
          videoDuration: 300,
        },
      ],
      quiz: {
        title: 'Quiz 1',
        description: 'Quiz 1 Description',
        questions: [
          {
            title: 'Question 1',
            type: 'MULTIPLE_CHOICE',
            points: 10,
            options: [
              { value: 'Option 1', isCorrect: true },
              { value: 'Option 2', isCorrect: false },
            ],
          },
        ],
      },
    },
  ],
  ...overrides,
});

// Setup and teardown helpers
export const setupMocks = () => {
  jest.clearAllMocks();
};

export const clearAllMocks = () => {
  jest.clearAllMocks();
};
