import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Define paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/register', '/auth/callback'];
  
  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Exclude static assets and Next.js internals
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg)$/)
  ) {
    return NextResponse.next();
  }

  // If user is not logged in and tries to access a protected route
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/auth/login', request.url);
    // loginUrl.searchParams.set('from', pathname); // Optional: remember where they were trying to go
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in and tries to access auth pages (login/register), redirect to home
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths
    '/:path*',
  ],
};
