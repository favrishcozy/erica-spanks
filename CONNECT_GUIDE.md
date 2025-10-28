# 🔗 Backend-Frontend Connection Guide

This guide will help you properly connect and run the Erica Spanks e-commerce application.

## ✅ Current Configuration Status

### Backend Configuration (`backend/.env`)
```
✅ NODE_ENV=development
✅ PORT=5000
✅ MONGODB_URI=mongodb://localhost:27017/erica-spanks
✅ JWT_SECRET=configured
✅ FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration (`frontend/.env`)
```
✅ VITE_API_URL=http://localhost:5000
```

## 🚀 Quick Start (3 Steps)

### Step 1: Start MongoDB

```bash
# Start MongoDB service
sudo systemctl start mongod

# Verify it's running
sudo systemctl status mongod
```

**Expected Output:** `Active: active (running)`

If MongoDB fails to start, check the logs:
```bash
sudo journalctl -u mongod -n 50
```

### Step 2: Seed the Database (First Time Only)

```bash
cd backend
node seed.js
```

**Expected Output:**
```
✅ MongoDB connected!
🗑️ Cleared old data!
🏷️ Categories created!
📸 Starting image upload process...
🎉 Successfully inserted 27 products into the database!
```

### Step 3: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Expected Output:**
```
🚀 Erica Spanks API server running on port 5000
📍 Environment: development
🏥 Health check: http://localhost:5000/health
🖼️ Serving images from: /path/to/frontend/src/images
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## 🧪 Test the Connection

### Method 1: Using the Test Script

```bash
chmod +x test-connection.sh
./test-connection.sh
```

### Method 2: Manual Testing

1. **Test Backend Health:**
   ```bash
   curl http://localhost:5000/health
   ```
   **Expected:** `{"status":"OK","message":"Erica Spanks API is running",...}`

2. **Test API Products:**
   ```bash
   curl http://localhost:5000/api/products
   ```
   **Expected:** JSON response with products array

3. **Test Image Serving:**
   ```bash
   curl -I http://localhost:5000/images/Dress.jpeg
   ```
   **Expected:** `HTTP/1.1 200 OK`

4. **Test Frontend:**
   - Open browser: http://localhost:5173
   - Open browser console (F12)
   - Check for API connection logs

## 🔍 Verify Connection in Browser

### Open Frontend (http://localhost:5173)

**Check Browser Console (F12):**

You should see:
```
API Configuration: {
  baseURL: "http://localhost:5000",
  apiEndpoint: "http://localhost:5000/api",
  imagesEndpoint: "http://localhost:5000/images"
}

Axios instance created with baseURL: http://localhost:5000/api

Loading featured products...
🔄 API Request: GET /products/featured
✅ API Response: 200 /products/featured
Successfully loaded products: 8
```

**Check Network Tab (F12 → Network):**

You should see successful requests to:
- `http://localhost:5000/api/products/featured` → Status 200
- `http://localhost:5000/images/Dress.jpeg` → Status 200

## 📋 API Endpoints Reference

### Public Endpoints (No Authentication Required)

```bash
# Health check
GET http://localhost:5000/health

# Get all products
GET http://localhost:5000/api/products
GET http://localhost:5000/api/products?category=dresses&limit=12

# Get featured products
GET http://localhost:5000/api/products/featured

# Get single product
GET http://localhost:5000/api/products/:id

# Get products by category
GET http://localhost:5000/api/products/category/dresses

# Search products
GET http://localhost:5000/api/products/search?q=dress

# Get categories
GET http://localhost:5000/api/categories

# Static images
GET http://localhost:5000/images/Dress.jpeg
```

### Protected Endpoints (Require Authentication)

```bash
# Register user
POST http://localhost:5000/api/auth/register
Content-Type: application/json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "password": "SecurePass123!"
}

# Login user
POST http://localhost:5000/api/auth/login
Content-Type: application/json
{
  "email": "jane@example.com",
  "password": "SecurePass123!"
}

# Get user profile (requires token)
GET http://localhost:5000/api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN

# Get user cart
GET http://localhost:5000/api/cart
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🐛 Troubleshooting

### Problem 1: "Cannot connect to backend"

**Symptoms:** Frontend shows error "Network Error" or "Failed to fetch"

**Solutions:**
1. Verify backend is running: `curl http://localhost:5000/health`
2. Check backend terminal for errors
3. Verify `frontend/.env` has `VITE_API_URL=http://localhost:5000`
4. Restart frontend dev server: `cd frontend && npm run dev`

