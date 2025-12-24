import styled from 'styled-components'

export const UploadLabel = styled.label<{ isDragActive?: boolean; disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  padding: 18px 24px;
  border-radius: 12px;

  cursor: pointer;
  user-select: none;

  border: 2px dashed ${({ isDragActive, disabled }) => (isDragActive || disabled ? '#4f46e5' : '#c7c7c7')};

  background: ${({ isDragActive, disabled }) =>
    isDragActive || disabled ? 'var(--input-disabled-color)' : 'var(--input-color)'};

  color: #1f2937;
  font-weight: 600;

  transition: all 0.2s ease;

  &:hover {
    border-color: #4f46e5;
    background: var(--input-disabled-color);
  }

  &:active {
    transform: scale(0.98);
  }
`
