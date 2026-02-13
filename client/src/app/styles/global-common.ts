import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  :root {
    --error-color: #c70c50;
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --radius-xl: 20px;
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
    --transition-fast: 0.15s ease;
    --transition-normal: 0.25s ease;
  }

  *,
  ::before,
  ::after {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    font-family: 'Manrope', system-ui, -apple-system, sans-serif;
    line-height: 1.6;
    letter-spacing: -0.01em;
  }

  a {
    transition: color var(--transition-fast), opacity var(--transition-fast);
    &:hover {
      opacity: 0.85;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Outfit', 'Manrope', system-ui, sans-serif;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1.3;
  }

  header,
  body,
  footer {
    transition: background-color var(--transition-normal), color var(--transition-normal);
  }
`
