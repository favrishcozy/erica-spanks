import React, { useState } from 'react'
import styled from 'styled-components'
import { Ruler, Info, ChevronDown } from 'lucide-react'

const SizeGuideContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
`

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.secondary};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
  }
`

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.darkGray};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const CategoryTabs = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`

const CategoryTab = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border: 2px solid ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.lightGray};
  background: ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.white};
  color: ${({ theme, $active }) => 
    $active ? theme.colors.white : theme.colors.black};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme, $active }) => $active ? theme.colors.white : theme.colors.primary};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex: 1;
    min-width: 0;
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`

const SizeChart = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const TableContainer = styled.div`
  overflow-x: auto;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: ${({ theme }) => theme.spacing.md};
    text-align: center;
    border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
  }
  
  th {
    background: ${({ theme }) => theme.colors.offWhite};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.black};
    font-size: ${({ theme }) => theme.fontSizes.sm};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  td {
    font-size: ${({ theme }) => theme.fontSizes.md};
    color: ${({ theme }) => theme.colors.darkGray};
  }
  
  tbody tr:hover {
    background: ${({ theme }) => theme.colors.offWhite};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    th, td {
      padding: ${({ theme }) => theme.spacing.sm};
      font-size: ${({ theme }) => theme.fontSizes.sm};
    }
  }
`

const MeasureGuide = styled.div`
  background: ${({ theme }) => theme.colors.cream};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const MeasureTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const MeasureList = styled.ul`
  list-style: none;
  padding: 0;
`

const MeasureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  &:before {
    content: counter(step);
    counter-increment: step;
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    flex-shrink: 0;
    margin-top: 2px;
  }
`

const FAQ = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  overflow: hidden;
`

const FAQItem = styled.div<{ $isOpen: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
  
  &:last-child {
    border-bottom: none;
  }
`

const FAQQuestion = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg};
  background: none;
  border: none;
  text-align: left;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.black};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.offWhite};
  }
