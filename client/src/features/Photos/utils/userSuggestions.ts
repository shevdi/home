import type { TaggedSuggestion } from '@shevdi-home/ui-kit'
import type { RootState } from '@/app/store/store'
import { getBackendUrl } from '@/shared/utils/getBackendUrl'

export function createUserSuggestionsLoader(getState: () => RootState) {
  return async (query: string): Promise<TaggedSuggestion[]> => {
    const q = query.trim()
    if (q.length < 1) return []
    const token = (getState() as RootState).auth?.token
    if (!token) return []
    const url = `${getBackendUrl()}/users/suggestions?q=${encodeURIComponent(q)}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    })
    if (!res.ok) return []
    const data = (await res.json()) as { id: string; name: string }[]
    return data.map((u) => ({ value: u.id, label: u.name }))
  }
}
