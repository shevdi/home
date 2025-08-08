import { ThemeProvider } from "styled-components";
import { Provider } from "react-redux";
import { store } from "../store/store";

export const theme = {
  main: "mediumseagreen",
};

function App({ children }: React.PropsWithChildren) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </Provider>
  );
}

export default App;
