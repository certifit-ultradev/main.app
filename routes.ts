export const publicRoutes = [
  '/',
  '/register',
  '/verify-email',
  '/new-password',
  '/reset-password'
];

export const authRoutes = ['/login', '/signup'];

// we'll make sure auth api route is always public.
export const apiRoute = '/api/auth';

export const adminRoute = '/admin';

export const videoApiRoute = '/api/uploads'

export const videoRoute = '/uploads'

// redirect users to this path after login
export const DEFAULT_LOGIN_REDIRECT = '/dashboard';
