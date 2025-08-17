import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware() {
    // Add any custom middleware logic here
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect API routes that require authentication
        if (req.nextUrl.pathname.startsWith('/api/protected')) {
          return !!token;
        }
        
        // Protect dashboard and user pages
        if (
          req.nextUrl.pathname.startsWith('/dashboard') ||
          req.nextUrl.pathname.startsWith('/my') ||
          req.nextUrl.pathname.startsWith('/create') ||
          req.nextUrl.pathname.startsWith('/interview') ||
          req.nextUrl.pathname.startsWith('/result')
        ) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/my/:path*',
    '/create/:path*',
    '/interview/:path*',
    '/result/:path*',
    '/api/protected/:path*',
  ],
};