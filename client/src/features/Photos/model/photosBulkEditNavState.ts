import type { ILink } from '@shevdi-home/shared'

/**
 * React Router `location.state` for `/photos/edit`.
 * Set when navigating from the gallery (admin "Редактировать список") with the
 * flat list of `ILink` rows currently shown there (same filter as the grid).
 */
export type PhotosBulkEditLocationState = {
  photos: ILink[]
}

export function isPhotosBulkEditLocationState(value: unknown): value is PhotosBulkEditLocationState {
  if (value === null || typeof value !== 'object') return false
  const photos = (value as PhotosBulkEditLocationState).photos
  if (!Array.isArray(photos)) return false
  return photos.every((p) => p !== null && typeof p === 'object' && typeof (p as ILink)._id === 'string')
}
