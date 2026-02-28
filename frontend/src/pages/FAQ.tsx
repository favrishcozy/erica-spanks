import React, { useState } from 'react'
import styled from 'styled-components'
import { ChevronDown } from 'lucide-react'

const FaqContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`

const FaqHeader = styled.div`
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

const PageSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.darkGray};
  font-size: ${({ theme }) => theme.fontSizes.md};
`

const FaqCategory = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`

const CategoryTitle = styled.h2`
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`

const FaqItem = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.lightGray};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  overflow: hidden;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`

const FaqQuestion = styled.button<{ expanded: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ expanded, theme }) => 
    expanded ? theme.colors.primaryLight : theme.colors.white};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  text-align: left;
  transition: ${({ theme }) => theme.transitions.fast};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.black};

  &:hover {
    background: ${({ expanded, theme }) => 
      expanded ? theme.colors.primaryLight : theme.colors.offWhite};
  }

  svg {
    color: ${({ theme }) => theme.colors.primary};
    transition: transform 0.3s ease;
    transform: ${({ expanded }) => expanded ? 'rotate(180deg)' : 'rotate(0)'};
    flex-shrink: 0;
  }
`

const FaqAnswer = styled.div<{ expanded: boolean }>`
  max-height: ${({ expanded }) => expanded ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: ${({ theme }) => theme.colors.offWhite};
`

const FaqAnswerContent = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.darkGray};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};

    &:last-child {
      margin-bottom: 0;
    }
  }

  ul {
    margin-left: ${({ theme }) => theme.spacing.lg};
    margin-bottom: ${({ theme }) => theme.spacing.md};

    li {
      margin-bottom: ${({ theme }) => theme.spacing.sm};
    }
  }
