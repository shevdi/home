import { createGlobalStyle } from 'styled-components'

export const LightGlobalStyle = createGlobalStyle`
  :root {
    --modal-back-color: #cfcfcf9d;
    --nav-back-color: #333;
    --nav-font-color: #fff;
    --link-color: #333;
    --input-color: #f1f4fb;
    --input-disabled-color: #cacede;
    --text-color: #000000;
  }
  body {
    background-color: #cfcfcf;
    margin: 0;
    h1, h2, h3, h4, h5, h6, div {
      color: #000;
    }
    a {
      color: #333;
    }
  }
`
