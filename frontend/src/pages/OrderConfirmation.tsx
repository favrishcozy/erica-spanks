import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useNavigate, useParams } from 'react-router-dom'
import { CheckCircle, Clock, Truck } from 'lucide-react'
import api from '../services/api'

const Container = styled.div`
  max-width: 800px;
  margin: 80px auto;
  padding: 2rem;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    margin: 40px auto;
    padding: 1.5rem;
  }
`

const Content = styled.div`
  text-align: center;
`

const SuccessIcon = styled.div`
  font-size: 80px;
  margin-bottom: 1.5rem;
  animation: bounce 1s ease-out;

  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`

const Title = styled.h1`
  color: #E91E63;
  font-size: 2.5rem;
  margin: 1rem 0;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`

const OrderNumber = styled.div`
  background: #E0E0E0;
  padding: 1.5rem;
  border-radius: 12px;
  margin: 2rem 0;
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: 700;
  color: #FF1493;
  font-size: 1.3rem;
  letter-spacing: 1px;
`

const Message = styled.p`
  color: #757575;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 1.5rem 0;
`

const OrderDetails = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin: 2rem 0;
  text-align: left;
`

const DetailSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    color: #E91E63;
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 8px;

    svg {
      width: 20px;
      height: 20px;
      color: #C9A876;
    }
  }
`

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #E0E0E0;
  font-size: 0.95rem;

  &:last-child {
    border-bottom: none;
  }

  .label {
    color: #757575;
    font-weight: 500;
  }

  .value {
    color: #2C2C2C;
    font-weight: 600;
  }
`

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const OrderItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;

  img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 6px;
  }

  .item-info {
    flex: 1;
    text-align: left;

    .name {
      font-weight: 600;
      color: #2C2C2C;
      margin: 0 0 4px 0;
      font-size: 0.95rem;
    }

    .details {
      color: #757575;
      font-size: 0.85rem;
      margin: 0;
    }
  }

  .price {
    font-weight: 600;
    color: #FF1493;
    white-space: nowrap;
  }
`

