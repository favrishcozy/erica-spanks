// components/AuthStyles.tsx
import styled from 'styled-components'

export const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #fdf7f0, #E8D4B8);
`

export const FormWrapper = styled.div`
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
  animation: fadeIn 0.5s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`

export const Title = styled.h1`
  color: #C9A876;
  margin-bottom: 10px;
  font-size: 28px;
  font-weight: 700;
`

export const Subtitle = styled.p`
  color: #757575;
  margin-bottom: 25px;
`

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border-radius: 10px;
  border: 1px solid #E0E0E0;
  font-size: 16px;
  transition: all 0.2s ease;

  &:focus {
    border-color: #C9A876;
    outline: none;
    box-shadow: 0 0 0 2px rgba(201, 168, 118, 0.2);
  }
`

export const AuthButton = styled.button`
  width: 100%;
  background: #C9A876;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #B8956A;
  }
`

export const SwitchText = styled.p`
  margin-top: 20px;
  color: #757575;

  a {
    color: #C9A876;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: #B8956A;
    }
  }
`
export const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #fcc;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`

export const SuccessMessage = styled.div`
  background: #efe;
  color: #363;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #cfc;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`

// Update Button to handle disabled state
export const Button = styled.button<{ disabled?: boolean }>`
  width: 100%;
  padding: 1rem;
  background: ${props => props.disabled ? '#ccc' : '#000'};
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.2s;

  &:hover {
    background: ${props => props.disabled ? '#ccc' : '#333'};
  }
`
