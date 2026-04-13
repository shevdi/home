import { useCallback, useRef } from 'react'
import { useLabeledFieldOutsideClick } from '../LabeledInput'

export function useTaggedInputFieldRef(
  onOutsideClick: (() => void) | undefined,
  closeMenu: () => void,
) {
  const onOutsideClickRef = useRef(onOutsideClick)
  onOutsideClickRef.current = onOutsideClick

  const mergedOutsideClick = useCallback(() => {
    closeMenu()
    onOutsideClickRef.current?.()
  }, [closeMenu])

  return useLabeledFieldOutsideClick(mergedOutsideClick)
}
