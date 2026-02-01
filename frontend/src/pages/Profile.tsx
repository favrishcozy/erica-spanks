import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useAuth } from '../contexts/AuthContext'
import { usePoints } from '../hooks/usePoints'
import api, { orderAPI } from '../services/api'
import { User, TrendingUp, ShoppingBag, Zap, Settings, LogOut, ArrowRight } from 'lucide-react'

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: #f8f9fa;
  min-height: 100vh;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 1rem;
  }
`

const PageHeader = styled.div`
  text-align: left;
  margin-bottom: 2.5rem;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  h1 {
    font-size: 2rem;
    color: #1a1a1a;
    margin: 0 0 0.5rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  p {
    font-size: 0.95rem;
    color: #666;
    margin: 0;
  }
`

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
  transition: all 0.3s ease;
  border-left: 4px solid #D4AF37;
  
  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`

const CardTitle = styled.h2`
  font-size: 1.2rem;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f0f0f0;
  
  strong {
    color: #333;
    font-weight: 600;
    font-size: 0.95rem;
  }
  
  span {
    color: #666;
    font-size: 0.95rem;
  }
`

const PointsStatCard = styled.div`
  background: linear-gradient(135deg, #D4AF37 0%, #F4E4C1 100%);
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
  color: #333;
  text-align: center;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.2);
  
  .label {
    font-size: 0.85rem;
    color: #555;
    margin-bottom: 6px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .value {
    font-size: 2rem;
    font-weight: 700;
  }
`

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
  
  th {
    background: #f8f9fa;
    padding: 12px;
    text-align: left;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #e9ecef;
    font-size: 0.85rem;
    text-transform: uppercase;
  }
  
  td {
    padding: 12px;
    border-bottom: 1px solid #e9ecef;
    color: #555;
  }
  
  tr:hover {
    background: #f8f9fa;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  .transaction-type {
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.8rem;
    display: inline-block;
    text-transform: capitalize;
    
    &.earned {
      background: #d4edda;
      color: #155724;
    }
    
    &.redeemed {
      background: #fff3cd;
      color: #856404;
    }
    
    &.expired {
      background: #f8d7da;
      color: #721c24;
    }
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  background-color: ${props => {
    switch (props.$variant) {
      case 'danger':
        return '#dc3545'
      case 'secondary':
        return '#e8e8e8'
      default:
        return '#D4AF37'
    }
  }};
  
  color: ${props => props.$variant === 'secondary' ? '#333' : 'white'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`

const LoadingMessage = styled.div`
  text-align: center;
  color: #666;
  padding: 2rem;
  font-size: 1rem;
`

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  border-left: 4px solid #721c24;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #999;
  font-style: italic;
  font-size: 0.95rem;
`

const Profile: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const { 
    balance, 
    history, 
    loading, 
    error, 
    fetchBalance, 
    fetchHistory 
  } = usePoints()
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchBalance()
      fetchHistory()
      fetchOrders()
    }
  }, [isAuthenticated, user])

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true)
      const response = await orderAPI.getMyOrders()
      setOrders(response.data?.data || response.data || [])
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setOrdersLoading(false)
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <PageContainer>
        <LoadingMessage>
          <h1>Profile</h1>
          <p>Please log in to view your profile.</p>
        </LoadingMessage>
      </PageContainer>
    )
  }

  const recentTransactions = Array.isArray(history) ? history.slice(0, 5) : []
  const totalOrders = orders.length
  const totalSpent = orders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0)

  return (
    <PageContainer>
      <PageHeader>
        <h1><User size={28} /> Welcome, {user.firstName}!</h1>
        <p>Manage your account, loyalty points, and preferences</p>
      </PageHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <DashboardGrid>
        {/* Points Overview */}
        <Card>
          <CardTitle><Zap size={20} /> Loyalty Points</CardTitle>
          {loading ? (
            <LoadingMessage>Loading points...</LoadingMessage>
          ) : (
            <>
              <PointsStatCard>
                <div className="label">Current Balance</div>
                <div className="value">{balance?.current_balance || 0}</div>
              </PointsStatCard>
              
              <InfoRow>
                <strong>Available:</strong>
                <span>{balance?.available_for_redemption || 0} points</span>
              </InfoRow>
              <InfoRow>
                <strong>Reserved:</strong>
                <span>{balance?.reserved_for_redemption || 0} points</span>
              </InfoRow>
              <InfoRow>
                <strong>Status:</strong>
                <span style={{ fontWeight: 600, color: balance?.account_frozen ? '#dc3545' : '#28a745' }}>
                  {balance?.account_frozen ? 'Frozen' : 'Active'}
                </span>
              </InfoRow>
              {balance?.expiring_soon_count > 0 && (
                <InfoRow style={{ color: '#ff9800', borderBottomColor: '#ffcc99' }}>
                  <strong style={{ color: '#ff9800' }}>Expiring Soon:</strong>
                  <span>{balance.expiring_soon_count} points</span>
                </InfoRow>
              )}
            </>
          )}
        </Card>

        {/* Account Information */}
        <Card>
          <CardTitle><User size={20} /> Account Information</CardTitle>
          <InfoRow>
            <strong>Name:</strong>
            <span>{user.firstName} {user.lastName}</span>
          </InfoRow>
          <InfoRow>
            <strong>Email:</strong>
            <span>{user.email}</span>
          </InfoRow>
          {user.phone && (
            <InfoRow>
              <strong>Phone:</strong>
              <span>{user.phone}</span>
            </InfoRow>
          )}
          <InfoRow>
            <strong>Role:</strong>
            <span>{user.role === 'admin' ? 'Administrator' : 'Customer'}</span>
          </InfoRow>
          <InfoRow>
            <strong>Account Status:</strong>
            <span style={{ color: '#28a745', fontWeight: 600 }}>Active</span>
          </InfoRow>
        </Card>

        {/* Purchase Statistics */}
        <Card>
          <CardTitle><TrendingUp size={20} /> Purchase Activity</CardTitle>
          <PointsStatCard style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="label" style={{ color: '#ddd' }}>Total Orders</div>
            <div className="value" style={{ color: 'white' }}>{totalOrders}</div>
          </PointsStatCard>
          <InfoRow>
            <strong>Total Spent:</strong>
            <span>₦{totalSpent.toLocaleString()}</span>
          </InfoRow>
          <InfoRow>
            <strong>Last Order:</strong>
            <span>
              {orders.length > 0
                ? new Date(orders[0]?.createdAt).toLocaleDateString()
                : 'No orders yet'}
            </span>
          </InfoRow>
          <InfoRow>
            <strong>Points Earned:</strong>
            <span>{balance?.total_earned || 0}</span>
          </InfoRow>
        </Card>
      </DashboardGrid>

      {/* Recent Transactions */}
      <Card style={{ marginBottom: '2rem' }}>
        <CardTitle><ShoppingBag size={20} /> Recent Activity</CardTitle>
        {loading ? (
          <LoadingMessage>Loading transactions...</LoadingMessage>
        ) : recentTransactions.length > 0 ? (
          <>
            <HistoryTable>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Points</th>
                  <th>Date</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td>
                      <span className={`transaction-type ${transaction.transaction_type}`}>
                        {transaction.transaction_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {transaction.transaction_type === 'redeemed' ? '-' : '+'}
                      {transaction.points_amount}
                    </td>
                    <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                    <td>{transaction.description || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </HistoryTable>
            <Button
              as="a"
              href="/account-settings"
              style={{ marginTop: '16px', display: 'inline-flex' }}
              $variant="secondary"
            >
              View All Transactions
              <ArrowRight size={16} />
            </Button>
          </>
        ) : (
          <EmptyState>No transaction history yet. Start earning points with your next purchase!</EmptyState>
        )}
      </Card>

      {/* Action Buttons */}
      <ButtonGroup>
        <Button $variant="primary" onClick={() => window.location.href = '/products'}>
          <ShoppingBag size={18} />
          Continue Shopping
        </Button>
        <Button $variant="secondary" onClick={() => window.location.href = '/account-settings'}>
          <Settings size={18} />
          Account Settings
        </Button>
        <Button $variant="danger" onClick={() => logout().then(() => window.location.href = '/login')}>
          <LogOut size={18} />
          Logout
        </Button>
      </ButtonGroup>
    </PageContainer>
  )
}

export default Profile
