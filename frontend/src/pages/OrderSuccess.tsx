import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useNavigate, useParams } from 'react-router-dom'
import api, { invoiceAPI } from '../services/api'
import { CheckCircle, Home } from 'lucide-react'

const Container = styled.div`
  max-width: 900px;
  margin: 96px auto;
  padding: 2rem;
`

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 2rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateX(-2px);
  }
`

const Title = styled.h1`
  color: #E91E63;
  font-size: 2rem;
  margin-bottom: 1rem;
`

const OrderBox = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
` 

const Section = styled.div`
  margin-bottom: 1rem;
`

const Loading = styled.div`
  text-align: center;
  padding: 4rem 0;
`

const ErrorMessage = styled.div`
  background: #FFEBEE;
  color: #C62828;
  padding: 1rem;
  border-radius: 6px;
`

const InvoiceLink = styled.a`
  color: #C9A876;
  font-weight: 600;
`

const OrderSuccess: React.FC = () => {
  const { reference } = useParams<{ reference: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<any | null>(null)

  useEffect(() => {
    const verify = async () => {
      if (!reference) {
        navigate('/')
        return
      }

      try {
        setLoading(true)
        const response = await api.post('/payments/verify', { reference })
        const payload = response.data?.data || response.data

        if (payload?.order) {
          setOrder(payload.order)
        } else if (payload?.orderId) {
          // fetch order details
          const orderResp = await api.get(`/orders/${payload.orderId}`)
          setOrder(orderResp.data?.data || orderResp.data)
        } else {
          // No order found; show generic success info
          setOrder(null)
        }
      } catch (err: any) {
        console.error('Verification failed:', err)
        setError(err.response?.data?.error || err.message || 'Verification failed')
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [reference, navigate])

  // Auto-download invoice if present - moved BEFORE conditional returns to avoid hook order violation
  useEffect(() => {
    const autoDownload = async () => {
      try {
        if (order && order._id) {
          // If invoice reference present on order, download it; otherwise try to fetch invoice by order
          const invoiceId = order.invoice?._id
          let invId = invoiceId
          if (!invId) {
            try {
              const resp = await invoiceAPI.getOrderInvoice(order._id)
              invId = resp.data?._id || resp._id || (resp.data && resp.data._id)
            } catch (e) {
              // no invoice yet
              invId = null
            }
          }

          if (invId) {
            // trigger download
            await invoiceAPI.downloadPDF(invId)
          }
        }
      } catch (e) {
        console.warn('Auto-download invoice failed:', e)
      }
    }

    autoDownload()
  }, [order])

  return (
    <Container>
      <BackButton onClick={() => navigate('/')}>
        <Home size={18} />
        Back to Home
      </BackButton>

      <Title>Payment Successful</Title>

      {loading && (
        <Loading>Verifying payment...</Loading>
      )}

      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}

      {!loading && !error && order && (
          <OrderBox>
            <Section>
              <h3>Order Summary</h3>
              <div>Order: #{order.orderId || order._id?.toString().slice(-6).toUpperCase()}</div>
              <div>Status: {order.status}</div>
              <div>Total: ₦{order.pricing?.total?.toLocaleString()}</div>
            </Section>

            <Section>
              <h3>Invoice</h3>
              <div>
                <InvoiceLink href={`/invoices/${order.invoice?._id || ''}`} onClick={(e) => {
                  // If invoice id missing, try to navigate to invoices page
                  if (!order.invoice?._id) {
                    e.preventDefault()
                    navigate('/invoices')
                  }
                }}>
                  {order.invoice?.invoiceNumber || 'View Invoices'}
                </InvoiceLink>
              </div>
            </Section>

            <Section>
              <h3>Delivery Info</h3>
              <div>{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</div>
              <div>{order.shippingAddress?.address1}</div>
              <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.country}</div>
              <div>Phone: {order.shippingAddress?.phone}</div>
            </Section>
          </OrderBox>
      )}

      {!loading && !error && !order && (
        <OrderBox>
          <p>Payment was successful but we couldn't locate the associated order. If you don't see your order in your account, please contact support with reference: <strong>{reference}</strong></p>
        </OrderBox>
      )}
    </Container>
  )
}

export default OrderSuccess
