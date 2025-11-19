/**
 * Tests for repository/courses.ts - User State Functions
 * 
 * Functions tested:
 * - createUserClassState
 * - createUserModuleFinishState
 * - createQuestionAnswer
 * - createUserModuleState
 */

import { prisma } from '@/lib/prisma';
import { UserClassesState } from '@/models/user-classes-state';
import { UserModuleState } from '@/models/user_module_state';
import { UserQuizAnswer } from '@/models/user-quiz-answer';
import {
  createUserClassState,
  createUserModuleFinishState,
  createQuestionAnswer,
  createUserModuleState,
} from '@/repository/courses';
import {
  mockUserClassesState,
  mockUserModuleState,
  mockUserQuizAnswer,
  setupMocks,
} from './setup';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    userClassesState: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userModuleState: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    userQuizAnswer: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@/models/user-classes-state');
jest.mock('@/models/user_module_state');
jest.mock('@/models/user-quiz-answer');

describe('repository/courses - User State Functions', () => {
  beforeEach(() => {
    setupMocks();
  });

  describe('createUserClassState', () => {
    it('should create new user class state when it does not exist', async () => {
      const inputState = mockUserClassesState({
        userCourseId: 1,
        classId: 1,
        completed: false,
        currentVideoTime: 120,
      });
      const createdState = { id: 1, ...inputState };

      (prisma.userClassesState.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.userClassesState.create as jest.Mock).mockResolvedValue(createdState);
      (UserClassesState as jest.Mock).mockImplementation((data) => data);

      const result = await createUserClassState(inputState);

      expect(prisma.userClassesState.findFirst).toHaveBeenCalledWith({
        where: {
          userCourseId: 1,
          classId: 1,
        },
      });
      expect(prisma.userClassesState.create).toHaveBeenCalledWith({
        data: {
          userCourseId: 1,
          classId: 1,
          completed: false,
          currentVideoTime: 120,
        },
      });
      expect(result).toBeDefined();
      expect(result?.currentVideoTime).toBe(120);
    });

    it('should update existing state when it already exists', async () => {
      const existingState = {
        id: 1,
        userCourseId: 1,
        classId: 1,
        completed: false,
        currentVideoTime: 100,
      };
      const inputState = mockUserClassesState({
        userCourseId: 1,
        classId: 1,
        completed: false,
        currentVideoTime: 200,
      });
      const updatedState = {
        ...existingState,
        currentVideoTime: 200,
      };

      (prisma.userClassesState.findFirst as jest.Mock).mockResolvedValue(existingState);
      (prisma.userClassesState.update as jest.Mock).mockResolvedValue(updatedState);
      (UserClassesState as jest.Mock).mockImplementation((data) => data);

      const result = await createUserClassState(inputState);

      expect(prisma.userClassesState.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          completed: false,
          currentVideoTime: 200,
        },
      });
      expect(result?.currentVideoTime).toBe(200);
    });

    it('should preserve completed flag when already true', async () => {
      const existingState = {
        id: 1,
        userCourseId: 1,
        classId: 1,
        completed: true,
        currentVideoTime: 300,
      };
      const inputState = mockUserClassesState({
        userCourseId: 1,
        classId: 1,
        completed: false,
        currentVideoTime: 350,
      });
      const updatedState = {
        ...existingState,
        currentVideoTime: 350,
      };

      (prisma.userClassesState.findFirst as jest.Mock).mockResolvedValue(existingState);
      (prisma.userClassesState.update as jest.Mock).mockResolvedValue(updatedState);
      (UserClassesState as jest.Mock).mockImplementation((data) => data);

      await createUserClassState(inputState);

      expect(prisma.userClassesState.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          completed: true, // Should preserve true
          currentVideoTime: 350,
        },
      });
    });

    it('should update completed to true when new state is completed', async () => {
      const existingState = {
        id: 1,
        userCourseId: 1,
        classId: 1,
        completed: false,
        currentVideoTime: 100,
      };
      const inputState = mockUserClassesState({
        userCourseId: 1,
        classId: 1,
        completed: true,
        currentVideoTime: 300,
      });
      const updatedState = {
        ...existingState,
        completed: true,
        currentVideoTime: 300,
      };

      (prisma.userClassesState.findFirst as jest.Mock).mockResolvedValue(existingState);
      (prisma.userClassesState.update as jest.Mock).mockResolvedValue(updatedState);
      (UserClassesState as jest.Mock).mockImplementation((data) => data);

      await createUserClassState(inputState);

      expect(prisma.userClassesState.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          completed: true,
          currentVideoTime: 300,
        },
      });
    });

    it('should return null when creation fails', async () => {
      const inputState = mockUserClassesState();
      (prisma.userClassesState.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.userClassesState.create as jest.Mock).mockResolvedValue(null);

      const result = await createUserClassState(inputState);

      expect(result).toBeNull();
    });

    it('should return UserClassesState model instance', async () => {
      const inputState = mockUserClassesState();
      const createdState = { id: 1, ...inputState };
      (prisma.userClassesState.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.userClassesState.create as jest.Mock).mockResolvedValue(createdState);
      (UserClassesState as jest.Mock).mockImplementation((data) => data);

      await createUserClassState(inputState);

      expect(UserClassesState).toHaveBeenCalledWith(createdState);
    });
  });

  describe('createUserModuleFinishState', () => {
    it('should create new module state when it does not exist', async () => {
      const inputState = {
        userCourseId: 1,
        moduleId: 1,
        completed: true,
      };
      const createdState = {
        id: 1,
        ...inputState,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.userModuleState.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.userModuleState.create as jest.Mock).mockResolvedValue(createdState);
      (UserModuleState as jest.Mock).mockImplementation((data) => data);

      const result = await createUserModuleFinishState(inputState as any);

      expect(prisma.userModuleState.findFirst).toHaveBeenCalledWith({
        where: {
          userCourseId: 1,
          moduleId: 1,
        },
      });
      expect(prisma.userModuleState.create).toHaveBeenCalledWith({
        data: {
          userCourseId: 1,
          moduleId: 1,
          completed: true,
        },
      });
      expect(result).toBeDefined();
      expect(result?.completed).toBe(true);
    });

    it('should return existing state without creating new one', async () => {
      const existingState = {
        id: 1,
        userCourseId: 1,
        moduleId: 1,
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const inputState = {
        userCourseId: 1,
        moduleId: 1,
        completed: true,
      };

      (prisma.userModuleState.findFirst as jest.Mock).mockResolvedValue(existingState);
      (UserModuleState as jest.Mock).mockImplementation((data) => data);

      const result = await createUserModuleFinishState(inputState as any);

      expect(prisma.userModuleState.create).not.toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(UserModuleState).toHaveBeenCalledWith(existingState);
    });

    it('should return null when creation fails', async () => {
      const inputState = mockUserModuleState();
      (prisma.userModuleState.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.userModuleState.create as jest.Mock).mockResolvedValue(null);

      const result = await createUserModuleFinishState(inputState);

      expect(result).toBeNull();
    });

    it('should always set completed to true', async () => {
      const inputState = {
        userCourseId: 2,
        moduleId: 3,
        completed: false, // Even if false is passed
      };
      const createdState = {
        id: 1,
        userCourseId: 2,
        moduleId: 3,
        completed: true, // Should be true
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.userModuleState.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.userModuleState.create as jest.Mock).mockResolvedValue(createdState);
      (UserModuleState as jest.Mock).mockImplementation((data) => data);

      await createUserModuleFinishState(inputState as any);

      expect(prisma.userModuleState.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          completed: true,
        }),
      });
    });
  });

  describe('createQuestionAnswer', () => {
    it('should create new answer when it does not exist', async () => {
      const inputAnswer = mockUserQuizAnswer({
        userCourseId: 1,
        quizId: 1,
        questionId: 1,
        correct: 'Answer A',
        answer: 'Answer A',
        isCorrect: true,
        points: 10,
      });
      const createdAnswer = { id: 1, ...inputAnswer };

      (prisma.userQuizAnswer.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.userQuizAnswer.create as jest.Mock).mockResolvedValue(createdAnswer);
      (UserQuizAnswer as jest.Mock).mockImplementation((data) => data);

      const result = await createQuestionAnswer(inputAnswer);

      expect(prisma.userQuizAnswer.findFirst).toHaveBeenCalledWith({
        where: {
          userCourseId: 1,
          quizId: 1,
          questionId: 1,
        },
      });
      expect(prisma.userQuizAnswer.create).toHaveBeenCalledWith({
        data: {
          userCourseId: 1,
          quizId: 1,
          questionId: 1,
          correct: 'Answer A',
          answer: 'Answer A',
          isCorrect: true,
          points: 10,
        },
      });
      expect(result).toBeDefined();
      expect(result?.isCorrect).toBe(true);
    });

    it('should update existing answer when it already exists', async () => {
      const existingAnswer = {
        id: 1,
        userCourseId: 1,
        quizId: 1,
        questionId: 1,
        correct: 'Answer A',
        answer: 'Answer A',
        isCorrect: true,
        points: 10,
      };
      const inputAnswer = mockUserQuizAnswer({
        userCourseId: 1,
        quizId: 1,
        questionId: 1,
        correct: 'Answer B',
        answer: 'Answer B',
        isCorrect: false,
        points: 0,
      });
      const updatedAnswer = {
        ...existingAnswer,
        correct: 'Answer B',
        answer: 'Answer B',
        isCorrect: false,
        points: 0,
      };

      (prisma.userQuizAnswer.findFirst as jest.Mock).mockResolvedValue(existingAnswer);
      (prisma.userQuizAnswer.update as jest.Mock).mockResolvedValue(updatedAnswer);
      (UserQuizAnswer as jest.Mock).mockImplementation((data) => data);

      const result = await createQuestionAnswer(inputAnswer);

      expect(prisma.userQuizAnswer.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          correct: 'Answer B',
          answer: 'Answer B',
          isCorrect: false,
          points: 0,
        },
      });
      expect(result?.isCorrect).toBe(false);
    });

    it('should return null when creation fails', async () => {
      const inputAnswer = mockUserQuizAnswer();
      (prisma.userQuizAnswer.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.userQuizAnswer.create as jest.Mock).mockResolvedValue(null);

      const result = await createQuestionAnswer(inputAnswer);

      expect(result).toBeNull();
    });

    it('should handle correct answers', async () => {
      const inputAnswer = mockUserQuizAnswer({
        userCourseId: 1,
        quizId: 1,
        questionId: 1,
        correct: 'Correct Answer',
        answer: 'Correct Answer',
        isCorrect: true,
        points: 15,
      });
      const createdAnswer = { id: 1, ...inputAnswer };

      (prisma.userQuizAnswer.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.userQuizAnswer.create as jest.Mock).mockResolvedValue(createdAnswer);
      (UserQuizAnswer as jest.Mock).mockImplementation((data) => data);

      const result = await createQuestionAnswer(inputAnswer);

      expect(result?.isCorrect).toBe(true);
      expect(result?.points).toBe(15);
    });

    it('should handle incorrect answers', async () => {
      const inputAnswer = mockUserQuizAnswer({
        userCourseId: 1,
        quizId: 1,
        questionId: 1,
        correct: 'Correct Answer',
        answer: 'Wrong Answer',
        isCorrect: false,
        points: 0,
      });
      const createdAnswer = { id: 1, ...inputAnswer };

      (prisma.userQuizAnswer.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.userQuizAnswer.create as jest.Mock).mockResolvedValue(createdAnswer);
      (UserQuizAnswer as jest.Mock).mockImplementation((data) => data);

      const result = await createQuestionAnswer(inputAnswer);

      expect(result?.isCorrect).toBe(false);
      expect(result?.points).toBe(0);
    });

    it('should return UserQuizAnswer model instance', async () => {
      const inputAnswer = mockUserQuizAnswer();
      const createdAnswer = { id: 1, ...inputAnswer };
      (prisma.userQuizAnswer.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.userQuizAnswer.create as jest.Mock).mockResolvedValue(createdAnswer);
      (UserQuizAnswer as jest.Mock).mockImplementation((data) => data);

      await createQuestionAnswer(inputAnswer);

      expect(UserQuizAnswer).toHaveBeenCalledWith(createdAnswer);
    });
  });

  describe('createUserModuleState', () => {
    it('should create user module state successfully', async () => {
      const inputState = {
        userCourseId: 1,
        moduleId: 1,
        completed: false,
      };
      const createdState = {
        id: 1,
        ...inputState,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.userModuleState.create as jest.Mock).mockResolvedValue(createdState);
      (UserModuleState as jest.Mock).mockImplementation((data) => data);

      const result = await createUserModuleState(inputState as any);

      expect(prisma.userModuleState.create).toHaveBeenCalledWith({
        data: {
          userCourseId: 1,
          moduleId: 1,
          completed: false,
        },
      });
      expect(result).toBeDefined();
      expect(result?.completed).toBe(false);
    });

    it('should return null when creation fails', async () => {
      const inputState = mockUserModuleState();
      (prisma.userModuleState.create as jest.Mock).mockResolvedValue(null);

      const result = await createUserModuleState(inputState);

      expect(result).toBeNull();
    });

    it('should handle completed state', async () => {
      const inputState = {
        userCourseId: 2,
        moduleId: 3,
        completed: true,
      };
      const createdState = {
        id: 1,
        ...inputState,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.userModuleState.create as jest.Mock).mockResolvedValue(createdState);
      (UserModuleState as jest.Mock).mockImplementation((data) => data);

      const result = await createUserModuleState(inputState as any);

      expect(result?.completed).toBe(true);
    });

    it('should return UserModuleState model instance', async () => {
      const inputState = mockUserModuleState();
      const createdState = { id: 1, ...inputState };
      (prisma.userModuleState.create as jest.Mock).mockResolvedValue(createdState);
      (UserModuleState as jest.Mock).mockImplementation((data) => data);

      await createUserModuleState(inputState);

      expect(UserModuleState).toHaveBeenCalledWith(createdState);
    });

    it('should handle different userCourseId and moduleId combinations', async () => {
      const inputState = {
        userCourseId: 5,
        moduleId: 10,
        completed: false,
      };
      const createdState = {
        id: 1,
        ...inputState,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.userModuleState.create as jest.Mock).mockResolvedValue(createdState);
      (UserModuleState as jest.Mock).mockImplementation((data) => data);

      await createUserModuleState(inputState as any);

      expect(prisma.userModuleState.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userCourseId: 5,
          moduleId: 10,
        }),
      });
    });
  });
});
