import React, { ReactNode } from 'react'
import styled from 'styled-components'
import Header from './Header'
import Footer from './Footer'
import MobileNav from './MobileNav'
import ScrollToTop from './ScrollToTop'


const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const Main = styled.main`
  flex: 1;
  padding-top: 70px; /* Account for fixed header */
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding-top: 60px; /* Smaller header on mobile */
    padding-bottom: 70px; /* Account for mobile nav */
    /* iPhone safe area support */
    padding-bottom: calc(70px + env(safe-area-inset-bottom));
  }
`

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LayoutContainer>
      <ScrollToTop />
      <Header />
      <Main>
        <div className="fade-in">
          {children}
        </div>
      </Main>
      <Footer />
      <MobileNav />
    </LayoutContainer>
  )
}

export default Layout