### Problem 2: "MongoDB connection error"

**Symptoms:** Backend shows `❌ MongoDB connection error`

**Solutions:**
```bash
# Check if MongoDB is running
systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check MongoDB logs
sudo journalctl -u mongod -n 50

# Test MongoDB connection
mongosh mongodb://localhost:27017/erica-spanks
```

### Problem 3: "No products showing on frontend"

**Symptoms:** Empty product list or "No featured products available"

**Solutions:**
1. Seed the database:
   ```bash
   cd backend
   node seed.js
   ```
2. Verify products in database:
   ```bash
   mongosh erica-spanks
   > db.products.countDocuments()
   > db.products.find().limit(2).pretty()
   ```
3. Test API directly: `curl http://localhost:5000/api/products`

### Problem 4: "Images not loading"

**Symptoms:** Broken image icons on product cards

**Solutions:**
1. Verify images exist:
   ```bash
   ls -la frontend/src/images/
   ```
2. Test image URL: `curl -I http://localhost:5000/images/Dress.jpeg`
3. Check backend console for image serving confirmation
4. Verify CORS settings allow image requests

### Problem 5: "Port already in use"

**Symptoms:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in backend/.env
echo "PORT=5001" >> backend/.env
```

### Problem 6: "CORS errors"

**Symptoms:** Browser console shows CORS policy errors

**Solutions:**
1. Verify `backend/.env` has: `FRONTEND_URL=http://localhost:5173`
2. Check `backend/src/server.js` CORS configuration includes:
   ```javascript
   origin: ['http://localhost:5173', ...]
   ```
3. Restart backend server

## 🎯 Testing Checklist

Use this checklist to verify everything is working:

- [ ] MongoDB is running
- [ ] Database is seeded with products
- [ ] Backend server starts without errors
- [ ] Frontend server starts without errors
- [ ] Backend health endpoint responds: http://localhost:5000/health
- [ ] API products endpoint responds: http://localhost:5000/api/products
- [ ] Images are accessible: http://localhost:5000/images/Dress.jpeg
- [ ] Frontend loads: http://localhost:5173
- [ ] Browser console shows successful API requests
- [ ] Products display on homepage
- [ ] Product images load correctly
- [ ] Navigation works
- [ ] No CORS errors in console

## 📱 Access URLs

Once everything is running:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main application |
| **Backend API** | http://localhost:5000/api | REST API endpoints |
| **Health Check** | http://localhost:5000/health | Server status |
| **Images** | http://localhost:5000/images | Static product images |
| **Example Product** | http://localhost:5173/product/dress-style-1 | Product detail page |

## 🔄 Daily Development Workflow

```bash
# Morning setup
# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Browse to http://localhost:5173

# End of day
# Press Ctrl+C in both terminals
```

## 📚 Additional Resources

- **Backend API Documentation:** Check `backend/src/routes/` for all endpoints
- **Database Schema:** Check `backend/src/models/` for data structure
- **Frontend Components:** Check `frontend/src/components/` for UI components
- **MongoDB Compass:** Install to visually browse the database
  - Connection: `mongodb://localhost:27017`
  - Database: `erica-spanks`

## 🆘 Still Having Issues?

1. **Check both terminal outputs** for error messages
2. **Check browser console** (F12) for frontend errors
3. **Verify all environment variables** are set correctly
4. **Restart both servers** after making changes
5. **Clear browser cache** and hard reload (Ctrl+Shift+R)
6. **Try the test script:** `./test-connection.sh`

## ✅ Success Indicators

You'll know everything is connected properly when:

1. ✅ Backend terminal shows: `✅ MongoDB Connected` and `🚀 Erica Spanks API server running`
2. ✅ Frontend terminal shows Vite dev server running
3. ✅ Browser console shows: `API Configuration`, `Axios instance created`, successful API requests
4. ✅ Homepage displays featured products with images
5. ✅ No red errors in browser console
6. ✅ Network tab shows successful 200 responses

---

**Need more help?** Review the error messages carefully - they usually point to the exact issue!
