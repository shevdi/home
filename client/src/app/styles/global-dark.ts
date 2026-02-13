import { createGlobalStyle } from 'styled-components'

export const DarkGlobalStyle = createGlobalStyle`
  :root {
    --modal-back-color: rgba(15, 22, 28, 0.97);
    --nav-back-color: #0f1619;
    --nav-back-color-end: #151d22;
    --nav-font-color: #e8e4df;
    --link-color: #e8e4df;
    --input-bg: rgba(26, 35, 42, 0.9);
    --input-border: rgba(74, 95, 110, 0.5);
    --input-focus: #e07d4a;
    --input-disabled-color: #606473;
    --text-color: #e8e4df;
    --text-muted: #9ca3af;
    --surface: #0a0f12;
    --surface-elevated: rgba(26, 35, 42, 0.95);
    --dropdown-over-nav: rgba(26, 35, 42, 0.98);
    --accent: #e07d4a;
    --accent-hover: #f08f5c;
    --glass-bg: rgba(26, 35, 42, 0.7);
    --glass-border: rgba(255, 255, 255, 0.06);
    --glass-shadow: 0 4px 24px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.03) inset;
  }

  body {
    color: var(--text-color);
    margin: 0;
    background: 
      radial-gradient(ellipse 100% 70% at 10% 0%, rgba(224, 125, 74, 0.05) 0%, transparent 45%),
      radial-gradient(ellipse 80% 50% at 90% 100%, rgba(74, 130, 140, 0.06) 0%, transparent 45%),
      linear-gradient(180deg, #0a0f12 0%, #0f1619 50%, #0d1318 100%);
    background-attachment: fixed;
    min-height: 100vh;

    &::after {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url('/background-dark.jpg');
      background-size: cover;
      background-position: center;
      opacity: 0.08;
      pointer-events: none;
      z-index: 0;
    }

    h1, h2, h3, h4, h5, h6, div {
      color: var(--text-color);
    }

    a {
      color: var(--link-color);
    }
  }
`
