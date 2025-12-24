import styled from 'styled-components'

export const Button = styled.button<{ margin?: string; display?: string; width?: string; disabled?: boolean }>`
  background-color: ${({ disabled }) => {
    console.log('disabled', disabled)
    return disabled ? 'grey' : '#dc3545'
  }};
  color: white;
  display: ${({ display = 'initial' }) => display};
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  width: ${({ width = 'initial' }) => width};
  margin: ${({ margin = '0' }) => margin};
  transition: background-color 0.2s ease-in-out;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};

  &:hover {
    background-color: ${({ disabled }) => (disabled ? 'grey' : '#c82333')};
  }
`
