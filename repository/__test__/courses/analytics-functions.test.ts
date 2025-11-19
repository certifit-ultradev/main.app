/**
 * Tests for repository/courses.ts - Analytics Functions
 * 
 * Functions tested:
 * - countCourseSales
 * - sumCourseSalesByLastMonth
 * - sumUsersByLastMonth
 */

import { prisma } from '@/lib/prisma';
import {
  countCourseSales,
  sumCourseSalesByLastMonth,
  sumUsersByLastMonth,
} from '@/repository/courses';
import { setupMocks } from './setup';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

describe('repository/courses - Analytics Functions', () => {
  beforeEach(() => {
    setupMocks();
  });

  describe('countCourseSales', () => {
    it('should return aggregated course sales data', async () => {
      const mockResults = [
        { course_name: '1 - Introduction to Programming', total: BigInt(25) },
        { course_name: '2 - Advanced JavaScript', total: BigInt(15) },
        { course_name: '3 - React Fundamentals', total: BigInt(30) },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResults);

      const result = await countCourseSales();

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(result).toHaveLength(3);
    });

    it('should truncate course names to 20 characters plus ellipsis', async () => {
      const mockResults = [
        { 
          course_name: '1 - This is a very long course name that should be truncated', 
          total: BigInt(10) 
        },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResults);

      const result = await countCourseSales();

      expect(result[0].course_name).toBe('1 - This is a very l...');
      expect(result[0].course_name.length).toBe(23); // 20 chars + '...'
    });

    it('should convert BigInt total to Number', async () => {
      const mockResults = [
        { course_name: '1 - Course A', total: BigInt(42) },
        { course_name: '2 - Course B', total: BigInt(100) },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResults);

      const result = await countCourseSales();

      expect(typeof result[0].total).toBe('number');
      expect(result[0].total).toBe(42);
      expect(typeof result[1].total).toBe('number');
      expect(result[1].total).toBe(100);
    });

    it('should return empty array when no sales found', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValue([]);

      const result = await countCourseSales();

      expect(result).toEqual([]);
    });

    it('should handle single course sale', async () => {
      const mockResults = [
        { course_name: '5 - Single Course', total: BigInt(1) },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResults);

      const result = await countCourseSales();

      expect(result).toHaveLength(1);
      expect(result[0].course_name).toBe('5 - Single Course...');
      expect(result[0].total).toBe(1);
    });

    it('should handle course names exactly 20 characters', async () => {
      const mockResults = [
        { course_name: '12345678901234567890', total: BigInt(5) },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResults);

      const result = await countCourseSales();

      expect(result[0].course_name).toBe('12345678901234567890...');
    });

    it('should map all results correctly', async () => {
      const mockResults = [
        { course_name: '1 - Course One', total: BigInt(10) },
        { course_name: '2 - Course Two', total: BigInt(20) },
        { course_name: '3 - Course Three', total: BigInt(30) },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResults);

      const result = await countCourseSales();

      expect(result).toEqual([
        { course_name: '1 - Course One...', total: 10 },
        { course_name: '2 - Course Two...', total: 20 },
        { course_name: '3 - Course Three...', total: 30 },
      ]);
    });
  });

  describe('sumCourseSalesByLastMonth', () => {
    it('should return current and previous month counts', async () => {
      const mockResult = [
        {
          current_month_count: BigInt(45),
          previous_month_count: BigInt(30),
        },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResult);

      const result = await sumCourseSalesByLastMonth();

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(result.current_month_count).toBe(45);
      expect(result.previous_month_count).toBe(30);
    });

    it('should convert BigInt values to Numbers', async () => {
      const mockResult = [
        {
          current_month_count: BigInt(100),
          previous_month_count: BigInt(85),
        },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResult);

      const result = await sumCourseSalesByLastMonth();

      expect(typeof result.current_month_count).toBe('number');
      expect(typeof result.previous_month_count).toBe('number');
      expect(result.current_month_count).toBe(100);
      expect(result.previous_month_count).toBe(85);
    });

    it('should handle zero sales in current month', async () => {
      const mockResult = [
        {
          current_month_count: BigInt(0),
          previous_month_count: BigInt(20),
        },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResult);

      const result = await sumCourseSalesByLastMonth();

      expect(result.current_month_count).toBe(0);
      expect(result.previous_month_count).toBe(20);
    });

    it('should handle zero sales in previous month', async () => {
      const mockResult = [
        {
          current_month_count: BigInt(15),
          previous_month_count: BigInt(0),
        },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResult);

      const result = await sumCourseSalesByLastMonth();

      expect(result.current_month_count).toBe(15);
      expect(result.previous_month_count).toBe(0);
    });

    it('should handle zero sales in both months', async () => {
      const mockResult = [
        {
          current_month_count: BigInt(0),
          previous_month_count: BigInt(0),
        },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResult);

      const result = await sumCourseSalesByLastMonth();

      expect(result.current_month_count).toBe(0);
      expect(result.previous_month_count).toBe(0);
    });

    it('should destructure first element from array result', async () => {
      const mockResult = [
        {
          current_month_count: BigInt(50),
          previous_month_count: BigInt(40),
        },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResult);

      const result = await sumCourseSalesByLastMonth();

      expect(result).toBeDefined();
      expect(result.current_month_count).toBe(50);
    });
  });

  describe('sumUsersByLastMonth', () => {
    it('should return current and previous month user counts', async () => {
      const mockResult = [
        {
          current_month_count: BigInt(120),
          previous_month_count: BigInt(95),
        },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResult);

      const result = await sumUsersByLastMonth();

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(result.current_month_count).toBe(120);
      expect(result.previous_month_count).toBe(95);
    });

    it('should convert BigInt values to Numbers', async () => {
      const mockResult = [
        {
          current_month_count: BigInt(200),
          previous_month_count: BigInt(150),
        },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResult);

      const result = await sumUsersByLastMonth();

      expect(typeof result.current_month_count).toBe('number');
      expect(typeof result.previous_month_count).toBe('number');
      expect(result.current_month_count).toBe(200);
      expect(result.previous_month_count).toBe(150);
    });

    it('should handle zero new users in current month', async () => {
      const mockResult = [
        {
          current_month_count: BigInt(0),
          previous_month_count: BigInt(75),
        },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResult);

      const result = await sumUsersByLastMonth();

      expect(result.current_month_count).toBe(0);
      expect(result.previous_month_count).toBe(75);
    });

    it('should handle zero new users in previous month', async () => {
      const mockResult = [
        {
          current_month_count: BigInt(50),
          previous_month_count: BigInt(0),
        },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResult);

      const result = await sumUsersByLastMonth();

      expect(result.current_month_count).toBe(50);
      expect(result.previous_month_count).toBe(0);
    });

    it('should handle zero users in both months', async () => {
      const mockResult = [
        {
          current_month_count: BigInt(0),
          previous_month_count: BigInt(0),
        },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResult);

      const result = await sumUsersByLastMonth();

      expect(result.current_month_count).toBe(0);
      expect(result.previous_month_count).toBe(0);
    });

    it('should destructure first element from array result', async () => {
      const mockResult = [
        {
          current_month_count: BigInt(88),
          previous_month_count: BigInt(92),
        },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResult);

      const result = await sumUsersByLastMonth();

      expect(result).toBeDefined();
      expect(result.current_month_count).toBe(88);
      expect(result.previous_month_count).toBe(92);
    });

    it('should handle growth scenario (current > previous)', async () => {
      const mockResult = [
        {
          current_month_count: BigInt(150),
          previous_month_count: BigInt(100),
        },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResult);

      const result = await sumUsersByLastMonth();

      expect(result.current_month_count).toBeGreaterThan(result.previous_month_count);
    });

    it('should handle decline scenario (current < previous)', async () => {
      const mockResult = [
        {
          current_month_count: BigInt(80),
          previous_month_count: BigInt(120),
        },
      ];
      (prisma.$queryRaw as jest.Mock).mockResolvedValue(mockResult);

      const result = await sumUsersByLastMonth();

      expect(result.current_month_count).toBeLessThan(result.previous_month_count);
    });
  });
});
