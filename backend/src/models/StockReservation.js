import mongoose from 'mongoose';

const stockReservationSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variationSku: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB TTL index for automatic cleanup
  },
  status: {
    type: String,
    enum: ['reserved', 'confirmed', 'cancelled', 'expired'],
    default: 'reserved'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  metadata: {
    sessionId: String,
    cartId: String,
    source: {
      type: String,
      enum: ['cart', 'checkout', 'direct'],
      default: 'cart'
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
stockReservationSchema.index({ productId: 1, variationSku: 1 });
stockReservationSchema.index({ userId: 1, status: 1 });
stockReservationSchema.index({ expiresAt: 1 }); // For TTL cleanup
stockReservationSchema.index({ orderId: 1 }); // For order lookups

// Static methods
stockReservationSchema.statics.reserveStock = async function(productId, variationSku, userId, quantity, options = {}) {
  try {
    const Product = mongoose.model('Product');
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error('Product not found');
    }

    const variation = product.variations.find(v => v.sku === variationSku);
    if (!variation) {
      throw new Error('Variation not found');
    }

    // Check available stock (current stock minus existing reservations)
    const currentReservations = await this.aggregate([
      {
        $match: {
          productId,
          variationSku,
          status: { $in: ['reserved', 'confirmed'] },
          expiresAt: { $gt: new Date() }
        }
      },
      {
        $group: {
          _id: null,
          totalReserved: { $sum: '$quantity' }
        }
      }
    ]);

    const reservedQuantity = currentReservations[0]?.totalReserved || 0;
    const availableStock = variation.inventory.quantity - reservedQuantity;

    if (availableStock < quantity) {
      throw new Error(`Insufficient stock. Only ${availableStock} items available`);
    }

    // Create reservation
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (options.expiryMinutes || 15));

    const reservation = await this.create({
      productId,
      variationSku,
      userId,
      quantity,
      expiresAt,
      metadata: options.metadata || {}
    });

    return {
      success: true,
      reservation,
      availableStock: availableStock - quantity
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

stockReservationSchema.statics.confirmReservation = async function(reservationId, orderId) {
  try {
    const reservation = await this.findByIdAndUpdate(
      reservationId,
      {
        status: 'confirmed',
        orderId,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.status !== 'reserved') {
      throw new Error('Reservation cannot be confirmed');
    }

    return reservation;
  } catch (error) {
    throw error;
  }
};

stockReservationSchema.statics.cancelReservation = async function(reservationId, reason = 'cancelled') {
  try {
    const reservation = await this.findByIdAndUpdate(
      reservationId,
      {
        status: 'cancelled',
        updatedAt: new Date()
      },
      { new: true }
    );

    return reservation;
  } catch (error) {
    throw error;
  }
};

stockReservationSchema.statics.getUserReservations = async function(userId, status = null) {
  const query = { userId };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('productId', 'name')
    .sort({ createdAt: -1 });
};

stockReservationSchema.statics.cleanupExpiredReservations = async function() {
  try {
    const now = new Date();
    const expiredReservations = await this.find({
      status: 'reserved',
      expiresAt: { $lt: now }
    });

    if (expiredReservations.length === 0) {
      return { processed: 0, updated: 0 };
    }

    // Update expired reservations
    const result = await this.updateMany(
      {
        status: 'reserved',
        expiresAt: { $lt: now }
      },
      {
        status: 'expired',
        updatedAt: now
      }
    );

    return {
      processed: expiredReservations.length,
      updated: result.modifiedCount
    };
  } catch (error) {
    throw error;
  }
};

const StockReservation = mongoose.model('StockReservation', stockReservationSchema);
export default StockReservation;