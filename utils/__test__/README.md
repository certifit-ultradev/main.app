# Utils Tests Documentation

## Overview
Comprehensive test suite for utility functions in `/utils` directory. These tests ensure data transformation, validation, cryptographic operations, file handling, and course management utilities work correctly.

## Test Files

### 1. classes.test.ts
**Functions Tested:** 3  
**Total Tests:** 21  
**Status:** ✅ All passing

Tests utility functions for course change management and progress calculation:
- `mergeChangesByTypeAndId` - Groups course changes by entity type and ID
- `getCourseProgress` - Calculates student progress through course modules
- `toSnakeCase` - Converts strings to snake_case format

**Key Test Cases:**
- Merging multiple changes to same entity
- Calculating progress with various completion states
- Visible class determination (current + next pattern)
- String conversion edge cases

---

### 2. type-guards.test.ts
**Functions Tested:** 4  
**Total Tests:** 24  
**Status:** ✅ All passing

Tests TypeScript type guard functions for runtime type checking:
- `isQuestion` - Validates quiz question objects
- `isOption` - Validates question option objects
- `isModuleClass` - Validates module class objects
- `isCourseModule` - Validates course module objects

**Key Test Cases:**
- Valid objects with required properties
- Objects missing required properties
- Null/undefined handling
- Primitive type rejection
- Empty object handling

---

### 3. filter-data.test.ts
**Functions Tested:** 1  
**Total Tests:** 10  
**Status:** ✅ All passing

Tests data sanitization functionality:
- `cleanData` - Removes undefined, null, and empty string values from objects

**Key Test Cases:**
- Removing undefined values
- Removing null values
- Removing empty strings
- Preserving zero values and false booleans
- Handling nested objects
- Handling arrays

---

### 4. expiraton-token.test.ts
**Functions Tested:** 1  
**Total Tests:** 5  
**Status:** ✅ All passing

Tests token generation for authentication/verification:
- `generateExpirationToken` - Creates UUID token with 1-hour expiration

**Key Test Cases:**
- UUID generation via `uuid` library
- Expiration set to exactly 1 hour from current time
- Different tokens on multiple calls
- Correct return object structure

**Mocks Used:**
- `uuid` - For predictable token generation
- `jest.useFakeTimers()` - For time-based testing

---

### 5. signature.test.ts
**Functions Tested:** 3  
**Total Tests:** 22  
**Status:** ✅ All passing

Tests cryptographic signature generation and verification:
- `generateHash` - Creates SHA-256 hash from string
- `generateSignature` - Generates payment signature with COP currency
- `verifyEventSignature` - Verifies webhook event signatures from payment provider

**Key Test Cases:**
- SHA-256 hash consistency
- Handling special characters and unicode
- Payment signature format (reference + price + COP + key)
- Event signature extraction from nested properties
- Timestamp inclusion in signatures

**Crypto Operations:**
- Uses Node.js `crypto.subtle.digest` API
- SHA-256 hashing with hex encoding

---

### 6. url.test.ts
**Functions Tested:** 1  
**Total Tests:** 5  
**Status:** ✅ All passing

Tests URL construction from environment variables:
- `getPaymentReviewUrl` - Constructs payment review URL

**Key Test Cases:**
- Domain from `NEXT_PUBLIC_DOMAIN` environment variable
- Localhost domain handling
- Undefined domain handling
- Empty domain handling
- Path concatenation

---

### 7. video.test.ts
**Functions Tested:** 4  
**Total Tests:** 28  
**Status:** ✅ All passing

Tests video size and duration calculations for courses:
- `calculateTotalVideoSize` - Sums video file sizes across modules
- `formatVideoSize` - Formats bytes to GB with 4 decimals
- `calculateTotalVideoDuration` - Sums video durations across modules
- `formatVideoDuration` - Formats seconds to "HH hr MM mins SS sec"

