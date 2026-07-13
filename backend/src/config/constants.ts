// Refresh token lifetime — used for DB expiresAt and cookie maxAge
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Maximum allowed booking duration
export const MAX_BOOKING_DAYS = 90;

// Background job intervals
export const AUTO_COMPLETE_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
export const TOKEN_CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Cache TTLs (seconds)
export const CACHE_TTL_CARS_SEC = 300;

// Chat limits
export const CHAT_MAX_MSG_LENGTH = 1000;
export const CHAT_RATE_LIMIT_COUNT = 30;
