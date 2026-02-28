import React from 'react'
import styled from 'styled-components'
import { Briefcase, Users, TrendingUp, Heart } from 'lucide-react'

const CareersContainer = styled.div`
  background: ${({ theme }) => theme.colors.offWhite};
  min-height: calc(100vh - 200px);
`

const CareersHeader = styled.section`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.primaryDark} 100%);
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing['3xl']} ${({ theme }) => theme.spacing.xl};
  text-align: center;
`

const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-family: 'Playfair Display', serif;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 1.8rem;
  }
`

const PageSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  opacity: 0.95;
  margin-bottom: 0;
`

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing['3xl']} ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.xl};
  }
`

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
`

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-family: 'Playfair Display', serif;
`

const SectionContent = styled.div`
  color: ${({ theme }) => theme.colors.darkGray};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  
  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
`

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin: ${({ theme }) => theme.spacing.xl} 0;
`

const ValueCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  text-align: center;
  transition: ${({ theme }) => theme.transitions.normal};

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }

  svg {
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  h3 {
    color: ${({ theme }) => theme.colors.black};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-size: 1.1rem;
  }

  p {
    color: ${({ theme }) => theme.colors.darkGray};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    margin: 0;
  }
`

const OpenPositions = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  margin: ${({ theme }) => theme.spacing.lg} 0;
`

const Position = styled.div`
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};

  &:last-child {
    border-bottom: none;
  }

  h4 {
    color: ${({ theme }) => theme.colors.black};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    font-size: 1rem;
  }

  p {
    color: ${({ theme }) => theme.colors.darkGray};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    margin: 0;
  }
`

const ApplyButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  transition: ${({ theme }) => theme.transitions.fast};
  font-size: ${({ theme }) => theme.fontSizes.sm};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-2px);
  }
`

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin: ${({ theme }) => theme.spacing.lg} 0;

  li {
    background: ${({ theme }) => theme.colors.white};
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    list-style: none;
    box-shadow: ${({ theme }) => theme.shadows.sm};

    &:before {
      content: '✓ ';
      color: ${({ theme }) => theme.colors.primary};
      font-weight: bold;
      margin-right: ${({ theme }) => theme.spacing.xs};
    }
  }
`

const Careers: React.FC = () => {
  return (
    <CareersContainer>
      <CareersHeader>
        <PageTitle>Join Our Team</PageTitle>
        <PageSubtitle>
          Help us revolutionize fashion and create amazing experiences for our customers
        </PageSubtitle>
      </CareersHeader>

      <ContentContainer>
        <Section>
          <SectionTitle>Why Work With Us?</SectionTitle>
          <SectionContent>
            <p>
              Erica Spanks is a fast-growing fashion e-commerce brand dedicated to delivering quality clothing and 
              exceptional customer service. We're looking for passionate, creative, and talented individuals to join 
              our dynamic team.
            </p>
          </SectionContent>

          <ValuesGrid>
            <ValueCard>
              <Heart size={32} />
              <h3>Passion for Fashion</h3>
              <p>We love what we do and it shows in every piece</p>
            </ValueCard>
            <ValueCard>
              <Users size={32} />
              <h3>Team Spirit</h3>
              <p>Collaborative environment that celebrates diversity</p>
            </ValueCard>
            <ValueCard>
              <TrendingUp size={32} />
              <h3>Growth Opportunity</h3>
              <p>Develop your skills and advance your career</p>
            </ValueCard>
            <ValueCard>
              <Briefcase size={32} />
              <h3>Professionalism</h3>
              <p>High standards and commitment to excellence</p>
            </ValueCard>
          </ValuesGrid>
        </Section>

        <Section>
          <SectionTitle>Benefits</SectionTitle>
          <BenefitsGrid as="ul">
            <li>Competitive salary and performance bonuses</li>
            <li>Flexible work arrangements</li>
            <li>Professional development and training</li>
            <li>Health and wellness programs</li>
            <li>Employee discount on all products</li>
            <li>Collaborative and supportive work culture</li>
          </BenefitsGrid>
        </Section>

        <Section>
          <SectionTitle>Open Positions</SectionTitle>
          <SectionContent>
            <p>
              We're currently hiring for the following roles. If you don't see a position that matches your skills, 
              please feel free to submit your resume for future opportunities.
            </p>
          </SectionContent>

          <OpenPositions>
            <Position>
              <h4>Social Media Manager</h4>
              <p>Create engaging content and manage our social media presence across multiple platforms</p>
              <ApplyButton onClick={() => window.location.href = 'mailto:careers@ericaspanks.com?subject=Application: Social Media Manager'}>
                Apply Now
              </ApplyButton>
            </Position>

            <Position>
              <h4>Fashion Designer</h4>
              <p>Design unique collections and contribute to our product line</p>
              <ApplyButton onClick={() => window.location.href = 'mailto:careers@ericaspanks.com?subject=Application: Fashion Designer'}>
                Apply Now
              </ApplyButton>
            </Position>

            <Position>
              <h4>Customer Service Representative</h4>
              <p>Provide excellent support to our customers and handle inquiries</p>
              <ApplyButton onClick={() => window.location.href = 'mailto:careers@ericaspanks.com?subject=Application: Customer Service Representative'}>
                Apply Now
              </ApplyButton>
            </Position>

            <Position>
              <h4>Marketing Specialist</h4>
              <p>Develop and execute marketing campaigns to promote our brand</p>
              <ApplyButton onClick={() => window.location.href = 'mailto:careers@ericaspanks.com?subject=Application: Marketing Specialist'}>
                Apply Now
              </ApplyButton>
            </Position>

            <Position>
              <h4>Full Stack Developer</h4>
              <p>Build and maintain our e-commerce platform and web applications</p>
              <ApplyButton onClick={() => window.location.href = 'mailto:careers@ericaspanks.com?subject=Application: Full Stack Developer'}>
                Apply Now
              </ApplyButton>
            </Position>

            <Position>
              <h4>General Inquiries</h4>
              <p>Have a skill set we're looking for? Send us your resume and let's talk!</p>
              <ApplyButton onClick={() => window.location.href = 'mailto:careers@ericaspanks.com?subject=General Career Inquiry'}>
                Submit Your Resume
              </ApplyButton>
            </Position>
          </OpenPositions>
        </Section>

        <Section>
          <SectionTitle>Application Process</SectionTitle>
          <SectionContent>
            <p>Our hiring process is straightforward:</p>
            <ol style={{ marginLeft: '20px' }}>
              <li>Submit your resume and cover letter</li>
              <li>Our team reviews your application</li>
              <li>Phone screening with the hiring manager</li>
              <li>In-depth interview</li>
              <li>Final decision and offer</li>
            </ol>
            <p style={{ marginTop: '20px' }}>
              We review all applications and aim to get back to you within 2 weeks.
            </p>
          </SectionContent>
        </Section>
      </ContentContainer>
    </CareersContainer>
  )
}

export default Careers
