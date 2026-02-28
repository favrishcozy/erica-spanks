import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Truck, MapPin, Clock, DollarSign } from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '../config/environment'

const ShippingContainer = styled.div`
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

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
`

const InfoCard = styled.div`
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
    font-size: ${({ theme }) => theme.fontSizes.sm};
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

const ZoneGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin: ${({ theme }) => theme.spacing.lg} 0;
`

const ZoneCard = styled.div`
  background: ${({ theme }) => theme.colors.offWhite};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};

  h4 {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1rem;
    margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    columns: 2;
    gap: ${({ theme }) => theme.spacing.md};

    @media (max-width: 500px) {
      columns: 1;
    }

    li {
      color: ${({ theme }) => theme.colors.darkGray};
      font-size: ${({ theme }) => theme.fontSizes.sm};
      margin-bottom: ${({ theme }) => theme.spacing.sm};
      break-inside: avoid;

      &:before {
        content: '• ';
        color: ${({ theme }) => theme.colors.primary};
        font-weight: bold;
        margin-right: ${({ theme }) => theme.spacing.xs};
      }
    }
  }
`

const ProcessSteps = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin: ${({ theme }) => theme.spacing.lg} 0;
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

const ContactBox = styled.div`
  background: ${({ theme }) => theme.colors.black};
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

const LoadingText = styled.p`
  text-align: center;
  color: ${({ theme }) => theme.colors.darkGray};
