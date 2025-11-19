# Test Plan for repository/courses.ts

## Overview
This document outlines the comprehensive test strategy for the `repository/courses.ts` file, which contains 40 exported functions organized into CRUD operations for courses, modules, classes, quizzes, and user progress tracking.

## File Organization

### 1. **setup.ts** - Shared Test Utilities
- Mock configurations for `prisma`
- Mock configurations for all model classes
- Mock configurations for utility functions (`storeVideoBlobStorage`, `del`, `toSnakeCase`, etc.)
- Shared test data factories
- Common test helpers

### 2. **query-functions.test.ts** - Read Operations (6 functions)
Functions covered:
- `allCourses(page, pageSize)` - Pagination, filtering deleted courses
- `countAllCourses()` - Count all courses
- `countAllActiveCourses()` - Count active courses only
- `findThreeCoursesActives(userId?)` - Get 3 active courses with optional user data
- `findUserCourses(userId?)` - Get user's enrolled courses
- `findModulesByCourseId(courseId)` - Get modules for a specific course

Test cases per function:
- **allCourses**: page < 1 defaults to 1, correct pagination, empty results, mapping to Course model
- **countAllCourses**: returns correct count
- **countAllActiveCourses**: filters by isActive flag
- **findThreeCoursesActives**: with userId, without userId, empty results
- **findUserCourses**: with valid userId, empty results, correct mapping to UserCourse model
- **findModulesByCourseId**: valid courseId, filters deleted, empty results

### 3. **find-course-functions.test.ts** - Course Lookup Operations (5 functions)
Functions covered:
- `findCourseById(id)` - Find by numeric ID
- `findCourseByCanonicalId(id, userId)` - Find by canonical ID
- `findCourseWithModulesByCanonicalId(id, userId)` - Find with full module tree
- `findUserCourseByCanonicalId(id, userId)` - Find with user state
- `findUserCourseWithModulesByCanonicalId(id, userId)` - Find with modules and user state

Test cases per function:
- **findCourseById**: course exists, course not found (NotFoundError), includes nested relations
- **findCourseByCanonicalId**: course exists, course not found (NotFoundError)
- **findCourseWithModulesByCanonicalId**: includes modules/classes/quizzes, not found error
- **findUserCourseByCanonicalId**: includes userCourse relation, user states
- **findUserCourseWithModulesByCanonicalId**: full nested includes with user progress

### 4. **quiz-functions.test.ts** - Quiz Operations (3 functions)
Functions covered:
- `findQuizAnswersByQuizId(userCourseId, quizId)` - Get user's quiz answers
- `findUserQuizState(quizId, userCourseId)` - Get quiz attempt state
- `createUserQuizState(userQuizState)` - Create new quiz state

Test cases:
- **findQuizAnswersByQuizId**: answers exist, empty array when no answers, correct mapping
- **findUserQuizState**: state exists, not found error, correct ordering (latest first)
- **createUserQuizState**: successful creation, returns correct UserQuizState model

### 5. **analytics-functions.test.ts** - Analytics & Reporting (3 functions)
Functions covered:
- `countCourseSales()` - Count sales per course (raw SQL)
- `sumCourseSalesByLastMonth()` - Compare current vs previous month sales
- `sumUsersByLastMonth()` - Compare current vs previous month user registrations

Test cases:
- **countCourseSales**: returns correct aggregated data, course name truncation, BigInt to Number conversion
- **sumCourseSalesByLastMonth**: current and previous month counts, filters by APPROVED status
- **sumUsersByLastMonth**: current and previous month counts

### 6. **create-course-functions.test.ts** - Course Creation (6 functions)
Functions covered:
- `createFullCourse(course)` - Create course with full structure (transaction)
- `createCourseModule(module)` - Create individual module
- `createModuleClass(cls)` - Create individual class
- `createModuleQuiz(quiz)` - Create individual quiz
- `createQuizQuestion(question)` - Create individual question
- `createQuestionOption(option)` - Create individual option

Test cases:
- **createFullCourse**: 
  - Complete course with modules/classes/quizzes
  - Transaction rollback on error
  - Blob storage upload for images
  - canonicalId conversion
  - Returns Course model with nested data
- **Individual create functions**: successful creation, null return handling, model mapping

