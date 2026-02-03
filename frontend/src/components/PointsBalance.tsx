import React from 'react'
import styled from 'styled-components'
import { Gift, AlertCircle } from 'lucide-react'

const ComingSoonContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 48px;
  color: white;
  text-align: center;
  margin-bottom: 24px;
`

const ComingSoon = () => {
  return (
    <ComingSoonContainer>
      <Gift size={64} style={{ marginBottom: '24px', opacity: 0.8 }} />
      <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>Loyalty Points</h2>
      <p style={{ fontSize: '18px', opacity: 0.9, marginBottom: '24px' }}>
        Our loyalty points system is coming soon!
      </p>
      <p style={{ fontSize: '16px', opacity: 0.8 }}>
        Earn points with every purchase and redeem them for exclusive rewards.
      </p>
      <AlertCircle size={32} style={{ marginTop: '24px', opacity: 0.6 }} />
    </ComingSoonContainer>
  )
}

export default ComingSoon
