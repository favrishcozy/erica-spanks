import React, { useState } from 'react'
import styled from 'styled-components'
import { CheckCircle, Package, RefreshCw, DollarSign } from 'lucide-react'

const ReturnsContainer = styled.div`
  background: ${({ theme }) => theme.colors.offWhite};
  min-height: calc(100vh - 200px);
  padding: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
`

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-family: 'Playfair Display', serif;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 1.8rem;
  }
`

const PageSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.darkGray};
  font-size: ${({ theme }) => theme.fontSizes.md};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
`

const PolicyCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};

  svg {
    color: ${({ theme }) => theme.colors.primary};
    width: 40px;
    height: 40px;
  }

  h3 {
    color: ${({ theme }) => theme.colors.black};
    font-size: 1.1rem;
    margin: 0;
  }

  p {
    color: ${({ theme }) => theme.colors.darkGray};
    margin: 0;
    line-height: ${({ theme }) => theme.lineHeights.normal};
  }
`

const Section = styled.section`
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-family: 'Playfair Display', serif;
`

const ProcessSteps = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`

const Step = styled.div`
  text-align: center;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 40px;
    right: -${({ theme }) => theme.spacing.lg};
    width: ${({ theme }) => theme.spacing.lg};
    height: 2px;
    background: ${({ theme }) => theme.colors.lightGray};
    
    @media (max-width: 600px) {
      display: none;
    }
  }
`

const StepNumber = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 auto ${({ theme }) => theme.spacing.md};
`

const StepTitle = styled.h3`
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: 1rem;
`

const StepDescription = styled.p`
  color: ${({ theme }) => theme.colors.darkGray};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: 0;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: ${({ theme }) => theme.spacing.lg} 0;

  th, td {
    padding: ${({ theme }) => theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
  }

  th {
    background: ${({ theme }) => theme.colors.offWhite};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.black};
  }

  tr:hover {
    background: ${({ theme }) => theme.colors.offWhite};
  }
`

const ContactBox = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.primaryDark} 100%);
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  text-align: center;

  h3 {
    margin-top: 0;
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  a {
    color: ${({ theme }) => theme.colors.white};
    text-decoration: underline;
  }
`

const Returns: React.FC = () => {
  return (
    <ReturnsContainer>
      <ContentWrapper>
        <PageHeader>
          <PageTitle>Returns & Exchanges</PageTitle>
          <PageSubtitle>
            Coming Soon
          </PageSubtitle>
        </PageHeader>

        <Section>
          <SectionTitle>Coming Soon</SectionTitle>
          <p>
            We're currently refining our returns and exchanges process. For now, if you have any concerns about your order, please <a href="/contact">contact us</a> and our team will assist you.
          </p>
        </Section>

        <ContactBox>
          <h3>Have Questions?</h3>
          <p>Our customer service team is here to help</p>
          <p><a href="/contact">Get in touch</a></p>
        </ContactBox>
      </ContentWrapper>
    </ReturnsContainer>
  )
}

export default Returns
