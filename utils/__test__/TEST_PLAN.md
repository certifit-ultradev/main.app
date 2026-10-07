# Utils Testing Plan

## Overview
Complete testing strategy for 11 utility files in the `/utils` directory. These utilities support core functionality including course management, data transformation, file uploads, validation, and cryptographic operations.

## Files to Test

### 1. ✅ classes.ts
**Functions:**
- `getCourseProgress` - Calculates student progress through course modules
- `toSnakeCase` - Converts strings to snake_case format

**Test Coverage:** progress behavior and canonical identifier normalization.

### 2. ✅ type-guards.ts (COMPLETED - 24 tests)
**Functions:**
- `isQuestion` - Type guard for quiz questions
- `isOption` - Type guard for question options
- `isModuleClass` - Type guard for module classes
- `isCourseModule` - Type guard for course modules

**Test Coverage:** 4 functions, 24 tests total
- Each function: 6 tests (valid object, missing property, null, undefined, primitives, empty object)

### 3. filter-data.ts (retired in TB-052)

The helper had no production consumers. Admin user action and repository tests now verify `''`, `null` and `undefined` according to the user patch contract.

### 4. ✅ expiraton-token.ts (COMPLETED - 5 tests)
**Functions:**
- `generateExpirationToken` - Generates UUID token with 1-hour expiration

**Test Coverage:** 1 function, 5 tests total
- Token generation, multiple calls, expiration timing, different times, return structure

### 5. ✅ signature.ts (COMPLETED - 22 tests)
**Functions:**
- `generateHash` - Creates SHA-256 hash from string
- `generateSignature` - Generates payment signature with COP currency
- `verifyEventSignature` - Verifies webhook event signatures

**Test Coverage:** 3 functions, 22 tests total
- generateHash: 7 tests (basic hashing, consistency, special chars, unicode, long strings)
- generateSignature: 7 tests (signature format, COP currency, different inputs, zero price)
- verifyEventSignature: 8 tests (event signature, nested paths, timestamps, properties)

### 6. ✅ url.ts (COMPLETED - 5 tests)
**Functions:**
- `getPaymentReviewUrl` - Constructs payment review URL from environment domain

**Test Coverage:** 1 function, 5 tests total
- Domain handling, localhost, undefined domain, empty domain

### 7. ✅ video.ts (COMPLETED - 28 tests)
**Functions:**
- `calculateTotalVideoSize` - Sums video file sizes from course modules
- `formatVideoSize` - Formats bytes to GB with 4 decimals
- `calculateTotalVideoDuration` - Sums video durations from modules
- `formatVideoDuration` - Formats seconds to "HH hr MM mins SS sec"

**Test Coverage:** 4 functions, 28 tests total
- calculateTotalVideoSize: 8 tests
- formatVideoSize: 5 tests
- calculateTotalVideoDuration: 6 tests
- formatVideoDuration: 9 tests

### 8. ✅ zod-errors-mapper.ts (COMPLETED - 10 tests)
**Functions:**
- `mapZodErrors` - Transforms Zod validation errors to error map

**Test Coverage:** 1 function, 10 tests total
- Single/multiple errors, nested paths, array indices, error codes, messages, complex nested arrays

### 9. ✅ upload-file-blob.test.ts (COMPLETED - 19 tests)
**Functions:**
- `uploadFile` - Uploads files to Vercel Blob storage
- `generateFileName` - Generates UUID-based filename with extension

**Test Coverage:** 2 functions, 19 tests total
- generateFileName: 8 tests (mp4, png, jpg extensions, invalid formats, multiple calls)
- uploadFile: 11 tests (upload config, public access, multipart, progress, different file types)

> `diff.ts`, `change-types.ts` and their tests were retired with the dynamic course editor. The current editor persists the explicit `CourseEditorPatch` command.
