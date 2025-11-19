/**
 * Tests for repository/courses.ts - Create Course Functions
 * 
 * Functions tested:
 * - createFullCourse
 * - createCourseModule
 * - createModuleClass
 * - createModuleQuiz
 * - createQuizQuestion
 * - createQuestionOption
 */

import { prisma } from '@/lib/prisma';
import { Course } from '@/models/course';
import { CourseModules } from '@/models/course-modules';
import { ModuleClass } from '@/models/module-class';
import { ModuleQuiz } from '@/models/module-quiz';
import { QuizQuestion } from '@/models/quiz-question';
import { PossibleAnswerQuestion } from '@/models/possible-answer-question';
import { storeVideoBlobStorage } from '@/services/video';
import { toSnakeCase } from '@/utils/classes';
import {
  createFullCourse,
  createCourseModule,
  createModuleClass,
  createModuleQuiz,
  createQuizQuestion,
  createQuestionOption,
} from '@/repository/courses';
import {
  mockCourse,
  mockCourseModule,
  mockModuleClass,
  mockModuleQuiz,
  mockQuizQuestion,
  mockPossibleAnswer,
  mockCourseData,
  setupMocks,
} from './setup';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    course: {
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    courseModules: {
      create: jest.fn(),
    },
    moduleClass: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    moduleQuiz: {
      create: jest.fn(),
    },
    quizQuestion: {
      create: jest.fn(),
    },
    possibleAnswerQuestion: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock('@/services/video', () => ({
  storeVideoBlobStorage: jest.fn(),
}));

jest.mock('@/utils/classes', () => ({
  toSnakeCase: jest.fn(),
}));

jest.mock('@/models/course');
jest.mock('@/models/course-modules');
jest.mock('@/models/module-class');
jest.mock('@/models/module-quiz');
jest.mock('@/models/quiz-question');
jest.mock('@/models/possible-answer-question');

describe('repository/courses - Create Course Functions', () => {
  beforeEach(() => {
    setupMocks();
  });

  describe('createFullCourse', () => {
    it('should create a complete course with all nested structures', async () => {
      const courseData = mockCourseData();
      const createdCourseBase = { id: 1, title: courseData.title };
      const fullCourse = mockCourse({ id: 1 });

      (toSnakeCase as jest.Mock).mockReturnValue('new-course');
      (storeVideoBlobStorage as jest.Mock).mockResolvedValue('https://example.com/uploaded.jpg');
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          course: { create: jest.fn().mockResolvedValue(createdCourseBase) },
          courseModules: { create: jest.fn().mockResolvedValue({ id: 1, courseId: 1 }) },
          moduleClass: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
          moduleQuiz: { create: jest.fn().mockResolvedValue({ id: 1 }) },
          quizQuestion: { create: jest.fn().mockResolvedValue({ id: 1 }) },
          possibleAnswerQuestion: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
        };
        return await callback(tx);
      });
      (prisma.course.update as jest.Mock).mockResolvedValue(fullCourse);
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(fullCourse);
      (Course as jest.Mock).mockImplementation((data) => data);

      const result = await createFullCourse(courseData);

      expect(toSnakeCase).toHaveBeenCalledWith(courseData.title);
      expect(storeVideoBlobStorage).toHaveBeenCalledTimes(2);
      expect(prisma.course.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
        })
      );
      expect(result).toBeDefined();
    });

    it('should throw error when transaction returns null', async () => {
      const courseData = mockCourseData();
      (toSnakeCase as jest.Mock).mockReturnValue('new-course');
      (prisma.$transaction as jest.Mock).mockResolvedValue(null);

      await expect(createFullCourse(courseData)).rejects.toThrow('No se pudo crear el curso');
    });

    it('should convert price to number', async () => {
      const courseData = mockCourseData({ price: '299.99' });
      const createdCourseBase = { id: 1, title: courseData.title };
      const fullCourse = mockCourse({ id: 1 });

      (toSnakeCase as jest.Mock).mockReturnValue('course');
      (storeVideoBlobStorage as jest.Mock).mockResolvedValue('https://example.com/image.jpg');
      
      let capturedCourseData: any;
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          course: { 
            create: jest.fn().mockImplementation((args) => {
              capturedCourseData = args.data;
              return Promise.resolve(createdCourseBase);
            })
          },
          courseModules: { create: jest.fn().mockResolvedValue({ id: 1, courseId: 1 }) },
          moduleClass: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
          moduleQuiz: { create: jest.fn().mockResolvedValue({ id: 1 }) },
          quizQuestion: { create: jest.fn().mockResolvedValue({ id: 1 }) },
          possibleAnswerQuestion: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
        };
        return await callback(tx);
      });
      (prisma.course.update as jest.Mock).mockResolvedValue(fullCourse);
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(fullCourse);
      (Course as jest.Mock).mockImplementation((data) => data);

      await createFullCourse(courseData);

      expect(typeof capturedCourseData.price).toBe('number');
      expect(capturedCourseData.price).toBe(299.99);
    });

    it('should set isActive to false for new courses', async () => {
      const courseData = mockCourseData();
      const createdCourseBase = { id: 1, title: courseData.title, isActive: false };
      const fullCourse = mockCourse({ id: 1 });

      (toSnakeCase as jest.Mock).mockReturnValue('course');
      (storeVideoBlobStorage as jest.Mock).mockResolvedValue('https://example.com/image.jpg');
      
      let capturedCourseData: any;
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          course: { 
            create: jest.fn().mockImplementation((args) => {
              capturedCourseData = args.data;
              return Promise.resolve(createdCourseBase);
            })
          },
          courseModules: { create: jest.fn().mockResolvedValue({ id: 1, courseId: 1 }) },
          moduleClass: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
          moduleQuiz: { create: jest.fn().mockResolvedValue({ id: 1 }) },
          quizQuestion: { create: jest.fn().mockResolvedValue({ id: 1 }) },
          possibleAnswerQuestion: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
        };
        return await callback(tx);
      });
      (prisma.course.update as jest.Mock).mockResolvedValue(fullCourse);
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(fullCourse);
      (Course as jest.Mock).mockImplementation((data) => data);

      await createFullCourse(courseData);

      expect(capturedCourseData.isActive).toBe(false);
    });

    it('should upload course image and instructor photo', async () => {
      const courseData = mockCourseData();
      const createdCourseBase = { id: 5, title: courseData.title };
      const fullCourse = mockCourse({ id: 5 });

      (toSnakeCase as jest.Mock).mockReturnValue('course');
      (storeVideoBlobStorage as jest.Mock)
        .mockResolvedValueOnce('https://blob.com/course-image.jpg')
        .mockResolvedValueOnce('https://blob.com/instructor-photo.jpg');
      
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          course: { create: jest.fn().mockResolvedValue(createdCourseBase) },
          courseModules: { create: jest.fn().mockResolvedValue({ id: 1, courseId: 5 }) },
          moduleClass: { createMany: jest.fn().mockResolvedValue({ count: 1 }) },
          moduleQuiz: { create: jest.fn().mockResolvedValue({ id: 1 }) },
          quizQuestion: { create: jest.fn().mockResolvedValue({ id: 1 }) },
          possibleAnswerQuestion: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
        };
        return await callback(tx);
      });
      (prisma.course.update as jest.Mock).mockResolvedValue(fullCourse);
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(fullCourse);
      (Course as jest.Mock).mockImplementation((data) => data);

      await createFullCourse(courseData);

      expect(storeVideoBlobStorage).toHaveBeenCalledWith(
        '/courses/5/',
        courseData.courseImage
      );
      expect(storeVideoBlobStorage).toHaveBeenCalledWith(
        '/courses/5/',
        courseData.instructorPhoto
      );
      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: {
          courseImage: 'https://blob.com/course-image.jpg',
          instructorPhoto: 'https://blob.com/instructor-photo.jpg',
        },
      });
    });

    it('should handle course without modules', async () => {
      const courseData = mockCourseData({ modules: [] });
      const createdCourseBase = { id: 1, title: courseData.title };
      const fullCourse = mockCourse({ id: 1 });

      (toSnakeCase as jest.Mock).mockReturnValue('course');
      (storeVideoBlobStorage as jest.Mock).mockResolvedValue('https://example.com/image.jpg');
      
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
        const tx = {
          course: { create: jest.fn().mockResolvedValue(createdCourseBase) },
          courseModules: { create: jest.fn() },
          moduleClass: { createMany: jest.fn() },
          moduleQuiz: { create: jest.fn() },
          quizQuestion: { create: jest.fn() },
          possibleAnswerQuestion: { createMany: jest.fn() },
        };
        return await callback(tx);
      });
      (prisma.course.update as jest.Mock).mockResolvedValue(fullCourse);
      (prisma.course.findFirst as jest.Mock).mockResolvedValue(fullCourse);
      (Course as jest.Mock).mockImplementation((data) => data);

      const result = await createFullCourse(courseData);

      expect(result).toBeDefined();
    });
  });

  describe('createCourseModule', () => {
    it('should create a course module successfully', async () => {
      const inputModule = {
        courseId: 1,
        title: 'Module 1',
        minRequiredPoints: 70,
      };
      const createdModule = {
        id: 1,
        ...inputModule,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.courseModules.create as jest.Mock).mockResolvedValue(createdModule);
      (CourseModules as jest.Mock).mockImplementation((data) => data);

      const result = await createCourseModule(inputModule as any);

      expect(prisma.courseModules.create).toHaveBeenCalledWith({
        data: {
          courseId: 1,
          title: 'Module 1',
          minRequiredPoints: 70,
        },
      });
      expect(result).toBeDefined();
      expect(result?.title).toBe('Module 1');
    });

    it('should return null when creation fails', async () => {
      (prisma.courseModules.create as jest.Mock).mockResolvedValue(null);

      const inputModule = mockCourseModule();
      const result = await createCourseModule(inputModule);

      expect(result).toBeNull();
    });

    it('should return CourseModules model instance', async () => {
      const inputModule = mockCourseModule();
      const createdModule = { id: 1, ...inputModule };
      (prisma.courseModules.create as jest.Mock).mockResolvedValue(createdModule);
      (CourseModules as jest.Mock).mockImplementation((data) => data);

      const result = await createCourseModule(inputModule);

      expect(CourseModules).toHaveBeenCalledWith(createdModule);
    });
  });

  describe('createModuleClass', () => {
    it('should create a module class successfully', async () => {
      const inputClass = mockModuleClass();
      const createdClass = { id: 1, ...inputClass };
      (prisma.moduleClass.create as jest.Mock).mockResolvedValue(createdClass);
      (ModuleClass as jest.Mock).mockImplementation((data) => data);

      const result = await createModuleClass(inputClass);

      expect(prisma.moduleClass.create).toHaveBeenCalledWith({
        data: inputClass,
      });
      expect(result).toBeDefined();
      expect(ModuleClass).toHaveBeenCalledWith(createdClass);
    });

    it('should return null when creation fails', async () => {
      (prisma.moduleClass.create as jest.Mock).mockResolvedValue(null);

      const inputClass = mockModuleClass();
      const result = await createModuleClass(inputClass);

      expect(result).toBeNull();
    });

    it('should pass all class data to prisma', async () => {
      const inputClass = mockModuleClass({
        title: 'Advanced Class',
        description: 'Advanced Description',
        videoPath: 'https://example.com/video.mp4',
        videoDuration: 600,
        videoSize: 2048000,
      });
      const createdClass = { id: 1, ...inputClass };
      (prisma.moduleClass.create as jest.Mock).mockResolvedValue(createdClass);
      (ModuleClass as jest.Mock).mockImplementation((data) => data);

      await createModuleClass(inputClass);

      expect(prisma.moduleClass.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Advanced Class',
          description: 'Advanced Description',
          videoDuration: 600,
          videoSize: 2048000,
        }),
      });
    });
  });

  describe('createModuleQuiz', () => {
    it('should create a module quiz successfully', async () => {
      const inputQuiz = {
        courseModuleId: 1,
        title: 'Quiz 1',
        description: 'Quiz Description',
      };
      const createdQuiz = {
        id: 1,
        ...inputQuiz,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.moduleQuiz.create as jest.Mock).mockResolvedValue(createdQuiz);
      (ModuleQuiz as jest.Mock).mockImplementation((data) => data);

      const result = await createModuleQuiz(inputQuiz as any);

      expect(prisma.moduleQuiz.create).toHaveBeenCalledWith({
        data: {
          title: 'Quiz 1',
          description: 'Quiz Description',
          courseModuleId: 1,
        },
      });
      expect(result).toBeDefined();
      expect(result?.title).toBe('Quiz 1');
    });

    it('should return null when creation fails', async () => {
      (prisma.moduleQuiz.create as jest.Mock).mockResolvedValue(null);

      const inputQuiz = mockModuleQuiz();
      const result = await createModuleQuiz(inputQuiz);

      expect(result).toBeNull();
    });

    it('should return ModuleQuiz model instance', async () => {
      const inputQuiz = mockModuleQuiz();
      const createdQuiz = { id: 1, ...inputQuiz };
      (prisma.moduleQuiz.create as jest.Mock).mockResolvedValue(createdQuiz);
      (ModuleQuiz as jest.Mock).mockImplementation((data) => data);

      const result = await createModuleQuiz(inputQuiz);

      expect(ModuleQuiz).toHaveBeenCalledWith(createdQuiz);
    });
  });

  describe('createQuizQuestion', () => {
    it('should create a quiz question successfully', async () => {
      const inputQuestion = {
        quizId: 1,
        title: 'What is 2 + 2?',
        type: 'MULTIPLE_CHOICE',
        points: 10,
      };
      const createdQuestion = {
        id: 1,
        ...inputQuestion,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      (prisma.quizQuestion.create as jest.Mock).mockResolvedValue(createdQuestion);
      (QuizQuestion as jest.Mock).mockImplementation((data) => data);

      const result = await createQuizQuestion(inputQuestion as any);

      expect(prisma.quizQuestion.create).toHaveBeenCalledWith({
        data: {
          quizId: 1,
          title: 'What is 2 + 2?',
          type: 'MULTIPLE_CHOICE',
          points: 10,
        },
      });
      expect(result).toBeDefined();
      expect(result?.title).toBe('What is 2 + 2?');
    });

    it('should return null when creation fails', async () => {
      (prisma.quizQuestion.create as jest.Mock).mockResolvedValue(null);

      const inputQuestion = mockQuizQuestion();
      const result = await createQuizQuestion(inputQuestion);

      expect(result).toBeNull();
    });

    it('should return QuizQuestion model instance', async () => {
      const inputQuestion = mockQuizQuestion();
      const createdQuestion = { id: 1, ...inputQuestion };
      (prisma.quizQuestion.create as jest.Mock).mockResolvedValue(createdQuestion);
      (QuizQuestion as jest.Mock).mockImplementation((data) => data);

      const result = await createQuizQuestion(inputQuestion);

      expect(QuizQuestion).toHaveBeenCalledWith(createdQuestion);
    });

    it('should handle different question types', async () => {
      const inputQuestion = {
        quizId: 1,
        title: 'Explain your answer',
        type: 'TEXT',
        points: 15,
      };
      const createdQuestion = { id: 1, ...inputQuestion, deleted: false };
      (prisma.quizQuestion.create as jest.Mock).mockResolvedValue(createdQuestion);
      (QuizQuestion as jest.Mock).mockImplementation((data) => data);

      await createQuizQuestion(inputQuestion as any);

      expect(prisma.quizQuestion.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'TEXT',
        }),
      });
    });
  });

  describe('createQuestionOption', () => {
    it('should create a question option successfully', async () => {
      const inputOption = mockPossibleAnswer();
      const createdOption = { id: 1, ...inputOption };
      (prisma.possibleAnswerQuestion.create as jest.Mock).mockResolvedValue(createdOption);
      (PossibleAnswerQuestion as jest.Mock).mockImplementation((data) => data);

      const result = await createQuestionOption(inputOption);

      expect(prisma.possibleAnswerQuestion.create).toHaveBeenCalledWith({
        data: inputOption,
      });
      expect(result).toBeDefined();
      expect(PossibleAnswerQuestion).toHaveBeenCalledWith(createdOption);
    });

    it('should return null when creation fails', async () => {
      (prisma.possibleAnswerQuestion.create as jest.Mock).mockResolvedValue(null);

      const inputOption = mockPossibleAnswer();
      const result = await createQuestionOption(inputOption);

      expect(result).toBeNull();
    });

    it('should handle correct answer option', async () => {
      const inputOption = mockPossibleAnswer({ value: 'Correct Answer', isCorrect: true });
      const createdOption = { id: 1, ...inputOption };
      (prisma.possibleAnswerQuestion.create as jest.Mock).mockResolvedValue(createdOption);
      (PossibleAnswerQuestion as jest.Mock).mockImplementation((data) => data);

      const result = await createQuestionOption(inputOption);

      expect(result?.isCorrect).toBe(true);
    });

    it('should handle incorrect answer option', async () => {
      const inputOption = mockPossibleAnswer({ value: 'Wrong Answer', isCorrect: false });
      const createdOption = { id: 1, ...inputOption };
      (prisma.possibleAnswerQuestion.create as jest.Mock).mockResolvedValue(createdOption);
      (PossibleAnswerQuestion as jest.Mock).mockImplementation((data) => data);

      const result = await createQuestionOption(inputOption);

      expect(result?.isCorrect).toBe(false);
    });
  });
});
