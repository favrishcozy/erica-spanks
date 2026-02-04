import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from 'styled-components'
import GlobalStyles from './styles/GlobalStyles'
import { theme } from './styles/theme'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import ProductList from './pages/ProductList'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import AccountSettings from './pages/AccountSettings'
import PointsInfo from './pages/PointsInfo'
import AdminDashboard from './pages/AdminDashboard'
import AdminProducts from './pages/AdminProducts'
import AdminOrders from './pages/AdminOrders'
import AdminUsers from './pages/AdminUsers'
import AdminNewsletter from './pages/AdminNewsletter'
import About from './pages/About'
import Contact from './pages/Contact'
import Lookbook from './pages/Lookbook'
import Wishlist from './pages/Wishlist'
import SizeGuide from './pages/SizeGuide'
import OrderConfirmation from './pages/OrderConfirmation'
import OrderHistory from './pages/OrderHistory'
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/playfair-display/700.css';
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'


function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/search" element={<ProductList />} />
              <Route path="/products/:category" element={<ProductList />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/lookbook" element={<Lookbook />} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
              <Route path="/learn-points" element={<PointsInfo />} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminProducts /></ProtectedRoute>} />
              <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/newsletter" element={<ProtectedRoute requireAdmin><AdminNewsletter /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
    </ThemeProvider>
  )
}

export default App
