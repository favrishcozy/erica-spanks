import React from 'react'
import styled from 'styled-components'
import { Heart, Users, Award, Truck } from 'lucide-react'

const AboutContainer = styled.div`
  width: 100%;
  padding-top: 80px;
`

// Hero Section
const HeroSection = styled.section`
  background: ${({ theme }) => theme.colors.cream};
  padding: ${({ theme }) => theme.spacing['4xl']} ${({ theme }) => theme.spacing.lg};
  text-align: center;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.md};
  }
`

const HeroTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.secondary};
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
  }
`

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.light};
  max-width: 600px;
  margin: 0 auto;
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`

// Story Section
const StorySection = styled.section`
  padding: ${({ theme }) => theme.spacing['4xl']} ${({ theme }) => theme.spacing.lg};
  max-width: 1000px;
  margin: 0 auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.md};
  }
`

const StoryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing['3xl']};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing['4xl']};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
  }
`

const StoryContent = styled.div``

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.secondary};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const StoryText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.darkGray};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const ImagePlaceholder = styled.div`
  background: ${({ theme }) => theme.colors.accent};
  height: 400px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.darkGray};
  font-style: italic;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    height: 300px;
  }
`

// Mission Section
const MissionSection = styled.section`
  background: ${({ theme }) => theme.colors.cream};
  padding: ${({ theme }) => theme.spacing['4xl']} ${({ theme }) => theme.spacing.lg};
`

const MissionContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`

const MissionStatement = styled.div`
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing['3xl']};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  margin-top: ${({ theme }) => theme.spacing['2xl']};
`

const MissionText = styled.h3`
  font-family: ${({ theme }) => theme.fonts.secondary};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  color: ${({ theme }) => theme.colors.primary};
  font-style: italic;
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`

// Values Section
const ValuesSection = styled.section`
  padding: ${({ theme }) => theme.spacing['4xl']} ${({ theme }) => theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
`

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing['2xl']};
  margin-top: ${({ theme }) => theme.spacing['2xl']};
`

const ValueCard = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['2xl']};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`

const ValueIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${({ theme }) => theme.colors.primaryLight};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.primary};
`

const ValueTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const ValueDescription = styled.p`
  color: ${({ theme }) => theme.colors.darkGray};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`

const About: React.FC = () => {
  const values = [
    {
      icon: <Heart size={24} />,
      title: "Comfort First",
      description: "Every piece is designed with your comfort in mind, using the finest materials that feel as good as they look."
    },
    {
      icon: <Users size={24} />,
      title: "Inclusive Beauty",
      description: "We celebrate women of all shapes, sizes, and backgrounds. Our designs are made to make everyone feel confident."
    },
    {
      icon: <Award size={24} />,
      title: "Quality Craftsmanship",
      description: "From design to delivery, we maintain the highest standards to ensure every piece meets your expectations."
    },
    {
      icon: <Truck size={24} />,
      title: "Sustainable Practices",
      description: "We're committed to responsible fashion, using sustainable materials and ethical production methods."
    }
  ]

  return (
    <AboutContainer>
      <HeroSection>
        <HeroTitle>About Erica Spanks</HeroTitle>
        <HeroSubtitle>
          Empowering women through fashion that celebrates confidence, 
          embraces comfort, and inspires self-expression.
        </HeroSubtitle>
      </HeroSection>

      <StorySection>
        <StoryGrid>
          <StoryContent>
            <SectionTitle>Our Beginning</SectionTitle>
            <StoryText>
              Erica Spanks was founded with a simple yet powerful vision: to create 
              fashion that makes every woman feel unstoppable. Born from the belief 
              that comfort and style should never be compromised, we set out to 
              design pieces that celebrate the modern woman's lifestyle.
            </StoryText>
            <StoryText>
              What started as a dream to bridge the gap between comfort and 
              confidence has evolved into a brand that stands for empowerment, 
              inclusivity, and authentic self-expression.
            </StoryText>
          </StoryContent>
          <ImagePlaceholder>
            Behind-the-scenes photo placeholder
          </ImagePlaceholder>
        </StoryGrid>

        <StoryGrid>
          <ImagePlaceholder>
            Lifestyle photo placeholder
          </ImagePlaceholder>
          <StoryContent>
            <SectionTitle>Our Process</SectionTitle>
            <StoryText>
              Every Erica Spanks piece begins with careful consideration of how 
              it will make you feel. We source premium fabrics that feel incredible 
              against your skin, work with skilled artisans who share our attention 
              to detail, and test every design to ensure the perfect fit.
            </StoryText>
            <StoryText>
              From the initial sketch to the final stitch, we're committed to 
              creating clothing that not only looks beautiful but feels amazing 
              to wear, no matter what your day brings.
            </StoryText>
          </StoryContent>
        </StoryGrid>
      </StorySection>

      <MissionSection>
        <MissionContainer>
          <SectionTitle>Our Mission</SectionTitle>
          <MissionStatement>
            <MissionText>
              "To bring comfort and confidence to every woman, creating fashion 
              that celebrates individuality while embracing the beauty of feeling 
              comfortable in your own skin."
            </MissionText>
          </MissionStatement>
        </MissionContainer>
      </MissionSection>

      <ValuesSection>
        <div style={{ textAlign: 'center' }}>
          <SectionTitle>What We Stand For</SectionTitle>
        </div>
        <ValuesGrid>
          {values.map((value, index) => (
            <ValueCard key={index}>
              <ValueIcon>{value.icon}</ValueIcon>
              <ValueTitle>{value.title}</ValueTitle>
              <ValueDescription>{value.description}</ValueDescription>
            </ValueCard>
          ))}
        </ValuesGrid>
      </ValuesSection>
    </AboutContainer>
  )
}

export default About