const Timeline = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 2rem 0;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const TimelineItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 1rem;

  .icon {
    width: 56px;
    height: 56px;
    background: #E0E0E0;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FF1493;

    svg {
      width: 24px;
      height: 24px;
    }
  }

  .label {
    font-weight: 600;
    color: #E91E63;
    font-size: 0.95rem;
  }

  .description {
    color: #757575;
    font-size: 0.85rem;
    text-align: center;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const Button = styled.button<{ $primary?: boolean }>`
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;

  background: ${({ $primary }) => $primary ? '#C9A876' : 'transparent'};
  color: ${({ $primary }) => $primary ? 'white' : '#C9A876'};
  border: ${({ $primary }) => $primary ? 'none' : '2px solid #C9A876'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 20, 147, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 20, 147, 0.2);
  border-radius: 50%;
  border-top-color: #ff1493;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const ErrorMessage = styled.div`
  background: #FFEBEE;
  color: #C62828;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`

interface OrderData {
  _id: string
  status: string
  pricing: {
    subtotal: number
    shippingCost: number
    discount: number
    total: number
  }
  items: Array<{
    productSnapshot?: { name: string; image: string }
    quantity: number
    unitPrice: number
    variation?: { size: string; color: string }
  }>
  shippingAddress: {
    firstName: string
    lastName: string
    address1: string
    city: string
    state: string
    country: string
  }
  createdAt: string
}

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        navigate('/')
        return
      }

      try {
        setLoading(true)
        const response = await api.get(`/orders/${orderId}`)
        // Try different response structures
        const orderData = response.data?.data || response.data
        setOrder(orderData)
      } catch (err: any) {
        console.error('Error fetching order:', err)
        console.error('Error response:', err.response?.data)
        setError(err.response?.data?.error || 'Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, navigate])

  if (loading) {
    return (
      <Container>
        <Content>
          <SuccessIcon>
            <LoadingSpinner />
          </SuccessIcon>
          <Message>Loading your order details...</Message>
        </Content>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <Content>
          <ErrorMessage>{error}</ErrorMessage>
          <ButtonGroup>
            <Button $primary onClick={() => navigate('/')}>
              Back to Home
            </Button>
            <Button onClick={() => navigate('/profile')}>View Orders</Button>
          </ButtonGroup>
        </Content>
      </Container>
    )
  }

  return (
    <Container>
      <Content>
        <SuccessIcon>✅</SuccessIcon>
        <Title>Order Confirmed!</Title>
        <Message>
          Thank you for your order. We've sent a confirmation email to{' '}
          <strong>{order?.shippingAddress?.firstName}</strong>.
        </Message>

        {order && (
          <>
            <OrderNumber>
              Order #{order.orderId || order._id.toString().slice(-6).toUpperCase()}
            </OrderNumber>

            <Timeline>
              <TimelineItem>
                <div className="icon">
                  <CheckCircle />
                </div>
                <div className="label">Order Confirmed</div>
                <div className="description">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </TimelineItem>
              <TimelineItem>
                <div className="icon">
                  <Clock />
                </div>
                <div className="label">Processing</div>
                <div className="description">1-2 business days</div>
              </TimelineItem>
              <TimelineItem>
                <div className="icon">
                  <Truck />
                </div>
                <div className="label">Shipped</div>
                <div className="description">2-5 business days</div>
              </TimelineItem>
            </Timeline>

            <OrderDetails>
              <DetailSection>
                <h3>📦 Order Items</h3>
                <ItemsList>
                  {order.items.map((item, idx) => (
                    <OrderItem key={idx}>
                      {item.productSnapshot?.image && (
                        <img
                          src={item.productSnapshot.image}
                          alt={item.productSnapshot.name}
                        />
                      )}
                      <div className="item-info">
                        <p className="name">{item.productSnapshot?.name}</p>
                        <p className="details">
                          {item.variation?.size} / {item.variation?.color} ×{' '}
                          {item.quantity}
                        </p>
                      </div>
                      <div className="price">
                        ₦{(item.unitPrice * item.quantity).toLocaleString()}
                      </div>
                    </OrderItem>
                  ))}
                </ItemsList>
              </DetailSection>

              <DetailSection>
                <h3>💳 Order Summary</h3>
                <DetailRow>
                  <span className="label">Subtotal</span>
                  <span className="value">
                    ₦{order.pricing.subtotal.toLocaleString()}
                  </span>
                </DetailRow>
                {order.pricing.shippingCost > 0 && (
                  <DetailRow>
                    <span className="label">Shipping</span>
                    <span className="value">
                      ₦{order.pricing.shippingCost.toLocaleString()}
                    </span>
                  </DetailRow>
                )}
                {order.pricing.discount > 0 && (
                  <DetailRow>
                    <span className="label">Discount</span>
                    <span className="value" style={{ color: '#4CAF50' }}>
                      -₦{order.pricing.discount.toLocaleString()}
                    </span>
                  </DetailRow>
                )}
                <DetailRow style={{ marginTop: '12px', paddingTop: '12px' }}>
                  <span className="label" style={{ fontSize: '1.1rem' }}>
                    Total
                  </span>
                  <span className="value" style={{ fontSize: '1.1rem' }}>
                    ₦{order.pricing.total.toLocaleString()}
                  </span>
                </DetailRow>
              </DetailSection>

              <DetailSection>
                <h3>📍 Shipping Address</h3>
                <div style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  <div>
                    {order.shippingAddress.firstName}{' '}
                    {order.shippingAddress.lastName}
                  </div>
                  <div>{order.shippingAddress.address1}</div>
                  <div>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.country}
                  </div>
                </div>
              </DetailSection>
            </OrderDetails>
          </>
        )}

        <ButtonGroup>
          <Button $primary onClick={() => navigate('/')}>
            Continue Shopping
          </Button>
          <Button onClick={() => navigate('/profile')}>View Order History</Button>
        </ButtonGroup>
      </Content>
    </Container>
  )
}

export default OrderConfirmation
