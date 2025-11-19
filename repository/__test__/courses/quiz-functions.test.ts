/**
 * Tests for repository/courses.ts - Quiz Functions
 * 
 * Functions tested:
 * - findQuizAnswersByQuizId
 * - findUserQuizState
 * - createUserQuizState
 */

import { NotFoundError } from '@/exceptions/not-found';
import { prisma } from '@/lib/prisma';
import { UserQuizAnswer } from '@/models/user-quiz-answer';
import { UserQuizState } from '@/models/user-quiz-state';
import {
  findQuizAnswersByQuizId,
  findUserQuizState,
  createUserQuizState,
} from '@/repository/courses';
import {
  mockUserQuizAnswer,
  mockUserQuizState,
  setupMocks,
} from './setup';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    userQuizAnswer: {
      findMany: jest.fn(),
    },
    userQuizState: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/models/user-quiz-answer');
jest.mock('@/models/user-quiz-state');

describe('repository/courses - Quiz Functions', () => {
  beforeEach(() => {
    setupMocks();
  });

  describe('findQuizAnswersByQuizId', () => {
    it('should return quiz answers for valid userCourseId and quizId', async () => {
      const mockAnswers = [
        mockUserQuizAnswer({ questionId: 1, answer: 'Answer A', isCorrect: true }),
        mockUserQuizAnswer({ questionId: 2, answer: 'Answer B', isCorrect: false }),
      ];
      (prisma.userQuizAnswer.findMany as jest.Mock).mockResolvedValue(mockAnswers);

      const result = await findQuizAnswersByQuizId(1, 1);

      expect(prisma.userQuizAnswer.findMany).toHaveBeenCalledWith({
        where: {
          userCourseId: 1,
          quizId: 1,
        },
        orderBy: {
          id: 'asc',
        },
      });
      expect(result).toHaveLength(2);
      expect(result[0].questionId).toBe(1);
      expect(result[1].questionId).toBe(2);
    });

    it('should return empty array when no answers found', async () => {
      (prisma.userQuizAnswer.findMany as jest.Mock).mockResolvedValue([]);

      const result = await findQuizAnswersByQuizId(1, 1);

      expect(result).toEqual([]);
    });

    it('should order answers by id ascending', async () => {
      const mockAnswers = [mockUserQuizAnswer()];
      (prisma.userQuizAnswer.findMany as jest.Mock).mockResolvedValue(mockAnswers);

      await findQuizAnswersByQuizId(1, 1);

      expect(prisma.userQuizAnswer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { id: 'asc' },
        })
      );
    });

    it('should filter by both userCourseId and quizId', async () => {
      const mockAnswers = [mockUserQuizAnswer()];
      (prisma.userQuizAnswer.findMany as jest.Mock).mockResolvedValue(mockAnswers);

      await findQuizAnswersByQuizId(5, 10);

      expect(prisma.userQuizAnswer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userCourseId: 5,
            quizId: 10,
          },
        })
      );
    });

    it('should map results to UserQuizAnswer objects', async () => {
      const mockAnswers = [
        {
          userCourseId: 1,
          quizId: 1,
          questionId: 1,
          correct: 'Answer A',
          answer: 'Answer A',
          isCorrect: true,
          points: 10,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];
      (prisma.userQuizAnswer.findMany as jest.Mock).mockResolvedValue(mockAnswers);

      const result = await findQuizAnswersByQuizId(1, 1);

      expect(result[0]).toEqual(
        expect.objectContaining({
          userCourseId: 1,
          quizId: 1,
          questionId: 1,
          correct: 'Answer A',
          answer: 'Answer A',
          isCorrect: true,
          points: 10,
        })
      );
    });

    it('should handle multiple answers with different correctness', async () => {
      const mockAnswers = [
        mockUserQuizAnswer({ questionId: 1, isCorrect: true, points: 10 }),
        mockUserQuizAnswer({ questionId: 2, isCorrect: false, points: 0 }),
        mockUserQuizAnswer({ questionId: 3, isCorrect: true, points: 15 }),
      ];
      (prisma.userQuizAnswer.findMany as jest.Mock).mockResolvedValue(mockAnswers);

      const result = await findQuizAnswersByQuizId(1, 1);

      expect(result).toHaveLength(3);
      expect(result[0].isCorrect).toBe(true);
      expect(result[1].isCorrect).toBe(false);
      expect(result[2].isCorrect).toBe(true);
    });
  });

  describe('findUserQuizState', () => {
    it('should return quiz state for valid quizId and userCourseId', async () => {
      const mockState = mockUserQuizState({ quizId: 1, userCourseId: 1, result: 85, passed: true });
      (prisma.userQuizState.findFirst as jest.Mock).mockResolvedValue(mockState);
      (UserQuizState as jest.Mock).mockImplementation((data) => data);

      const result = await findUserQuizState(1, 1);

      expect(prisma.userQuizState.findFirst).toHaveBeenCalledWith({
        where: {
          userCourseId: 1,
          quizId: 1,
        },
        orderBy: [
          {
            id: 'desc',
          },
        ],
      });
      expect(result).toBeDefined();
      expect(result.result).toBe(85);
      expect(result.passed).toBe(true);
    });

    it('should throw NotFoundError when state not found', async () => {
      (prisma.userQuizState.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(findUserQuizState(1, 1)).rejects.toThrow(NotFoundError);
      await expect(findUserQuizState(1, 1)).rejects.toThrow('Recurso no encontrado');
    });

    it('should order by id descending to get latest state', async () => {
      const mockState = mockUserQuizState();
      (prisma.userQuizState.findFirst as jest.Mock).mockResolvedValue(mockState);
      (UserQuizState as jest.Mock).mockImplementation((data) => data);

      await findUserQuizState(1, 1);

      expect(prisma.userQuizState.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ id: 'desc' }],
        })
      );
    });

    it('should return UserQuizState model instance', async () => {
      const mockState = mockUserQuizState({ retries: 2, result: 75, passed: true });
      (prisma.userQuizState.findFirst as jest.Mock).mockResolvedValue(mockState);
      (UserQuizState as jest.Mock).mockImplementation((data) => data);

      const result = await findUserQuizState(1, 1);

      expect(UserQuizState).toHaveBeenCalledWith(mockState);
      expect(result.retries).toBe(2);
      expect(result.result).toBe(75);
    });

    it('should filter by both quizId and userCourseId', async () => {
      const mockState = mockUserQuizState();
      (prisma.userQuizState.findFirst as jest.Mock).mockResolvedValue(mockState);
      (UserQuizState as jest.Mock).mockImplementation((data) => data);

      await findUserQuizState(5, 10);

      expect(prisma.userQuizState.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userCourseId: 10,
            quizId: 5,
          },
        })
      );
    });
  });

  describe('createUserQuizState', () => {
    it('should create new quiz state successfully', async () => {
      const inputState = {
        quizId: 1,
        userCourseId: 1,
        courseModuleId: 1,
        retries: 0,
        result: 90,
        passed: true,
      };
      const createdState = {
        id: 1,
        ...inputState,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      (prisma.userQuizState.create as jest.Mock).mockResolvedValue(createdState);
      (UserQuizState as jest.Mock).mockImplementation((data) => data);

      const result = await createUserQuizState(inputState as any);

      expect(prisma.userQuizState.create).toHaveBeenCalledWith({
        data: {
          quizId: 1,
          userCourseId: 1,
          courseModuleId: 1,
          retries: 0,
          result: 90,
          passed: true,
        },
      });
      expect(result).toBeDefined();
      expect(result?.result).toBe(90);
      expect(result?.passed).toBe(true);
    });

    it('should return null when creation fails', async () => {
      (prisma.userQuizState.create as jest.Mock).mockResolvedValue(null);

      const inputState = mockUserQuizState();
      const result = await createUserQuizState(inputState);

      expect(result).toBeNull();
    });

    it('should create state with retries count', async () => {
      const inputState = {
        quizId: 1,
        userCourseId: 1,
        courseModuleId: 1,
        retries: 3,
        result: 65,
        passed: false,
      };
      const createdState = { id: 1, ...inputState, createdAt: new Date(), updatedAt: new Date() };
      (prisma.userQuizState.create as jest.Mock).mockResolvedValue(createdState);
      (UserQuizState as jest.Mock).mockImplementation((data) => data);

      const result = await createUserQuizState(inputState as any);

      expect(result?.retries).toBe(3);
      expect(result?.passed).toBe(false);
    });

    it('should return UserQuizState model instance', async () => {
      const inputState = mockUserQuizState();
      const createdState = { id: 1, ...inputState };
      (prisma.userQuizState.create as jest.Mock).mockResolvedValue(createdState);
      (UserQuizState as jest.Mock).mockImplementation((data) => data);

      const result = await createUserQuizState(inputState);

      expect(UserQuizState).toHaveBeenCalledWith(createdState);
    });

    it('should handle failed quiz attempts', async () => {
      const inputState = {
        quizId: 2,
        userCourseId: 5,
        courseModuleId: 3,
        retries: 1,
        result: 45,
        passed: false,
      };
      const createdState = { id: 1, ...inputState, createdAt: new Date(), updatedAt: new Date() };
      (prisma.userQuizState.create as jest.Mock).mockResolvedValue(createdState);
      (UserQuizState as jest.Mock).mockImplementation((data) => data);

      const result = await createUserQuizState(inputState as any);

      expect(result?.passed).toBe(false);
      expect(result?.result).toBe(45);
      expect(result?.retries).toBe(1);
    });

    it('should store all required fields', async () => {
      const inputState = {
        quizId: 10,
        userCourseId: 20,
        courseModuleId: 30,
        retries: 2,
        result: 88,
        passed: true,
      };
      const createdState = { id: 1, ...inputState, createdAt: new Date(), updatedAt: new Date() };
      (prisma.userQuizState.create as jest.Mock).mockResolvedValue(createdState);
      (UserQuizState as jest.Mock).mockImplementation((data) => data);

      await createUserQuizState(inputState as any);

      expect(prisma.userQuizState.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          quizId: 10,
          userCourseId: 20,
          courseModuleId: 30,
          retries: 2,
          result: 88,
          passed: true,
        }),
      });
    });
  });
});
