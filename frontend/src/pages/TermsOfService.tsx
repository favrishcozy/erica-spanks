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

  ul, ol {
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

const TermsOfService: React.FC = () => {
  return (
    <PolicyContainer>
      <PolicyHeader>
        <PageTitle>Terms of Service</PageTitle>
        <LastUpdated>Last Updated: February 2026</LastUpdated>
      </PolicyHeader>

      <PolicySection>
        <SectionTitle>1. Agreement to Terms</SectionTitle>
        <SectionContent>
          <p>
            By accessing and using the Erica Spanks website and services, you accept and agree to be bound by and comply 
            with these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our 
            services.
          </p>
        </SectionContent>
      </PolicySection>

      <PolicySection>
        <SectionTitle>2. Use License</SectionTitle>
        <SectionContent>
          <p>Permission is granted to temporarily download one copy of the materials (information or software) on Erica 
            Spanks website for personal, non-commercial transitory viewing only. This is the grant of a license, not a 
            transfer of title, and under this license you may not:
          </p>
          <ul>
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose or for any public display</li>
            <li>Attempting to decompile or reverse engineer any software on the site</li>
            <li>Removing any copyright or other proprietary notations from the materials</li>
            <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
          </ul>
        </SectionContent>
      </PolicySection>

      <PolicySection>
        <SectionTitle>3. Disclaimer</SectionTitle>
        <SectionContent>
          <p>
            The materials on Erica Spanks website are provided on an "as-is" basis. Erica Spanks makes no warranties, 
            expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, 
            implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
            of intellectual property or other violation of rights.
          </p>
        </SectionContent>
      </PolicySection>

      <PolicySection>
        <SectionTitle>4. Limitations</SectionTitle>
        <SectionContent>
          <p>
            In no event shall Erica Spanks or its suppliers be liable for any damages (including, without limitation, 
            damages for loss of data or profit, or due to business interruption) arising out of the use or inability to 
            use the materials on the Erica Spanks website, even if Erica Spanks or an authorized representative has been 
            notified orally or in writing of the possibility of such damage.
          </p>
        </SectionContent>
      </PolicySection>

      <PolicySection>
        <SectionTitle>5. Accuracy of Materials</SectionTitle>
        <SectionContent>
          <p>
            The materials appearing on the Erica Spanks website could include technical, typographical, or photographic 
            errors. Erica Spanks does not warrant that any of the materials on its website are accurate, complete, or 
            current. Erica Spanks may make changes to the materials contained on its website at any time without notice.
          </p>
        </SectionContent>
      </PolicySection>

      <PolicySection>
        <SectionTitle>6. Product Information</SectionTitle>
        <SectionContent>
          <p>
            We strive to provide accurate descriptions and images of our products. However, we do not warrant that product 
            descriptions, pricing, or other content on the site is accurate, complete, reliable, current, or error-free. 
            If a product offered by Erica Spanks is not as described, your sole remedy is to return it in unused condition.
          </p>
        </SectionContent>
      </PolicySection>

      <PolicySection>
        <SectionTitle>7. User Accounts</SectionTitle>
        <SectionContent>
          <p>
            When you create an account with us, you must provide information that is accurate, complete, and current. 
            You are responsible for maintaining the confidentiality of your account information and password and for 
            restricting access to your computer. You agree to accept responsibility for all activities that occur under 
            your account.
          </p>
        </SectionContent>
      </PolicySection>

      <PolicySection>
        <SectionTitle>8. Prohibited Conduct</SectionTitle>
        <SectionContent>
          <p>You agree not to engage in any of the following prohibited behaviors:</p>
          <ul>
            <li>Harassing or causing distress or inconvenience to any person</li>
            <li>Obscene or abusive language or offensive statements</li>
            <li>Disrupting the normal flow of dialogue within our platforms</li>
            <li>Attempting to gain unauthorized access to our systems</li>
            <li>Uploading viruses or malicious code</li>
            <li>Collecting or tracking personal information of others</li>
          </ul>
        </SectionContent>
      </PolicySection>

      <PolicySection>
        <SectionTitle>9. Limitation of Liability</SectionTitle>
        <SectionContent>
          <p>
            In no case shall Erica Spanks, its directors, officers, or agents be liable for any indirect, incidental, 
            special, consequential, or punitive damages arising out of or in connection with your use of the website or 
            these terms and conditions.
          </p>
        </SectionContent>
      </PolicySection>

      <PolicySection>
        <SectionTitle>10. Modifications to Terms</SectionTitle>
        <SectionContent>
          <p>
            Erica Spanks may revise these terms of service for its website at any time without notice. By using this website, 
            you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </SectionContent>
      </PolicySection>

      <ContactSection>
        <SectionTitle>Contact Us</SectionTitle>
        <SectionContent>
          <p>If you have questions about these Terms of Service, please contact us at:</p>
          <ul>
            <li><strong>Email:</strong> legal@ericaspanks.com</li>
            <li><strong>Phone:</strong> +234 811 332 2121</li>
            <li><strong>Address:</strong> Lagos, Nigeria</li>
          </ul>
        </SectionContent>
      </ContactSection>
    </PolicyContainer>
  )
}

export default TermsOfService