**Key Test Cases:**
- File size from `videoSize` property and File objects
- Multiple modules aggregation
- Missing values handling (defaults to 0)
- GB formatting precision
- Duration formatting with zero-padding
- Decimal seconds flooring

---

### 8. zod-errors-mapper.test.ts
**Functions Tested:** 1  
**Total Tests:** 10  
**Status:** ✅ All passing

Tests Zod validation error transformation:
- `mapZodErrors` - Transforms Zod errors to error map object

**Key Test Cases:**
- Single and multiple validation errors
- Nested object path handling (joined with dashes)
- Array index paths (e.g., "items-0-title")
- Error code preservation as `type`
- Error message preservation
- Complex nested array errors
- Console logging verification

**Integration:** Works with Zod schema validation throughout the application

---

### 9. upload-file-blob.test.ts
**Functions Tested:** 2  
**Total Tests:** 19  
**Status:** ✅ All passing

Tests file upload to Vercel Blob storage:
- `uploadFile` - Uploads files with progress tracking
- `generateFileName` - Generates UUID-based filenames with extensions

**Key Test Cases:**
- Filename generation for mp4, png, jpg formats
- Invalid format rejection (throws error)
- Upload configuration (public access, multipart)
- Blob API endpoint (`/api/blob-upload`)
- Progress callback functionality
- Path concatenation with generated filename

**Mocks Used:**
- `@vercel/blob/client` - upload function
- `uuid` - For predictable filename generation

---

### 10. diff.test.ts
**Functions Tested:** 1  
**Total Tests:** 16  
**Status:** ✅ All passing

Tests deep comparison of course objects to detect changes:
- `diffCourses` - Detects added, updated, deleted entities at all nesting levels

**Key Test Cases:**
- Course property updates
- Module add/delete/update operations
- Class add/delete/update operations
- Quiz property changes
- Question add/delete operations
- Option add/delete/update operations
- Complex nested changes (multiple simultaneous changes)
- Path context preservation through nesting levels

**Change Types Detected:**
- `course`, `module`, `class`, `quiz`, `question`, `option`
- Actions: `added`, `updated`, `deleted`
- Path tracking: `{ course: 1, module: 2, class: 5, property: 'title' }`

**Integration:** Powers the `updateFullCourse` transaction logic in repository tests

---

### 11. change-types.ts
**Status:** ⏭️ Skipped (Type definitions only)

This file contains only TypeScript type definitions (`Path`, `BaseChange`, `CourseChange`). Types are validated at compile time by TypeScript, so no runtime tests are needed.

---

## Running Tests

### Run All Utils Tests
```bash
npm test -- utils/__test__
```

### Run Individual Test File
```bash
npm test -- utils/__test__/classes.test.ts
npm test -- utils/__test__/type-guards.test.ts
npm test -- utils/__test__/filter-data.test.ts
npm test -- utils/__test__/expiraton-token.test.ts
npm test -- utils/__test__/signature.test.ts
npm test -- utils/__test__/url.test.ts
npm test -- utils/__test__/video.test.ts
npm test -- utils/__test__/zod-errors-mapper.test.ts
npm test -- utils/__test__/upload-file-blob.test.ts
npm test -- utils/__test__/diff.test.ts
```

### Run Tests in Watch Mode
```bash
npm test -- utils/__test__/classes.test.ts --watch
```

### Run with Coverage
```bash
npm test -- utils/__test__ --coverage
```

---

## Test Summary

| File | Functions | Tests | Status | Execution Time |
|------|-----------|-------|--------|----------------|
| classes.test.ts | 3 | 21 | ✅ | ~0.2s |
| type-guards.test.ts | 4 | 24 | ✅ | ~0.2s |
| filter-data.test.ts | 1 | 10 | ✅ | ~0.2s |
| expiraton-token.test.ts | 1 | 5 | ✅ | ~0.2s |
| signature.test.ts | 3 | 22 | ✅ | ~0.2s |
| url.test.ts | 1 | 5 | ✅ | ~0.2s |
| video.test.ts | 4 | 28 | ✅ | ~0.2s |
| zod-errors-mapper.test.ts | 1 | 10 | ✅ | ~0.2s |
| upload-file-blob.test.ts | 2 | 19 | ✅ | ~0.3s |
| diff.test.ts | 1 | 16 | ✅ | ~0.2s |
| **TOTAL** | **21** | **160** | **✅** | **~2.1s** |

