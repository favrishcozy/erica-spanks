import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { AuthContainer, FormWrapper, Title, Subtitle, Input, AuthButton, SwitchText, ErrorMessage, SuccessMessage } from '../components/AuthStyles'
import { useAuth } from '../contexts/AuthContext'

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
  color: #757575;
  transition: color 0.2s ease;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #C9A876;
  }
`

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions')
      return
    }

    setIsLoading(true)

    try {
      const { confirmPassword, acceptTerms, ...registerData } = formData
      await register(registerData)
      
      // Redirect to home page on successful registration
      navigate('/', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContainer>
      <FormWrapper>
        <Title>Create Account</Title>
        <Subtitle>Join Erica's Inspired elegance</Subtitle>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <form onSubmit={handleRegister}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <Input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          
          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          
          <Input
            type="tel"
            name="phone"
            placeholder="Phone Number (Optional)"
            value={formData.phone}
            onChange={handleChange}
            disabled={isLoading}
          />
          
          <PasswordInputWrapper>
            <PasswordInput
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleChange}
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
          
          <PasswordInputWrapper>
            <PasswordInput
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <ToggleButton
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
              title={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </ToggleButton>
          </PasswordInputWrapper>
          
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              disabled={isLoading}
              style={{ marginRight: '0.5rem' }}
            />
            <label style={{ fontSize: '0.875rem', color: '#666' }}>
              I agree to the Terms and Conditions
            </label>
          </div>
          
          <AuthButton type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </AuthButton>
        </form>

        <SwitchText>
          Already have an account? <Link to="/login">Login</Link>
        </SwitchText>
      </FormWrapper>
    </AuthContainer>
  )
}

export default Register