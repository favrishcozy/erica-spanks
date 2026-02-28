import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { BarChart3, Users, Package, TrendingUp, Eye, ArrowRight, ArrowLeft, LogOut } from 'lucide-react'
import { DashboardHeader, Avatar, IconOnlyButton, TextButton, SmallStatsGrid, SquareStatCard, DesktopStatsWrapper } from '../components/admin/UI'
import { useAuth } from '../contexts/AuthContext'
import { Order } from '../types/Order'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import ShippingFeeManager from '../components/admin/ShippingFeeManager'

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
  background: #f8f9fa;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 0;
    margin: 0;
    min-height: 100vh;
    background: #ffffff;
    display: flex;
    flex-direction: column;
  }
`




const OrdersContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 32px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 16px;
    min-height: 180px;
  }
`

const OrderCard = styled.div<{ isActive?: boolean }>`
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f2f5 100%);
  border: 2px solid ${props => props.isActive ? '#C9A876' : '#e0e0e0'};
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  ${props => props.isActive && `
    border-color: #C9A876;
    box-shadow: 0 4px 16px rgba(212, 175, 55, 0.2);
    transform: translateY(-2px);
  `}

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 10px;
  }
`

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;

  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
`

const CardTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .order-id {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
  }

  .customer {
    font-size: 13px;
    color: #666;
    margin: 0;
  }

  @media (max-width: 768px) {
    .order-id {
      font-size: 14px;
    }

    .customer {
      font-size: 12px;
    }
  }
`

const StatusBadge = styled.span<{ $status: string }>`
  background: ${props => {
    switch (props.$status) {
      case 'pending':
        return '#fff3cd'
      case 'processing':
        return '#d1ecf1'
      case 'shipped':
        return '#d4edda'
      case 'delivered':
        return '#c8e6c9'
      default:
        return '#f8f9fa'
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'pending':
        return '#856404'
      case 'processing':
        return '#0c5460'
      case 'shipped':
        return '#155724'
      case 'delivered':
        return '#1b5e20'
      default:
        return '#333'
    }
  }};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  text-transform: capitalize;

  @media (max-width: 768px) {
    padding: 5px 10px;
    font-size: 11px;
  }
`

const CardPagination = styled.div`
  text-align: center;
  font-size: 13px;
  color: #888;
  margin-top: 12px;
  font-weight: 500;
`

const NavigationControls = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    gap: 10px;
    margin-top: 12px;
  }
`

const NavButton = styled.button<{ disabled?: boolean }>`
  background: #C9A876;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.4 : 1};

  &:hover:not(:disabled) {
    background: #1a1a1a;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
  }
`





const Header = styled.div`
  background: #1a1a1a;
  color: white;
  padding: 24px;
  margin: -40px -24px 32px -24px;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  h1 {
    font-size: 28px;
    color: white;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 700;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px;
    margin: -40px -16px 12px -16px;
    width: calc(100% + 32px);
    border-radius: 0;
    margin-top: 12px;
  }
`

// shared admin UI components are imported from ../components/admin/UI

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    gap: 12px;
  }
`


const WelcomeMessage = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  margin: 4px 0 0 0;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }
`

const IconWrapper = styled.div`
  width: 56px;
  height: 56px;
  background: #1a1a1a;
  border: 2px solid #C9A876;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C9A876;
  flex-shrink: 0;

  svg {
    width: 28px;
    height: 28px;
  }
`

const StatContent = styled.div`
  flex: 1;

  h3 {
    font-size: 0.875rem;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 8px 0;
    font-weight: 600;
  }

  .value {
    font-size: 2rem;
    color: #1a1a1a;
    font-weight: 700;
    margin: 0;
  }

  .label {
    font-size: 0.75rem;
    color: #ccc;
    margin-top: 4px;
  }
`

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 768px) {
    gap: 0;
    margin-top: 16px;
  }
`

const TabNavigation = styled.div`
  display: flex;
  gap: 16px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 12px;
  background: white;
  margin-bottom: 24px;
`

const TabButton = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.$active ? '#C9A876' : '#888'};
  border-bottom: ${props => props.$active ? '3px solid #C9A876' : 'none'};
  margin-bottom: ${props => props.$active ? '-15px' : '-12px'};
  transition: all 0.3s ease;

  &:hover {
    color: #C9A876;
  }
`

const TabContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    border-radius: 0;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border-bottom: 1px solid #f0f0f0;
    margin: 0;
  }
`

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: #1a1a1a;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    width: 20px;
    height: 20px;
    color: #C9A876;
  }
