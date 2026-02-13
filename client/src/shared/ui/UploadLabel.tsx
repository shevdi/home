import styled from 'styled-components'

export const UploadLabel = styled.label<{ isDragActive?: boolean; disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);

  cursor: pointer;
  user-select: none;

  border: 2px dashed
    ${({ isDragActive, disabled }) => (isDragActive || disabled ? 'var(--accent)' : 'var(--input-border)')};

  background: ${({ isDragActive, disabled }) =>
    isDragActive || disabled ? 'var(--input-disabled-color)' : 'var(--input-bg)'};

  color: var(--text-color);
  font-weight: 500;

  transition: all var(--transition-fast);

  &:hover:not([disabled]) {
    border-color: var(--accent);
    background: rgba(199, 107, 57, 0.08);
  }

  &:active {
    transform: scale(0.98);
  }
`
