/**
 * Sets required env vars for tests so env.ts validation passes.
 * Runs after dotenv/config; only sets vars if not already present.
 */
if (!process.env.ACCESS_TOKEN_SECRET) {
  process.env.ACCESS_TOKEN_SECRET = 'access-secret'
}
if (!process.env.REFRESH_TOKEN_SECRET) {
  process.env.REFRESH_TOKEN_SECRET = 'refresh-secret'
}
