import { useEffect, useRef } from 'react'

export function useLabeledFieldOutsideClick(onOutsideClick?: () => void) {
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!onOutsideClick) return
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        onOutsideClick()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onOutsideClick])

  return wrapperRef
}
