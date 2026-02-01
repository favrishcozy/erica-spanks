import React, { useState } from 'react'
import styled from 'styled-components'
import { Gift, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { usePoints } from '../../hooks/usePoints'

const PointsContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 24px;
  color: white;
  margin-bottom: 24px;
`

const PointsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
`

const BalanceDisplay = styled.div`
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 16px;
`

const BalanceLabel = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-top: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 8px;
  backdrop-filter: blur(10px);

  svg {
    margin-bottom: 8px;
    width: 24px;
    height: 24px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 12px;
    opacity: 0.9;
  }
`

const WarningBox = styled.div`
  background: rgba(255, 193, 7, 0.1);
  border-left: 4px solid #ffc107;
  padding: 12px;
  border-radius: 4px;
  display: flex;
  gap: 12px;
  margin-top: 16px;
  font-size: 14px;

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`

const FrozenBanner = styled.div`
  background: rgba(255, 87, 34, 0.1);
  border-left: 4px solid #ff5722;
  padding: 16px;
  border-radius: 4px;
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  color: #ff5722;

  svg {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }

  .freeze-info {
    font-size: 14px;

    .reason {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .frozen-date {
      font-size: 12px;
      opacity: 0.8;
    }
  }
`

const TransactionHistory = styled.div`
  margin-top: 24px;
`

const TransactionTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th {
    text-align: left;
    padding: 12px;
    background: #f5f5f5;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    border-bottom: 2px solid #e0e0e0;
  }

  td {
    padding: 12px;
    border-bottom: 1px solid #e0e0e0;
    font-size: 14px;
  }

  tr:hover {
    background: #fafafa;
  }
`

const TypeBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;

  &[data-type='earned'] {
    background: #e8f5e9;
    color: #2e7d32;
  }

  &[data-type='redeemed'] {
    background: #fff3e0;
    color: #e65100;
  }

  &[data-type='expired'] {
    background: #fce4ec;
    color: #c2185b;
  }

  &[data-type='refunded'] {
    background: #e3f2fd;
    color: #1565c0;
  }

  &[data-type='reversal'] {
    background: #f3e5f5;
    color: #6a1b9a;
  }
`

const LoadingState = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;

  p {
    margin: 8px 0;
  }
`

const PointsBalance = () => {
  const { balance, history, loading, error } = usePoints()
  const [showHistory, setShowHistory] = useState(false)

  if (loading) {
    return (
      <LoadingState>
        <p>Loading points information...</p>
      </LoadingState>
    )
  }

  if (!balance) {
    return (
      <EmptyState>
        <Gift size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p>No points information available</p>
      </EmptyState>
    )
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTransactionType = (type) => {
    const types = {
      earned: 'Earned',
      redeemed: 'Redeemed',
      expired: 'Expired',
      refunded: 'Refunded',
      reversal: 'Reversed',
      admin_adjustment: 'Admin Adjustment'
    }
    return types[type] || type
  }

  return (
    <>
      {/* Main Points Balance Card */}
      <PointsContainer>
        <PointsHeader>
          <h2>Loyalty Points</h2>
          <Gift size={32} />
        </PointsHeader>

        {/* Show frozen notice if account is frozen */}
        {balance.is_frozen && (
          <FrozenBanner>
            <AlertCircle />
            <div className="freeze-info">
              <div className="reason">Account Frozen: {balance.freeze_reason}</div>
              <div className="frozen-date">Frozen on {formatDate(balance.frozen_at)}</div>
            </div>
          </FrozenBanner>
        )}

        {/* Current Balance */}
        <BalanceDisplay>{balance.current_balance.toLocaleString()}</BalanceDisplay>
        <BalanceLabel>Available Points</BalanceLabel>

        {/* Stats Grid */}
        <StatsGrid>
          <StatCard>
            <TrendingUp />
            <div className="stat-value">{balance.total_earned.toLocaleString()}</div>
            <div className="stat-label">Total Earned</div>
          </StatCard>
          <StatCard>
            <Gift />
            <div className="stat-value">{balance.total_redeemed.toLocaleString()}</div>
            <div className="stat-label">Total Redeemed</div>
          </StatCard>
          <StatCard>
            <Clock />
            <div className="stat-value">{balance.expiring_soon.toLocaleString()}</div>
            <div className="stat-label">Expiring Soon</div>
          </StatCard>
        </StatsGrid>

        {/* Warning if points expiring soon */}
        {balance.expiring_soon > 0 && (
          <WarningBox>
            <AlertCircle />
            <div>
              You have <strong>{balance.expiring_soon.toLocaleString()} points</strong> expiring within the next 30 days.
              Redeem them now to avoid losing them!
            </div>
          </WarningBox>
        )}
      </PointsContainer>

      {/* Transaction History */}
      <TransactionHistory>
        <h3 style={{ marginBottom: '16px', cursor: 'pointer' }} onClick={() => setShowHistory(!showHistory)}>
          Transaction History {showHistory ? '▼' : '▶'}
        </h3>

        {showHistory && history.length > 0 ? (
          <TransactionTable>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
                {history.some(t => t.expiry_date) && <th>Expires</th>}
              </tr>
            </thead>
            <tbody>
              {history.map((tx) => (
                <tr key={tx._id}>
                  <td>{formatDate(tx.createdAt)}</td>
                  <td>
                    <TypeBadge data-type={tx.type}>{getTransactionType(tx.type)}</TypeBadge>
                  </td>
                  <td>
                    <strong>{tx.amount.toLocaleString()}</strong>
                  </td>
                  <td>{tx.reason}</td>
                  {history.some(t => t.expiry_date) && <td>{tx.expiry_date ? formatDate(tx.expiry_date) : '—'}</td>}
                </tr>
              ))}
            </tbody>
          </TransactionTable>
        ) : (
          showHistory && (
            <EmptyState>
              <p>No transactions yet</p>
            </EmptyState>
          )
        )}
      </TransactionHistory>

      {error && (
        <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginTop: '16px' }}>
          Error: {error}
        </div>
      )}
    </>
  )
}

export default PointsBalance
