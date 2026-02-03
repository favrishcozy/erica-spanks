// Example seed data for Loyalty Points System
// Use this to initialize the system with example configuration and tiers

// ============================================
// PointsConfig - System Settings
// ============================================

db.pointsconfigs.insertMany([
  {
    config_key: "points_conversion_rate",
    value: 500,
    data_type: "number",
    description: "Amount in ₦ that equals 1 point",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    config_key: "points_expiry_days",
    value: 180,
    data_type: "number",
    description: "Days after which earned points expire",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    config_key: "allow_stacking_with_coupons",
    value: false,
    data_type: "boolean",
    description: "Whether points can be combined with coupon codes",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    config_key: "system_enabled",
    value: true,
    data_type: "boolean",
    description: "Enable or disable the entire points system",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    config_key: "min_points_per_transaction",
    value: 100,
    data_type: "number",
    description: "Minimum order amount (₦) to earn points",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// ============================================
// RedemptionTier - Discount Tiers
// ============================================

db.reductiontiers.insertMany([
  {
    points_required: 200,
    discount_value: 2000,
    discount_type: "fixed",
    minimum_order_value: 5000,
    maximum_redemptions_per_user_per_month: 0, // 0 = unlimited
    applicable_on_discounted_items: true,
    is_active: true,
    tier_rank: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    points_required: 500,
    discount_value: 6000,
    discount_type: "fixed",
    minimum_order_value: 10000,
    maximum_redemptions_per_user_per_month: 0,
    applicable_on_discounted_items: true,
    is_active: true,
    tier_rank: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    points_required: 1000,
    discount_value: 15,
    discount_type: "percentage",
    minimum_order_value: 15000,
    maximum_redemptions_per_user_per_month: 2, // Max 2 per month
    applicable_on_discounted_items: true,
    is_active: true,
    tier_rank: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    points_required: 2000,
    discount_value: 25,
    discount_type: "percentage",
    minimum_order_value: 25000,
    maximum_redemptions_per_user_per_month: 1, // Max 1 per month
    applicable_on_discounted_items: true,
    is_active: true,
    tier_rank: 4,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// ============================================
// PointsBalance - Example User Balances
// ============================================

// NOTE: Replace ObjectId values with actual user IDs from your database
const userId1 = ObjectId("USER_ID_1");
const userId2 = ObjectId("USER_ID_2");
const userId3 = ObjectId("USER_ID_3");

db.pointsbalances.insertMany([
  {
    userId: userId1,
    current_balance: 450,
    total_earned: 1000,
    total_redeemed: 550,
    is_frozen: false,
    freeze_reason: null,
    frozen_at: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId2,
    current_balance: 1200,
    total_earned: 3200,
    total_redeemed: 2000,
    is_frozen: false,
    freeze_reason: null,
    frozen_at: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId3,
    current_balance: 0,
    total_earned: 500,
    total_redeemed: 500,
    is_frozen: true,
    freeze_reason: "Suspected fraudulent activity",
    frozen_at: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// ============================================
// PointsTransaction - Example Transactions
// ============================================

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const thirtyDaysFromNow = new Date();
thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

const pastDate = new Date();
pastDate.setDate(pastDate.getDate() - 200); // Expired

db.pointstransactions.insertMany([
  // User 1 transactions
  {
    userId: userId1,
    type: "earned",
    amount: 500,
    reason: "Points earned for order ES-123456",
    orderId: ObjectId("ORDER_ID_1"),
    expiry_date: thirtyDaysFromNow,
    reversed_transaction_id: null,
    admin_notes: null,
    metadata: {
      order_subtotal: 250000,
      conversion_rate: 500
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    userId: userId1,
    type: "earned",
    amount: 500,
    reason: "Points earned for order ES-789012",
    orderId: ObjectId("ORDER_ID_2"),
    expiry_date: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
    reversed_transaction_id: null,
    admin_notes: null,
    metadata: {
      order_subtotal: 250000,
      conversion_rate: 500
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId1,
    type: "redeemed",
    amount: 200,
    reason: "Points redeemed for ₦2,000 discount",
    orderId: ObjectId("ORDER_ID_3"),
    expiry_date: null,
    reversed_transaction_id: null,
    admin_notes: null,
    metadata: {
      tier_id: ObjectId("TIER_ID_1"),
      tier_name: "200 Points Tier",
      discount_type: "fixed",
      discount_value: 2000
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId1,
    type: "expired",
    amount: 350,
    reason: "Points expired after 180-day retention period",
    orderId: null,
    expiry_date: pastDate,
    reversed_transaction_id: null,
    admin_notes: null,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // User 2 transactions
  {
    userId: userId2,
    type: "earned",
    amount: 1000,
    reason: "Points earned for order ES-345678",
    orderId: ObjectId("ORDER_ID_4"),
    expiry_date: new Date(Date.now() + 160 * 24 * 60 * 60 * 1000),
    reversed_transaction_id: null,
    admin_notes: null,
    metadata: {
      order_subtotal: 500000,
      conversion_rate: 500
    },
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
  },
  {
    userId: userId2,
    type: "earned",
    amount: 1200,
    reason: "Points earned for order ES-567890",
    orderId: ObjectId("ORDER_ID_5"),
    expiry_date: new Date(Date.now() + 175 * 24 * 60 * 60 * 1000),
    reversed_transaction_id: null,
    admin_notes: null,
    metadata: {
      order_subtotal: 600000,
      conversion_rate: 500
    },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    userId: userId2,
    type: "redeemed",
    amount: 500,
    reason: "Points redeemed for 15% discount",
    orderId: ObjectId("ORDER_ID_6"),
    expiry_date: null,
    reversed_transaction_id: null,
    admin_notes: null,
    metadata: {
      tier_id: ObjectId("TIER_ID_3"),
      tier_name: "1000 Points Tier (15%)",
      discount_type: "percentage",
      discount_value: 15
    },
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    userId: userId2,
    type: "redeemed",
    amount: 500,
    reason: "Points redeemed for ₦6,000 discount",
    orderId: ObjectId("ORDER_ID_7"),
    expiry_date: null,
    reversed_transaction_id: null,
    admin_notes: null,
    metadata: {
      tier_id: ObjectId("TIER_ID_2"),
      tier_name: "500 Points Tier",
      discount_type: "fixed",
      discount_value: 6000
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: userId2,
    type: "admin_adjustment",
    amount: 300,
    reason: "Bonus points awarded for positive review",
    orderId: null,
    expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    reversed_transaction_id: null,
    admin_notes: "User left 5-star review",
    metadata: {
      admin_id: ObjectId("ADMIN_ID_1"),
      reason_code: "review_bonus"
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // User 3 transactions (frozen account)
  {
    userId: userId3,
    type: "earned",
    amount: 500,
    reason: "Points earned for order ES-901234",
    orderId: ObjectId("ORDER_ID_8"),
    expiry_date: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
    reversed_transaction_id: null,
    admin_notes: null,
    metadata: {
      order_subtotal: 250000,
      conversion_rate: 500
    },
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  },
  {
    userId: userId3,
    type: "redeemed",
    amount: 500,
    reason: "Points redeemed for ₦6,000 discount",
    orderId: ObjectId("ORDER_ID_9"),
    expiry_date: null,
    reversed_transaction_id: null,
    admin_notes: null,
    metadata: {
      tier_id: ObjectId("TIER_ID_2")
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  }
]);

// ============================================
// MongoDB Commands
// ============================================

// Run this in MongoDB to insert the data:
/*

use erica-spanks

// 1. Insert config settings
db.pointsconfigs.insertMany([...])

// 2. Insert redemption tiers
db.reductiontiers.insertMany([...])

// 3. Create indexes
db.pointsbalances.createIndex({ userId: 1 }, { unique: true })
db.pointsbalances.createIndex({ is_frozen: 1 })

db.pointstransactions.createIndex({ userId: 1, createdAt: -1 })
db.pointstransactions.createIndex({ userId: 1, type: 1 })
db.pointstransactions.createIndex({ orderId: 1 })
db.pointstransactions.createIndex({ expiry_date: 1 })
db.pointstransactions.createIndex({ type: 1, createdAt: -1 })

db.reductiontiers.createIndex({ is_active: 1, tier_rank: 1 })

// 4. Verify data
db.pointsconfigs.find()
db.reductiontiers.find()
db.pointsbalances.find()
db.pointstransactions.find()

*/

// ============================================
// API Examples
// ============================================

/*

// 1. Get user's balance (logged in as user)
GET /api/points/balance
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "balance": {
    "current_balance": 450,
    "total_earned": 1000,
    "total_redeemed": 550,
    "is_frozen": false,
    "expiring_soon": 350
  }
}

// 2. Get available tiers for cart
GET /api/points/available-tiers?cart_subtotal=10000
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "tiers": [
    {
      "_id": "...",
      "points_required": 200,
      "discount_value": 2000,
      "discount_type": "fixed"
    }
  ]
}

// 3. Reserve points for redemption
POST /api/points/reserve
Headers: Authorization: Bearer <token>
Body: { "tier_id": "..." }

Response:
{
  "success": true,
  "reservation": {
    "reservation_id": "...",
    "tier_id": "...",
    "points_reserved": 200,
    "discount_value": 2000
  }
}

// 4. Confirm redemption after checkout
POST /api/points/redeem
Headers: Authorization: Bearer <token>
Body: { "reservation_id": "...", "order_id": "..." }

Response:
{
  "success": true,
  "result": {
    "confirmed": true,
    "points_deducted": 200,
    "new_balance": 250
  }
}

// 5. Get transaction history
GET /api/points/history?limit=20&skip=0
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "transactions": [
    {
      "_id": "...",
      "type": "earned",
      "amount": 500,
      "reason": "Points earned for order ES-123456",
      "createdAt": "..."
    }
  ],
  "total": 8,
  "hasMore": false
}

// Admin: Adjust user's points
POST /api/points/admin/adjust
Headers: Authorization: Bearer <admin_token>
Body: {
  "user_id": "...",
  "amount": 100,
  "reason": "Bonus for review"
}

Response:
{
  "success": true,
  "new_balance": 550
}

*/