---

## Testing Patterns Used

### 1. Mocking External Dependencies
```typescript
jest.mock('uuid');
jest.mock('@vercel/blob/client');

const mockUuid = uuid as jest.MockedFunction<typeof uuid>;
mockUuid.mockReturnValue('test-uuid-1234');
```

### 2. Time-Based Testing
```typescript
beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
});

afterEach(() => {
    jest.useRealTimers();
});
```

### 3. Environment Variable Testing
```typescript
const originalEnv = process.env;

beforeEach(() => {
    process.env = { ...originalEnv };
});

afterEach(() => {
    process.env = originalEnv;
});
```

### 4. Type Assertions for Complex Types
```typescript
const changes: any = [
    { op: 'add', path: { class: 1 }, data: { title: 'New' } }
];
```

### 5. Error Testing
```typescript
expect(() => generateFileName('invalid')).toThrow('Formato invalido');

await expect(uploadFile('path/', invalidFile)).rejects.toThrow();
```

### 6. Async/Await Testing
```typescript
it('should generate hash', async () => {
    const result = await generateHash('test');
    expect(result).toMatch(/^[a-f0-9]{64}$/);
});
```

---

## Coverage Goals

### Target Coverage
- **Statements:** >90%
- **Branches:** >85%
- **Functions:** 100%
- **Lines:** >90%

### Current Status
All 21 functions tested across 10 test files with 160 test cases. Fast execution (<3 seconds total) ensures quick feedback during development.

---

## Integration Points

### Course Management
- `classes.ts` - Powers `updateFullCourse` change merging
- `diff.ts` - Detects changes for course updates
- `video.ts` - Calculates course metadata for UI display

### Validation & Error Handling
- `type-guards.ts` - Runtime validation before processing
- `zod-errors-mapper.ts` - User-friendly error messages
- `filter-data.ts` - Data sanitization before DB operations

### Authentication & Security
- `expiraton-token.ts` - Verification tokens, password reset
- `signature.ts` - Payment webhook verification

### File Management
- `upload-file-blob.ts` - Video/image uploads to Vercel Blob

### Data Transformation
- `toSnakeCase` - Canonical ID generation for SEO-friendly URLs
- `formatVideoSize` / `formatVideoDuration` - User-friendly displays

---

## Maintenance

### Adding New Tests
1. Create test file: `utils/__test__/<filename>.test.ts`
2. Follow existing patterns (describe blocks, mocking strategy)
3. Update this README with test count and description
4. Update TEST_PLAN.md if needed

### Updating Existing Tests
1. Maintain test structure and naming conventions
2. Update test counts in this README
3. Ensure all tests continue to pass
4. Update integration point documentation if behavior changes

### Mock Updates
When utility dependencies change:
1. Update mock implementations in test files
2. Verify all related tests still pass
3. Update mock documentation in this README

---

## Related Documentation
- `utils/__test__/TEST_PLAN.md` - Detailed testing strategy
- `repository/__test__/courses/README.md` - Repository layer tests
- `repository/__test__/courses/TEST_PLAN.md` - Repository testing strategy

---

## Notes

### Type-Only Files
`change-types.ts` contains only TypeScript type definitions and requires no runtime tests. TypeScript compiler validates types at build time.

### Fast Execution
All tests execute in under 3 seconds total, enabling rapid development feedback and CI/CD integration.

### No Shared State
Tests use `beforeEach`/`afterEach` to reset mocks and state, ensuring test isolation and preventing flaky tests.

### Real Crypto API
Signature tests use Node.js native `crypto.subtle` API, no mocking needed for cryptographic operations.
