import User from '../models/User.js'
import { verifyToken } from '../utils/jwt.js'

/**
 * Protect routes - verify JWT token and attach user to request
 */
export const protect = async (req, res, next) => {
  try {
    let token

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
      console.log('Found token in Authorization header')
    }
    // Check for token in cookies (for web)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token
      console.log('Found token in cookies')
    }

    if (!token) {
      console.log('No token found in request')
      return res.status(401).json({
        success: false,
        error: 'Not authorized. No token provided.'
      })
    }

    try {
      // Verify token
      const decoded = verifyToken(token)
      console.log('Token verified, userId:', decoded.userId)
      
      // Get user from token (password is automatically excluded due to select: false)
      const user = await User.findById(decoded.userId)
      
      if (!user) {
        console.log('User not found in database for userId:', decoded.userId)
        return res.status(401).json({
          success: false,
          error: 'Not authorized. User not found.'
        })
      }

      if (!user.isActive) {
        console.log('User is not active:', user.email)
        return res.status(401).json({
          success: false,
          error: 'Not authorized. Account is deactivated.'
        })
      }

      console.log('User authenticated:', user.email, 'role:', user.role)
      // Attach user to request
      req.user = user
      next()
    } catch (tokenError) {
      console.log('Token verification failed:', tokenError.message)
      return res.status(401).json({
        success: false,
        error: 'Not authorized. Invalid token.'
      })
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    })
  }
}

/**
 * Admin middleware - must be used after protect middleware
 */
export const admin = (req, res, next) => {
  try {
    console.log('Admin middleware check:')
    console.log('  req.user exists:', !!req.user)
    console.log('  req.user?.email:', req.user?.email)
    console.log('  req.user?.role:', req.user?.role)
    console.log('  role === admin:', req.user?.role === 'admin')
    
    if (!req.user) {
      console.log('  ✗ No user attached to request')
      return res.status(401).json({
        success: false,
        error: 'Not authorized. Please authenticate first.'
      })
    }

    if (req.user.role !== 'admin') {
      console.log('  ✗ User is not admin, role is:', req.user.role)
      return res.status(403).json({
        success: false,
        error: 'Not authorized. Admin access required.'
      })
    }

    console.log('  ✓ User is admin, proceeding')
    next()
  } catch (error) {
    console.error('Admin middleware error:', error)
    return res.status(500).json({
      success: false,
      error: 'Authorization error'
    })
  }
}

/**
 * Optional auth middleware - attaches user if token exists, but doesn't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token
    }

    if (token) {
      try {
        const decoded = verifyToken(token)
        const user = await User.findById(decoded.userId)
        
        if (user && user.isActive) {
          req.user = user
        }
      } catch (tokenError) {
        // Token is invalid, but we don't throw error for optional auth
        console.log('Optional auth: Invalid token, continuing without user')
      }
    }

    next()
  } catch (error) {
    console.error('Optional auth middleware error:', error)
    // For optional auth, we don't block the request on error
    next()
  }
}

/**
 * Role-based access control middleware
 */
export const requireRoles = (roles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized. Please authenticate first.'
        })
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: `Not authorized. Required roles: ${roles.join(', ')}`
        })
      }

      next()
    } catch (error) {
      console.error('Role middleware error:', error)
      return res.status(500).json({
        success: false,
        error: 'Authorization error'
        })
    }
  }
}

/**
 * Customer middleware - must be used after protect middleware
 * Ensures user is a customer (not admin accessing customer routes)
 */
export const customer = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized. Please authenticate first.'
      })
    }

    if (req.user.role !== 'customer') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized. Customer access required.'
      })
    }

    next()
  } catch (error) {
    console.error('Customer middleware error:', error)
    return res.status(500).json({
      success: false,
      error: 'Authorization error'
    })
  }
}