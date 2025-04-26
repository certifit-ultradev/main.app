# Changelog

## [unreleased]

### Added

- Added the following principal dependencies: 
    - prisma/client v6.5.0
    - vercel/blob: v0.27.0
    - next: v15.1.0
    - react: v18
    - react-dom: v18
    - bcryptjs v2.4.3
    - auth/prisma-adapter v2.7.3
    - next-auth v5.0.0-beta.4
    - tailwind-merge v2.5.4
    - zod v3.23.8
    - uuid v10.0.0
    - hookform/error-message v2.7.3
    - hookform/resolvers v3.9.1
    - nextui-org/react v2.4.8
- Added migrations
- Added Prisma client
- Added Nodemailer client
- Added database classes
- Added signIn, signOut, register form with steps and verification token by EMAIL
- Added middleware that allows us to limit the access to the urls to non logged in users
- Added middleware to server actions to avoid unauthorized access
- Added Admin Views
    - Categories CRUD
    - Courses CRUD
    - Users CRUD
- Added Client Views
    - Courses Dashboard
    - Courses viewer
    - Payment review
    - Users change password
- Added Home View
    - Landing page
- Added Server Actions
    - Auth login, logout, new-passwords, register, reset-password, verification-tokens
    - Category list, register
    - Courses activate, deactivate, list, register
    - User exist, list, register, user-verified
- Added the following API endpoints
    - GET courses/{canonicalId}/quizzes/{quizId}
    - GET courses/{canonicalId}/quizzes/{quizId}/last-result
    - POST courses/calculate-quiz-score
    - POST courses/class-state
    - POST courses/module-state
    - GET courses/reports/total-sales
    - GET courses/reports/total-sales-last-month
    - GET courses/reports/total-users-last-month
    - POST courses/quiz-answer
    - GET courses/top-three
    - POST payments/notifications
    - POST payments/transactions
    - POST payments/quote/transactions
