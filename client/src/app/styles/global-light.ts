import { createGlobalStyle } from 'styled-components'
import bgLight from '../../assets/background-light.jpg'

export const LightGlobalStyle = createGlobalStyle`
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
      background-image: url(${bgLight});
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
