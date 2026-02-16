import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useNavigate, useParams } from 'react-router-dom'
import api, { orderAPI, invoiceAPI } from '../services/api'
import toast from 'react-hot-toast'

const Container = styled.div`
  max-width: 900px;
  margin: 96px auto;
  padding: 2rem;
`

const Card = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
`

const Button = styled.button`
  background: #C9A876;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
`

const OrderFailed: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return
      try {
        setLoading(true)
        const resp = await api.get(`/orders/${orderId}`)
        setOrder(resp.data?.data || resp.data)
      } catch (err) {
        console.error('Failed to load order:', err)
      } finally { setLoading(false) }
    }

    fetchOrder()
  }, [orderId])

  const handleRetry = async () => {
    if (!orderId) return
    try {
      setLoading(true)
      const resp = await orderAPI.retryPayment(orderId)
      const init = resp.data?.paymentInitialization || resp.paymentInitialization || resp.data
      if (init?.authorizationUrl) {
        // store pending order and redirect to Paystack
        localStorage.setItem('pendingOrderId', orderId)
        window.location.href = init.authorizationUrl
      } else {
        toast.error('Failed to initialize payment')
      }
    } catch (err: any) {
      console.error('Retry failed:', err)
      toast.error(err?.message || 'Retry failed')
    } finally { setLoading(false) }
  }

  return (
    <Container>
      <h1>Payment Failed</h1>
      <Card>
        <p>Your payment was not completed. Your order has been saved so you can try again.</p>
        {order && (
          <div style={{ marginBottom: '12px' }}>
            <div>Order: #{order.orderId || order._id?.toString().slice(-6).toUpperCase()}</div>
            <div>Total: ₦{order.pricing?.total?.toLocaleString()}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button onClick={handleRetry} disabled={loading}>Retry Payment</Button>
          <Button onClick={() => navigate('/profile')}>View Orders</Button>
        </div>
      </Card>
    </Container>
  )
}

export default OrderFailed
