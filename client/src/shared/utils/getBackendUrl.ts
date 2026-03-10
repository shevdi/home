/**
 * Resolves backend API URL at runtime.
 * - When accessed from localhost (host-run e2e/debug): use localhost:3001
 * - Otherwise: use build-time BACKEND_URL (home-backend in Docker, production URL in prod)
 */
export function getBackendUrl(): string {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001/api/v1';
  }
  return (typeof process !== 'undefined' && process.env.BACKEND_URL) || 'https://home-server-shevdi.amvera.io/api/v1';
}
