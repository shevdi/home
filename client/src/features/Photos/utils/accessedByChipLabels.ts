import type { ReactElement, ReactNode } from 'react'
import { cloneElement, isValidElement } from 'react'
import type { IPhotoAccessGrant } from '@shevdi-home/shared'
import type { TaggedSuggestion } from '@shevdi-home/ui-kit'

export function accessGrantsToLabelMap(grants?: IPhotoAccessGrant[] | null): Record<string, string> {
  const out: Record<string, string> = {}
  if (!grants) return out
  for (const g of grants) {
    if (g.userName) out[g.userId] = g.userName
  }
  return out
}

export function mergeUserLabelMaps(
  ...maps: Record<string, string>[]
): Record<string, string> {
  return Object.assign({}, ...maps)
}

export function suggestionToStoredLabel(s: TaggedSuggestion): string {
  return typeof s.label === 'string' ? s.label : String(s.value)
}

/** Replaces chip text while preserving remove control from ui-kit `TagChips`. */
export function createAccessedByRenderTag(labels: Record<string, string>) {
  return (tag: string, chip: ReactElement<unknown>): ReactNode => {
    const text = labels[tag] ?? tag
    if (!isValidElement(chip)) return chip
    const ch = (chip.props as { children?: unknown }).children
    if (Array.isArray(ch) && ch.length >= 2) {
      return cloneElement(chip, {}, [text, ...ch.slice(1)])
    }
    return cloneElement(chip, {}, text)
  }
}
