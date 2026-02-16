import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import toast from 'react-hot-toast'
import { X, Edit2, Loader } from 'lucide-react'
import api from '../../services/api'

const ManagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const ManagerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h2 {
    font-size: 1.5rem;
    color: #1a1a1a;
    margin: 0;
    font-weight: 700;
  }
`

const ControlsBar = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Select = styled.select`
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #C9A876;
    box-shadow: 0 0 0 3px rgba(201, 168, 118, 0.1);
  }
`

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;

  thead {
    background: #f8f9fa;
    border-bottom: 2px solid #e0e0e0;
  }

  th {
    padding: 16px;
    text-align: left;
    font-weight: 700;
    color: #1a1a1a;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
  }

  td {
    padding: 14px 16px;
    border-bottom: 1px solid #f0f0f0;
    color: #555;
  }

  tr:hover {
    background: #f8f9fa;
  }

  tr:last-child td {
    border-bottom: none;
  }
`

const PriceCell = styled.span`
  font-weight: 600;
  color: #C9A876;
  font-size: 1.05rem;
`

const ActionButton = styled.button`
  background: #C9A876;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.85rem;

  &:hover {
    background: #1a1a1a;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #888;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #888;

  p {
    margin: 0;
    font-size: 0.95rem;
  }
`

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
`

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    padding: 24px;
  }
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h3 {
    font-size: 1.3rem;
    margin: 0;
    color: #1a1a1a;
    font-weight: 700;
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  transition: color 0.3s ease;

  &:hover {
    color: #1a1a1a;
  }
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;

  label {
    font-weight: 600;
    color: #1a1a1a;
    font-size: 0.95rem;
  }
`

const Input = styled.input`
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #C9A876;
    box-shadow: 0 0 0 3px rgba(201, 168, 118, 0.1);
  }
`

const ModalActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
`

const PrimaryButton = styled.button`
  background: #C9A876;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background: #1a1a1a;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const SecondaryButton = styled.button`
  background: transparent;
  color: #666;
  border: 1px solid #ddd;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    border-color: #C9A876;
    color: #C9A876;
  }
`

const InfoText = styled.p`
  font-size: 0.85rem;
  color: #888;
  margin: 0;
