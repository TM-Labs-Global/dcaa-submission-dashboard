import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const publicPaths = ['/login', '/invite'];
const apiPublicPaths = ['/api/auth', '/api/invites'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public API routes
  if (apiPublicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow public pages
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check session for protected routes
  const session = await auth();

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Excludes Next.js internals and any request for a static file
    // (images, fonts, icons, etc. served from /public) by extension —
    // files in /public are served from the URL root, not under /public/*,
    // so matching the literal string "public" never actually excluded them.
    '/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf)$).*)',
  ],
};
