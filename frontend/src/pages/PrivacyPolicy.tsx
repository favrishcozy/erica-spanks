import React from 'react'
import styled from 'styled-components'

const PolicyContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`

const PolicyHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
  padding-bottom: ${({ theme }) => theme.spacing.xl};
  border-bottom: 2px solid ${({ theme }) => theme.colors.lightGray};
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

const LastUpdated = styled.p`
  color: ${({ theme }) => theme.colors.darkGray};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`

const PolicySection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`

const SectionContent = styled.div`
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  color: ${({ theme }) => theme.colors.darkGray};

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  ul {
    margin-left: ${({ theme }) => theme.spacing.lg};
    margin-bottom: ${({ theme }) => theme.spacing.md};

    li {
      margin-bottom: ${({ theme }) => theme.spacing.sm};
    }
  }

  strong {
    color: ${({ theme }) => theme.colors.black};
  }
`

const ContactSection = styled.div`
  background: ${({ theme }) => theme.colors.offWhite};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
`

const PrivacyPolicy: React.FC = () => {
  return (
    <PolicyContainer>
      <PolicyHeader>
        <PageTitle>Privacy Policy</PageTitle>
        <LastUpdated>Last Updated: February 2026</LastUpdated>
      </PolicyHeader>

      <PolicySection>
        <SectionTitle>1. Introduction</SectionTitle>
        <SectionContent>
          <p>
            At Erica Spanks, we are committed to protecting your privacy. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you visit our website and use our services.
          </p>
          <p>
            Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do 
            not use our services.
          </p>
        </SectionContent>
      </PolicySection>

      <PolicySection>
        <SectionTitle>2. Information We Collect</SectionTitle>
        <SectionContent>
          <p>We may collect information about you in a variety of ways. The information we may collect on the site includes:</p>
          <ul>
            <li><strong>Personal Data:</strong> Name, email address, phone number, delivery address, and payment information</li>
            <li><strong>Account Information:</strong> Username, password, and profile preferences</li>
            <li><strong>Transaction Data:</strong> Order history, purchase details, and payment records</li>
            <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent on pages, links clicked, and search queries</li>
          </ul>
        </SectionContent>
      </PolicySection>

      <PolicySection>
        <SectionTitle>3. How We Use Your Information</SectionTitle>
        <SectionContent>
          <p>We use the information we collect for various purposes:</p>
          <ul>
            <li>To process your orders and send related information</li>
            <li>To provide customer service and respond to your inquiries</li>
            <li>To personalize your experience and improve our services</li>
            <li>To send promotional emails, newsletters, and updates</li>
            <li>To detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            <li>To comply with legal obligations</li>
          </ul>
        </SectionContent>
      </PolicySection>

      <PolicySection>
        <SectionTitle>4. Data Sharing</SectionTitle>
        <SectionContent>
          <p>
            We do not sell, trade, or rent your personal information to third parties. However, we may share your 
            information in the following circumstances:
          </p>
          <ul>
            <li><strong>Service Providers:</strong> Trusted third parties who assist us in operating our website and conducting business</li>
            <li><strong>Payment Processors:</strong> Secure payment gateways for processing transactions</li>
            <li><strong>Shipping Partners:</strong> Delivery and logistics companies to fulfill your orders</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our legal rights</li>
          </ul>
        </SectionContent>
      </PolicySection>

      <PolicySection>
        <SectionTitle>5. Data Security</SectionTitle>
        <SectionContent>
          <p>
            We implement comprehensive security measures to protect your personal information from unauthorized access, 
            alteration, disclosure, or destruction. Our security measures include:
          </p>
          <ul>
            <li>SSL/TLS encryption for all sensitive data transmission</li>
            <li>Secure payment gateway integration</li>
            <li>Regular security audits and updates</li>
            <li>Restricted access to personal information</li>
          </ul>
          <p>
            However, no method of transmission over the Internet is 100% secure. Therefore, we cannot guarantee absolute 
            security of your information.
          </p>
        </SectionContent>
      </PolicySection>

      <PolicySection>
        <SectionTitle>6. Your Rights</SectionTitle>
        <SectionContent>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your personal information</li>
            <li>Opt-out of marketing communications</li>
            <li>Request a copy of your data in a portable format</li>
          </ul>
        </SectionContent>
      </PolicySection>

      <PolicySection>
        <SectionTitle>7. Cookies</SectionTitle>
        <SectionContent>
          <p>
            Our website uses cookies to enhance your browsing experience. Cookies are small data files stored on your 
            device that help us remember your preferences and improve site functionality. You can control cookie settings 
            through your browser preferences.
          </p>
        </SectionContent>
      </PolicySection>

      <PolicySection>
        <SectionTitle>8. Changes to This Policy</SectionTitle>
        <SectionContent>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
            Privacy Policy on this page and updating the "Last Updated" date at the top of this policy.
          </p>
        </SectionContent>
      </PolicySection>

      <ContactSection>
        <SectionTitle>Contact Us</SectionTitle>
        <SectionContent>
          <p>If you have questions about this Privacy Policy, please contact us at:</p>
          <ul>
            <li><strong>Email:</strong> privacy@ericaspanks.com</li>
            <li><strong>Phone:</strong> +234 811 332 2121</li>
            <li><strong>Address:</strong> Lagos, Nigeria</li>
          </ul>
        </SectionContent>
      </ContactSection>
    </PolicyContainer>
  )
}

export default PrivacyPolicy
