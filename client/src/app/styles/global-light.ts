import { createGlobalStyle } from 'styled-components'

export const LightGlobalStyle = createGlobalStyle`
  :root {
    --nav-back-color: #333;
    --nav-font-color: #fff;
    --input-color: #f1f4fb;
    --input-disabled-color: #cacede;
  }
  body {
    background-color: #fbfbff;
    margin: 0;
    h1, h2, h3, h4, h5, h6, div {
      color: #000;
    }
    a {
      color: #333;
    }
  }
`
