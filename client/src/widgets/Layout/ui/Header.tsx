import { NavLink } from 'react-router'
import styled from 'styled-components'
import { Menu } from '@/widgets/Menu'
import { useSelector } from 'react-redux'
import { selectCurrentToken } from '@/features/Auth'
import { selectSearch } from '@/features'
import { buildSearchParams } from '@/shared/utils'

export function Header() {
  const search = useSelector(selectSearch)
  const token = useSelector(selectCurrentToken)
  const stringSearchParams = buildSearchParams(search)

  return (
    <Head>
      <Nav>
        <Logo to='/'>shevdi</Logo>
        <NavList>
          <NavItem>
            <NavLink to='/'>Главная</NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              to={{
                pathname: '/photos',
                search: stringSearchParams,
              }}
            >
              Фото
            </NavLink>
          </NavItem>
          {!token && (
            <NavItem>
              <NavLink to='/login'>Вход</NavLink>
            </NavItem>
          )}
          <NavItem>
            <Menu />
          </NavItem>
        </NavList>
      </Nav>
    </Head>
  )
}

const Head = styled.header`
  background: linear-gradient(135deg, var(--nav-back-color) 0%, var(--nav-back-color-end) 100%);
  color: var(--nav-font-color);
  z-index: 100;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
`

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  margin: 0 auto;
`

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const NavItem = styled.li`
  display: flex;
  align-items: center;

  a {
    font-size: 0.95rem;
    font-weight: 500;
    color: inherit;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-md);
    transition:
      background-color var(--transition-fast),
      color var(--transition-fast);

    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    &.active {
      background-color: rgba(255, 255, 255, 0.15);
    }
  }
`

const Logo = styled(NavLink)`
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0;
  color: inherit;
  text-decoration: none;
  letter-spacing: -0.03em;

  &:hover {
    opacity: 0.9;
  }
`
