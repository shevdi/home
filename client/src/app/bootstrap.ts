import { store } from '@/app/store/store'
import { authApiSlice } from '@/features/Auth/model/authApiSlice'

/**
 * Hydrates auth token from refresh-token cookie before first React render.
 * Ensures protected routes receive correct auth state on direct load/refresh.
 */
export async function hydrateAuth(): Promise<void> {
  try {
    await store.dispatch(authApiSlice.endpoints.refresh.initiate()).unwrap()
  } catch {
    // No refresh token, network error, or expired — proceed with null token
  }
}