### 7. **user-state-functions.test.ts** - User Progress Tracking (4 functions)
Functions covered:
- `createUserClassState(state)` - Track video progress
- `createUserModuleFinishState(state)` - Mark module complete
- `createQuestionAnswer(answer)` - Save quiz answer
- `createUserModuleState(state)` - Create module state

Test cases:
- **createUserClassState**: new state creation, update existing state, preserve completion flag
- **createUserModuleFinishState**: new state creation, existing state handling
- **createQuestionAnswer**: new answer, update existing answer
- **createUserModuleState**: basic creation

### 8. **update-functions.test.ts** - Update Operations (6 functions)
Functions covered:
- `updateCourse(courseId, data)` - Update course
- `updateModule(moduleId, data)` - Update module
- `updateClass(classId, data)` - Update class
- `updateQuiz(quizId, data)` - Update quiz
- `updateQuestion(questionId, data)` - Update question
- `updateOption(optionId, data)` - Update option

Test cases per function:
- Successful update
- Partial data update
- Exclude nested relations from update
- Returns updated model instance

### 9. **delete-functions.test.ts** - Delete Operations (6 functions)
Functions covered:
- `deleteCourse(courseId)` - Delete course
- `deleteModule(moduleId)` - Delete module
- `deleteClass(classId)` - Delete class
- `deleteQuiz(quizId)` - Delete quiz
- `deleteQuestion(questionId)` - Delete question
- `deleteOption(optionId)` - Delete option

Test cases per function:
- Successful deletion
- Returns void
- Cascade deletion behavior (if applicable)

### 10. **update-full-course.test.ts** - Complex Transaction (1 function)
Functions covered:
- `updateFullCourse(courseId, adds, updates, deletes)` - Complex course update

Test cases:
- **Add operations**: module, class, quiz, question, option
- **Update operations**: all entity types, blob storage updates for images/videos
- **Delete operations**: all entity types, blob storage cleanup
- **Transaction handling**: rollback on error
- **Complex scenarios**: multiple operations combined
- **Edge cases**: empty arrays, video path deletion

## Mock Strategy

### Prisma Client Mocks
```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    course: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    courseModules: { /* ... */ },
    moduleClass: { /* ... */ },
    moduleQuiz: { /* ... */ },
    quizQuestion: { /* ... */ },
    possibleAnswerQuestion: { /* ... */ },
    userCourse: { /* ... */ },
    userClassesState: { /* ... */ },
    userModuleState: { /* ... */ },
    userQuizState: { /* ... */ },
    userQuizAnswer: { /* ... */ },
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
  }
}));
```

### Model Class Mocks
Mock all model constructors to return input data as-is:
- Course, CourseModules, ModuleClass, ModuleQuiz, QuizQuestion, PossibleAnswerQuestion
- UserCourse, UserClassesState, UserModuleState, UserQuizState, UserQuizAnswer

### External Dependencies
- `@/services/video` - `storeVideoBlobStorage` mock
- `@vercel/blob` - `del` mock
- `@/utils/classes` - `toSnakeCase`, `mergeChangesByTypeAndId` mocks
- `@/utils/type-guards` - type guard mocks

## Test Data Factories

Create reusable factory functions for:
- `mockCourse(overrides?)` - Complete course object
- `mockCourseModule(overrides?)` - Module object
- `mockModuleClass(overrides?)` - Class object
- `mockModuleQuiz(overrides?)` - Quiz object
- `mockQuizQuestion(overrides?)` - Question object
- `mockPossibleAnswer(overrides?)` - Answer option object
- `mockUserCourse(overrides?)` - User course enrollment
- `mockCourseData(overrides?)` - CourseData for createFullCourse

## Running Tests

```bash
# Run all courses repository tests
npm test -- repository/__test__/courses/

# Run specific test file
npm test -- repository/__test__/courses/query-functions.test.ts

# Run with coverage
npm test -- repository/__test__/courses/ --coverage

# Watch mode
npm test -- repository/__test__/courses/ --watch
```

## Coverage Goals
- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 95%
- **Lines**: > 90%

## Notes
- All tests should be isolated and not depend on database state
- Use `beforeEach` to reset all mocks
- Use descriptive test names following pattern: "should [expected behavior] when [condition]"
- Group related tests with `describe` blocks
- Test both success and error scenarios
