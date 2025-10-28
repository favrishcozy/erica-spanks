import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthContainer, FormWrapper, Title, Subtitle, Input, AuthButton, SwitchText, ErrorMessage, SuccessMessage } from '../components/AuthStyles'
import { useAuth } from '../contexts/AuthContext'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      
      // Show success message
      setError('') // Clear any previous errors
      
      // Redirect to intended page or home
      navigate(from, { replace: true })
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
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
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