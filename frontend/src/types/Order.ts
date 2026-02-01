export interface OrderItem {
  product: {
    _id: string
    name: string
    image: string
  }
  variation: {
    size: string
    color: string
    sku: string
  }
  quantity: number
  unitPrice: number
  totalPrice: number
  productSnapshot: {
    name: string
    image: string
    description: string
  }
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
}

export interface PaymentInfo {
  method: 'stripe' | 'paypal' | 'apple_pay' | 'google_pay' | 'card' | 'paystack' | 'bank' | 'cash'
  transactionId: string
  paymentIntentId?: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded'
  amountPaid: number
  currency: string
  paymentDate: Date
  refunds: Array<{
    amount: number
    reason: string
    refundId: string
    processedAt: Date
    processedBy: string
  }>
}

export interface ShippingInfo {
  method: 'standard' | 'express' | 'overnight' | 'free'
  carrier?: 'usps' | 'ups' | 'fedex' | 'dhl'
  cost: number
  estimatedDelivery: {
    min: number
    max: number
  }
  trackingNumber?: string
  trackingUrl?: string
  shippedAt?: Date
  deliveredAt?: Date
}

export interface OrderStatusHistory {
  status: string
  updatedAt: Date
  updatedBy: string
  note?: string
}

export interface Order {
  _id: string
  orderNumber: string
  user: {
    _id: string
    firstName: string
    lastName: string
  }
  items: OrderItem[]
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded' | 'returned'
  statusHistory: OrderStatusHistory[]
  shippingAddress: ShippingAddress
  billingAddress: ShippingAddress
  paymentInfo: PaymentInfo
  shippingInfo: ShippingInfo
  pricing: {
    subtotal: number
    shippingCost: number
    tax: number
    discount: number
    total: number
  }
  coupon?: {
    code: string
    description: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
  }
  pointsRedemption?: {
    reservation_id: string
    points_redeemed: number
    discount_applied: boolean
    appliedAt: Date
  }
  pointsAwarded: boolean
  pointsEarned: number
  notes: {
    customer?: string
    internal?: string
  }
  createdAt: Date
  updatedAt: Date
}