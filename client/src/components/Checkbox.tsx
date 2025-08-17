import React from 'react'
import styled, { css } from 'styled-components'

interface CheckboxProps {
  /** Checked state of the checkbox */
  checked: boolean
  /** Callback when checkbox state changes */
  onChange: (checked: boolean) => void
  /** Disable the checkbox */
  disabled?: boolean
  /** Size of the checkbox */
  size?: 'sm' | 'md' | 'lg'
  /** Custom color when checked */
  color?: string
  /** Label text for the checkbox */
  label?: string
  /** Position of the label relative to the checkbox */
  labelPosition?: 'left' | 'right'
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  color = '#4caf50',
  label,
  labelPosition = 'right',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked)
  }

  return (
    <CheckboxContainer $disabled={disabled}>
      {label && labelPosition === 'left' && (
        <CheckboxLabel $position='left' $size={size}>
          {label}
        </CheckboxLabel>
      )}

      <HiddenCheckbox type='checkbox' checked={checked} onChange={handleChange} disabled={disabled} />

      <StyledCheckbox $checked={checked} $disabled={disabled} $color={color} $size={size} />

      {label && labelPosition === 'right' && (
        <CheckboxLabel $position='right' $size={size}>
          {label}
        </CheckboxLabel>
      )}
    </CheckboxContainer>
  )
}

const CheckWrapper = styled.div`
  width: 20px;
  height: 20px;
`
const CheckboxContainer = styled.label<{ $disabled: boolean }>`
  display: inline-flex;
  align-items: center;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.7 : 1)};
  user-select: none;
`

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
  padding: 0;
`

const StyledCheckbox = styled.span<{
  $checked: boolean
  $disabled: boolean
  $color: string
  $size: 'sm' | 'md' | 'lg'
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${({ $checked, $color }) => ($checked ? $color : '#ccc')};
  background: ${({ $checked, $color }) => ($checked ? $color : 'transparent')};
  transition: all 0.2s ease;
  border-radius: 50%;
  position: relative;

  ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return css`
          width: 16px;
          height: 16px;
        `
      case 'md':
        return css`
          width: 20px;
          height: 20px;
        `
      case 'lg':
        return css`
          width: 24px;
          height: 24px;
        `
    }
  }}

  &:hover {
    border-color: ${({ $disabled, $color }) => (!$disabled ? $color : 'inherit')};
  }
`

const Checkmark = styled.span<{
  $color?: string
}>`
  background-color: ${({ $color = '#000000' }) => `2px solid ${$color}`};
  /* width: 20px;
  height: 20px;
  border-color: ${({ $color = '#000000' }) => `2px solid ${$color}`};
  border-radius: 50%; */
`

// const Checkmark = styled.svg`
//   fill: none;
//   stroke: white;
//   stroke-width: 3px;
//   width: 100%;
//   height: 100%;
// `;

const CheckboxLabel = styled.span<{
  $position: 'left' | 'right'
  $size: 'sm' | 'md' | 'lg'
  $color?: string
}>`
  ${({ $position }) => ($position === 'left' ? 'margin-right: 8px;' : 'margin-left: 8px;')}

  color: ${({ $color = '#000000' }) => $color};
  font-size: ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return '0.875rem'
      case 'md':
        return '1rem'
      case 'lg':
        return '1.125rem'
    }
  }};
`
