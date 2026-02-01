import React from 'react'
import styled from 'styled-components'
import { Gift, TrendingUp, Award, Clock, AlertCircle } from 'lucide-react'
import { usePoints } from '../hooks/usePoints'

const Container = styled.div`
  max-width: 1000px;
  margin: 120px auto 60px;
  padding: 40px 24px;
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 50px;

  h1 {
    font-family: ${({ theme }) => theme.fonts.secondary};
    font-size: 48px;
    color: ${({ theme }) => theme.colors.black};
    margin-bottom: 12px;
  }

  p {
    font-size: 18px;
    color: ${({ theme }) => theme.colors.darkGray};
  }
`

const Section = styled.section`
  margin-bottom: 50px;
`

const SectionTitle = styled.h2`
  font-size: 28px;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    width: 32px;
    height: 32px;
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`

const Card = styled.div`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.lightGray};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.black};
    margin-bottom: 12px;
  }

  p {
    font-size: 14px;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.darkGray};
  }
`

const CalculationBox = styled.div`
  background: #f9f9f9;
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;

  h4 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: ${({ theme }) => theme.colors.black};
  }

  code {
    background: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 14px;
    display: block;
    margin: 8px 0;
    color: #d73a49;
  }

  p {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.darkGray};
    margin: 12px 0;
  }
`

const TierTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  border: 1px solid ${({ theme }) => theme.colors.lightGray};

  th {
    background: ${({ theme }) => theme.colors.cream};
    padding: 12px;
    text-align: left;
    font-weight: 600;
    border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  }

  td {
    padding: 12px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
  }

  tr:hover {
    background: #fafafa;
  }
`

const WarningBox = styled.div`
  background: #fffbea;
  border-left: 4px solid #ffc107;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  gap: 12px;
  margin: 20px 0;

  svg {
    flex-shrink: 0;
    color: #ff9800;
  }

  div {
    p {
      margin: 0;
      font-size: 14px;
      color: ${({ theme }) => theme.colors.darkGray};
      line-height: 1.6;
    }
  }
`

const PointsInfoPage: React.FC = () => {
  const { balance } = usePoints()

  return (
    <Container>
      <Header>
        <h1>🎁 Loyalty Points Program</h1>
        <p>Earn points on every purchase and redeem them for exclusive rewards!</p>
      </Header>

      {/* How It Works */}
      <Section>
        <SectionTitle>
          <TrendingUp />
          How It Works
        </SectionTitle>
        <Grid>
          <Card>
            <h3>💳 Earn Points</h3>
            <p>Every purchase earns you points. The more you spend, the more points you accumulate for future rewards.</p>
          </Card>
          <Card>
            <h3>📦 Automatic Calculation</h3>
            <p>Points are automatically calculated based on your order total. No codes, no sign-ups needed—they're added to your account instantly.</p>
          </Card>
          <Card>
            <h3>🎯 Redeem Rewards</h3>
            <p>Use your accumulated points at checkout to get discounts on your next purchase. Higher points = bigger savings!</p>
          </Card>
        </Grid>
      </Section>

      {/* Earning Points */}
      <Section>
        <SectionTitle>
          <Gift />
          Earning Points
        </SectionTitle>
        <CalculationBox>
          <h4>Points Calculation Formula</h4>
          <code>Points Earned = Order Total × 0.1</code>
          <p>Example: If you spend ₦10,000, you earn 1,000 points</p>
        </CalculationBox>
        <p>
          Points are credited to your account after your order is confirmed. You can start using them immediately at checkout on your next purchase.
        </p>
      </Section>

      {/* Redemption Tiers */}
      <Section>
        <SectionTitle>
          <Award />
          Redemption Tiers
        </SectionTitle>
        <p>Different point amounts unlock different discount levels:</p>
        <TierTable>
          <thead>
            <tr>
              <th>Points Required</th>
              <th>Discount Amount</th>
              <th>Minimum Order</th>
              <th>Benefit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>500</td>
              <td>₦500</td>
              <td>₦5,000</td>
              <td>Starter discount</td>
            </tr>
            <tr>
              <td>1,000</td>
              <td>₦1,200</td>
              <td>₦10,000</td>
              <td>Standard reward</td>
            </tr>
            <tr>
              <td>2,500</td>
              <td>₦3,500</td>
              <td>₦25,000</td>
              <td>Premium bonus</td>
            </tr>
            <tr>
              <td>5,000</td>
              <td>₦8,000</td>
              <td>₦50,000</td>
              <td>VIP exclusive</td>
            </tr>
          </tbody>
        </TierTable>
      </Section>

      {/* Point Expiration */}
      <Section>
        <SectionTitle>
          <Clock />
          Point Expiration & Policies
        </SectionTitle>
        <WarningBox>
          <AlertCircle />
          <div>
            <p>
              <strong>Expiration:</strong> Points expire 365 days from the date they were earned. Keep track of your expiration dates in your account dashboard to avoid losing points.
            </p>
          </div>
        </WarningBox>
        <ul style={{ fontSize: '14px', lineHeight: '1.8', color: '#666' }}>
          <li>Points are non-transferable and cannot be exchanged for cash</li>
          <li>Redeemed points cannot be restored if you cancel an order</li>
          <li>Points may be frozen or revoked for policy violations</li>
          <li>Account termination results in loss of all points</li>
        </ul>
      </Section>

      {/* Tips */}
      <Section>
        <SectionTitle>
          <TrendingUp />
          Maximize Your Rewards
        </SectionTitle>
        <Grid>
          <Card>
            <h3>Shop More, Save More</h3>
            <p>Build your points balance over time and redeem for larger discounts on bigger purchases.</p>
          </Card>
          <Card>
            <h3>Watch for Promotions</h3>
            <p>Special promotions may offer bonus points during sales or holidays—keep an eye on your email!</p>
          </Card>
          <Card>
            <h3>Use Before Expiry</h3>
            <p>Check your account to see expiration dates and use points before they expire to avoid losing your rewards.</p>
          </Card>
        </Grid>
      </Section>

      {/* Current Balance */}
      {balance && (
        <Section>
          <SectionTitle>
            <Gift />
            Your Points Status
          </SectionTitle>
          <Card style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F4E4C1 100%)', border: 'none' }}>
            <div style={{ color: '#333' }}>
              <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>
                ⭐ {balance.current_balance?.toLocaleString() || 0} Points
              </h3>
              <p><strong>Available for Redemption:</strong> {balance.available_for_redemption?.toLocaleString() || 0}</p>
              <p><strong>Total Earned:</strong> {balance.total_earned?.toLocaleString() || 0}</p>
              {balance.expiring_soon > 0 && (
                <p style={{ color: '#ff9800', marginTop: '8px' }}>
                  ⚠️ {balance.expiring_soon} points expiring soon!
                </p>
              )}
            </div>
          </Card>
        </Section>
      )}

      {/* Call to Action */}
      <Section style={{ textAlign: 'center', marginTop: '60px' }}>
        <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Ready to earn more?</h3>
        <a href="/products" style={{
          display: 'inline-block',
          background: '#D4AF37',
          color: 'white',
          padding: '12px 32px',
          borderRadius: '6px',
          textDecoration: 'none',
          fontWeight: '600',
          transition: 'background 0.3s ease'
        }} onMouseEnter={(e) => e.currentTarget.style.background = '#c99820'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#D4AF37'}>
          Start Shopping
        </a>
      </Section>
    </Container>
  )
}

export default PointsInfoPage
