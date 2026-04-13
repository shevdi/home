import type React from 'react'

/** One row in the autocomplete list: stable `value` becomes the tag; `label` is shown in the list. */
export interface TaggedSuggestion {
  value: string
  label: React.ReactNode
}
