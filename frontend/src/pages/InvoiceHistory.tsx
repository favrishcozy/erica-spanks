import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronDown, Download, Loader, FileText, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { invoiceAPI } from '../services/api'

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.lg};
  padding-top: 120px;
  max-width: 1200px;
  margin: 0 auto;
`

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`

const BackButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.black};
    transform: translateX(-4px);
  }
`

const PageTitle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  color: ${({ theme }) => theme.colors.black};
  font-family: ${({ theme }) => theme.fonts.secondary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.borderRadius.lg};

  h3 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    color: ${({ theme }) => theme.colors.black};
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  p {
    color: ${({ theme }) => theme.colors.darkGray};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`

const InvoiceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`

const InvoiceCard = styled.div<{ isExpanded: boolean }>`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`

const InvoiceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  cursor: pointer;
  background: ${({ theme }) => theme.colors.background};
  transition: background 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.cream};
  }
`

const InvoiceInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  flex: 1;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.md};
  }
`

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};

  label {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.colors.darkGray};
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  span {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.black};
    font-weight: 500;
  }
`

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${({ $status }) => {
    switch ($status) {
      case 'draft':
        return `
          background: #f0f0f0;
          color: #666;
        `
      case 'sent':
        return `
          background: #e3f2fd;
          color: #1976d2;
        `
      case 'viewed':
        return `
          background: #fff3e0;
          color: #f57c00;
        `
      case 'paid':
        return `
          background: #e8f5e9;
          color: #388e3c;
        `
      default:
        return `
          background: #f0f0f0;
          color: #666;
        `
    }
  }}
`

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`

const ExpandIcon = styled.div<{ isExpanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
  transform: ${({ isExpanded }) => isExpanded ? 'rotate(180deg)' : 'rotate(0)'};
  transition: transform 0.3s ease;
`

const InvoiceDetails = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background: white;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`

const DetailSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }

  h4 {
    font-size: 0.95rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.black};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;

  thead {
    background: ${({ theme }) => theme.colors.background};
  }

  th {
    padding: ${({ theme }) => theme.spacing.md};
    text-align: left;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.black};
    border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  }

  td {
    padding: ${({ theme }) => theme.spacing.md};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.darkGray};
  }

  tr:last-child td {
    border-bottom: none;
  }
`

const BreakdownGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  label {
    color: ${({ theme }) => theme.colors.darkGray};
    font-size: 0.9rem;
  }

  span {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.black};
  }
`

const TotalAmount = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: 1.2rem;
  font-weight: 700;

  span:last-child {
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.5rem;
  }
`

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing['2xl']};
`