`

const FAQAnswer = styled.div<{ $isOpen: boolean }>`
  padding: ${({ $isOpen, theme }) => 
    $isOpen ? `0 ${theme.spacing.lg} ${theme.spacing.lg}` : '0'};
  max-height: ${({ $isOpen }) => $isOpen ? '200px' : '0'};
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.normal};
  color: ${({ theme }) => theme.colors.darkGray};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`

const sizeData = {
  clothing: {
    title: 'Clothing Size Chart',
    headers: ['Size', 'UK', 'US', 'EU', 'Bust (inches)', 'Waist (inches)', 'Hips (inches)'],
    rows: [
      ['XS', '4', '0', '32', '32', '24', '34'],
      ['S', '6', '2', '34', '34', '26', '36'],
      ['M', '8', '4', '36', '36', '28', '38'],
      ['L', '10', '6', '38', '38', '30', '40'],
      ['XL', '12', '8', '40', '40', '32', '42'],
      ['XXL', '14', '10', '42', '42', '34', '44'],
    ]
  },
  intimates: {
    title: 'Intimates Size Chart',
    headers: ['Size', 'UK', 'US', 'EU', 'Band (inches)', 'Cup Size'],
    rows: [
      ['XS', '30A-32A', '30A-32A', '65A-70A', '28-30', 'A'],
      ['S', '32B-34B', '32B-34B', '70B-75B', '30-32', 'B'],
      ['M', '34C-36C', '34C-36C', '75C-80C', '32-34', 'C'],
      ['L', '36D-38D', '36D-38D', '80D-85D', '34-36', 'D'],
      ['XL', '38DD-40DD', '38DD-40DD', '85E-90E', '36-38', 'DD'],
    ]
  },
  footwear: {
    title: 'Footwear Size Chart',
    headers: ['Size', 'UK', 'US', 'EU', 'Length (cm)'],
    rows: [
      ['3', '3', '5', '36', '22.5'],
      ['4', '4', '6', '37', '23.0'],
      ['5', '5', '7', '38', '24.0'],
      ['6', '6', '8', '39', '24.5'],
      ['7', '7', '9', '40', '25.5'],
      ['8', '8', '10', '41', '26.0'],
    ]
  }
}

const measurementGuide = [
  'Wrap the measuring tape around the fullest part of your bust, keeping the tape parallel to the floor.',
  'Measure around your natural waistline, which is the narrowest part of your torso.',
  'Measure around the fullest part of your hips, keeping the tape parallel to the floor.',
  'For length measurements, measure from the highest point of your shoulder down to your desired length.',
  'Always measure over your undergarments or fitted clothing for the most accurate results.',
  'If you are between sizes, we recommend sizing up for a more comfortable fit.',
]

const faqData = [
  {
    question: 'What if I\'m between sizes?',
    answer: 'If you find yourself between sizes, we generally recommend sizing up for comfort. However, if you prefer a more fitted look, you might consider the smaller size. Check the product description for specific fit notes.'
  },
  {
    question: 'Do your clothes run true to size?',
    answer: 'Most of our pieces are designed to fit true to size according to our size chart. However, some styles may have a more relaxed or fitted cut. We always include fit notes in the product description to help guide your choice.'
  },
  {
    question: 'Can I exchange if the size doesn\'t fit?',
    answer: 'Yes! We offer free exchanges within 30 days of purchase. Items must be unworn, unwashed, and in original condition with tags attached. Visit our returns page for more details.'
  },
  {
    question: 'How do I measure myself accurately?',
    answer: 'Use a soft measuring tape and measure over your undergarments or fitted clothing. Stand in front of a mirror to ensure the tape is straight and parallel to the floor. It\'s helpful to have someone assist you for the most accurate measurements.'
  },
  {
    question: 'What about international sizing?',
    answer: 'Our size charts include UK, US, and EU sizing conversions. However, sizing can vary between brands and countries, so we always recommend using our measurements in inches/cm for the most accurate fit.'
  }
]

const SizeGuide: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof sizeData>('clothing')
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const currentSizeData = sizeData[activeCategory]

  return (
    <SizeGuideContainer style={{ counterReset: 'step' }}>
      <Header>
        <Title>Size Guide</Title>
        <Subtitle>Find your perfect fit with our comprehensive sizing information</Subtitle>
      </Header>

      <CategoryTabs>
        {Object.entries(sizeData).map(([key, data]) => (
          <CategoryTab
            key={key}
            $active={activeCategory === key}
            onClick={() => setActiveCategory(key as keyof typeof sizeData)}
          >
            {data.title.replace(' Size Chart', '')}
          </CategoryTab>
        ))}
      </CategoryTabs>

      <SizeChart>
        <TableContainer>
          <Table>
            <thead>
              <tr>
                {currentSizeData.headers.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentSizeData.rows.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      </SizeChart>

      <MeasureGuide>
        <MeasureTitle>
          <Ruler size={24} />
          How to Measure
        </MeasureTitle>
        <MeasureList>
          {measurementGuide.map((instruction, index) => (
            <MeasureItem key={index}>
              <span>{instruction}</span>
            </MeasureItem>
          ))}
        </MeasureList>
      </MeasureGuide>

      <div>
        <Title style={{ textAlign: 'left', marginBottom: '2rem' }}>
          <Info size={28} style={{ marginRight: '0.5rem' }} />
          Frequently Asked Questions
        </Title>
        <FAQ>
          {faqData.map((item, index) => (
            <FAQItem key={index} $isOpen={openFAQ === index}>
              <FAQQuestion onClick={() => setOpenFAQ(openFAQ === index ? null : index)}>
                {item.question}
                <ChevronDown 
                  size={20} 
                  style={{ 
                    transform: openFAQ === index ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }} 
                />
              </FAQQuestion>
              <FAQAnswer $isOpen={openFAQ === index}>
                {item.answer}
              </FAQAnswer>
            </FAQItem>
          ))}
        </FAQ>
      </div>
    </SizeGuideContainer>
  )
}

export default SizeGuide
