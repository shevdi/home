import styled from 'styled-components'

export const Button = styled.button<{ margin?: string; display?: string; width?: string }>`
  background-color: #dc3545;
  color: white;
  display: ${({ display = 'initial' }) => display};
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  width: ${({ width = 'initial' }) => width};
  margin: ${({ margin = '0' }) => margin};
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #c82333;
  }
`
