import styled from 'styled-components'

export const DashboardHeader = styled.div`
  background: linear-gradient(135deg, #C9A876 0%, #1a1a1a 100%);
  color: white;
  padding: 20px 16px;
  margin: -40px -24px 32px -24px;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 8px 24px rgba(212, 175, 55, 0.25);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    margin: -40px -16px 24px -16px;
    width: calc(100% + 32px);
    padding: 12px 16px;
    flex-wrap: wrap;
    border-radius: 0 0 16px 16px;
    gap: 12px;
  }
`

export const Avatar = styled.div`
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
  color: white;

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
`

export const DesktopStatsWrapper = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`

export const SmallStatsGrid = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 16px;
    padding: 0 4px;
  }
`

export const SquareStatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  aspect-ratio: 1/1;
  min-width: 0;
  font-weight: 700;
  font-size: 0.9rem;
  border-top: 3px solid #C9A876;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
  }
`

export const IconOnlyButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 0;
  background: rgba(255,255,255,0.25);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255,255,255,0.35);
    transform: scale(1.05);
  }

  svg { 
    width: 18px; 
    height: 18px; 
  }
`

export const TextButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 8px;
  border: 0;
  background: rgba(255,255,255,0.25);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  color: white;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255,255,255,0.35);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255,255,255,0.3);
  }

  svg { 
    width: 16px; 
    height: 16px; 
  }

  @media(max-width: 768px) { display: none; }
`