`

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`

const OrderItem = styled.div<{ $status?: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f8f9fa;
  border-left: 4px solid ${({ $status }) => {
    switch ($status) {
      case 'confirmed': return '#4CAF50'
      case 'processing': return '#2196F3'
      case 'shipped': return '#FF9800'
      case 'delivered': return '#8BC34A'
      default: return '#999'
    }
  }};
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: #e8e9eb;
  }
`

const OrderInfo = styled.div`
  flex: 1;

  .order-id {
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 4px 0;
    font-size: 0.95rem;
  }

  .customer {
    color: #666;
    font-size: 0.85rem;
    margin: 0;
  }
`

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
`

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #1a1a1a;
  transition: all 0.3s ease;
  text-align: left;

  &:hover {
    border-color: #C9A876;
    background: #fdf7f0;
    color: #C9A876;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #999;

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 0.95rem;
  }
`

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 20, 147, 0.2);
  border-radius: 50%;
  border-top-color: #C9A876;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

interface DashboardStats {
  users: number
  products: number
  orders: number
  totalRevenue: number
  recentOrders: Order[]
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [orderIndex, setOrderIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shipping'>('dashboard')
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  // Auto-play orders
  useEffect(() => {
    if (!stats?.recentOrders || stats.recentOrders.length === 0) return

    const total = stats.recentOrders.length
    
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current)
    }

    const interval = setInterval(() => {
      setOrderIndex(prev => (prev + 1) % total)
    }, 5000)

    autoPlayIntervalRef.current = interval

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current)
      }
    }
  }, [stats?.recentOrders])

  const goToPrevious = () => {
    if (stats?.recentOrders) {
      setOrderIndex(prev => (prev - 1 + stats.recentOrders.length) % stats.recentOrders.length)
    }
  }

  const goToNext = () => {
    if (stats?.recentOrders) {
      setOrderIndex(prev => (prev + 1) % stats.recentOrders.length)
    }
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      console.log('Fetching admin stats from /admin/stats')
      const response = await api.get('/admin/stats')
      console.log('Admin stats response:', response.data)
      setStats(response.data?.data)
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error)
      console.error('Error details:', error?.details || error?.message)
      toast.error(`Failed to load dashboard: ${error?.details?.error || error?.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <DashboardHeader>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar>{user?.firstName?.[0] || 'A'}</Avatar>
            <div>
              <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 /> Admin Dashboard
              </h1>
              <WelcomeMessage>Welcome back{user ? `, ${user.firstName}` : ''}!</WelcomeMessage>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <IconOnlyButton onClick={() => navigate('/') } aria-label="Back">
              <ArrowLeft />
            </IconOnlyButton>
            <IconOnlyButton onClick={async () => { await logout(); navigate('/'); }} aria-label="Logout">
              <LogOut />
            </IconOnlyButton>
          </div>
        </DashboardHeader>
        <StatsGrid>
          {[1, 2, 3, 4].map((i) => (
            <StatCard key={i}>
              <LoadingSpinner />
            </StatCard>
          ))}
        </StatsGrid>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', justifyContent: 'center', flexDirection: 'column', textAlign: 'center' }}>
          <Avatar>{user?.firstName?.[0] || 'A'}</Avatar>
          <div>
            <h1>Dashboard</h1>
            <WelcomeMessage>Welcome back, {user?.firstName}!</WelcomeMessage>
          </div>
        </div>
        <HeaderActions>
          <IconOnlyButton onClick={() => navigate('/')} aria-label="Back to home">
            <ArrowLeft size={20} />
          </IconOnlyButton>
          <IconOnlyButton onClick={async () => {
            try {
              await logout();
              navigate('/');
              toast.success('Logged out successfully');
            } catch (error) {
              // Clear local session even if backend logout fails
              localStorage.removeItem('authToken');
              localStorage.removeItem('userData');
              navigate('/');
            }
          }} aria-label="Logout">
            <LogOut size={20} />
          </IconOnlyButton>
        </HeaderActions>
      </Header>

      <SmallStatsGrid>
        <SquareStatCard>
          <div style={{ fontSize: 12, color: '#777' }}>Users</div>
          <div style={{ fontSize: 16 }}>{stats?.users || 0}</div>
        </SquareStatCard>
        <SquareStatCard>
          <div style={{ fontSize: 12, color: '#777' }}>Products</div>
          <div style={{ fontSize: 16 }}>{stats?.products || 0}</div>
        </SquareStatCard>
        <SquareStatCard>
          <div style={{ fontSize: 12, color: '#777' }}>Orders</div>
          <div style={{ fontSize: 16 }}>{stats?.orders || 0}</div>
        </SquareStatCard>
        <SquareStatCard>
          <div style={{ fontSize: 12, color: '#777' }}>Revenue</div>
          <div style={{ fontSize: 16 }}>₦{(stats?.totalRevenue || 0).toLocaleString()}</div>
        </SquareStatCard>
      </SmallStatsGrid>

      <DesktopStatsWrapper>
        <StatsGrid>
        <StatCard>
          <IconWrapper>
            <Users />
          </IconWrapper>
          <StatContent>
            <h3>Total Users</h3>
            <p className="value">{stats?.users || 0}</p>
            <p className="label">Active accounts</p>
          </StatContent>
        </StatCard>

        <StatCard>
          <IconWrapper>
            <Package />
          </IconWrapper>
          <StatContent>
            <h3>Total Products</h3>
            <p className="value">{stats?.products || 0}</p>
            <p className="label">In catalog</p>
          </StatContent>
        </StatCard>

        <StatCard>
          <IconWrapper>
            <Eye />
          </IconWrapper>
          <StatContent>
            <h3>Total Orders</h3>
            <p className="value">{stats?.orders || 0}</p>
            <p className="label">All time</p>
          </StatContent>
        </StatCard>

        <StatCard>
          <IconWrapper>
            <TrendingUp />
          </IconWrapper>
          <StatContent>
            <h3>Total Revenue</h3>
            <p className="value">₦{(stats?.totalRevenue || 0).toLocaleString()}</p>
            <p className="label">From confirmed orders</p>
          </StatContent>
        </StatCard>
      </StatsGrid>
      </DesktopStatsWrapper>

      <MainContent>
        {/* Tab Navigation */}
        <TabNavigation>
          <TabButton 
            $active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </TabButton>
          <TabButton 
            $active={activeTab === 'shipping'}
            onClick={() => setActiveTab('shipping')}
          >
            Delivery Fees
          </TabButton>
        </TabNavigation>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <TabContent>
        <Section>
          <SectionTitle>
            <Package />
            Recent Orders
          </SectionTitle>
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <OrdersContainer>
              {stats.recentOrders.map((order: Order, idx: number) => (
                <OrderCard key={order._id} isActive={idx === orderIndex}>
                  <CardHeader>
                    <CardTitle>
                      <p className="order-id">Order #{order._id.toString().slice(-6).toUpperCase()}</p>
                      <p className="customer">{order.user?.firstName} {order.user?.lastName}</p>
                    </CardTitle>
                    <StatusBadge $status={order.status}>{order.status}</StatusBadge>
                  </CardHeader>
                </OrderCard>
              ))}
              <CardPagination>
                Order {orderIndex + 1} of {stats.recentOrders.length}
              </CardPagination>
              <NavigationControls>
                <NavButton onClick={goToPrevious} disabled={stats.recentOrders.length <= 1}>
                  <ArrowLeft size={16} />
                  Previous
                </NavButton>
                <NavButton onClick={goToNext} disabled={stats.recentOrders.length <= 1}>
                  Next
                  <ArrowRight size={16} />
                </NavButton>
              </NavigationControls>
            </OrdersContainer>
          ) : (
            <EmptyState>
              <Package />
              <p>No orders yet</p>
            </EmptyState>
          )}
        </Section>

        <Section>
          <SectionTitle>
            <BarChart3 />
            Quick Actions
          </SectionTitle>
          <QuickActions>
            <ActionButton onClick={() => navigate('/admin/products')}>
              <span>Manage Products</span>
              <ArrowRight />
            </ActionButton>
            <ActionButton onClick={() => navigate('/admin/orders')}>
              <span>View All Orders</span>
              <ArrowRight />
            </ActionButton>
            <ActionButton onClick={() => navigate('/admin/users')}>
              <span>Manage Users</span>
              <ArrowRight />
            </ActionButton>
            <ActionButton onClick={() => navigate('/admin/newsletter')}>
              <span>Newsletter Manager</span>
              <ArrowRight />
            </ActionButton>
          </QuickActions>
        </Section>
          </TabContent>
        )}

        {/* Shipping Fees Tab */}
        {activeTab === 'shipping' && (
          <Section style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}>
            <ShippingFeeManager />
          </Section>
        )}
      </MainContent>
    </Container>
  )
}

export default AdminDashboard