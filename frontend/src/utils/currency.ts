/**
 * Currency utility for consistent NGN formatting across the app
 */

export const formatPrice = (price: number | null | undefined): string => {
  if (price === null || price === undefined || isNaN(price)) {
    return '—'
  }
  return `₦${price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatPriceNoSymbol = (price: number | null | undefined): string => {
  if (price === null || price === undefined || isNaN(price)) {
    return '—'
  }
  return price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default formatPrice
