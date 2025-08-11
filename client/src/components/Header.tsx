import { NavLink } from "react-router";
import styled from "styled-components";

const Head = styled.header``;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  color: #fff;
  padding: 1rem;
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
`;

const NavItem = styled.li`
  margin: 0 1rem;
  a {
    color: #fff;
    text-decoration: none;
    transition: all 0.3s ease;

    &:hover {
      color: #bada55; // Example hover effect
    }
  }
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  margin: 0;
`;

export function Header() {
  return (
    <Head>
      <Nav>
        <Logo>shevdi</Logo>
        <NavList>
          <NavItem>
            <NavLink to="/">Main</NavLink> |&nbsp;
          </NavItem>
          <NavItem>
            <NavLink to="/projects">Projects</NavLink> |&nbsp;
          </NavItem>
        </NavList>
      </Nav>
    </Head>
  );
}
