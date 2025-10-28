import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react'

const FooterContainer = styled.footer`
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing['3xl']} 0 ${({ theme }) => theme.spacing.xl};
  margin-top: auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none; // Hidden on mobile, replaced by MobileNav
  }
`

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing.lg};
  }
`

const FooterSection = styled.div`
  h4 {
    color: ${({ theme }) => theme.colors.primary};
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  
  li {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
`

const FooterLink = styled(Link)`
  color: ${({ theme }) => theme.colors.offWhite};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.offWhite};
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
  }
`

const SocialLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-2px);
  }
`

const NewsletterForm = styled.form`
  margin-top: ${({ theme }) => theme.spacing.lg};
`

const NewsletterInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.darkGray};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.darkGray};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.mediumGray};
  }
`

const NewsletterButton = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`

const Copyright = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.darkGray};
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.mediumGray};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`

const Footer: React.FC = () => {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter signup
  }

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <h4>Shop</h4>
          <FooterLinks>
            <li><FooterLink to="/products/new-in">New In</FooterLink></li>
            <li><FooterLink to="/products/dresses">Dresses</FooterLink></li>
            <li><FooterLink to="/products/tops">Tops</FooterLink></li>
            <li><FooterLink to="/products/bottoms">Bottoms</FooterLink></li>
            <li><FooterLink to="/products/sets">Sets</FooterLink></li>
            <li><FooterLink to="/products/sale">Sale</FooterLink></li>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <h4>Customer Care</h4>
          <FooterLinks>
            <li><FooterLink to="/contact">Contact Us</FooterLink></li>
            <li><FooterLink to="/shipping">Shipping Info</FooterLink></li>
            <li><FooterLink to="/returns">Returns & Exchanges</FooterLink></li>
            <li><FooterLink to="/size-guide">Size Guide</FooterLink></li>
            <li><FooterLink to="/faq">FAQ</FooterLink></li>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <h4>Company</h4>
          <FooterLinks>
            <li><FooterLink to="/about">About Us</FooterLink></li>
            <li><FooterLink to="/careers">Careers</FooterLink></li>
            <li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
            <li><FooterLink to="/terms">Terms of Service</FooterLink></li>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <h4>Connect</h4>
          <ContactInfo>
            <Mail size={16} />
            <span>hello@ericaspanks.com</span>
          </ContactInfo>
          <ContactInfo>
            <Phone size={16} />
            <span>1-800-SPANKS-1</span>
          </ContactInfo>
          <ContactInfo>
            <MapPin size={16} />
            <span>Los Angeles, CA</span>
          </ContactInfo>
          
          <SocialLinks>
            <SocialLink href="https://instagram.com/ericaspanks" target="_blank" rel="noopener noreferrer">
              <Instagram size={20} />
            </SocialLink>
            <SocialLink href="https://facebook.com/ericaspanks" target="_blank" rel="noopener noreferrer">
              <Facebook size={20} />
            </SocialLink>
            <SocialLink href="https://twitter.com/ericaspanks" target="_blank" rel="noopener noreferrer">
              <Twitter size={20} />
            </SocialLink>
          </SocialLinks>
          
          <NewsletterForm onSubmit={handleNewsletterSubmit}>
            <NewsletterInput 
              type="email" 
              placeholder="Enter your email"
              required
            />
            <NewsletterButton type="submit">
              Subscribe
            </NewsletterButton>
          </NewsletterForm>
        </FooterSection>
      </FooterContent>
      
      <Copyright>
        <p>&copy; 2024 Erica Spanks. All rights reserved.</p>
      </Copyright>
    </FooterContainer>
  )
}

export default Footer
