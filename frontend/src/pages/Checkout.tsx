// pages/checkout.tsx
import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../stores/cartStore'

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`

// Styled Components
const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: ${({ theme }) => theme.spacing.xl};
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.lg};
  }
`

const CheckoutHeader = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  h1 {
    margin: 0;
    color: ${({ theme }) => theme.colors.primaryDark};
    font-size: 2.5rem;
    font-weight: 700;
  }

  &::after {
    content: '';
    display: block;
    width: 80px;
    height: 4px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
    margin: ${({ theme }) => theme.spacing.sm} auto;
    border-radius: 2px;
  }
`

const FormSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: ${({ theme }) => theme.spacing.xl};
  animation: ${slideIn} 0.4s ease-out;
`

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primaryDark};
  margin: 0 0 ${({ theme }) => theme.spacing.lg} 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
    margin-left: ${({ theme }) => theme.spacing.sm};
  }
`

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const Label = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primaryDark};
  font-size: 0.95rem;
`

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${({ theme, hasError }) => 
    hasError ? theme.colors.error : theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: ${({ theme, hasError }) => 
      hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme, hasError }) => 
      hasError ? theme.colors.error + '20' : theme.colors.primary + '20'};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
  }
`

const Select = styled.select<{ hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${({ theme, hasError }) => 
    hasError ? theme.colors.error : theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme, hasError }) => 
      hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme, hasError }) => 
      hasError ? theme.colors.error + '20' : theme.colors.primary + '20'};
  }
`

const ErrorMessage = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.85rem;
  margin-top: ${({ theme }) => theme.spacing.xs};
  display: block;
  animation: ${shake} 0.3s ease-in-out;
`

const PaymentMethods = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
`

const PaymentMethod = styled.label<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme, selected }) => 
    selected ? theme.colors.primary : theme.colors.border};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${({ theme, selected }) => 
    selected ? theme.colors.primary + '10' : 'white'};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }

  svg {
    width: 32px;
    height: 32px;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    color: ${({ theme, selected }) => 
      selected ? theme.colors.primary : theme.colors.textLight};
  }

  span {
    font-size: 0.9rem;
    font-weight: ${({ selected }) => selected ? '600' : '400'};
    color: ${({ theme, selected }) => 
      selected ? theme.colors.primary : theme.colors.text};
  }
`

const HiddenRadio = styled.input`
  display: none;
`

const OrderSummary = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  padding: ${({ theme }) => theme.spacing.xl};
  height: fit-content;
  position: sticky;
  top: ${({ theme }) => theme.spacing.lg};
  animation: ${fadeIn} 0.5s ease-out;
`

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`

const ItemImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const ItemDetails = styled.div`
  flex: 1;
  min-width: 0;

  h4 {
    margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
    font-size: 0.95rem;
    color: ${({ theme }) => theme.colors.primaryDark};
    line-height: 1.3;
  }

  .attributes {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.textLight};
  }
`

const ItemPrice = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`

