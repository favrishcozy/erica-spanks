import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Users, Mail, Phone, Calendar, ChevronRight, ArrowLeft } from 'lucide-react'
import { IconOnlyButton, DashboardHeader, Avatar } from '../components/admin/UI'
import api from '../services/api'
import toast from 'react-hot-toast'

const Button = styled.button`
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

  &:hover {
    border-color: #ff1493;
    color: #ff1493;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

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
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 700;
  }

  p {
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    font-size: 0.95rem;
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

const UsersList = styled.div`
  display: grid;
  gap: 12px;
`

const UserCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`

const UserAvatar = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff1493 0%, #ff69b4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
`

const UserInfo = styled.div`
  flex: 1;
  margin-left: 16px;

  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
  }
`

const UserName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: #1a1a1a;
  font-weight: 700;
`

const UserDetails = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 12px;
  }
`

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 0.85rem;

  svg {
    width: 16px;
    height: 16px;
    color: #ff1493;
    flex-shrink: 0;
  }
`

const UserMeta = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    gap: 12px;
  }
`

const Badge = styled.span<{ $type?: string }>`
  display: inline-block;
  background: ${({ $type }) => ($type === 'admin' ? '#FFF3E0' : '#E3F2FD')};
  color: ${({ $type }) => ($type === 'admin' ? '#E65100' : '#1565C0')};
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
`

const ActionButton = styled.button`
  width: 40px;
  height: 40px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ff1493;
    color: #ff1493;
    background: #fff5f9;
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
  padding: 24px;
  background: white;
  border-radius: 12px;
  margin-top: 24px;
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

const Controls = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 10px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ff1493;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #999;

  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    opacity: 0.3;
  }

  p {
    margin: 0;
    font-size: 1rem;
  }
`

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 20, 147, 0.2);
  border-radius: 50%;
  border-top-color: #ff1493;
  animation: spin 1s ease-in-out infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: 'customer' | 'admin'
  createdAt: string
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [page, searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })
      const response = await api.get(`/admin/users?${params}`)
      let data = response.data?.data || []

      // Client-side filtering if search term provided
      if (searchTerm) {
        data = data.filter((user: User) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      setUsers(data)
      setTotalPages(response.data?.pagination?.pages || 1)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  return (
    <Container>
      <Header>
        <div>
          <h1>
            <Users />
            User Management
          </h1>
          <p>Manage all registered users and their accounts</p>
        </div>
        <IconOnlyButton onClick={() => window.location.href = '/admin/dashboard'} aria-label="Back">
          <ArrowLeft />
        </IconOnlyButton>
      </Header>

      <Controls>
        <SearchInput
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </Controls>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <LoadingSpinner />
        </div>
      ) : users.length === 0 ? (
        <EmptyState>
          <Users />
          <p>No users found</p>
        </EmptyState>
      ) : (
        <>
          <UsersList>
            {users.map((user) => (
              <UserCard key={user._id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flex: 1,
                    width: '100%'
                  }}
                >
                  <UserAvatar>
                    {getInitials(user.firstName, user.lastName)}
                  </UserAvatar>
                  <UserInfo>
                    <UserName>
                      {user.firstName} {user.lastName}
                    </UserName>
                    <UserDetails>
                      <DetailItem>
                        <Mail />
                        {user.email}
                      </DetailItem>
                      {user.phone && (
                        <DetailItem>
                          <Phone />
                          {user.phone}
                        </DetailItem>
                      )}
                      <DetailItem>
                        <Calendar />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </DetailItem>
                    </UserDetails>
                  </UserInfo>
                </div>
                <UserMeta>
                  <Badge $type={user.role}>{user.role}</Badge>
                  <ActionButton title="View details">
                    <ChevronRight />
                  </ActionButton>
                </UserMeta>
              </UserCard>
            ))}
          </UsersList>

          {totalPages > 1 && (
            <Pagination>
              <PaginationButton
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                ←
              </PaginationButton>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                return (
                  <PaginationButton
                    key={pageNum}
                    $active={page === pageNum}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </PaginationButton>
                )
              })}
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
    </Container>
  )
}

export default AdminUsers
