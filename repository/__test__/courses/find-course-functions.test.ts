/**
 * Tests for repository/courses.ts - Find Course Functions
 * 
 * Functions tested:
 * - findCourseById
 * - findCourseByCanonicalId
 * - findCourseWithModulesByCanonicalId
 * - findUserCourseByCanonicalId
 * - findUserCourseWithModulesByCanonicalId
 */

import { NotFoundError } from '@/exceptions/not-found';
import { prisma } from '@/lib/prisma';
import { Course } from '@/models/course';
import {
  findCourseById,
  findCourseByCanonicalId,
  findCourseWithModulesByCanonicalId,
  findUserCourseByCanonicalId,
  findUserCourseWithModulesByCanonicalId,
} from '@/repository/courses';
import {
  mockCourse,
  mockCourseModule,
  mockModuleClass,
  mockModuleQuiz,
  mockQuizQuestion,
  mockPossibleAnswer,
  setupMocks,
} from './setup';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    course: {
      findFirst: jest.fn(),
    },
  },
}));

jest.mock('@/models/course');

describe('repository/courses - Find Course Functions', () => {
  beforeEach(() => {
    setupMocks();
  });

  describe('findCourseById', () => {
    it('should return course with full nested structure when found', async () => {
      const mockCourseData = {
        ...mockCourse(),
        courseModules: [
          {
            ...mockCourseModule(),
            moduleClass: [mockModuleClass()],
            moduleQuiz: [
              {
                ...mockModuleQuiz(),
                quizQuestion: [
                  {
                    ...mockQuizQuestion(),
                    possibleAnswerQuestion: [mockPossibleAnswer()],
                  },
                ],
              },
            ],
          },
        ],
      };
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourseData);
      (Course as jest.Mock).mockImplementation((data) => data);

      const result = await findCourseById(1);

      expect(prisma.course.findFirst).toHaveBeenCalledWith({
        include: {
          category: true,
          courseModules: {
            include: {
              moduleClass: {
                orderBy: {
                  id: 'asc',
                },
              },
              moduleQuiz: {
                include: {
                  quizQuestion: {
                    include: {
                      possibleAnswerQuestion: {
                        orderBy: {
                          id: 'asc',
                        },
                      },
                    },
                    orderBy: {
                      id: 'asc',
                    },
                  },
                },
                orderBy: {
                  id: 'asc',
                },
              },
            },
            orderBy: {
              id: 'asc',
            },
          },
        },
        where: { id: 1 },
      });
      expect(result).toBeDefined();
      expect(Course).toHaveBeenCalledWith(mockCourseData);
    });

    it('should throw NotFoundError when course does not exist', async () => {
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(findCourseById(999)).rejects.toThrow(NotFoundError);
      await expect(findCourseById(999)).rejects.toThrow('Recurso no encontrado');
    });

    it('should include category in the query', async () => {
      const mockCourseData = mockCourse();
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourseData);
      (Course as jest.Mock).mockImplementation((data) => data);

      await findCourseById(1);

      expect(prisma.course.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            category: true,
          }),
        })
      );
    });

    it('should order all nested collections by id ascending', async () => {
      const mockCourseData = {
        ...mockCourse(),
        courseModules: [],
      };
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourseData);
      (Course as jest.Mock).mockImplementation((data) => data);

      await findCourseById(1);

      const call = (prisma.course.findFirst as jest.Mock).mock.calls[0][0];
      expect(call.include.courseModules.orderBy).toEqual({ id: 'asc' });
      expect(call.include.courseModules.include.moduleClass.orderBy).toEqual({ id: 'asc' });
      expect(call.include.courseModules.include.moduleQuiz.orderBy).toEqual({ id: 'asc' });
      expect(call.include.courseModules.include.moduleQuiz.include.quizQuestion.orderBy).toEqual({ id: 'asc' });
    });
  });

  describe('findCourseByCanonicalId', () => {
    it('should return course when found by canonicalId', async () => {
      const mockCourseData = mockCourse({ canonicalId: 'test-course' });
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourseData);
      (Course as jest.Mock).mockImplementation((data) => data);

      const result = await findCourseByCanonicalId('test-course', 'user-123');

      expect(prisma.course.findFirst).toHaveBeenCalledWith({
        where: { canonicalId: 'test-course' },
      });
      expect(result).toBeDefined();
      expect(Course).toHaveBeenCalledWith(mockCourseData);
    });

    it('should throw NotFoundError when course not found', async () => {
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(findCourseByCanonicalId('non-existent', 'user-123')).rejects.toThrow(
        NotFoundError
      );
      await expect(findCourseByCanonicalId('non-existent', 'user-123')).rejects.toThrow(
        'Recurso no encontrado'
      );
    });

    it('should accept userId parameter even though not used in query', async () => {
      const mockCourseData = mockCourse();
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourseData);
      (Course as jest.Mock).mockImplementation((data) => data);

      await findCourseByCanonicalId('test-course', 'user-456');

      expect(prisma.course.findFirst).toHaveBeenCalled();
    });
  });

  describe('findCourseWithModulesByCanonicalId', () => {
    it('should return course with complete module structure', async () => {
      const mockCourseData = {
        ...mockCourse({ canonicalId: 'advanced-course' }),
        courseModules: [
          {
            ...mockCourseModule(),
            moduleClass: [mockModuleClass()],
            moduleQuiz: [
              {
                ...mockModuleQuiz(),
                quizQuestion: [
                  {
                    ...mockQuizQuestion(),
                    possibleAnswerQuestion: [mockPossibleAnswer()],
                  },
                ],
              },
            ],
          },
        ],
      };
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourseData);
      (Course as jest.Mock).mockImplementation((data) => data);

      const result = await findCourseWithModulesByCanonicalId('advanced-course', 'user-123');

      expect(prisma.course.findFirst).toHaveBeenCalledWith({
        include: {
          category: true,
          courseModules: {
            include: {
              moduleClass: {
                orderBy: {
                  id: 'asc',
                },
              },
              moduleQuiz: {
                include: {
                  quizQuestion: {
                    include: {
                      possibleAnswerQuestion: {
                        orderBy: {
                          id: 'asc',
                        },
                      },
                    },
                    orderBy: {
                      id: 'asc',
                    },
                  },
                },
                orderBy: {
                  id: 'asc',
                },
              },
            },
            orderBy: {
              id: 'asc',
            },
          },
        },
        where: { canonicalId: 'advanced-course' },
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundError when course not found', async () => {
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        findCourseWithModulesByCanonicalId('missing-course', 'user-123')
      ).rejects.toThrow(NotFoundError);
    });

    it('should include nested quiz questions with options', async () => {
      const mockCourseData = {
        ...mockCourse(),
        courseModules: [
          {
            ...mockCourseModule(),
            moduleClass: [],
            moduleQuiz: [
              {
                ...mockModuleQuiz(),
                quizQuestion: [
                  {
                    ...mockQuizQuestion(),
                    possibleAnswerQuestion: [
                      mockPossibleAnswer(),
                      mockPossibleAnswer({ id: 2, value: 'Option 2', isCorrect: false }),
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourseData);
      (Course as jest.Mock).mockImplementation((data) => data);

      const result = await findCourseWithModulesByCanonicalId('test-course', 'user-123');

      expect(result).toBeDefined();
      expect(Course).toHaveBeenCalledWith(mockCourseData);
    });
  });

  describe('findUserCourseByCanonicalId', () => {
    it('should return course with user course data and user states', async () => {
      const mockCourseData = {
        ...mockCourse({ canonicalId: 'user-course' }),
        userCourse: [
          {
            id: 1,
            userId: 'user-123',
            courseId: 1,
            userClassesState: [
              { id: 1, classId: 1, completed: true, currentVideoTime: 300 },
            ],
            userModuleState: [{ id: 1, moduleId: 1, completed: false }],
          },
        ],
      };
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourseData);
      (Course as jest.Mock).mockImplementation((data) => data);

      const result = await findUserCourseByCanonicalId('user-course', 'user-123');

      expect(prisma.course.findFirst).toHaveBeenCalledWith({
        include: {
          userCourse: {
            where: {
              userId: 'user-123',
            },
            include: {
              userClassesState: {
                orderBy: {
                  id: 'desc',
                },
              },
              userModuleState: {
                orderBy: {
                  id: 'desc',
                },
              },
            },
          },
        },
        where: {
          canonicalId: 'user-course',
        },
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundError when course not found', async () => {
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(findUserCourseByCanonicalId('missing', 'user-123')).rejects.toThrow(
        NotFoundError
      );
    });

    it('should filter userCourse by userId', async () => {
      const mockCourseData = {
        ...mockCourse(),
        userCourse: [],
      };
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourseData);
      (Course as jest.Mock).mockImplementation((data) => data);

      await findUserCourseByCanonicalId('test-course', 'user-456');

      expect(prisma.course.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            userCourse: expect.objectContaining({
              where: {
                userId: 'user-456',
              },
            }),
          }),
        })
      );
    });

    it('should order user states by id descending', async () => {
      const mockCourseData = {
        ...mockCourse(),
        userCourse: [],
      };
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourseData);
      (Course as jest.Mock).mockImplementation((data) => data);

      await findUserCourseByCanonicalId('test-course', 'user-123');

      const call = (prisma.course.findFirst as jest.Mock).mock.calls[0][0];
      expect(call.include.userCourse.include.userClassesState.orderBy).toEqual({ id: 'desc' });
      expect(call.include.userCourse.include.userModuleState.orderBy).toEqual({ id: 'desc' });
    });
  });

  describe('findUserCourseWithModulesByCanonicalId', () => {
    it('should return course with modules and user progress data', async () => {
      const mockCourseData = {
        ...mockCourse({ canonicalId: 'complete-course' }),
        courseModules: [
          {
            ...mockCourseModule(),
            moduleClass: [mockModuleClass()],
            moduleQuiz: [
              {
                ...mockModuleQuiz(),
                quizQuestion: [
                  {
                    ...mockQuizQuestion(),
                    possibleAnswerQuestion: [mockPossibleAnswer()],
                  },
                ],
              },
            ],
          },
        ],
        userCourse: [
          {
            id: 1,
            userId: 'user-123',
            courseId: 1,
            userClassesState: [],
            userModuleState: [],
            userQuizState: [],
          },
        ],
      };
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourseData);
      (Course as jest.Mock).mockImplementation((data) => data);

      const result = await findUserCourseWithModulesByCanonicalId('complete-course', 'user-123');

      expect(prisma.course.findFirst).toHaveBeenCalledWith({
        include: {
          category: true,
          courseModules: {
            include: {
              moduleClass: {
                orderBy: {
                  id: 'asc',
                },
              },
              moduleQuiz: {
                include: {
                  quizQuestion: {
                    include: {
                      possibleAnswerQuestion: {
                        orderBy: {
                          id: 'asc',
                        },
                      },
                    },
                    orderBy: {
                      id: 'asc',
                    },
                  },
                },
                orderBy: {
                  id: 'asc',
                },
              },
            },
            orderBy: {
              id: 'asc',
            },
          },
          userCourse: {
            where: {
              userId: 'user-123',
            },
            include: {
              userClassesState: {
                orderBy: {
                  id: 'desc',
                },
              },
              userModuleState: {
                orderBy: {
                  id: 'desc',
                },
              },
              userQuizState: {
                orderBy: [
                  {
                    id: 'desc',
                  },
                ],
              },
            },
          },
        },
        where: { canonicalId: 'complete-course' },
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundError when course is null', async () => {
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        findUserCourseWithModulesByCanonicalId('missing', 'user-123')
      ).rejects.toThrow(NotFoundError);
      await expect(
        findUserCourseWithModulesByCanonicalId('missing', 'user-123')
      ).rejects.toThrow('Recurso no encontrado');
    });

    it('should include userQuizState in user course data', async () => {
      const mockCourseData = {
        ...mockCourse(),
        courseModules: [],
        userCourse: [
          {
            id: 1,
            userId: 'user-123',
            courseId: 1,
            userClassesState: [],
            userModuleState: [],
            userQuizState: [
              { id: 1, quizId: 1, retries: 1, result: 80, passed: true },
            ],
          },
        ],
      };
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourseData);
      (Course as jest.Mock).mockImplementation((data) => data);

      const result = await findUserCourseWithModulesByCanonicalId('test-course', 'user-123');

      expect(result).toBeDefined();
      expect(Course).toHaveBeenCalledWith(mockCourseData);
    });

    it('should combine both module structure and user progress in single query', async () => {
      const mockCourseData = {
        ...mockCourse(),
        courseModules: [mockCourseModule()],
        userCourse: [
          {
            id: 1,
            userId: 'user-789',
            courseId: 1,
            userClassesState: [{ id: 1, classId: 1, completed: false }],
            userModuleState: [{ id: 1, moduleId: 1, completed: false }],
            userQuizState: [],
          },
        ],
      };
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(mockCourseData);
      (Course as jest.Mock).mockImplementation((data) => data);

      await findUserCourseWithModulesByCanonicalId('test-course', 'user-789');

      const call = (prisma.course.findFirst as jest.Mock).mock.calls[0][0];
      expect(call.include).toHaveProperty('category');
      expect(call.include).toHaveProperty('courseModules');
      expect(call.include).toHaveProperty('userCourse');
      expect(call.include.userCourse.where.userId).toBe('user-789');
    });
  });
});
