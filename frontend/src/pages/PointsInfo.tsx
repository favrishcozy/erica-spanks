import React from 'react'
import styled from 'styled-components'
import { Gift, AlertCircle } from 'lucide-react'

const ComingSoonPage = styled.div`
  max-width: 1000px;
  margin: 120px auto 60px;
  padding: 40px 24px;
  text-align: center;
`

const ComingSoon = () => {
  return (
    <ComingSoonPage>
      <Gift size={64} style={{ marginBottom: '24px', opacity: 0.8 }} />
      <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>Loyalty Points Program</h1>
      <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '24px' }}>
        Our loyalty points system is coming soon!
      </p>
      <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '32px' }}>
        Earn points with every purchase and redeem them for exclusive rewards.
      </p>
      <AlertCircle size={32} style={{ opacity: 0.6 }} />
      <div style={{ marginTop: '40px' }}>
        <p style={{ fontSize: '14px', opacity: 0.7 }}>
          We're working hard to bring you an amazing rewards program. Stay tuned for updates!
        </p>
      </div>
    </ComingSoonPage>
  )
}

export default ComingSoon