`

const Shipping: React.FC = () => {
  const [zones, setZones] = useState<{ [key: string]: string[] }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadZones = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/shipping/zones`)
        if (response.data?.zones) {
          setZones(response.data.zones)
        }
      } catch (error) {
        console.error('Error loading zones:', error)
      } finally {
        setLoading(false)
      }
    }
    loadZones()
  }, [])

  const zoneDescriptions: { [key: string]: string } = {
    MAINLAND_A: "Central Lagos - Includes major business and residential areas",
    MAINLAND_B: "Western Mainland - Magodo, Omole, and surrounding areas",
    MAINLAND_C: "Northern Mainland - Festac, Apapa, Isolo areas",
    MAINLAND_D: "Northeast Mainland - Egbeda, Idimu, Igando regions",
    MAINLAND_E: "Far North - Ijegun, Jakande, Ikotun areas",
    MAINLAND_F: "West Lagos - Agege, Ijaiye, Alagbado regions",
    MAINLAND_G: "Far West - LASU, Iba, Ishashi areas",
    ISLAND_A: "Ikoyi & VI - Premium island locations",
    ISLAND_B: "Lekki Phase 1 - Eastern island residential area",
    ISLAND_C: "Lekki Phase 2 & Beyond - Extended island areas"
  }

  return (
    <ShippingContainer>
      <ContentWrapper>
        <PageHeader>
          <PageTitle>Shipping Information</PageTitle>
          <PageSubtitle>
            Fast, reliable delivery to Lagos with transparent pricing
          </PageSubtitle>
        </PageHeader>

        <InfoGrid>
          <InfoCard>
            <Truck />
            <h3>Fast Delivery</h3>
            <p>Most orders delivered within 2-5 business days</p>
          </InfoCard>
          <InfoCard>
            <MapPin />
            <h3>Multiple Zones</h3>
            <p>Delivery available across all Lagos zones</p>
          </InfoCard>
          <InfoCard>
            <DollarSign />
            <h3>Transparent Pricing</h3>
            <p>Clear, zone-based delivery fees calculated at checkout</p>
          </InfoCard>
          <InfoCard>
            <Clock />
            <h3>Real-time Tracking</h3>
            <p>Track your order from warehouse to your door</p>
          </InfoCard>
        </InfoGrid>

        <Section>
          <SectionTitle>How It Works</SectionTitle>
          <ProcessSteps>
            <Step>
              <StepNumber>1</StepNumber>
              <StepTitle>Place Order</StepTitle>
              <StepDescription>Add items to cart and checkout</StepDescription>
            </Step>
            <Step>
              <StepNumber>2</StepNumber>
              <StepTitle>Select Zone</StepTitle>
              <StepDescription>Choose your delivery area</StepDescription>
            </Step>
            <Step>
              <StepNumber>3</StepNumber>
              <StepTitle>See Fee</StepTitle>
              <StepDescription>Zone-based fee calculated instantly</StepDescription>
            </Step>
            <Step>
              <StepNumber>4</StepNumber>
              <StepTitle>Confirm Payment</StepTitle>
              <StepDescription>Pay with your preferred method</StepDescription>
            </Step>
            <Step>
              <StepNumber>5</StepNumber>
              <StepTitle>Get Tracking</StepTitle>
              <StepDescription>Receive delivery updates via email</StepDescription>
            </Step>
          </ProcessSteps>
        </Section>

        <Section>
          <SectionTitle>Delivery Zones & Areas</SectionTitle>
          <p style={{ color: '#555', marginBottom: '20px' }}>
            We service all major areas across Lagos. Find your zone below to see which areas we cover and estimated delivery times.
          </p>
          
          {loading ? (
            <LoadingText>Loading delivery zones...</LoadingText>
          ) : Object.keys(zones).length > 0 ? (
            <ZoneGrid>
              {Object.entries(zones).map(([zone, areas]) => (
                <ZoneCard key={zone}>
                  <h4>{zone}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '10px', fontStyle: 'italic' }}>
                    {zoneDescriptions[zone] || 'Delivery zone'}
                  </p>
                  <ul>
                    {(areas as string[]).map((area) => (
                      <li key={area}>{area}</li>
                    ))}
                  </ul>
                </ZoneCard>
              ))}
            </ZoneGrid>
          ) : (
            <LoadingText>Unable to load zones. Please try refreshing the page.</LoadingText>
          )}
        </Section>

        <Section>
          <SectionTitle>Delivery Timeline</SectionTitle>
          <div style={{ color: '#555', lineHeight: '1.8' }}>
            <h4 style={{ color: '#333', marginTop: 0 }}>Standard Delivery (2-5 Business Days)</h4>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>Order Processing:</strong> 24 hours after payment confirmation</li>
              <li><strong>Preparation:</strong> 1 business day to pick and pack your items</li>
              <li><strong>Shipping:</strong> 2-3 business days for delivery to your address</li>
              <li><strong>Peak Periods:</strong> May take 1-2 additional days during peak seasons</li>
            </ul>
          </div>
        </Section>

        <Section>
          <SectionTitle>Tracking Your Order</SectionTitle>
          <div style={{ color: '#555', lineHeight: '1.8' }}>
            <p>
              Once your order ships, you'll receive an email with a tracking number. You can:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li>Track shipment status in real-time</li>
              <li>See estimated delivery date</li>
              <li>Get delivery notifications via email and SMS</li>
              <li>Contact customer service if you have questions</li>
            </ul>
          </div>
        </Section>

        <Section>
          <SectionTitle>Shipping Rates</SectionTitle>
          <div style={{ color: '#555', lineHeight: '1.8' }}>
            <p>
              Shipping costs are calculated based on your delivery zone. You'll see the exact fee when you select 
              your delivery area at checkout.
            </p>
            <h4 style={{ color: '#333' }}>Zone-Based Pricing:</h4>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>Mainland Zone A:</strong> Lowest rates - ₦2,500 - ₦3,500</li>
              <li><strong>Mainland Zones B-G:</strong> Standard rates - ₦3,000 - ₦4,500</li>
              <li><strong>Island Zones A-C:</strong> Premium rates - ₦2,500 - ₦4,000</li>
            </ul>
            <p>
              <em>* Rates vary based on origin and destination zones. Exact rate will be shown at checkout.</em>
            </p>
          </div>
        </Section>

        <Section>
          <SectionTitle>Special Cases</SectionTitle>
          <div style={{ color: '#555', lineHeight: '1.8' }}>
            <h4 style={{ color: '#333' }}>Out of Delivery Area</h4>
            <p>
              If your address is outside our standard delivery zones, contact us directly. We may be able to arrange 
              special delivery or pickup options.
            </p>
            
            <h4 style={{ color: '#333' }}>Undeliverable Addresses</h4>
            <p>
              If we cannot deliver to your address, we'll contact you. You can request reshipment to another address 
              or arrange a refund.
            </p>

            <h4 style={{ color: '#333' }}>Weather & Emergencies</h4>
            <p>
              In case of unforeseen circumstances, delivery timelines may be extended. We'll keep you informed every 
              step of the way.
            </p>
          </div>
        </Section>

        <ContactBox>
          <h3>Need Help With Shipping?</h3>
          <p>Our team is ready to assist you!</p>
          <p>
            <strong>Email:</strong> <a href="mailto:info@ericaspanks.com">info@ericaspanks.com</a>
          </p>
          <p>
            <strong>Phone:</strong> <a href="tel:+2348113322121">+234 811 332 2121</a>
          </p>
          <p>
            <strong>WhatsApp:</strong> <a href="https://wa.me/2348113322121" target="_blank" rel="noopener noreferrer">Chat with us</a>
          </p>
        </ContactBox>
      </ContentWrapper>
    </ShippingContainer>
  )
}

export default Shipping