const SummaryRow = styled.div<{ highlight?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: ${({ highlight, theme }) => 
    highlight ? '2px' : '1px'} solid ${({ theme }) => theme.colors.border};
  font-weight: ${({ highlight }) => highlight ? '700' : '400'};
  font-size: ${({ highlight }) => highlight ? '1.2rem' : '1rem'};
  color: ${({ highlight, theme }) => 
    highlight ? theme.colors.primaryDark : 'inherit'};

  &:last-child {
    border-bottom: none;
  }
`

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const SecondaryButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.textLight};
  border: 2px solid ${({ theme }) => theme.colors.border};
  padding: 14px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 2;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    animation: ${pulse} 1s infinite;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`

const LoadingSpinner = styled.div`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
`

const Checkout: React.FC = () => {
  const navigate = useNavigate()
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
    paymentMethod: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()
  const shippingFee = totalPrice > 50000 ? 0 : 1500 // Free shipping over ₦50,000
  const finalTotal = totalPrice + shippingFee

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Payment method is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert(`🎉 Order placed successfully!\nTotal: ₦${finalTotal.toLocaleString()}`)
      clearCart()
      navigate('/order-confirmation')
    } catch (error) {
      alert('There was an error processing your order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const paymentMethods = [
    { id: 'card', name: 'Credit Card', icon: '💳' },
    { id: 'paystack', name: 'Paystack', icon: '⚡' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦' },
    { id: 'cash', name: 'Cash on Delivery', icon: '💰' }
  ]

  if (items.length === 0) {
    return (
      <Container>
        <CheckoutHeader>
          <h1>Checkout</h1>
          <p>Your cart is empty</p>
        </CheckoutHeader>
        <SecondaryButton onClick={() => navigate('/')}>
          Continue Shopping
        </SecondaryButton>
      </Container>
    )
  }

  return (
    <Container>
      <CheckoutHeader>
        <h1>Checkout</h1>
        <p>Complete your purchase</p>
      </CheckoutHeader>

      <form onSubmit={handleSubmit}>
        <FormSection>
          <SectionTitle>📦 Shipping Information</SectionTitle>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <FormGroup>
              <Label>First Name *</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="John"
                hasError={!!errors.firstName}
              />
              {errors.firstName && <ErrorMessage>{errors.firstName}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Last Name *</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Doe"
                hasError={!!errors.lastName}
              />
              {errors.lastName && <ErrorMessage>{errors.lastName}</ErrorMessage>}
            </FormGroup>
          </div>

          <FormGroup>
            <Label>Email Address *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john.doe@example.com"
              hasError={!!errors.email}
            />
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Phone Number *</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+234 800 000 0000"
              hasError={!!errors.phone}
            />
            {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label>Street Address *</Label>
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 Main Street"
              hasError={!!errors.address}
            />
            {errors.address && <ErrorMessage>{errors.address}</ErrorMessage>}
          </FormGroup>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <FormGroup>
              <Label>City *</Label>
              <Input
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Lagos"
                hasError={!!errors.city}
              />
              {errors.city && <ErrorMessage>{errors.city}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>State *</Label>
              <Input
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Lagos State"
                hasError={!!errors.state}
              />
              {errors.state && <ErrorMessage>{errors.state}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Postal Code</Label>
              <Input
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="100001"
              />
            </FormGroup>
          </div>

          <FormGroup>
            <Label>Country</Label>
            <Select
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
            >
              <option value="Nigeria">Nigeria</option>
              <option value="Ghana">Ghana</option>
              <option value="Kenya">Kenya</option>
              <option value="South Africa">South Africa</option>
            </Select>
          </FormGroup>
        </FormSection>

        <FormSection>
          <SectionTitle>💳 Payment Method</SectionTitle>
          
          <FormGroup>
            <Label>Select Payment Method *</Label>
            <PaymentMethods>
              {paymentMethods.map((method) => (
                <PaymentMethod
                  key={method.id}
                  selected={formData.paymentMethod === method.id}
                >
                  <HiddenRadio
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={formData.paymentMethod === method.id}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  />
                  <span style={{ fontSize: '24px' }}>{method.icon}</span>
                  <span>{method.name}</span>
                </PaymentMethod>
              ))}
            </PaymentMethods>
            {errors.paymentMethod && <ErrorMessage>{errors.paymentMethod}</ErrorMessage>}
          </FormGroup>
        </FormSection>
      </form>

      <OrderSummary>
        <SectionTitle>Order Summary</SectionTitle>
        
        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
          {items.map((item) => (
            <OrderItem key={`${item.id}-${item.size}-${item.color}`}>
              <ItemImage>
                <img 
                  src={item.image || '/api/placeholder/60/60'} 
                  alt={item.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/api/placeholder/60/60'
                  }}
                />
              </ItemImage>
              <ItemDetails>
                <h4>{item.name}</h4>
                <div className="attributes">
                  {item.size && <span>Size: {item.size}</span>}
                  {item.color && <span> • Color: {item.color}</span>}
                </div>
                <div>Qty: {item.quantity}</div>
              </ItemDetails>
              <ItemPrice>₦{(item.price * item.quantity).toLocaleString()}</ItemPrice>
            </OrderItem>
          ))}
        </div>

        <SummaryRow>
          <span>Subtotal ({totalItems} items):</span>
          <span>₦{totalPrice.toLocaleString()}</span>
        </SummaryRow>
        
        <SummaryRow>
          <span>Shipping:</span>
          <span>
            {shippingFee === 0 ? (
              <span style={{ color: 'green' }}>FREE</span>
            ) : (
              `₦${shippingFee.toLocaleString()}`
            )}
          </span>
        </SummaryRow>
        
        <SummaryRow highlight>
          <span>Total:</span>
          <span>₦{finalTotal.toLocaleString()}</span>
        </SummaryRow>

        <ActionButtons>
          <SecondaryButton type="button" onClick={() => navigate('/cart')}>
            ← Back to Cart
          </SecondaryButton>
          <PrimaryButton 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoadingSpinner /> : `Place Order • ₦${finalTotal.toLocaleString()}`}
          </PrimaryButton>
        </ActionButtons>
      </OrderSummary>
    </Container>
  )
}

export default Checkout