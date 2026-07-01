import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis gracefully
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Create sliding window rate limiters (only if Redis is configured)
const autocompleteRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"),
}) : null;

const searchRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
}) : null;

const parseSocialRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
}) : null;

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const path = request.nextUrl.pathname;

  // If Redis is not configured, bypass rate limiting (useful for local dev without keys)
  if (!redis) {
    return NextResponse.next();
  }

  // 1. Limit Autocomplete API (30 requests / minute)
  if (path.startsWith('/api/autocomplete') && autocompleteRateLimit) {
    const { success } = await autocompleteRateLimit.limit(`autocomplete_${ip}`);
    if (!success) {
      return new NextResponse(JSON.stringify({ error: "Too many requests to Autocomplete" }), { status: 429 });
    }
  }

  // 2. Limit AI Search Places API (5 requests / minute)
  if (path.startsWith('/api/search-places') && searchRateLimit) {
    const { success } = await searchRateLimit.limit(`search_${ip}`);
    if (!success) {
      return new NextResponse(JSON.stringify({ error: "Too many requests to AI Search" }), { status: 429 });
    }
  }

  // 3. Limit Social Parser API (3 requests / minute)
  if (path.startsWith('/api/parse-social') && parseSocialRateLimit) {
    const { success } = await parseSocialRateLimit.limit(`parse_${ip}`);
    if (!success) {
      return new NextResponse(JSON.stringify({ error: "Too many requests to Social Parser" }), { status: 429 });
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/:path*',
};
