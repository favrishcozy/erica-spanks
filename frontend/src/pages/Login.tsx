import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { AuthContainer, FormWrapper, Title, Subtitle, Input, AuthButton, SwitchText, ErrorMessage, SuccessMessage } from '../components/AuthStyles'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/authService'

const PasswordInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`

const PasswordInput = styled(Input)`
  margin-bottom: 0;
  width: 100%;
  padding-right: 40px;
`

const ToggleButton = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #666;
  transition: color 0.2s ease;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #d63384;
  }
`

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get the intended destination or default to home
  const from = location.state?.from?.pathname || '/'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login({ email, password })
      
      // Get the user immediately after login to check role
      const user = authService.getUser()
      console.log('[Login] User logged in:', user?.email, 'Role:', user?.role)
      
      // Redirect based on user role
      if (user?.role === 'admin') {
        console.log('[Login] Admin user detected, redirecting to admin dashboard')
        navigate('/admin/dashboard', { replace: true })
      } else {
        console.log('[Login] Regular user, redirecting to:', from)
        navigate(from, { replace: true })
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContainer>
      <FormWrapper>
        <Title>Welcome Back</Title>
        <Subtitle>Sign in to continue shopping</Subtitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <form onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          <PasswordInputWrapper>
            <PasswordInput
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <ToggleButton
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </ToggleButton>
          </PasswordInputWrapper>
          <AuthButton type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Login'}
          </AuthButton>
        </form>

        <SwitchText>
          Don't have an account? <Link to="/register">Create one</Link>
        </SwitchText>

        {/* Demo credentials hint */}
        <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666', textAlign: 'center' }}>
          <p>Demo: test@example.com / password</p>
        </div>
      </FormWrapper>
    </AuthContainer>
  )
}

export default Login