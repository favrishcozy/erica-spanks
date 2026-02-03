import React from 'react'
import styled from 'styled-components'
import { Gift, AlertCircle } from 'lucide-react'

const ComingSoonWidget = styled.div`
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  background: #fafafa;
  margin-bottom: 16px;
  text-align: center;
`

const ComingSoon = () => {
  return (
    <ComingSoonWidget>
      <Gift size={48} style={{ marginBottom: '16px', opacity: 0.8 }} />
      <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Redeem Points</h3>
      <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '16px' }}>
        Points redemption is coming soon!
      </p>
      <p style={{ fontSize: '14px', opacity: 0.8 }}>
        Start earning points with your purchases and redeem them for exclusive discounts.
      </p>
      <AlertCircle size={24} style={{ marginTop: '16px', opacity: 0.6 }} />
    </ComingSoonWidget>
  )
}

export default ComingSoon
