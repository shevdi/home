import { createGlobalStyle } from 'styled-components'

export const LightGlobalStyle = createGlobalStyle`
  :root {
    --modal-back-color: rgba(250, 248, 245, 0.96);
    --nav-back-color: #1a2a2e;
    --nav-back-color-end: #1e2d32;
    --nav-font-color: #f5f3ef;
    --link-color: #2d2a26;
    --input-bg: rgba(255, 255, 255, 0.9);
    --input-border: rgba(181, 169, 155, 0.4);
    --input-focus: #c76b39;
    --input-disabled-color: #cacede;
    --text-color: #2d2a26;
    --text-muted: #6b6560;
    --surface: #faf8f5;
    --surface-elevated: rgba(255, 255, 255, 0.92);
    --dropdown-over-nav: rgba(255, 255, 255, 0.98);
    --accent: #c76b39;
    --accent-hover: #b35a2d;
    --glass-bg: rgba(255, 255, 255, 0.75);
    --glass-border: rgba(255, 255, 255, 0.5);
    --glass-shadow: 0 4px 24px rgba(0, 0, 0, 0.06), 0 1px 0 rgba(255, 255, 255, 0.5) inset;
  }

  body {
    color: var(--text-color);
    margin: 0;
    background: 
      radial-gradient(ellipse 120% 80% at 20% 0%, rgba(199, 107, 57, 0.06) 0%, transparent 50%),
      radial-gradient(ellipse 100% 60% at 80% 100%, rgba(107, 142, 140, 0.08) 0%, transparent 50%),
      linear-gradient(180deg, #faf8f5 0%, #f5f0e8 50%, #f0ebe3 100%);
    background-attachment: fixed;
    min-height: 100vh;

    &::after {
      content: '';
      position: fixed;
      inset: 0;
      background-image: url('/background-light.jpg');
      background-size: cover;
      background-position: center;
      opacity: 0.12;
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
