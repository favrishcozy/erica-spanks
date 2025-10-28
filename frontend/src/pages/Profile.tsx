import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  text-align: center;
`

const Profile: React.FC = () => {
  return (
    <Container>
      <h1>Profile</h1>
      <p>User profile coming soon...</p>
    </Container>
  )
}

export default Profile
