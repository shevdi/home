import { createGlobalStyle, ThemeProvider } from "styled-components";
import { Provider } from "react-redux";
import { store } from "../store/store";

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #fbfbff;
    margin: 0;
  }
`;

export const theme = {
  main: "mediumseagreen",
};

function App({ children }: React.PropsWithChildren) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </Provider>
  );
}

export default App;
