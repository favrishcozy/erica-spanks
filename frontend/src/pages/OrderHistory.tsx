import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronDown, Package, Loader } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { orderAPI } from '../services/api'

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.lg};
  padding-top: 120px;
  max-width: 1200px;
  margin: 0 auto;
`

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  font-family: ${({ theme }) => theme.fonts.secondary};
`

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.borderRadius.lg};

  h3 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    color: ${({ theme }) => theme.colors.black};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    color: ${({ theme }) => theme.colors.darkGray};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`

const OrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

const OrderCard = styled.div`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.lightGray};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`

const OrderHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.cream};
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #faf5f0;
  }
`

const OrderInfo = styled.div`
  flex: 1;

  .order-number {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.darkGray};
  }

  .order-date {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.mediumGray};
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`

const OrderTotal = styled.div`
  text-align: right;

  .amount {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
  }

  .status {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    margin-top: ${({ theme }) => theme.spacing.xs};
    padding: 4px 12px;
    border-radius: 16px;
    display: inline-block;
    
    &.pending {
      background: #fff3cd;
      color: #856404;
    }
    
    &.confirmed {
      background: #d4edda;
      color: #155724;
    }
    
    &.shipped {
      background: #cfe2ff;
      color: #084298;
    }
    
    &.delivered {
      background: #d1e7dd;
      color: #0f5132;
    }
    
    &.cancelled {
      background: #f8d7da;
      color: #842029;
    }
  }
`

const ExpandIcon = styled.div<{ expanded: boolean }>`
  color: ${({ theme }) => theme.colors.mediumGray};
  transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0)'};
  transition: transform 0.3s ease;
`

const OrderDetails = styled.div<{ expanded: boolean }>`
  display: ${props => props.expanded ? 'block' : 'none'};
  padding: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.lightGray};
`

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  th {
    text-align: left;
    padding: ${({ theme }) => theme.spacing.md};
    border-bottom: 2px solid ${({ theme }) => theme.colors.lightGray};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.black};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  td {
    padding: ${({ theme }) => theme.spacing.md};
    border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }

  tr:last-child td {
    border-bottom: none;
  }
`

const ShippingInfo = styled.div`
  background: ${({ theme }) => theme.colors.cream};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  h4 {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.black};
  }

  p {
    margin: 4px 0;
    color: ${({ theme }) => theme.colors.darkGray};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${({ theme }) => theme.colors.mediumGray};
`

const OrderHistory: React.FC = () => {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await orderAPI.getMyOrders()
        setOrders(response.data?.data || response.data || [])
      } catch (error) {
        console.error('Error fetching orders:', error)
        toast.error('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, navigate])

  if (authLoading || loading) {
    return (
      <Container>
        <LoadingContainer>
          <Loader size={32} />
        </LoadingContainer>
      </Container>
    )
  }

  return (
    <Container>
      <PageTitle>Order History</PageTitle>

      {orders.length === 0 ? (
        <EmptyState>
          <Package size={48} style={{ margin: '0 auto 16px', color: '#d4a574' }} />
          <h3>No Orders Yet</h3>
          <p>You haven't placed any orders yet. Start shopping to create your first order!</p>
          <button
            onClick={() => navigate('/products')}
            style={{
              padding: '12px 32px',
              background: '#FF1493',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Continue Shopping
          </button>
        </EmptyState>
      ) : (
        <OrderList>
          {orders.map((order) => (
            <OrderCard key={order._id}>
              <OrderHeader onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}>
                <OrderInfo>
                  <div className="order-number">Order #{order.orderId}</div>
                  <div className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </OrderInfo>
                <OrderTotal>
                  <div className="amount">
                    N{(order.pricing?.total || 0).toLocaleString()}
                  </div>
                  <div className={`status ${order.status?.toLowerCase()}`}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                  </div>
                </OrderTotal>
                <ExpandIcon expanded={expandedOrderId === order._id}>
                  <ChevronDown size={20} />
                </ExpandIcon>
              </OrderHeader>

              <OrderDetails expanded={expandedOrderId === order._id}>
                <h4 style={{ marginBottom: '16px' }}>Items</h4>
                <ItemsTable>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Size / Color</th>
                      <th style={{ textAlign: 'right' }}>Qty</th>
                      <th style={{ textAlign: 'right' }}>Unit Price</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item: any, index: number) => (
                      <tr key={index}>
                        <td>{item.productSnapshot?.name || 'Product'}</td>
                        <td>
                          {item.variation?.size || 'N/A'} / {item.variation?.color || 'N/A'}
                        </td>
                        <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>
                          N{(item.unitPrice || 0).toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '600' }}>
                          N{(item.totalPrice || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </ItemsTable>

                <ShippingInfo>
                  <h4>Shipping Address</h4>
                  <p>
                    {order.shipping?.firstName} {order.shipping?.lastName}
                  </p>
                  <p>{order.shipping?.address1}</p>
                  {order.shipping?.address2 && <p>{order.shipping?.address2}</p>}
                  <p>
                    {order.shipping?.city}, {order.shipping?.state} {order.shipping?.zipCode}
                  </p>
                  <p>{order.shipping?.country}</p>
                  {order.shipping?.phone && <p>Phone: {order.shipping?.phone}</p>}
                </ShippingInfo>

                <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '4px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <span>Subtotal:</span>
                    <span>N{(order.pricing?.subtotal || 0).toLocaleString()}</span>
                  </div>
                  {order.pricing?.discount > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px',
                        fontSize: '14px',
                        color: '#28a745'
                      }}
                    >
                      <span>Discount:</span>
                      <span>-N{(order.pricing.discount || 0).toLocaleString()}</span>
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <span>Shipping:</span>
                    <span>N{(order.pricing?.shippingFee || 0).toLocaleString()}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#FF1493',
                      borderTop: '1px solid #ddd',
                      paddingTop: '8px'
                    }}
                  >
                    <span>Total:</span>
                    <span>N{(order.pricing?.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </OrderDetails>
            </OrderCard>
          ))}
        </OrderList>
      )}
    </Container>
  )
}

export default OrderHistory
