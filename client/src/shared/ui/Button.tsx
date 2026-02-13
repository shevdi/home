import styled from 'styled-components'

export const Button = styled.button<{ margin?: string; display?: string; width?: string; disabled?: boolean }>`
  background-color: ${({ disabled }) => (disabled ? 'var(--text-muted)' : 'var(--accent)')};
  color: white;
  display: ${({ display = 'initial' }) => display};
  border: none;
  border-radius: var(--radius-md);
  padding: 0.6rem 1.25rem;
  width: ${({ width = 'initial' }) => width};
  margin: ${({ margin = '0' }) => margin};
  font-size: 0.95rem;
  font-weight: 500;
  font-family: inherit;
  transition:
    background-color var(--transition-fast),
    transform var(--transition-fast);
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  box-shadow: var(--shadow-sm);

  &:hover {
    background-color: ${({ disabled }) => (disabled ? 'var(--text-muted)' : 'var(--accent-hover)')};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`
