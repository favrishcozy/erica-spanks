import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`

const Content = styled.div`
  text-align: center;
  color: white;

  h1 {
    margin-bottom: 1rem;
    font-size: 2rem;
  }

  p {
    margin-bottom: 1.5rem;
  }
`

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  margin: 2rem auto;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

export default function OrderVerify() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const reference = searchParams.get('reference')
    const accessCode = searchParams.get('access_code')

    if (reference) {
      // Redirect to success page with the reference
      // Paystack callback URL will have ?reference=xxx&access_code=yyy
      navigate(`/order/success/${reference}`, { replace: true })
    } else {
      // No reference found, redirect to checkout
      console.warn('No payment reference found in callback')
      setTimeout(() => {
        navigate('/checkout', { replace: true })
      }, 2000)
    }
  }, [searchParams, navigate])

  return (
    <Container>
      <Content>
        <h1>Processing Your Payment</h1>
        <p>Please wait while we verify your payment...</p>
        <Spinner />
      </Content>
    </Container>
  )
}