const PaginationButton = styled.button<{ disabled?: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: white;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  transition: all 0.3s ease;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${({ theme }) => theme.colors.darkGray};
`

interface Invoice {
  _id: string
  invoiceNumber: string
  customer: string
  amount: number
  status: 'draft' | 'sent' | 'viewed' | 'paid'
  createdAt: string
  dueDate?: string
  order?: any
  items?: any[]
  subtotal?: number
  tax?: number
  deliveryFee?: number
  discount?: number
}

const InvoiceHistory: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    fetchInvoices()
  }, [user, currentPage])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await invoiceAPI.getInvoices(currentPage, 10)
      
      if (response.success) {
        setInvoices(response.data || [])
        setTotalPages(response.totalPages || 1)
      } else {
        setInvoices([])
      }
    } catch (error: any) {
      console.error('Error fetching invoices:', error)
      toast.error(error.response?.data?.error || 'Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async (invoiceId: string) => {
    try {
      setDownloading(invoiceId)
      await invoiceAPI.downloadPDF(invoiceId)
      toast.success('Invoice downloaded successfully')
    } catch (error: any) {
      console.error('Error downloading invoice:', error)
      toast.error(error.response?.data?.error || 'Failed to download invoice')
    } finally {
      setDownloading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <Loader size={40} style={{ animation: 'spin 1s linear infinite' }} />
        </LoadingContainer>
      </Container>
    )
  }

  return (
    <Container>
      <PageHeader>
        <BackButton onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
          Back to Profile
        </BackButton>
        <PageTitle>
          <FileText size={32} />
          Invoice History
        </PageTitle>
      </PageHeader>

      {invoices.length === 0 ? (
        <EmptyState>
          <h3>No Invoices Yet</h3>
          <p>
            You don't have any invoices yet. Complete your first order to generate an invoice.
          </p>
        </EmptyState>
      ) : (
        <>
          <InvoiceList>
            {invoices.map((invoice) => (
              <InvoiceCard key={invoice._id} isExpanded={expandedId === invoice._id}>
                <InvoiceHeader onClick={() => setExpandedId(expandedId === invoice._id ? null : invoice._id)}>
                  <InvoiceInfo>
                    <InfoItem>
                      <label>Invoice Number</label>
                      <span>{invoice.invoiceNumber}</span>
                    </InfoItem>
                    <InfoItem>
                      <label>Amount</label>
                      <span style={{ color: '#C9A876', fontSize: '1.1rem' }}>
                        {formatCurrency(invoice.amount)}
                      </span>
                    </InfoItem>
                    <InfoItem>
                      <label>Date</label>
                      <span>{formatDate(invoice.createdAt)}</span>
                    </InfoItem>
                    <InfoItem>
                      <label>Status</label>
                      <StatusBadge $status={invoice.status}>
                        {invoice.status}
                      </StatusBadge>
                    </InfoItem>
                  </InvoiceInfo>

                  <Actions>
                    <ActionButton
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDownloadPDF(invoice._id)
                      }}
                      disabled={downloading === invoice._id}
                    >
                      {downloading === invoice._id ? (
                        <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <>
                          <Download size={18} />
                          PDF
                        </>
                      )}
                    </ActionButton>
                    <ExpandIcon isExpanded={expandedId === invoice._id}>
                      <ChevronDown size={20} />
                    </ExpandIcon>
                  </Actions>
                </InvoiceHeader>

                {expandedId === invoice._id && (
                  <InvoiceDetails>
                    {invoice.items && invoice.items.length > 0 && (
                      <DetailSection>
                        <h4>Items</h4>
                        <ItemsTable>
                          <thead>
                            <tr>
                              <th>Description</th>
                              <th style={{ textAlign: 'center' }}>Qty</th>
                              <th style={{ textAlign: 'right' }}>Unit Price</th>
                              <th style={{ textAlign: 'right' }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoice.items.map((item: any, idx: number) => (
                              <tr key={idx}>
                                <td>{item.description}</td>
                                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                <td style={{ textAlign: 'right' }}>
                                  {formatCurrency(item.unitPrice)}
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                  {formatCurrency(item.totalPrice)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </ItemsTable>
                      </DetailSection>
                    )}

                    <DetailSection>
                      <h4>Summary</h4>
                      <BreakdownGrid>
                        <BreakdownItem>
                          <label>Subtotal</label>
                          <span>{formatCurrency(invoice.subtotal || 0)}</span>
                        </BreakdownItem>
                        {invoice.deliveryFee ? (
                          <BreakdownItem>
                            <label>Delivery Fee</label>
                            <span>{formatCurrency(invoice.deliveryFee)}</span>
                          </BreakdownItem>
                        ) : null}
                        {invoice.tax ? (
                          <BreakdownItem>
                            <label>Tax</label>
                            <span>{formatCurrency(invoice.tax)}</span>
                          </BreakdownItem>
                        ) : null}
                        {invoice.discount ? (
                          <BreakdownItem>
                            <label>Discount</label>
                            <span>-{formatCurrency(invoice.discount)}</span>
                          </BreakdownItem>
                        ) : null}
                      </BreakdownGrid>

                      <div style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                        (VAT included)
                      </div>

                      <TotalAmount>
                        <span>Total Amount Due</span>
                        <span>{formatCurrency(invoice.amount)}</span>
                      </TotalAmount>
                    </DetailSection>
                  </InvoiceDetails>
                )}
              </InvoiceCard>
            ))}
          </InvoiceList>

          {totalPages > 1 && (
            <PaginationContainer>
              <PaginationButton
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </PaginationButton>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <PaginationButton
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next →
              </PaginationButton>
            </PaginationContainer>
          )}
        </>
      )}
    </Container>
  )
}

export default InvoiceHistory
