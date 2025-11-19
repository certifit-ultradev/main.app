# Courses Repository Tests

Comprehensive unit tests for `repository/courses.ts` covering all 40 exported functions.

## 📁 Test Structure

```
repository/__test__/courses/
├── README.md                          # This file
├── TEST_PLAN.md                       # Detailed test strategy
├── setup.ts                           # Shared mocks and utilities
├── query-functions.test.ts            # Read operations (17 tests)
├── find-course-functions.test.ts      # Course lookups (18 tests)
├── quiz-functions.test.ts             # Quiz operations (17 tests)
├── analytics-functions.test.ts        # Analytics & reporting (21 tests)
├── create-course-functions.test.ts    # Create operations (23 tests)
├── user-state-functions.test.ts       # User progress tracking (21 tests)
├── update-functions.test.ts           # Update operations (18 tests)
├── delete-functions.test.ts           # Delete operations (18 tests)
└── update-full-course.test.ts         # Complex transactions (20 tests)
```

## 📊 Coverage Summary

| Test File | Functions Tested | Test Count | Focus Area |
|-----------|-----------------|------------|------------|
| **query-functions.test.ts** | 6 | 17 | Pagination, filtering, basic queries |
| **find-course-functions.test.ts** | 5 | 18 | Course lookups by ID/canonical ID |
| **quiz-functions.test.ts** | 3 | 17 | Quiz answers and state management |
| **analytics-functions.test.ts** | 3 | 21 | Sales analytics, BigInt conversion |
| **create-course-functions.test.ts** | 6 | 23 | Entity creation, transactions |
| **user-state-functions.test.ts** | 4 | 21 | User progress, upsert logic |
| **update-functions.test.ts** | 6 | 18 | Entity updates, relation exclusion |
| **delete-functions.test.ts** | 6 | 18 | Entity deletion |
| **update-full-course.test.ts** | 1 | 20 | Complex add/update/delete transactions |
| **TOTAL** | **40** | **173** | **Complete coverage** |

## 🚀 Running Tests

### Run all courses tests
```bash
npm test -- repository/__test__/courses/
```

### Run a specific test file
```bash
npm test -- repository/__test__/courses/query-functions.test.ts
```

### Run with coverage
```bash
npm test -- --coverage repository/__test__/courses/
```

### Watch mode
```bash
npm test -- --watch repository/__test__/courses/
```

## 🔍 Test Categories

### 1. Query Functions (Read Operations)
**File:** `query-functions.test.ts`

Tests basic read operations with pagination and filtering:
- `allCourses` - Pagination logic (default page handling, skip/take)
- `countAllCourses` - Total course count
- `countAllActiveCourses` - Active courses filter
- `findThreeCoursesActives` - Limit queries with optional userId
- `findUserCourses` - User enrollment data
- `findModulesByCourseId` - Module retrieval with ordering

**Key Tests:**
- Pagination edge cases (page < 1 defaults to 1)
- Deleted courses filtering (`deletedAt: null`)
- Empty result handling
- Correct ordering (`orderBy: { id: 'asc' }`)

### 2. Find Course Functions (Course Lookups)
**File:** `find-course-functions.test.ts`

Tests course retrieval with different identifiers:
- `findCourseById` - Full nested structure with all relations
- `findCourseByCanonicalId` - Canonical ID lookup
- `findCourseWithModulesByCanonicalId` - Complete module tree
- `findUserCourseByCanonicalId` - User course with progress states
- `findUserCourseWithModulesByCanonicalId` - Combined data

**Key Tests:**
- Deep nested relations (modules → classes/quizzes → questions → options)
- NotFoundError handling
- User state inclusion (ordered by `id: 'desc'`)
- Proper ordering of nested entities

### 3. Quiz Functions
**File:** `quiz-functions.test.ts`

Tests quiz-related operations:
- `findQuizAnswersByQuizId` - User quiz answers
- `findUserQuizState` - Latest quiz state
- `createUserQuizState` - New quiz state creation

**Key Tests:**
- Ordering (answers by `id: 'asc'`, state by `id: 'desc'`)
- NotFoundError for missing states
- Retries and pass/fail tracking
- Null handling

### 4. Analytics Functions
**File:** `analytics-functions.test.ts`

Tests analytics and reporting with raw SQL:
- `countCourseSales` - Course sales by product
- `sumCourseSalesByLastMonth` - Monthly comparison
- `sumUsersByLastMonth` - User registration trends

**Key Tests:**
- Raw SQL execution (`$queryRaw`)
- BigInt to Number conversion
- Course name truncation (20 chars + '...')
- Current vs previous month filtering
- APPROVED status filtering for purchases

### 5. Create Course Functions
**File:** `create-course-functions.test.ts`

Tests course and entity creation:
- `createFullCourse` - Complex transactional creation
- `createCourseModule`, `createModuleClass`, `createModuleQuiz`
- `createQuizQuestion`, `createQuestionOption`

**Key Tests:**
- Transaction handling (`$transaction`)
- Blob storage uploads (`storeVideoBlobStorage`)
- Canonical ID generation (`toSnakeCase`)
- Price conversion (string → number)
- Default values (`isActive: false`)
- Nested entity creation
- Error rollback

### 6. User State Functions
**File:** `user-state-functions.test.ts`

Tests user progress tracking with upsert logic:
- `createUserClassState` - Video progress tracking
- `createUserModuleFinishState` - Module completion
- `createQuestionAnswer` - Quiz answer upsert
- `createUserModuleState` - Module state creation

