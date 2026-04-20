import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  html, body {
    height: 100%;
    width: 100%;
    line-height: 1.5;
  }

  body {
    font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background: #0a0a0a;
    color: #e0e0e0;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
  }

  * {
    box-sizing: border-box;
  }

  input, select, button, textarea {
    font-family: inherit;
    font-size: inherit;
  }

  #root {
    min-height: 100%;
  }

  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
  }
  ::-webkit-scrollbar-track {
    background: #111;
  }
  ::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }

  ::selection {
    background: #333;
    color: #fff;
  }
`;
