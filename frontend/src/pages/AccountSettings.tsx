import React, { useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../services/api'

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`

const BackButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #C9A876;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    color: #1a1a1a;
    transform: translateX(-4px);
  }
`

const Container = styled.div`
  max-width: 720px;
  margin: 120px auto 40px;
  padding: 24px;
  background: white;
  border-radius: 12px;
`

const Row = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`

const Input = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
`

const Button = styled.button`
  background: #D4AF37;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
`

const AccountSettings: React.FC = () => {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSave = async () => {
    setLoading(true)
    setMessage(null)
    try {
      await authAPI.updateProfile({ firstName, lastName, email })
      await refreshUser()
      setMessage('Profile updated')
    } catch (err) {
      console.error('Failed to update profile', err)
      setMessage('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/profile')}>
          <ArrowLeft size={20} />
          Back to Profile
        </BackButton>
      </Header>
      
      <h2>Account Settings</h2>
      <p>Update your basic account information.</p>

      <Row>
        <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" />
        <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
      </Row>

      <Row>
        <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      </Row>

      <div style={{ marginTop: 16 }}>
        <Button onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save changes'}</Button>
        {message && <span style={{ marginLeft: 12 }}>{message}</span>}
      </div>
    </Container>
  )
}

export default AccountSettings