`

interface Fee {
  _id: string
  fromZone: string
  toZone: string
  price: number
  isActive: boolean
  previousPrice?: number
  updatedBy?: string
  priceUpdatedAt?: string
}

const ShippingFeeManager: React.FC = () => {
  const [fees, setFees] = useState<Fee[]>([])
  const [loading, setLoading] = useState(true)
  const [filteredFees, setFilteredFees] = useState<Fee[]>([])
  const [selectedFromZone, setSelectedFromZone] = useState('all')
  const [selectedToZone, setSelectedToZone] = useState('all')
  const [zones, setZones] = useState<string[]>([])
  const [editingFee, setEditingFee] = useState<Fee | null>(null)
  const [newPrice, setNewPrice] = useState('')
  const [updating, setUpdating] = useState(false)

  // Zones list
  const ZONES = [
    'MAINLAND_A', 'MAINLAND_B', 'MAINLAND_C', 'MAINLAND_D', 
    'MAINLAND_E', 'MAINLAND_F', 'MAINLAND_G',
    'ISLAND_A', 'ISLAND_B', 'ISLAND_C'
  ]

  useEffect(() => {
    fetchFees()
    setZones(ZONES)
  }, [])

  useEffect(() => {
    filterFees()
  }, [fees, selectedFromZone, selectedToZone])

  const fetchFees = async () => {
    try {
      setLoading(true)
      // Try the admin endpoint first, then fall back to public endpoint
      let response
      try {
        response = await api.get('/shipping/fees')
      } catch (err) {
        // Try alternative endpoint if first fails
        console.log('Trying alternative endpoint...')
        response = await api.get('/api/shipping/fees')
      }
      
      if (response.data?.success || response.data?.data) {
        const feesData = response.data.data || response.data.fees || []
        setFees(Array.isArray(feesData) ? feesData : [])
      } else if (Array.isArray(response.data)) {
        // Handle case where response is directly an array
        setFees(response.data)
      } else {
        console.error('Unexpected response format:', response.data)
        toast.error('Failed to load delivery fees - unexpected format')
      }
    } catch (error: any) {
      console.error('Error fetching fees:', error)
      toast.error(error.response?.data?.error || 'Failed to load delivery fees')
      setFees([])
    } finally {
      setLoading(false)
    }
  }

  const filterFees = () => {
    let filtered = fees

    if (selectedFromZone !== 'all') {
      filtered = filtered.filter(f => f.fromZone === selectedFromZone)
    }

    if (selectedToZone !== 'all') {
      filtered = filtered.filter(f => f.toZone === selectedToZone)
    }

    setFilteredFees(filtered)
  }

  const handleEditClick = (fee: Fee) => {
    setEditingFee(fee)
    setNewPrice(fee.price.toString())
  }

  const handleUpdateFee = async () => {
    if (!editingFee) return

    const price = parseInt(newPrice)
    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid price')
      return
    }

    if (price === editingFee.price) {
      toast.info('Price unchanged')
      setEditingFee(null)
      return
    }

    try {
      setUpdating(true)
      const response = await api.put(
        `/shipping/fees/${editingFee.fromZone}/${editingFee.toZone}`,
        { price }
      )

      if (response.data?.success) {
        // Update local state
        setFees(fees.map(f => 
          f._id === editingFee._id 
            ? { ...f, price, previousPrice: editingFee.price }
            : f
        ))
        toast.success(`Fee updated: ₦${price.toLocaleString()}`)
        setEditingFee(null)
      }
    } catch (error: any) {
      console.error('Error updating fee:', error)
      toast.error(error.response?.data?.error || 'Failed to update fee')
    } finally {
      setUpdating(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <ManagerContainer>
      <ManagerHeader>
        <h2>Delivery Fee Management</h2>
      </ManagerHeader>

      <ControlsBar>
        <FormGroup style={{ marginBottom: 0 }}>
          <label>Filter by From Zone</label>
          <Select value={selectedFromZone} onChange={(e) => setSelectedFromZone(e.target.value)}>
            <option value="all">All Zones</option>
            {zones.map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup style={{ marginBottom: 0 }}>
          <label>Filter by To Zone</label>
          <Select value={selectedToZone} onChange={(e) => setSelectedToZone(e.target.value)}>
            <option value="all">All Zones</option>
            {zones.map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </Select>
        </FormGroup>
      </ControlsBar>

      <TableContainer>
        {loading ? (
          <LoadingContainer>
            <Loader size={32} style={{ animation: 'spin 1s linear infinite' }} />
          </LoadingContainer>
        ) : filteredFees.length === 0 ? (
          <EmptyState>
            <p>No delivery fees found</p>
          </EmptyState>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th>From Zone</th>
                  <th>To Zone</th>
                  <th>Current Price</th>
                  <th>Previous Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredFees.map((fee) => (
                  <tr key={fee._id}>
                    <td style={{ fontWeight: 600 }}>{fee.fromZone}</td>
                    <td style={{ fontWeight: 600 }}>{fee.toZone}</td>
                    <td>
                      <PriceCell>{formatPrice(fee.price)}</PriceCell>
                    </td>
                    <td>
                      {fee.previousPrice ? (
                        <span style={{ fontSize: '0.9rem', color: '#999' }}>
                          {formatPrice(fee.previousPrice)}
                        </span>
                      ) : (
                        <span style={{ color: '#ccc' }}>-</span>
                      )}
                    </td>
                    <td>
                      <ActionButton onClick={() => handleEditClick(fee)}>
                        <Edit2 size={16} />
                        Edit
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <InfoText style={{ padding: '16px', marginBottom: 0, borderTop: '1px solid #f0f0f0' }}>
              Showing {filteredFees.length} of {fees.length} delivery fees
            </InfoText>
          </>
        )}
      </TableContainer>

      {editingFee && (
        <ModalOverlay onClick={() => setEditingFee(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h3>Update Delivery Fee</h3>
              <CloseButton onClick={() => setEditingFee(null)}>
                <X size={24} />
              </CloseButton>
            </ModalHeader>

            <FormGroup>
              <label>Route</label>
              <Input
                type="text"
                value={`${editingFee.fromZone} → ${editingFee.toZone}`}
                disabled
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </FormGroup>

            <FormGroup>
              <label>Current Price</label>
              <Input
                type="text"
                value={formatPrice(editingFee.price)}
                disabled
                style={{ backgroundColor: '#f8f9fa' }}
              />
            </FormGroup>

            <FormGroup>
              <label>New Price (₦) *</label>
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Enter new price"
                min="0"
                disabled={updating}
              />
            </FormGroup>

            {editingFee.previousPrice && (
              <InfoText>
                Previous price: {formatPrice(editingFee.previousPrice)}
              </InfoText>
            )}

            <ModalActions>
              <SecondaryButton onClick={() => setEditingFee(null)} disabled={updating}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleUpdateFee} disabled={updating}>
                {updating ? (
                  <>
                    <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Updating...
                  </>
                ) : (
                  'Update Fee'
                )}
              </PrimaryButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </ManagerContainer>
  )
}

export default ShippingFeeManager
