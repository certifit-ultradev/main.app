/**
 * Tests for repository/courses.ts - Query/Read Functions
 * 
 * Functions tested:
 * - allCourses
 * - countAllCourses
 * - countAllActiveCourses
 * - findThreeCoursesActives
 * - findUserCourses
 * - findModulesByCourseId
 */

import { NotFoundError } from '@/exceptions/not-found';
import { prisma } from '@/lib/prisma';
import { Course } from '@/models/course';
import { CourseModules } from '@/models/course-modules';
import { UserCourse } from '@/models/user-course';
import {
  allCourses,
  countAllCourses,
  countAllActiveCourses,
  findThreeCoursesActives,
  findUserCourses,
  findModulesByCourseId,
} from '@/repository/courses';
import {
  mockCourse,
  mockCourseModule,
  mockUserCourse,
  setupMocks,
} from './setup';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    course: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    courseModules: {
      findMany: jest.fn(),
    },
    userCourse: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/models/course');
jest.mock('@/models/course-modules');
jest.mock('@/models/user-course');

describe('repository/courses - Query Functions', () => {
  beforeEach(() => {
    setupMocks();
  });

  describe('allCourses', () => {
    it('should return courses for valid page and pageSize', async () => {
      const mockCourses = [mockCourse(), mockCourse({ id: 2, title: 'Course 2' })];
      (prisma.course.findMany as jest.Mock).mockResolvedValue(mockCourses);
      (Course as jest.Mock).mockImplementation((data) => data);

      const result = await allCourses(1, 10);

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        include: { category: true },
        where: { deleted: false },
        orderBy: [{ createdAt: 'desc' }],
        skip: 0,
        take: 10,
      });
      expect(result).toHaveLength(2);
      expect(Course).toHaveBeenCalledTimes(2);
    });

    it('should default page to 1 when page < 1', async () => {
      const mockCourses = [mockCourse()];
      (prisma.course.findMany as jest.Mock).mockResolvedValue(mockCourses);
      (Course as jest.Mock).mockImplementation((data) => data);

      await allCourses(0, 10);

      expect(prisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        })
      );
    });

    it('should calculate correct pagination skip value', async () => {
      const mockCourses = [mockCourse()];
      (prisma.course.findMany as jest.Mock).mockResolvedValue(mockCourses);
      (Course as jest.Mock).mockImplementation((data) => data);

      await allCourses(3, 10);

      expect(prisma.course.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });

    it('should return empty array when no courses found', async () => {
      (prisma.course.findMany as jest.Mock).mockResolvedValue([]);

      const result = await allCourses(1, 10);

      expect(result).toEqual([]);
      expect(Course).not.toHaveBeenCalled();
    });
  });

  describe('countAllCourses', () => {
    it('should return total count of courses', async () => {
      (prisma.course.count as jest.Mock).mockResolvedValue(42);

      const result = await countAllCourses();

      expect(result).toBe(42);
      expect(prisma.course.count).toHaveBeenCalledWith();
    });

    it('should return 0 when no courses exist', async () => {
      (prisma.course.count as jest.Mock).mockResolvedValue(0);

      const result = await countAllCourses();

      expect(result).toBe(0);
    });
  });

  describe('countAllActiveCourses', () => {
    it('should return count of active courses only', async () => {
      (prisma.course.count as jest.Mock).mockResolvedValue(15);

      const result = await countAllActiveCourses();

      expect(result).toBe(15);
      expect(prisma.course.count).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });

    it('should return 0 when no active courses exist', async () => {
      (prisma.course.count as jest.Mock).mockResolvedValue(0);

      const result = await countAllActiveCourses();

      expect(result).toBe(0);
    });
  });

  describe('findThreeCoursesActives', () => {
    it('should return active courses with user data when userId provided', async () => {
      const mockCourses = [
        { ...mockCourse(), courseModules: [{ moduleClass: [] }], userCourse: [] },
        { ...mockCourse({ id: 2 }), courseModules: [{ moduleClass: [] }], userCourse: [] },
      ];
      (prisma.course.findMany as jest.Mock).mockResolvedValue(mockCourses);
      (Course as jest.Mock).mockImplementation((data) => data);

      const result = await findThreeCoursesActives('user-123');

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        include: {
          category: true,
          courseModules: {
            include: {
              moduleClass: true,
            },
          },
          userCourse: {
            where: {
              userId: 'user-123',
            },
          },
        },
        where: { isActive: true },
      });
      expect(result).toHaveLength(2);
    });

    it('should return active courses without user data when userId not provided', async () => {
      const mockCourses = [
        { ...mockCourse(), courseModules: [{ moduleClass: [] }] },
      ];
      (prisma.course.findMany as jest.Mock).mockResolvedValue(mockCourses);
      (Course as jest.Mock).mockImplementation((data) => data);

      const result = await findThreeCoursesActives();

      expect(prisma.course.findMany).toHaveBeenCalledWith({
        include: {
          category: true,
          courseModules: {
            include: {
              moduleClass: true,
            },
          },
        },
        where: { isActive: true },
      });
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no active courses found', async () => {
      (prisma.course.findMany as jest.Mock).mockResolvedValue([]);

      const result = await findThreeCoursesActives('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('findUserCourses', () => {
    it('should return user courses with all relations', async () => {
      const mockUserCourses = [
        {
          ...mockUserCourse(),
          course: {
            ...mockCourse(),
            courseModules: [
              {
                ...mockCourseModule(),
                moduleClass: [],
                moduleQuiz: [],
              },
            ],
          },
          userClassesState: [],
          userModuleState: [],
        },
      ];
      (prisma.userCourse.findMany as jest.Mock).mockResolvedValue(mockUserCourses);
      (UserCourse as jest.Mock).mockImplementation((data) => data);
      (Course as jest.Mock).mockImplementation((data) => data);

      const result = await findUserCourses('user-123');

      expect(prisma.userCourse.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: [{ createdAt: 'desc' }],
        include: {
          course: {
            include: {
              category: true,
              courseModules: {
                include: {
                  moduleClass: true,
                  moduleQuiz: true,
                },
              },
            },
          },
          userClassesState: true,
          userModuleState: true,
        },
      });
      expect(result).toHaveLength(1);
      expect(UserCourse).toHaveBeenCalled();
    });

    it('should return empty array when user has no courses', async () => {
      (prisma.userCourse.findMany as jest.Mock).mockResolvedValue([]);

      const result = await findUserCourses('user-123');

      expect(result).toEqual([]);
      expect(UserCourse).not.toHaveBeenCalled();
    });
  });

  describe('findModulesByCourseId', () => {
    it('should return modules for valid courseId', async () => {
      const mockModules = [
        mockCourseModule(),
        mockCourseModule({ id: 2, title: 'Module 2' }),
      ];
      (prisma.courseModules.findMany as jest.Mock).mockResolvedValue(mockModules);
      (CourseModules as jest.Mock).mockImplementation((data) => data);

      const result = await findModulesByCourseId(1);

      expect(prisma.courseModules.findMany).toHaveBeenCalledWith({
        where: { deleted: false, courseId: 1 },
        orderBy: { id: 'asc' },
      });
      expect(result).toHaveLength(2);
      expect(CourseModules).toHaveBeenCalledTimes(2);
    });

    it('should filter out deleted modules', async () => {
      const mockModules = [mockCourseModule()];
      (prisma.courseModules.findMany as jest.Mock).mockResolvedValue(mockModules);
      (CourseModules as jest.Mock).mockImplementation((data) => data);

      await findModulesByCourseId(1);

      expect(prisma.courseModules.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deleted: false, courseId: 1 },
        })
      );
    });

    it('should return empty array when no modules found', async () => {
      (prisma.courseModules.findMany as jest.Mock).mockResolvedValue([]);

      const result = await findModulesByCourseId(1);

      expect(result).toEqual([]);
      expect(CourseModules).not.toHaveBeenCalled();
    });

    it('should order modules by id ascending', async () => {
      const mockModules = [mockCourseModule()];
      (prisma.courseModules.findMany as jest.Mock).mockResolvedValue(mockModules);
      (CourseModules as jest.Mock).mockImplementation((data) => data);

      await findModulesByCourseId(1);

      expect(prisma.courseModules.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { id: 'asc' },
        })
      );
    });
  });
});
