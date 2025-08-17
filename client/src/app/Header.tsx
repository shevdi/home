import { NavLink } from 'react-router'
import styled from 'styled-components'
import { Menu } from '@/widgets/Menu'
import { ThemeProps } from '@/styles'

const Head = styled.header`
  background-color: var(--nav-back-color);
  color: var(--nav-font-color);
`

const Nav = styled.nav<ThemeProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
`

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
`

const NavItem = styled.li`
  display: flex;
  align-items: center;
  margin: 0 1rem;
  a {
    font-size: 1.2rem;
    color: inherit;
    text-decoration: none;
  }
`

const Logo = styled.h1`
  font-size: 1.5rem;
  margin: 0;
  color: inherit;
`

export function Header() {
  return (
    <Head>
      <Nav>
        <Logo>shevdi</Logo>
        <NavList>
          <NavItem>
            <NavLink to='/'>Main</NavLink> &nbsp;
          </NavItem>
          <NavItem>
            <NavLink to='/projects'>Projects</NavLink> &nbsp;
          </NavItem>
          <NavItem>
            <Menu />
          </NavItem>
        </NavList>
      </Nav>
    </Head>
  )
}
