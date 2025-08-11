import { Outlet } from "react-router";
import styled from "styled-components";
import { Header } from "./Header";
import { Footer } from "./Footer";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Main = styled.main`
  max-width: 1024px;
  flex-grow: 1;
  margin: 0 auto;
`;

export function Layout() {
  return (
    <Container>
      <Header />
      <Main>
        <Outlet />
      </Main>
      <Footer />
    </Container>
  );
}
