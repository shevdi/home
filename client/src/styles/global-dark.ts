import { createGlobalStyle } from 'styled-components'

export const DarkGlobalStyle = createGlobalStyle`
  :root {
    --nav-back-color: #cfcfcf;
    --modal-back-color: #cfcfcf9d;
    --nav-font-color: #000;
    --link-color: #333;
  }
  body {
    background-color: #1c1c2cff;
    margin: 0;
    h1, h2, h3, h4, h5, h6 {
      color: #fff;
    }
    a {
      color: #ddd;
    }
  }
`
