/**
 * Resolves backend API URL at runtime.
 * - When accessed from localhost (host-run e2e/debug): use localhost:3001
 * - When loaded from Docker Compose e2e (home-frontend service): use home-backend (matches CORS whitelist)
 * - Otherwise: use build-time BACKEND_URL (home-backend in Docker, production URL in prod)
 */
export function getBackendUrl(): string {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001/api/v1';
  }
  if (typeof window !== 'undefined' && window.location.hostname === 'home-frontend') {
    return 'http://home-backend:3001/api/v1';
  }
  return (typeof process !== 'undefined' && process.env.BACKEND_URL) || 'http://localhost:3001/api/v1';
}
