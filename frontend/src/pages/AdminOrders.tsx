import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Package, Edit2, Filter, X, ArrowLeft } from 'lucide-react'
import { IconOnlyButton, DashboardHeader, Avatar } from '../components/admin/UI'
import api from '../services/api'
import toast from 'react-hot-toast'

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
  background: #f8f9fa;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 16px;
    margin: 0;
    min-height: 100vh;
    background: #ffffff;
  }
`

const Header = styled.div`
  background: linear-gradient(135deg, #D4AF37 0%, #c99820 100%);
  color: white;
  padding: 24px;
  margin: -40px -24px 32px -24px;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.25);
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
    margin: -40px -16px 32px -16px;
    width: calc(100% + 32px);
    padding: 16px;
    flex-wrap: wrap;
    gap: 12px;
    border-radius: 0 0 16px 16px;
  }
`

const Controls = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #1a1a1a;
  transition: all 0.3s ease;
  min-width: 120px;

  &:hover {
    border-color: #ff1493;
    color: #ff1493;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 14px;
    min-width: auto;
    flex: 1;
    justify-content: center;
  }
`

const StatusFilter = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`

const StatusTag = styled.button<{ $active?: boolean }>`
  padding: 8px 16px;
  border: 2px solid ${({ $active }) => ($active ? '#ff1493' : '#e0e0e0')};
  background: ${({ $active }) => ($active ? '#fff5f9' : 'white')};
  color: ${({ $active }) => ($active ? '#ff1493' : '#666')};
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: #ff1493;
    color: #ff1493;
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
  }
`

const Table = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  overflow-x: auto;

  @media (max-width: 768px) {
    display: grid;
    gap: 12px;
    border-radius: 0;
    margin: 0 -16px;
    width: calc(100% + 32px);
  }
`

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1.5fr 1.2fr 0.8fr;
  gap: 16px;
  padding: 16px 24px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 700;
  color: #999;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    display: none;
  }
`

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1.5fr 1.2fr 0.8fr;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
  align-items: center;
  transition: background 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    display: block;
    padding: 16px;
    background: #f8f9fa;
    margin: 0 16px;
    border-radius: 8px;
    border-bottom: none;
  }
`

const OrderCell = styled.div`
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    &::before {
      content: attr(data-label);
      font-weight: 600;
      color: #999;
      font-size: 0.85rem;
    }
  }
`

const OrderNumber = styled.span`
  font-weight: 700;
  color: #1a1a1a;
`

const CustomerName = styled.span`
  color: #1a1a1a;
`

const Amount = styled.span`
  font-weight: 600;
  color: #4CAF50;
`

