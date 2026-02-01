import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Gift, ChevronDown, AlertCircle } from 'lucide-react'
import { usePoints } from '../hooks/usePoints'
import toast from 'react-hot-toast'

const Widget = styled.div`
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
  margin-bottom: 16px;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;

  h4 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
  }

  svg {
    color: #667eea;
  }
`

const Content = styled.div`
  margin-top: 16px;
`

const BalanceInfo = styled.div`
  background: white;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;

  .balance-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #666;
    }

    .value {
      font-weight: 600;
      color: #667eea;
    }
  }
`

const TierOption = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 8px;
  background: white;
  transition: all 0.2s;

  &:hover {
    border-color: #667eea;
    background: #f0f4ff;
  }

  &[data-selected='true'] {
    border-color: #667eea;
    background: #f0f4ff;
  }

  input[type='radio'] {
    cursor: pointer;
  }

  .tier-info {
    flex: 1;

    .tier-name {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .tier-description {
      font-size: 12px;
      color: #666;
    }
  }

  .discount-badge {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 14px;
    white-space: nowrap;
  }
`

const NoTiersMessage = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 12px;
  margin: 16px 0;
  font-size: 14px;
  display: flex;
  gap: 8px;

  svg {
    color: #ff9800;
    flex-shrink: 0;
  }
`

const ActionButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 12px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.div`
  background: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 6px;
  padding: 12px;
  margin: 12px 0;
  font-size: 14px;
  color: #c62828;
  display: flex;
  gap: 8px;

  svg {
    flex-shrink: 0;
  }
`

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

const PointsRedemptionWidget = ({ cartSubtotal = 0, onReservationCreated = null }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedTierId, setSelectedTierId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { balance, availableTiers, fetchAvailableTiers, reservePoints } = usePoints()

  // Fetch available tiers when cart subtotal changes
  useEffect(() => {
    if (isExpanded && cartSubtotal > 0) {
      fetchAvailableTiers(cartSubtotal)
    }
  }, [isExpanded, cartSubtotal, fetchAvailableTiers])

  if (!balance) {
    return null
  }

  const handleReserve = async () => {
    if (!selectedTierId) {
      setError('Please select a tier')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const reservation = await reservePoints(selectedTierId)

      if (reservation) {
        toast.success(`Reserved ${reservation.points_reserved} points!`)
        if (onReservationCreated) {
          onReservationCreated(reservation)
        }
        setIsExpanded(false)
        setSelectedTierId(null)
      } else {
        setError('Failed to reserve points')
      }
    } catch (err) {
      setError('An error occurred while reserving points')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const hasPoints = (balance?.current_balance ?? 0) > 0
  const hasEligibleTiers = (availableTiers?.length ?? 0) > 0

  return (
    <Widget>
      <Header onClick={() => setIsExpanded(!isExpanded)}>
        <h4>
          <Gift size={20} />
          Redeem Loyalty Points
          {hasPoints && <span style={{ fontSize: '12px', color: '#999' }}>({balance?.current_balance ?? 0})</span>}
        </h4>
        <ChevronDown
          size={20}
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s'
          }}
        />
      </Header>

      {isExpanded && (
        <Content>
          {/* Balance Information */}
          <BalanceInfo>
            <div className="balance-row">
              <span className="label">Available Points:</span>
              <span className="value">{(balance?.current_balance ?? 0).toLocaleString()}</span>
            </div>
            {(balance?.expiring_soon ?? 0) > 0 && (
              <div className="balance-row" style={{ color: '#ff9800' }}>
                <span className="label">Expiring Soon:</span>
                <span className="value">{balance.expiring_soon.toLocaleString()}</span>
              </div>
            )}
          </BalanceInfo>

          {/* Error Message */}
          {error && (
            <ErrorMessage>
              <AlertCircle size={18} />
              {error}
            </ErrorMessage>
          )}

          {/* Available Tiers */}
          {hasEligibleTiers ? (
            <>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                Select a discount tier to redeem:
              </p>
              {(availableTiers ?? []).map((tier) => {
                const discountText =
                  tier.discount_type === 'fixed'
                    ? `₦${tier.discount_value.toLocaleString()} off`
                    : `${tier.discount_value}% off`

                return (
                  <TierOption
                    key={tier._id}
                    data-selected={selectedTierId === tier._id ? 'true' : 'false'}
                    onClick={() => setSelectedTierId(tier._id)}
                  >
                    <input
                      type="radio"
                      name="points-tier"
                      value={tier._id}
                      checked={selectedTierId === tier._id}
                      onChange={() => setSelectedTierId(tier._id)}
                    />
                    <div className="tier-info">
                      <div className="tier-name">{tier.points_required} Points Tier</div>
                      <div className="tier-description">
                        Min order: ₦{tier.minimum_order_value.toLocaleString()}
                      </div>
                    </div>
                    <div className="discount-badge">{discountText}</div>
                  </TierOption>
                )
              })}

              <ActionButton onClick={handleReserve} disabled={isLoading || !selectedTierId}>
                {isLoading ? (
                  <>
                    <LoadingSpinner /> Reserving...
                  </>
                ) : (
                  'Reserve Points'
                )}
              </ActionButton>
            </>
          ) : (
            <NoTiersMessage>
              <AlertCircle size={18} />
              <div>
                {cartSubtotal === 0
                  ? 'Add items to your cart to view available redemption tiers.'
                  : `You don't have enough points or your cart doesn't meet the minimum requirements for any tier.`}
              </div>
            </NoTiersMessage>
          )}
        </Content>
      )}
    </Widget>
  )
}

export default PointsRedemptionWidget