**Key Tests:**
- Upsert logic (create if not exists, update if exists)
- Completed flag preservation (once true, stays true)
- Video progress updates (`currentVideoTime`)
- Quiz retry handling
- Correct/incorrect answer tracking

### 7. Update Functions
**File:** `update-functions.test.ts`

Tests entity update operations:
- `updateCourse`, `updateModule`, `updateClass`
- `updateQuiz`, `updateQuestion`, `updateOption`

**Key Tests:**
- Partial updates
- Nested relation exclusion (category, courseModules, etc.)
- Model instance returns
- Field-specific updates

### 8. Delete Functions
**File:** `delete-functions.test.ts`

Tests entity deletion:
- `deleteCourse`, `deleteModule`, `deleteClass`
- `deleteQuiz`, `deleteQuestion`, `deleteOption`

**Key Tests:**
- Deletion by ID
- Void return type
- Different ID values
- Cascade behavior (implicit)

### 9. Update Full Course (Complex Transactions)
**File:** `update-full-course.test.ts`

Tests the most complex function with mixed operations:
- **Add Operations:** New questions, options, classes, modules
- **Update Operations:** Course data, price/date conversion, blob uploads
- **Delete Operations:** All entity types with video cleanup
- **Complex Scenarios:** Mixed operations, error handling

**Key Tests:**
- Transaction atomicity
- Blob storage integration
- File extraction (courseImage, instructorPhoto)
- Video deletion tracking
- Error rollback and recovery
- Graceful blob deletion failures

## 🛠️ Mock Strategy

### Shared Setup (`setup.ts`)
Provides consistent mock factories and utilities:

```typescript
// Mock data factories
mockCourse({ name: 'Custom Course' })
mockCourseModule({ title: 'Custom Module' })
mockModuleClass({ title: 'Custom Class' })
// ... and more

// Helper functions
setupMocks()      // Reset all mocks
clearAllMocks()   // Clear mock history
```

### Mocked Dependencies
- **Prisma Client:** All CRUD operations, transactions, raw queries
- **Model Classes:** Course, CourseModules, ModuleClass, etc.
- **Blob Storage:** `storeVideoBlobStorage`, `del`
- **Utilities:** `toSnakeCase`, `mergeChangesByTypeAndId`, type guards

## 📋 Test Patterns

### 1. Successful Operation
```typescript
it('should perform operation successfully', async () => {
    // Arrange: Setup mocks
    (prisma.course.findMany as jest.Mock).mockResolvedValue([mockCourse()]);
    
    // Act: Call function
    const result = await allCourses(1);
    
    // Assert: Verify behavior
    expect(prisma.course.findMany).toHaveBeenCalledWith({ ... });
    expect(result).toHaveLength(1);
});
```

### 2. Error Handling
```typescript
it('should throw NotFoundError when not found', async () => {
    (prisma.course.findFirst as jest.Mock).mockResolvedValue(null);
    
    await expect(findCourseById(1)).rejects.toThrow(NotFoundError);
});
```

### 3. Null Returns
```typescript
it('should return null when creation fails', async () => {
    (prisma.course.create as jest.Mock).mockResolvedValue(null);
    
    const result = await createCourse(data);
    
    expect(result).toBeNull();
});
```

### 4. Model Instance Verification
```typescript
it('should return Course model instance', async () => {
    (Course as jest.MockedClass<typeof Course>)
        .mockImplementation((data: any) => data as any);
    
    const result = await findCourseById(1);
    
    expect(Course).toHaveBeenCalledWith(mockData);
    expect(result).toBeInstanceOf(Object);
});
```

## 🎯 Coverage Goals

- **Statements:** >90%
- **Branches:** >85%
- **Functions:** 100% (40/40 functions)
- **Lines:** >90%

## 🔄 Continuous Integration

These tests are designed to:
- Run fast (< 2 seconds total)
- Be independent (no shared state between tests)
- Be deterministic (no flakiness)
- Provide clear failure messages

## 📝 Adding New Tests

When adding new functions to `repository/courses.ts`:

1. **Identify the category:** Query, Create, Update, Delete, or Complex
2. **Add to appropriate test file** or create a new one if needed
3. **Follow existing patterns:** Mock setup, assertions, error cases
4. **Update this README:** Add to coverage summary table
5. **Update TEST_PLAN.md:** Document test strategy

## 🐛 Common Issues

### Mock Not Working
```typescript
// ❌ Wrong
jest.mock('lib/prisma')

// ✅ Correct
jest.mock('../../../lib/prisma', () => ({
    __esModule: true,
    prisma: { /* mock implementation */ }
}));
```

### Transaction Testing
```typescript
// Setup transaction callback
(prisma.$transaction as jest.Mock).mockImplementation(async (callback) => {
    return await callback(mockTransaction);
});
```

### BigInt Conversion
```typescript
// Raw query returns BigInt, convert to Number
const result = { total: BigInt(100) };
expect(Number(result.total)).toBe(100);
```

## 📚 Related Documentation

- **TEST_PLAN.md** - Detailed test strategy and organization
- **repository/courses.ts** - Source file being tested
- **Jest Documentation** - https://jestjs.io/

## ✅ Verification

Run all tests to verify setup:
```bash
npm test -- repository/__test__/courses/
```

Expected output:
```
Test Suites: 9 passed, 9 total
Tests:       173 passed, 173 total
Time:        ~1.0s
```

---

**Last Updated:** November 8, 2025  
**Test Coverage:** 40/40 functions (100%)  
**Total Tests:** 173
