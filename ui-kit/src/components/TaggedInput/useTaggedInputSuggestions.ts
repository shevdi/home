import { useCallback, useEffect, useRef, useState } from 'react'
import type { TaggedSuggestion } from './taggedInputTypes'

export interface UseTaggedInputSuggestionsParams {
  inputValue: string
  fetchSuggestions?: (query: string) => Promise<TaggedSuggestion[]>
  suggestionDebounceMs: number
  disabled?: boolean
}

export function useTaggedInputSuggestions({
  inputValue,
  fetchSuggestions,
  suggestionDebounceMs,
  disabled,
}: UseTaggedInputSuggestionsParams) {
  const fetchIdRef = useRef(0)
  const [suggestions, setSuggestions] = useState<TaggedSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const [menuDismissed, setMenuDismissed] = useState(false)

  const autocompleteEnabled = Boolean(fetchSuggestions && !disabled)

  useEffect(() => {
    setMenuDismissed(false)
  }, [inputValue])

  useEffect(() => {
    if (!autocompleteEnabled || !fetchSuggestions) {
      setSuggestions([])
      setLoading(false)
      return
    }

    const timer = window.setTimeout(() => {
      const id = ++fetchIdRef.current
      setLoading(true)
      setSuggestions([])
      void (async () => {
        try {
          const items = await fetchSuggestions(inputValue)
          if (id !== fetchIdRef.current) {
            return
          }
          setSuggestions(items)
          setHighlightIndex(-1)
        } catch {
          if (id !== fetchIdRef.current) {
            return
          }
          setSuggestions([])
          setHighlightIndex(-1)
        } finally {
          if (id === fetchIdRef.current) {
            setLoading(false)
          }
        }
      })()
    }, suggestionDebounceMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [autocompleteEnabled, fetchSuggestions, inputValue, suggestionDebounceMs])

  const closeMenu = useCallback(() => {
    setMenuDismissed(true)
    setHighlightIndex(-1)
  }, [])

  const showPanel =
    autocompleteEnabled && !menuDismissed && (loading || suggestions.length > 0)

  return {
    suggestions,
    loading,
    highlightIndex,
    setHighlightIndex,
    menuDismissed,
    setMenuDismissed,
    closeMenu,
    showPanel,
    autocompleteEnabled,
  }
}
