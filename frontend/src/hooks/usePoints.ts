import { useState } from 'react'

/**
 * Mock usePoints hook for coming soon functionality
 */
export const usePoints = () => {
  const [balance, setBalance] = useState(null)
  const [history, setHistory] = useState([])
  const [availableTiers, setAvailableTiers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Mock functions that do nothing
  const fetchBalance = async () => {
    setLoading(false)
    setError('Points system is coming soon!')
  }

  const fetchHistory = async () => {
    setLoading(false)
    setError('Points system is coming soon!')
  }

  const fetchAvailableTiers = async () => {
    setLoading(false)
    setError('Points system is coming soon!')
  }

  const reservePoints = async () => {
    setLoading(false)
    setError('Points system is coming soon!')
  }

  const confirmRedemption = async () => {
    setLoading(false)
    setError('Points system is coming soon!')
  }

  const cancelReservation = async () => {
    setLoading(false)
    setError('Points system is coming soon!')
  }

  return {
    balance,
    history,
    availableTiers,
    loading,
    error,
    fetchBalance,
    fetchHistory,
    fetchAvailableTiers,
    reservePoints,
    confirmRedemption,
    cancelReservation
  }
}

export default usePoints
