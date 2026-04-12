import type { ILink } from '@shevdi-home/shared'
import type { PerFileOptions } from './perFileOptions'
import { defaultPerFileOptions } from './perFileOptions'

export function photoToPerFileOptions(photo: ILink): PerFileOptions {
  return {
    ...defaultPerFileOptions,
    title: photo.title ?? '',
    priority: photo.priority ?? 0,
    private: photo.private ?? false,
    country: photo.location?.value?.country ?? [],
    city: photo.location?.value?.city ?? [],
    tags: photo.tags ?? [],
    accessedBy: photo.accessedBy?.map((g) => g.userId) ?? [],
  }
}
