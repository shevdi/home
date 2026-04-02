import styled from 'styled-components'
import { Header } from './Header'
import { Footer } from './Footer'
import { Outlet } from 'react-router'

export function Layout() {
  return (
    <LayoutContainer>
      <Header />
      <Main>
        <PageContainer>
          <Outlet />
        </PageContainer>
      </Main>
      <Footer />
    </LayoutContainer>
  )
}

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 1;
`

const Main = styled.main`
  position: relative;
  width: 100%;
  flex-grow: 1;
  display: flex;
  z-index: 20;
`

const PageContainer = styled.div`
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
  max-width: 1200px;
  width: 100%;
  flex-grow: 1;
`
