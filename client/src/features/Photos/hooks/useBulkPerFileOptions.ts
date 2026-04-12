import { useCallback, useMemo, useState } from 'react'
import type { PerFileOptions } from '../utils/perFileOptions'
import { computeMergedView, getTargetIds } from '../utils/perFileOptions'

export function useBulkPerFileOptions() {
  const [fileOptions, setFileOptions] = useState<Map<string, PerFileOptions>>(() => new Map())
  const [selection, setSelection] = useState<Set<string>>(() => new Set())

  const toggleSelection = useCallback((id: string) => {
    setSelection((prev) => {
      const updated = new Set(prev)
      if (updated.has(id)) updated.delete(id)
      else updated.add(id)
      return updated
    })
  }, [])

  const toggleSelectAll = useCallback((allIds: string[]) => {
    setSelection((prev) =>
      prev.size === allIds.length && allIds.length > 0 ? new Set() : new Set(allIds),
    )
  }, [])

  const mergedView = useMemo(
    () => computeMergedView(fileOptions, selection),
    [fileOptions, selection],
  )

  const handleBulkUpdate = useCallback(
    (field: keyof PerFileOptions, value: unknown) => {
      const targets = getTargetIds(fileOptions, selection)
      setFileOptions((prev) => {
        const updated = new Map(prev)
        for (const id of targets) {
          const current = updated.get(id)
          if (!current) continue
          updated.set(id, { ...current, [field]: value })
        }
        return updated
      })
    },
    [fileOptions, selection],
  )

  const handleTagAdd = useCallback(
    (field: 'country' | 'city' | 'tags' | 'accessedBy', tag: string) => {
      const targets = getTargetIds(fileOptions, selection)
      setFileOptions((prev) => {
        const updated = new Map(prev)
        for (const id of targets) {
          const current = updated.get(id)
          if (!current) continue
          const arr = current[field]
          if (!arr.includes(tag)) {
            updated.set(id, { ...current, [field]: [...arr, tag] })
          }
        }
        return updated
      })
    },
    [fileOptions, selection],
  )

  const handleTagRemove = useCallback(
    (field: 'country' | 'city' | 'tags' | 'accessedBy', tag: string) => {
      const targets = getTargetIds(fileOptions, selection)
      setFileOptions((prev) => {
        const updated = new Map(prev)
        for (const id of targets) {
          const current = updated.get(id)
          if (!current) continue
          updated.set(id, {
            ...current,
            [field]: current[field].filter((t) => t !== tag),
          })
        }
        return updated
      })
    },
    [fileOptions, selection],
  )

  const removeOptionIds = useCallback((ids: string[]) => {
    if (ids.length === 0) return
    setFileOptions((prev) => {
      const updated = new Map(prev)
      for (const id of ids) updated.delete(id)
      return updated
    })
    setSelection((prev) => {
      const updated = new Set(prev)
      for (const id of ids) updated.delete(id)
      return updated
    })
  }, [])

  return {
    fileOptions,
    setFileOptions,
    selection,
    setSelection,
    toggleSelection,
    toggleSelectAll,
    mergedView,
    handleBulkUpdate,
    handleTagAdd,
    handleTagRemove,
    removeOptionIds,
  }
}
