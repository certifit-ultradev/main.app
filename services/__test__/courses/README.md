# Tests de Courses Service - Estructura Modular

Este directorio contiene los tests para el servicio de cursos organizados de manera modular para mejor mantenibilidad y legibilidad.

## Estructura de Archivos

### `setup.ts`
Archivo base que contiene utilidades compartidas por todos los tests:
- `mockSession`: Sesión de usuario simulada para tests
- `mockSessionWithoutEmail`: Sesión sin email verificado
- `setupMocks()`: Configura los mocks básicos
- `clearAllMocks()`: Limpia todos los mocks después de cada test

### Archivos de Test

#### `basic-operations.test.ts` (7 tests)
Tests de operaciones básicas CRUD:
- `getAllCourses` - Paginación y obtención de cursos
- `getCourseById` - Obtención por ID
- `getModulesByCourseId` - Obtención de módulos

#### `user-course-retrieval.test.ts` (13 tests)
Tests de acceso a cursos por usuarios:
- `getUserCourseWithModulesByCanonicalId` - Curso con módulos del usuario
- `getUserCourseByCanonicalId` - Curso del usuario
- `getCourseByCanonicalId` - Curso público
- `getTopThreeCourses` - Top 3 cursos activos
- `getUserCourses` - Todos los cursos del usuario

#### `course-management.test.ts` (27 tests)
Tests de gestión y administración de cursos:
- `registerCourse` - Creación de curso
- `editCourse` - Edición con diff de cambios (added/updated/deleted)
- `updateClassVideoPath` - Actualización de rutas de video
- `activateCourse` - Activación (límite de 3 cursos activos)
- `deactivateCourse` - Desactivación

#### `user-progress.test.ts` (16 tests)
Tests de seguimiento del progreso del usuario:
- `registerClassCurrentState` - Estado de reproducción de clases
- `registerModuleFinishtState` - Estado de finalización de módulos

#### `quiz-retrieval.test.ts` (14 tests)
Tests de obtención de datos de quizzes:
- `getUserCourseQuizAnswers` - Respuestas del quiz del usuario
- `getUserQuizState` - Estado del quiz (intentos, puntaje)

#### `quiz-answer-registration.test.ts` (13 tests)
Tests de registro de respuestas de quizzes:
- `registerQuestionAnswer` - Registro de respuesta (múltiple opción / texto)
  - Valida preguntas correctas e incorrectas
  - Calcula puntos según tipo de respuesta

#### `quiz-scoring.test.ts` (14 tests)
Tests de calificación de quizzes:
- `calculateQuizScore` - Cálculo de puntaje
  - Pass/fail según mínimo requerido
  - Incremento de reintentos
  - Validación de respuestas completas

#### `analytics.test.ts` (6 tests)
Tests de funciones de análisis y estadísticas:
- `calculateTotalSalesPerCourse` - Ventas por curso
- `calculateTotalSalesByMonth` - Ventas mensuales
- `calculateUsersRegisteredByMonth` - Usuarios registrados por mes

## Cobertura Total

- **Total de tests**: 101 tests
- **Cobertura de statements**: 92.77%
- **Cobertura de branches**: 74.28%
- **Cobertura de functions**: 80.48%

## Ejecutar Tests

```bash
# Ejecutar todos los tests del servicio de cursos
npm test -- services/__test__/courses/

# Ejecutar un archivo específico
npm test -- services/__test__/courses/quiz-scoring.test.ts

# Ejecutar con cobertura
npm test -- --coverage services/__test__/courses/
```

## Patrones de Testing

### Mocking
Todos los tests usan jest.mock() para:
- `@/repository/courses` - Capa de datos
- `@/auth` - Autenticación
- `@/exceptions/error-encoder` - Logging de errores
- `@/models/*` - Modelos de datos

### Estructura de Tests
Cada archivo sigue el patrón:
```typescript
describe('Courses Service - [Feature Area]', () => {
    beforeEach(() => {
        setupMocks(logPrismaError as jest.Mock, auth as jest.Mock);
    });

    afterEach(() => {
        clearAllMocks();
    });

    describe('[functionName]', () => {
        test('debería...', async () => {
            // Arrange
            // Act
            // Assert
        });
    });
});
```

### Casos de Prueba Comunes
- Autenticación (usuario logueado, email verificado)
- Validación de permisos (curso pertenece al usuario)
- Manejo de errores (propagación y logging)
- Validaciones de datos (IDs válidos, datos completos)
- Casos edge (valores límite, arrays vacíos, null values)

## Migración desde el Archivo Monolítico

Este directorio reemplaza el archivo `courses.test.ts` original de 1851 líneas. Los tests fueron reorganizados por funcionalidad manteniendo la misma lógica y cobertura.

### Ventajas de la Nueva Estructura:
✅ **Mantenibilidad**: Archivos más pequeños y enfocados (200-400 líneas)
✅ **Navegación**: Fácil encontrar tests relacionados a una funcionalidad
✅ **Colaboración**: Menor riesgo de conflictos en git
✅ **Legibilidad**: Código más organizado y documentado
✅ **Escalabilidad**: Fácil agregar nuevos tests en el archivo correspondiente

## Notas

- Todos los tests usan `as any` para los parámetros cuando no se necesitan todos los campos
- Los mocks se limpian después de cada test para evitar interferencias
- Las funciones helper (como `createMockCourse...`) están definidas dentro de cada archivo de test según sus necesidades específicas