const StatusBadge = styled.span<{ $status?: string }>`
  display: inline-block;
  background: ${({ $status }) => {
    switch ($status) {
      case 'confirmed': return '#E8F5E9'
      case 'processing': return '#E3F2FD'
      case 'shipped': return '#FFF3E0'
      case 'delivered': return '#F1F8E9'
      case 'pending': return '#F5F5F5'
      case 'cancelled': return '#FFEBEE'
      default: return '#F5F5F5'
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'confirmed': return '#2E7D32'
      case 'processing': return '#1565C0'
      case 'shipped': return '#E65100'
      case 'delivered': return '#558B2F'
      case 'pending': return '#666'
      case 'cancelled': return '#C62828'
      default: return '#666'
    }
  }};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
`

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s ease;

  &:hover {
    background: #ff1493;
    color: white;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
`

const PaginationButton = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  border: 2px solid ${({ $active }) => ($active ? '#ff1493' : '#e0e0e0')};
  background: ${({ $active }) => ($active ? '#ff1493' : 'white')};
  color: ${({ $active }) => ($active ? 'white' : '#1a1a1a')};
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff1493;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Modal = styled.div<{ $open?: boolean }>`
  display: ${({ $open }) => ($open ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #1a1a1a;
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  font-size: 24px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #1a1a1a;
  }
`

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 8px;
    color: #1a1a1a;
  }
`

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ff1493;
  }
`

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #ff1493;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;

  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 1rem;
  }
`

interface Order {
  _id: string
  status: string
  pricing: { total: number }
  user: { firstName: string; lastName: string; email: string }
  createdAt: string
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState('')
  const [updating, setUpdating] = useState(false)

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

  useEffect(() => {
    fetchOrders()
  }, [page, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(statusFilter && { status: statusFilter })
      })
      const response = await api.get(`/admin/orders?${params}`)
      setOrders(response.data?.data || [])
      setTotalPages(response.data?.pagination?.pages || 1)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) {
      toast.error('Please select a status')
      return
    }

    try {
      setUpdating(true)
      await api.put(`/orders/${selectedOrder._id}/status`, { status: newStatus })
      toast.success('Order status updated')
      setSelectedOrder(null)
      setNewStatus('')
      fetchOrders()
    } catch (error) {
      console.error('Failed to update order:', error)
      toast.error('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
  }

  const handleCloseModal = () => {
    setSelectedOrder(null)
    setNewStatus('')
  }

  return (
    <Container>
      <Header>
        <h1>
          <Package />
          Order Management
        </h1>
        <IconOnlyButton onClick={() => window.location.href = '/admin/dashboard'} aria-label="Back">
          <ArrowLeft />
        </IconOnlyButton>
      </Header>

      <Controls>
        <FilterButton onClick={() => setStatusFilter(null)}>
          <Filter size={16} />
          All Orders
        </FilterButton>
        <StatusFilter>
          {statuses.map((status) => (
            <StatusTag
              key={status}
              $active={statusFilter === status}
              onClick={() => {
                setStatusFilter(statusFilter === status ? null : status)
                setPage(1)
              }}
            >
              {status}
            </StatusTag>
          ))}
        </StatusFilter>
      </Controls>

      {loading ? (
        <Table>
          <EmptyState>
            <p>Loading orders...</p>
          </EmptyState>
        </Table>
      ) : orders.length === 0 ? (
        <Table>
          <EmptyState>
            <Package />
            <p>No orders found</p>
          </EmptyState>
        </Table>
      ) : (
        <>
          <Table>
            <TableHeader>
              <div>Order ID</div>
              <div>Customer</div>
              <div>Date</div>
              <div>Amount</div>
              <div>Status</div>
              <div>Actions</div>
            </TableHeader>

            {orders.map((order) => (
              <TableRow key={order._id}>
                <OrderCell data-label="Order ID">
                  <OrderNumber>
                    #{order._id.toString().slice(-6).toUpperCase()}
                  </OrderNumber>
                </OrderCell>
                <OrderCell data-label="Customer">
                  <CustomerName>
                    {order.user?.firstName} {order.user?.lastName}
                  </CustomerName>
                </OrderCell>
                <OrderCell data-label="Date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </OrderCell>
                <OrderCell data-label="Amount">
                  <Amount>₦{(order.pricing?.total || 0).toLocaleString()}</Amount>
                </OrderCell>
                <OrderCell data-label="Status">
                  <StatusBadge $status={order.status}>{order.status}</StatusBadge>
                </OrderCell>
                <OrderCell data-label="Actions">
                  <Actions>
                    <ActionButton onClick={() => handleViewDetails(order)}>
                      <Edit2 />
                    </ActionButton>
                  </Actions>
                </OrderCell>
              </TableRow>
            ))}
          </Table>

          {totalPages > 1 && (
            <Pagination>
              <PaginationButton
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                ←
              </PaginationButton>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationButton
                  key={p}
                  $active={page === p}
                  onClick={() => setPage(p)}
                >
                  {p}
                </PaginationButton>
              ))}
              <PaginationButton
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                →
              </PaginationButton>
            </Pagination>
          )}
        </>
      )}

      <Modal $open={!!selectedOrder}>
        <ModalContent>
          <ModalHeader>
            <h2>Update Order Status</h2>
            <CloseButton onClick={handleCloseModal}>
              <X size={20} />
            </CloseButton>
          </ModalHeader>

          {selectedOrder && (
            <>
              <FormGroup>
                <label>Order ID</label>
                <div style={{ color: '#1a1a1a', fontWeight: 600 }}>
                  #{selectedOrder._id.toString().slice(-6).toUpperCase()}
                </div>
              </FormGroup>

              <FormGroup>
                <label>Customer</label>
                <div style={{ color: '#1a1a1a' }}>
                  {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                </div>
              </FormGroup>

              <FormGroup>
                <label>Amount</label>
                <div style={{ color: '#1a1a1a', fontWeight: 600 }}>
                  ₦{(selectedOrder.pricing?.total || 0).toLocaleString()}
                </div>
              </FormGroup>

              <FormGroup>
                <label htmlFor="status">New Status</label>
                <Select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="">Select a status</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <SubmitButton
                onClick={handleUpdateStatus}
                disabled={updating || !newStatus}
              >
                {updating ? 'Updating...' : 'Update Status'}
              </SubmitButton>
            </>
          )}
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default AdminOrders