`

interface FAQ {
  id: string
  question: string
  answer: string | React.ReactNode
}

interface FaqCategory {
  title: string
  faqs: FAQ[]
}

const FAQ: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const categories: FaqCategory[] = [
    {
      title: "Ordering & Products",
      faqs: [
        {
          id: "order-1",
          question: "How do I place an order?",
          answer: "Simply browse our collection, add items to your cart, and proceed to checkout. You'll need to create an account or log in to complete your purchase."
        },
        {
          id: "order-2",
          question: "Do you offer international shipping?",
          answer: "Currently, we deliver within Lagos, Nigeria. We're working on expanding our shipping options to other cities soon. Subscribe to our newsletter to stay updated."
        },
        {
          id: "order-3",
          question: "Can I cancel my order?",
          answer: "Orders can be cancelled within 30 minutes of placement. After that, please contact our customer service team at info@ericaspanks.com or call +234 811 332 2121."
        },
        {
          id: "order-4",
          question: "How do I use a discount code?",
          answer: "Enter your discount code in the 'Promo Code' field during checkout before completing your payment. The discount will be applied to your total."
        }
      ]
    },
    {
      title: "Shipping & Delivery",
      faqs: [
        {
          id: "ship-1",
          question: "What are the shipping options?",
          answer: "We offer standard home delivery to various zones in Lagos. Delivery fees vary based on your location. You can select your delivery area during checkout to see the applicable fee."
        },
        {
          id: "ship-2",
          question: "How long does delivery take?",
          answer: "Most orders are delivered within 2-5 business days depending on your location and delivery zone. You'll receive a tracking update once your order ships."
        },
        {
          id: "ship-3",
          question: "How do I track my order?",
          answer: "Once your order ships, you'll receive an email with tracking information. You can also check your order status in your account under 'Orders'."
        },
        {
          id: "ship-4",
          question: "What if my package doesn't arrive?",
          answer: "Contact us immediately at info@ericaspanks.com. We'll investigate with our logistics partner and either redeliver your package or issue a refund."
        }
      ]
    },
    {
      title: "Payments & Billing",
      faqs: [
        {
          id: "pay-1",
          question: "What payment methods do you accept?",
          answer: "We accept major credit cards (Visa, Mastercard), debit cards, and secure payment gateways. All payments are processed securely through encrypted connections."
        },
        {
          id: "pay-2",
          question: "Is my payment information secure?",
          answer: "Yes! We use industry-standard SSL encryption and PCI DSS compliance to protect your payment information. We never store complete credit card numbers."
        },
        {
          id: "pay-3",
          question: "Why was my payment declined?",
          answer: "Payment declines can happen for various reasons. Please check: card details are correct, sufficient funds, card not expired, no purchase restrictions. Contact your bank for more help."
        },
        {
          id: "pay-4",
          question: "Do you offer payment plans?",
          answer: "Currently, we don't offer payment plans. We accept one-time payments only. Check back soon for new payment options!"
        }
      ]
    },
    {
      title: "Account & Personal Info",
      faqs: [
        {
          id: "account-1",
          question: "How do I create an account?",
          answer: "Click 'Register' on our homepage, enter your email and password, and fill in your personal information. You'll receive a confirmation email to verify your account."
        },
        {
          id: "account-2",
          question: "Can I guest checkout?",
          answer: "We require an account for all purchases to ensure order tracking and customer service. Registration is quick and free!"
        },
        {
          id: "account-3",
          question: "How do I reset my password?",
          answer: "Click 'Forgot Password' on the login page, enter your email, and we'll send you a link to reset your password."
        },
        {
          id: "account-4",
          question: "How do I delete my account?",
          answer: "Contact our support team at info@ericaspanks.com with your account email. We'll help you with account deletion and data removal."
        }
      ]
    },
    {
      title: "Size & Fit",
      faqs: [
        {
          id: "size-1",
          question: "How do I find my size?",
          answer: "Check our Size Guide for detailed measurements. Each product page also includes sizing information and customer reviews that mention fit."
        },
        {
          id: "size-2",
          question: "What if the item doesn't fit?",
          answer: "If the item doesn't fit, please contact our customer service team at info@ericaspanks.com for assistance. We're happy to help!"
        },
        {
          id: "size-3",
          question: "Do you have extended sizes?",
          answer: "We carry sizes XS to 3XL for most items. Check individual product pages for available sizes. Let us know if you'd like us to stock different sizes!"
        }
      ]
    },
    {
      title: "Loyalty & Rewards",
      faqs: [
        {
          id: "loyalty-1",
          question: "How do the loyalty points work?",
          answer: "Earn 1 point for every ₦100 spent on purchases. Points can be redeemed for discounts on future purchases. Check our Loyalty Program page for more details."
        },
        {
          id: "loyalty-2",
          question: "How do I redeem my points?",
          answer: "Visit your account dashboard to view your points balance. Select 'Redeem Points' at checkout to apply them to your purchase."
        }
      ]
    }
  ]

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <FaqContainer>
      <FaqHeader>
        <PageTitle>Frequently Asked Questions</PageTitle>
        <PageSubtitle>
          Find answers to common questions about shopping with Erica Spanks
        </PageSubtitle>
      </FaqHeader>

      {categories.map((category) => (
        <FaqCategory key={category.title}>
          <CategoryTitle>{category.title}</CategoryTitle>
          {category.faqs.map((faq) => (
            <FaqItem key={faq.id}>
              <FaqQuestion
                expanded={expandedId === faq.id}
                onClick={() => toggleExpand(faq.id)}
              >
                {faq.question}
                <ChevronDown size={20} />
              </FaqQuestion>
              <FaqAnswer expanded={expandedId === faq.id}>
                <FaqAnswerContent>
                  {typeof faq.answer === 'string' ? <p>{faq.answer}</p> : faq.answer}
                </FaqAnswerContent>
              </FaqAnswer>
            </FaqItem>
          ))}
        </FaqCategory>
      ))}
    </FaqContainer>
  )
}

export default FAQ
