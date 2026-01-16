import { createGlobalStyle } from 'styled-components'

export const DarkGlobalStyle = createGlobalStyle`
  :root {
    --modal-back-color: #cfcfcf9d;
    --nav-back-color: #cfcfcf;
    --nav-font-color: #000;
    --link-color: #333;
    --input-color: #cacede;
    --input-disabled-color: #606473;
    --text-color: #eee;
  }
  body {
    background-color: #1c1c2cff;
    margin: 0;
    h1, h2, h3, h4, h5, h6, div {
      color: #fff;
    }
    a {
      color: #ddd;
    }
  }
`
