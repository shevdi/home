import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  :root {
  }
  *,
  ::before,
  ::after {
    box-sizing: border-box;
  }
  body {
    margin: 0;
  }
  a {
    transition: all 0.3s ease;
    &:hover {
      opacity: 0.7;
    }
  }
  h1, h2, h3, h4, h5, h6 {
    transition: background-color 0.3s ease;
  }
  header,
  body,
  footer {
    transition: background-color 0.3s ease;
  }
`
