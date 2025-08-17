import React from 'react'
import styled from 'styled-components'
import { Header } from './Header'
import { Footer } from './Footer'
import { Outlet } from 'react-router'

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

const Main = styled.main`
  max-width: 1024px;
  flex-grow: 1;
  margin: 0 auto;
  padding: 0 1rem;
`

export const Layout = () => {
  return (
    <LayoutContainer>
      <Header />
      <Main>
        <Outlet />
      </Main>
      <Footer />
    </LayoutContainer>
  )
}
