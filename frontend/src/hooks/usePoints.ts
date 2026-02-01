import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import { useAuth } from '../contexts/AuthContext'

/**
 * Hook for fetching and managing user points data
 */
export const usePoints = () => {
  // Prefer AuthContext user (keeps in sync with authService) but fall back
  // to the zustand store for parts of the app that still use it.
  const authContext = (() => {
    try {
      return useAuth()
    } catch (e) {
      return null
    }
  })()

  const store = useAuthStore()
  const user = authContext?.user ?? store.user
  const [balance, setBalance] = useState(null)
  const [history, setHistory] = useState([])
  const [availableTiers, setAvailableTiers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch user's points balance
  const fetchBalance = async () => {
    // Guard: need a logged-in user id
    if (!user?.id && !user?._id) return

    setLoading(true)
    try {
      const response = await axios.get('/api/points/balance')
      // Normalize response shape: prefer response.data.balance but allow response.data
      const balanceData = response.data?.balance ?? response.data
      setBalance(balanceData)
      setError(null)
    } catch (err) {
      console.error('Error fetching points balance:', err)
      setError(err.response?.data?.message || 'Failed to fetch points balance')
    } finally {
      setLoading(false)
    }
  }

  // Fetch transaction history
  const fetchHistory = async (limit = 20, skip = 0) => {
    if (!user?.id && !user?._id) return

    setLoading(true)
    try {
      const response = await axios.get(`/api/points/history?limit=${limit}&skip=${skip}`)
      const tx = response.data?.transactions ?? response.data
      setHistory(Array.isArray(tx) ? tx : (tx && tx.data && Array.isArray(tx.data) ? tx.data : []))
      setError(null)
    } catch (err) {
      console.error('Error fetching points history:', err)
      setError(err.response?.data?.message || 'Failed to fetch points history')
    } finally {
      setLoading(false)
    }
  }

  // Fetch eligible redemption tiers
  const fetchAvailableTiers = async (cartSubtotal = 0) => {
    if (!user?.id && !user?._id) return

    try {
      const response = await axios.get(`/api/points/available-tiers?cart_subtotal=${cartSubtotal}`)
      setAvailableTiers(response.data.tiers)
      setError(null)
    } catch (err) {
      console.error('Error fetching available tiers:', err)
      setError(err.response?.data?.message || 'Failed to fetch available tiers')
    }
  }

  // Reserve points for redemption
  const reservePoints = async (tierId) => {
    if (!user?.id && !user?._id) return null

    try {
      const response = await axios.post('/api/points/reserve', { tier_id: tierId })
      return response.data.reservation
    } catch (err) {
      console.error('Error reserving points:', err)
      setError(err.response?.data?.message || 'Failed to reserve points')
      return null
    }
  }

  // Confirm redemption after checkout
  const confirmRedemption = async (reservationId, orderId) => {
    if (!user?.id && !user?._id) return null

    try {
      const response = await axios.post('/api/points/redeem', {
        reservation_id: reservationId,
        order_id: orderId
      })
      // Refresh balance after redemption
      await fetchBalance()
      return response.data.result
    } catch (err) {
      console.error('Error confirming redemption:', err)
      setError(err.response?.data?.message || 'Failed to confirm redemption')
      return null
    }
  }

  // Cancel reservation if checkout fails
  const cancelReservation = async (reservationId) => {
    if (!user?.id && !user?._id) return false

    try {
      const response = await axios.post('/api/points/cancel-reservation', {
        reservation_id: reservationId
      })
      return response.data.released
    } catch (err) {
      console.error('Error cancelling reservation:', err)
      setError(err.response?.data?.message || 'Failed to cancel reservation')
      return false
    }
  }

  // Auto-fetch on mount if user is logged in
  useEffect(() => {
    const uid = user?.id ?? user?._id
    if (uid) {
      fetchBalance()
      fetchHistory()
    } else {
      // clear when signed out
      setBalance(null)
      setHistory([])
    }
  }, [user?.id, user?._id])

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
