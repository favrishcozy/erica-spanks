import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Plus, Edit2, Trash2, X, Download, FileUp, Image as ImageIcon, Package, DollarSign, TrendingUp, Settings, ArrowLeft, RotateCcw } from 'lucide-react'
import { IconOnlyButton, DashboardHeader, Avatar } from '../components/admin/UI'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { API_BASE_URL } from '../services/api'

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
  background: #f8f9fa;
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 16px;
    margin: 0;
    min-height: 100vh;
    background: #ffffff;
  }
`

const Header = styled.div`
  background: #1a1a1a;
  color: white;
  padding: 24px;
  margin: -40px -24px 32px -24px;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  h1 {
    font-size: 28px;
    color: white;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 700;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    padding: 16px;
    margin: -40px -16px 12px -16px;
    width: calc(100% + 32px);
    gap: 12px;
    border-radius: 0;
    margin-top: 12px;
    
    h1 {
      font-size: 22px;
      width: 100%;
      order: 1;
      text-align: center;
    }
  }
`

const Actions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 6px;
    width: 100%;
    order: 2;
    justify-content: center;
  }
`

const Button = styled.button`
  background: #C9A876;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  font-size: 14px;

  &:hover {
    background: #1a1a1a;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 13px;
    border-radius: 8px;
  }
`

const SecondaryBtn = styled(Button)`
  background: #C9A876;
  padding: 10px 16px;

  &:hover {
    background: #1a1a1a;
  }

  @media (max-width: 768px) {
    padding: 6px 10px;
    font-size: 11px;
    gap: 4px;
    svg {
      width: 16px;
      height: 16px;
    }
  }
`

const AnalyticsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }
`

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-top: 4px solid #C9A876;
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }

  h3 {
    color: #888;
    font-size: 12px;
    margin: 0 0 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  p {
    font-size: 24px;
    font-weight: 700;
    color: #C9A876;
    margin: 0;
  }

  @media (max-width: 768px) {
    padding: 12px;
    h3 {
      font-size: 10px;
      margin-bottom: 6px;
    }
    p {
      font-size: 18px;
    }
  }
`

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: #C9A876;
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
  }
`

const PriceRangeGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  input {
    width: 100px;
    padding: 8px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;

    &:focus {
      outline: none;
      border-color: #C9A876;
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
    }
  }
`

const ProductsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    display: block;
    width: 100%;
    overflow-x: auto;
    border-radius: 8px;
    font-size: 12px;
  }

  th {
    background: #f8f9fa;
    padding: 16px;
    text-align: left;
    font-weight: 600;
    color: #333;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #C9A876;

    @media (max-width: 768px) {
      padding: 10px 8px;
      font-size: 11px;
    }
  }

  td {
    padding: 16px;
    border-bottom: 1px solid #e9ecef;
    color: #555;

    @media (max-width: 768px) {
      padding: 10px 8px;
      font-size: 12px;
    }
  }

  tr:hover {
    background: #f8f9fa;
  }

  @media (max-width: 480px) {
    font-size: 11px;
    
    td, th {
      padding: 8px 4px;
    }
  }
`

const Checkbox = styled.input`
  cursor: pointer;
  width: 18px;
  height: 18px;

  @media (max-width: 768px) {
    width: 16px;
    height: 16px;
  }
`

const ActionButtons = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;

  button {
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s ease;

    @media (max-width: 768px) {
      padding: 6px 8px;
      font-size: 11px;
    }
  }
`

const EditBtn = styled.button`
  background: #C9A876;
  color: white;

  &:hover {
    background: #1a1a1a;
    transform: translateY(-1px);
  }
`

const DeleteBtn = styled.button`
  background: #ff6b6b;
  color: white;

  &:hover {
    background: #ff5252;
    transform: translateY(-1px);
  }
`

const Modal = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

  @media (max-width: 768px) {
    padding: 20px;
    width: 100%;
    max-width: 100%;
    border-radius: 16px 16px 0 0;
    margin: 0;
    max-height: 85vh;
  }

  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px 12px 0 0;
  }
`

const CloseBtn = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #f0f0f0;
  border: none;
  cursor: pointer;
  color: #333;
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #e0e0e0;
    color: #000;
    transform: rotate(90deg);
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }

  input, textarea, select {
    width: 100%;
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    background: white;
    transition: all 0.2s ease;

    &:focus {
      outline: none;
      border-color: #C9A876;
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
    }
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }
`

const ArrayInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .item {
    display: flex;
    gap: 8px;
    align-items: center;

    input {
      flex: 1;
    }

    button {
      background: #ff6b6b;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background: #ff5252;
      }
    }
  }

  .add-btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    width: fit-content;

    &:hover {
      background: #5568d3;
    }
  }
`

const VariationsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 12px;

  thead {
    background: #f5f5f5;
  }

  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #e0e0e0;
    font-size: 14px;
  }

  th {
    font-weight: 600;
    color: #333;
    background: #f8f9fa;
  }

  td {
    color: #555;
  }

  input[type="number"] {
    width: 80px;
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #C9A876;
      box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.1);
    }
  }

  tr:hover {
    background: #f8f9fa;
  }
`

const VariationsSection = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;

  h4 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 16px;
  }

  .preview-text {
    font-size: 13px;
    color: #666;
    margin-bottom: 12px;
  }

  .bulk-controls {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e0e0e0;
    align-items: center;
    flex-wrap: wrap;

    label {
      font-size: 14px;
      color: #555;
    }

    input {
      width: 80px;
      padding: 6px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;

      &:focus {
        outline: none;
        border-color: #C9A876;
      }
    }

    button {
      padding: 6px 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;

      &:hover {
        background: #5568d3;
      }
    }
  }

  .no-variations {
    text-align: center;
    padding: 20px;
    color: #999;
    font-size: 14px;
  }
`

const SubmitBtn = styled.button`
  background: #C9A876;
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  width: 100%;
  transition: all 0.3s ease;
  font-size: 16px;

  &:hover {
    background: #1a1a1a;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;

  p {
    margin: 12px 0;
  }
`

const HiddenFileInput = styled.input`
  display: none;
`

const ImageUploadSection = styled.div`
  border: 2px dashed #ddd;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #C9A876;
    background: rgba(212, 175, 55, 0.05);
  }

  p {
    margin: 8px 0;
    color: #666;
  }
`

const ImagePreview = styled.img`
  max-width: 200px;
  max-height: 200px;
  border-radius: 6px;
  margin: 12px 0;
`

const ImageViewsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
`

const ImageViewCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  background: #f9f9f9;
  position: relative;

  .view-label {
    font-size: 12px;
    font-weight: 600;
    color: #666;
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  .upload-btn {
    width: 100%;
    padding: 12px;
    border: 2px dashed #ddd;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 14px;
    color: #666;
    transition: all 0.2s;

    &:hover {
      border-color: #C9A876;
      color: #C9A876;
    }
  }

  .preview {
    width: 100%;
    max-height: 150px;
    border-radius: 6px;
    object-fit: cover;
    margin-top: 8px;
  }

  .remove-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;

    &:hover {
      background: #ff5252;
    }
  }
`

const CategorySelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  background: white;

  &:focus {
    outline: none;
    border-color: #C9A876;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.1);
  }
  
  /* Improve appearance for multi-selects */
  &[multiple] {
    min-height: 120px;
    height: auto;
  }

  option {
    padding: 6px 8px;
  }
`

interface Product {
  _id: string
  name: string
  price: number
  description: string
  sizes: string[]
  colors: string[]
  materials: string[]
  careInstructions: string[]
  variations: any[]
  category?: any
  occasions?: any[]
  images?: any[]
  stockStatus?: string
}

const AdminProducts: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [categories, setCategories] = useState<any[]>([])
  const [occasions, setOccasions] = useState<any[]>([])
  // All categories are available for both primary and occasion selection
  const allCategories = React.useMemo(() => categories, [categories])
  
  // Prevent duplicate requests in React StrictMode (dev)
  const fetchedCategoriesRef = useRef(false)
  const fetchedProductsRef = useRef(false)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  // Analytics
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    avgPrice: 0
  })

  // Helper: get numeric price for a product, prefer minPrice virtual, then first variation price, then product.price
  const getProductPrice = (p: any) => {
    if (p == null) return 0
    if (typeof p.minPrice === 'number' && !isNaN(p.minPrice)) return p.minPrice
    if (p.variations && Array.isArray(p.variations) && p.variations.length > 0) {
      const v = p.variations[0]
      if (v && typeof v.price === 'number') return v.price
      if (v && v.price) return parseFloat(v.price) || 0
    }
    if (typeof p.price === 'number') return p.price
    if (p.price) return parseFloat(p.price) || 0
    return 0
  }

  // Helper: get total stock for a product (sum of all variations)
  const getTotalStock = (p: any) => {
    if (p == null || !p.variations || !Array.isArray(p.variations)) return 0
    return p.variations.reduce((sum: number, v: any) => {
      const qty = v?.inventory?.quantity || 0
      return sum + qty
    }, 0)
  }

  // Helper: get out of stock variations count
  const getOutOfStockCount = (p: any) => {
    if (p == null || !p.variations || !Array.isArray(p.variations)) return 0
    return p.variations.filter((v: any) => (v?.inventory?.quantity || 0) === 0).length
  }

  // Helper: generate all possible variations based on current sizes and colors
  const generateVariationsList = () => {
    const sizes = formData.sizes.filter(s => s.trim())
    const colors = formData.colors.filter(c => c.trim())
    
    if (sizes.length === 0 || colors.length === 0) return []
    
    const variations: Array<{ size: string; color: string; key: string }> = []
    for (const color of colors) {
      for (const size of sizes) {
        variations.push({
          size: size.toUpperCase(),
          color: color,
          key: `${size.toUpperCase()}-${color}`
        })
      }
    }
    return variations
  }

  // Helper: get stock for a variation
  const getVariationStock = (key: string): number => {
    if (!formData.variationStocks) return parseInt(formData.stock) || 10
    return formData.variationStocks[key] !== undefined 
      ? parseInt(String(formData.variationStocks[key])) 
      : parseInt(formData.stock) || 10
  }

  // Helper: set stock for a variation
  const setVariationStock = (key: string, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      variationStocks: {
        ...(prev.variationStocks || {}),
        [key]: quantity
      }
    }))
  }

  // Helper: bulk apply stock to all variations
  const bulkApplyStock = () => {
    const quantity = parseInt(formData.stock) || 10
    const variations = generateVariationsList()
    const newStocks: Record<string, number> = {}
    variations.forEach(v => {
      newStocks[v.key] = quantity
    })
    setFormData(prev => ({
      ...prev,
      variationStocks: newStocks
    }))
  }

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '10', // Default stock quantity for bulk apply
    sizes: [] as string[],
    colors: [] as string[],
    category: '',
    occasions: [] as string[],
    materials: [] as string[],
    careInstructions: [] as string[],
    stockStatus: 'in_stock',
    variationStocks: {} as Record<string, number>, // Key: "SIZE-COLOR", Value: quantity
    images: {
      front: { file: null as File | null, preview: '' },
      back: { file: null as File | null, preview: '' },
      side: { file: null as File | null, preview: '' }
    },
    variationImages: {} as Record<string, Array<{ file: File | null; preview: string }>>
  })

  // Check if user is admin
  useEffect(() => {
    console.log('[AdminProducts] Checking auth. User:', user, 'Role:', user?.role)
    if (!user || user.role !== 'admin') {
      console.log('[AdminProducts] Access denied. Redirecting to home.')
      toast.error('Access denied. Admin only.')
      window.location.href = '/'
    }
  }, [user])

  // Fetch categories and occasions
  useEffect(() => {
    if (fetchedCategoriesRef.current) return
    fetchedCategoriesRef.current = true

    const fetchCategories = async () => {
      try {
        const response = await api.get(`/categories`)
        const cats = response.data?.data || []
        console.log('[AdminProducts] Fetched categories:', cats)
        setCategories(cats)
      } catch (err) {
        console.error('[AdminProducts] Failed to fetch categories:', err)
        toast.error('Failed to load categories')
      }
    }

    fetchCategories()
  }, [])

  // Fetch occasions
  useEffect(() => {
    const fetchOccasions = async () => {
      try {
        const response = await api.get(`/occasions`)
        const occs = response.data?.data || []
        console.log('[AdminProducts] Fetched occasions:', occs)
        setOccasions(occs)
      } catch (err) {
        console.error('[AdminProducts] Failed to fetch occasions:', err)
        toast.error('Failed to load occasions')
      }
    }

    fetchOccasions()
  }, [])

  // Load products
  useEffect(() => {
    if (fetchedProductsRef.current) return
    fetchedProductsRef.current = true

    const loadProducts = async () => {
      try {
        console.log('[AdminProducts] Loading products from', `/products/admin/all`)
        const res = await api.get(`/products/admin/all`)
        console.log('[AdminProducts] Products loaded:', res.data)
        const prods = res.data?.data || []
        setProducts(prods)
        setFilteredProducts(prods)
        
        // Calculate analytics using computed product price
        const totalProducts = prods.length
        const totalRevenue = prods.reduce((sum: number, p: any) => sum + getProductPrice(p), 0)
        const avgPrice = totalProducts > 0 ? Math.round(totalRevenue / totalProducts) : 0

        setAnalytics({
          totalProducts,
          totalRevenue,
          avgPrice
        })
      } catch (err) {
        console.error('[AdminProducts] Failed to load products', err)
        toast.error('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Filter products
  useEffect(() => {
    let filtered = products

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (minPrice) {
      const min = parseFloat(minPrice)
      filtered = filtered.filter(p => getProductPrice(p) >= min)
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice)
      filtered = filtered.filter(p => getProductPrice(p) <= max)
    }

    setFilteredProducts(filtered)
  }, [searchTerm, minPrice, maxPrice, products])

  // Refresh products from server
  const refreshProducts = async () => {
    fetchedProductsRef.current = false // Clear the flag to allow refetch
    try {
      setLoading(true)
      const res = await api.get(`/products/admin/all`)
      
      console.log('[AdminProducts.refresh] Response:', res.data)
      const prods = res.data?.data || []
      console.log('[AdminProducts.refresh] Loaded', prods.length, 'products')
      
      setProducts(prods)
      setFilteredProducts(prods)
      
      const totalProducts = prods.length
      const totalRevenue = prods.reduce((sum: number, p: any) => sum + getProductPrice(p), 0)
      const avgPrice = totalProducts > 0 ? Math.round(totalRevenue / totalProducts) : 0

      setAnalytics({
        totalProducts,
        totalRevenue,
        avgPrice
      })
      toast.success('Products refreshed')
    } catch (err) {
      console.error('[AdminProducts.refresh] Error:', err)
      toast.error('Failed to refresh products')
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData({ 
      name: '', 
      description: '', 
      price: '', 
      stock: '10',
      sizes: [] as string[], 
      colors: [] as string[],
      category: '',
      occasions: [] as string[],
      materials: [] as string[],
      careInstructions: [] as string[],
      stockStatus: 'in_stock',
      variationStocks: {},
      images: {
        front: { file: null, preview: '' },
        back: { file: null, preview: '' },
        side: { file: null, preview: '' }
      },
      variationImages: {}
    })
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    
    // Extract images by view type from variations or product images
    let frontPreview = ''
    let backPreview = ''
    let sidePreview = ''
    
    // Try to get images from variations
    if (product.variations && product.variations.length > 0) {
      const allImages = product.variations.flatMap((v: any) => v.images || [])
      const primaryImages = allImages.filter((img: any) => img.isPrimary)
      
      if (primaryImages.length > 0) {
        frontPreview = primaryImages[0]?.url || ''
        if (primaryImages.length > 1) backPreview = primaryImages[1]?.url || ''
        if (primaryImages.length > 2) sidePreview = primaryImages[2]?.url || ''
      }
    }
    
    // Fallback to product-level images
    if (!frontPreview && product.images && product.images.length > 0) {
      frontPreview = product.images[0]?.url || product.images[0] || ''
      if (product.images.length > 1) backPreview = product.images[1]?.url || product.images[1] || ''
      if (product.images.length > 2) sidePreview = product.images[2]?.url || product.images[2] || ''
    }
    
    // Convert materials objects to strings for form display
    const materialsStrings = (product.materials || []).map((m: any) => {
      if (typeof m === 'string') return m
      if (m.percentage) return `${m.percentage}% ${m.name}`
      return m.name
    })

    // Build variationImages grouped by color
    const variationImagesData: Record<string, Array<{ file: File | null; preview: string }>> = {}
    if (product.variations && product.variations.length > 0) {
      for (const v of product.variations) {
        const colorKey = v.color || 'default'
        if (!variationImagesData[colorKey]) variationImagesData[colorKey] = []
        const imgs = (v.images || []).map((img: any) => {
          if (!img) return null
          return { file: null, preview: img.url || img }
        }).filter((item: any) => item !== null)
        variationImagesData[colorKey].push(...imgs)
      }
    }
    
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: (getProductPrice(product) || 0).toString(),
      stock: '10', // Default, will be managed per variation
      sizes: product.sizes || [],
      colors: product.colors || [],
      category: product.category?._id || '',
      occasions: (product.occasions || []).map((o: any) => (o && o._id) ? o._id : o),
      materials: materialsStrings,
      careInstructions: product.careInstructions || [],
      stockStatus: product.stockStatus || 'in_stock',
      variationStocks: {},
      images: {
        front: { file: null, preview: frontPreview },
        back: { file: null, preview: backPreview },
        side: { file: null, preview: sidePreview }
      },
      variationImages: variationImagesData
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    setFormData({ 
      name: '', 
      description: '', 
      price: '', 
      stock: '10',
      sizes: [] as string[], 
      colors: [] as string[],
      category: '',
      occasions: [] as string[],
      materials: [] as string[],
      careInstructions: [] as string[],
      stockStatus: 'in_stock',
      variationStocks: {},
      images: {
        front: { file: null, preview: '' },
        back: { file: null, preview: '' },
        side: { file: null, preview: '' }
      },
      variationImages: {}
    })
  }

  const handleImageChange = (view: 'front' | 'back' | 'side', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const preview = event.target?.result as string
        setFormData(prev => ({
          ...prev,
          images: {
            ...prev.images,
            [view]: { file, preview }
          }
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVariationImagesChange = (color: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Validate and create previews
    const validFiles: Array<{ file: File; preview: string }> = []
    const readers: Promise<void>[] = []
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return
      if (file.size > 5 * 1024 * 1024) return

      const p = new Promise<void>((resolve) => {
        const reader = new FileReader()
        reader.onload = (evt) => {
          validFiles.push({ file, preview: evt.target?.result as string })
          resolve()
        }
        reader.readAsDataURL(file)
      })
      readers.push(p)
    })

    Promise.all(readers).then(() => {
      setFormData(prev => ({
        ...prev,
        variationImages: {
          ...prev.variationImages,
          [color]: [ ...(prev.variationImages[color] || []), ...validFiles.map(v => ({ file: v.file, preview: v.preview })) ]
        }
      }))
    })
  }

  const removeVariationImage = (color: string, index: number) => {
    setFormData(prev => {
      const arr = [...(prev.variationImages[color] || [])]
      arr.splice(index, 1)
      return {
        ...prev,
        variationImages: {
          ...prev.variationImages,
          [color]: arr
        }
      }
    })
  }

  const removeImage = (view: 'front' | 'back' | 'side') => {
    setFormData(prev => ({
      ...prev,
      images: {
        ...prev.images,
        [view]: { file: null, preview: '' }
      }
    }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Name and price are required')
      return
    }

    if (!formData.description || formData.description.trim() === '') {
      toast.error('Description is required')
      return
    }

    if (!formData.category) {
      toast.error('Category is required')
      return
    }

    try {
      const sizes = formData.sizes.filter(s => s.trim())
      const colors = formData.colors.filter(c => c.trim())
      const stockQuantity = parseInt(formData.stock) || 10

      // Generate variations from sizes and colors
      const variations: any[] = []
      const colorCodeMap: any = {
        'black': '#000000',
        'white': '#FFFFFF',
        'red': '#FF0000',
        'blue': '#0000FF',
        'green': '#00FF00',
        'yellow': '#FFFF00',
        'pink': '#FFC0CB',
        'nude': '#F5DEB3',
        'gray': '#808080',
        'camel': '#C19A6B',
        'navy': '#000080',
        'purple': '#800080',
        'orange': '#FFA500',
        'brown': '#A52A2A'
      }

      let skuCounter = 1
      for (const color of colors) {
        for (const size of sizes) {
          const variationKey = `${size.toUpperCase()}-${color}`
          const variationStock = formData.variationStocks[variationKey] !== undefined 
            ? parseInt(String(formData.variationStocks[variationKey])) 
            : stockQuantity

          variations.push({
            size: size.toUpperCase(),
            color: color,
            colorCode: colorCodeMap[color.toLowerCase()] || '#808080',
            sku: `${formData.name.toUpperCase().replace(/\s+/g, '-')}-${color.toUpperCase()}-${size.toUpperCase()}-${skuCounter}`,
            price: parseFloat(formData.price),
            inventory: {
              quantity: variationStock,
              lowStockThreshold: 5,
              allowBackorder: false
            },
            weight: 0.5,
            images: []
          })
          skuCounter++
        }
      }

      if (variations.length === 0) {
        toast.error('Please add at least one size and one color')
        return
      }

      // Convert materials from strings to objects with name and percentage
      const materialsData = formData.materials
        .filter(m => m.trim())
        .map(m => {
          // Parse "100% Silk" or "Silk" format
          const match = m.match(/^(\d+)%?\s*(.+)$/)
          if (match) {
            return {
              name: match[2].trim(),
              percentage: parseInt(match[1], 10)
            }
          }
          // Fallback: just name, no percentage
          return {
            name: m.trim()
          }
        })

      const payload: any = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        occasions: formData.occasions,
        variations: variations,
        materials: materialsData,
        careInstructions: formData.careInstructions.filter(c => c.trim())
      }

      if (editingProduct) {
        // Update
        await api.put(`/products/${editingProduct._id}`, payload)

        // Upload images for each view
        const views: Array<'front' | 'back' | 'side'> = ['front', 'back', 'side']
        for (const view of views) {
          if (formData.images[view].file) {
            const imageFormData = new FormData()
            imageFormData.append('image', formData.images[view].file)
            imageFormData.append('view', view)

            try {
              console.log(`[AdminProducts] Uploading ${view} view...`)
              await api.post(`/products/${editingProduct._id}/upload-image`, imageFormData)
              console.log(`[AdminProducts] ${view} view uploaded successfully`)
            } catch (imgErr) {
              console.error(`[AdminProducts] ${view} view upload failed:`, imgErr)
              const errorMsg = imgErr?.response?.data?.error || imgErr?.message || 'Unknown error'
              toast.error(`${view} view upload failed: ${errorMsg}`)
            }
          }
        }

        // Upload variation images (per color) - assign to first variation SKU for each color
        try {
          const prodRes = await api.get(`/products/${editingProduct._id}`)
          const prod = prodRes.data?.data || prodRes.data || {}
          const colorToSku: Record<string, string> = {}
          if (prod.variations && Array.isArray(prod.variations)) {
            prod.variations.forEach((v: any) => {
              if (v && v.color && !colorToSku[v.color]) colorToSku[v.color] = v.sku
            })
          }

          const variationImagesObj = formData.variationImages || {}
          if (typeof variationImagesObj === 'object' && variationImagesObj !== null) {
            const colorKeys = Object.keys(variationImagesObj)
            for (const colorKey of colorKeys) {
              const sku = colorToSku[colorKey]
              if (!sku) continue
              const images = variationImagesObj[colorKey]
              if (!Array.isArray(images)) continue
              for (const imgObj of images) {
                if (!imgObj || !imgObj.file) continue
                const fd = new FormData()
                fd.append('image', imgObj.file)
                fd.append('variationSku', sku)
                try {
                  await api.post(`/products/${editingProduct._id}/upload-image`, fd)
                } catch (vErr) {
                  console.error('[AdminProducts] Variation image upload failed for', colorKey, vErr)
                }
              }
            }
          }
        } catch (err) {
          console.error('[AdminProducts] Failed to upload variation images on update', err)
        }

        toast.success('Product and images updated successfully')
      } else {
        // Create
        console.log('[AdminProducts] Creating product with payload:', JSON.stringify(payload, null, 2))
        const response = await api.post(`/products`, payload)

        const newProductId = response.data?.data?._id || response.data?._id

        // Upload images for each view
        if (newProductId) {
          const views: Array<'front' | 'back' | 'side'> = ['front', 'back', 'side']
          for (const view of views) {
            if (formData.images[view].file) {
              const imageFormData = new FormData()
              imageFormData.append('image', formData.images[view].file)
              imageFormData.append('view', view)

              try {
                console.log(`[AdminProducts] Uploading ${view} view for new product...`)
                await api.post(`/products/${newProductId}/upload-image`, imageFormData)
                console.log(`[AdminProducts] ${view} view uploaded successfully`)
              } catch (imgErr) {
                console.error(`[AdminProducts] ${view} view upload failed:`, imgErr)
                const errorMsg = imgErr?.response?.data?.error || imgErr?.message || 'Unknown error'
                toast.error(`${view} view upload failed: ${errorMsg}`)
              }
            }
          }
        }

        // After creating product, fetch it to obtain variation SKUs and upload variation images per color
        try {
          const createdRes = await api.get(`/products/${newProductId}`)
          const createdProd = createdRes.data?.data || createdRes.data || {}
          const colorToSku: Record<string, string> = {}
          if (createdProd.variations && Array.isArray(createdProd.variations)) {
            createdProd.variations.forEach((v: any) => {
              if (v && v.color && !colorToSku[v.color]) colorToSku[v.color] = v.sku
            })
          }

          const variationImagesObj = formData.variationImages || {}
          if (typeof variationImagesObj === 'object' && variationImagesObj !== null) {
            const colorKeys = Object.keys(variationImagesObj)
            for (const colorKey of colorKeys) {
              const sku = colorToSku[colorKey]
              if (!sku) continue
              const images = variationImagesObj[colorKey]
              if (!Array.isArray(images)) continue
              for (const imgObj of images) {
                if (!imgObj || !imgObj.file) continue
                const fd = new FormData()
                fd.append('image', imgObj.file)
                fd.append('variationSku', sku)
                try {
                  await api.post(`/products/${newProductId}/upload-image`, fd)
                } catch (vErr) {
                  console.error('[AdminProducts] Variation image upload failed for', colorKey, vErr)
                }
              }
            }
          }
        } catch (err) {
          console.error('[AdminProducts] Failed to upload variation images after create', err)
        }

        toast.success('Product created with images successfully')
      }


      closeModal()
      // Reload products
      const res = await api.get(`/products/admin/all`)
      setProducts(res.data?.data || [])
      } catch (err: any) {
        console.error('Failed to save product', err)
        // Enhanced error logging to see what server is actually returning
        const errorResponse = err?.details || (err?.response && err.response.data) || {}
        const errorMsg = errorResponse?.error || errorResponse?.message || err?.message || 'Failed to save product'
        console.error('Error response:', errorResponse)
        console.error('Formatted error message:', errorMsg)
        toast.error(errorMsg)
      }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`)
        toast.success('Product deleted')
        setProducts(products.filter(p => p._id !== productId))
      } catch (err: any) {
        console.error('Failed to delete product', err)
        toast.error(err.response?.data?.error || 'Failed to delete product')
      }
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Select products to delete')
      return
    }

    if (window.confirm(`Permanently delete ${selectedProducts.size} products? This cannot be undone.`)) {
      try {
        for (const id of selectedProducts) {
          // Use hard delete endpoint for permanent removal
          await api.delete(`/products/${id}/hard`)
        }
        toast.success(`Permanently deleted ${selectedProducts.size} products`)
        setProducts(products.filter(p => !selectedProducts.has(p._id)))
        setSelectedProducts(new Set())
        
        // Refresh from server to ensure state is in sync
        await refreshProducts()
      } catch (err: any) {
        console.error('Failed to delete products', err)
        toast.error('Failed to delete some products')
      }
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(filteredProducts.map(p => p._id)))
    } else {
      setSelectedProducts(new Set())
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const updated = new Set(selectedProducts)
    if (checked) {
      updated.add(productId)
    } else {
      updated.delete(productId)
    }
    setSelectedProducts(updated)
  }

  const downloadCSVTemplate = () => {
    const headers = ['ProductID', 'Name', 'Price', 'Description', 'Stock', 'Sizes', 'Colors']
    const templateRow = ['', 'Example: Gold Ring', '5000', 'Beautiful handcrafted ring', '10', '8;9;10', 'Gold;Silver']
    const csv = [headers, templateRow].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products-template-${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Template downloaded')
  }

  const exportToCSV = () => {
    const headers = ['ProductID', 'Name', 'Price', 'Description', 'Stock', 'Sizes', 'Colors', 'CreatedDate', 'LastModified']
    const rows = filteredProducts.map(p => [
      p._id || p.id || '',
      p.name,
      getProductPrice(p),
      p.description || '',
      p.stock || 0,
      (p.sizes || []).join(';'),
      (p.colors || []).join(';'),
      p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '',
      p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0] : ''
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `products-export-${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Exported to CSV')
  }

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      if (lines.length < 2) {
        toast.error('CSV file must have headers and at least one data row')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const requiredFields = ['Name', 'Price', 'Description']
      const missingFields = requiredFields.filter(f => !headers.includes(f))
      
      if (missingFields.length > 0) {
        toast.error(`Missing required fields: ${missingFields.join(', ')}`)
        return
      }

      let imported = 0
      const errors: string[] = []

      for (let i = 1; i < lines.length; i++) {
        const lineNum = i + 1
        try {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          const obj: any = {}
          let hasData = false

          headers.forEach((header, idx) => {
            const value = values[idx] || ''
            if (value) hasData = true

            if (header === 'ProductID') {
              obj.id = value
            } else if (header === 'Sizes' || header === 'Colors') {
              obj[header.toLowerCase()] = value.split(';').filter(Boolean) || []
            } else if (header === 'Price' || header === 'Stock') {
              const fieldLower = header.toLowerCase()
              const num = parseFloat(value)
              if (isNaN(num)) {
                throw new Error(`${header} must be a valid number`)
              }
              obj[fieldLower] = num
            } else if (header !== 'ProductID') {
              obj[header.toLowerCase()] = value
            }
          })

          if (!hasData) continue

          // Validate required fields
          if (!obj.name || !obj.price || !obj.description) {
            throw new Error('Name, Price, and Description are required')
          }

          // Check if updating or creating
          if (obj.id) {
            await api.put(`/products/${obj.id}`, obj)
          } else {
            await api.post(`/products`, obj)
          }
          imported++
        } catch (err: any) {
          const errMsg = err?.response?.data?.message || err?.message || 'Unknown error'
          errors.push(`Row ${lineNum}: ${errMsg}`)
        }
      }

      if (imported > 0) {
        toast.success(`Imported/Updated ${imported} products`)
        const res = await api.get('/products/admin/all')
        setProducts(res.data?.data || [])
      }

      if (errors.length > 0) {
        toast.error(`${errors.length} row(s) failed:\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? `\n...and ${errors.length - 3} more` : ''}`)
      }
    } catch (err: any) {
      console.error('CSV import error:', err)
      toast.error('Failed to process CSV file')
    }
  }

  const addSize = () => {
    setFormData({ ...formData, sizes: [...formData.sizes, ''] })
  }

  const updateSize = (index: number, value: string) => {
    const newSizes = [...formData.sizes]
    newSizes[index] = value
    setFormData({ ...formData, sizes: newSizes })
  }

  const removeSize = (index: number) => {
    setFormData({ ...formData, sizes: formData.sizes.filter((_, i) => i !== index) })
  }

  const addColor = () => {
    const newColor = ''
    setFormData({ 
      ...formData, 
      colors: [...formData.colors, newColor],
      variationImages: {
        ...formData.variationImages,
        [newColor]: [] // Initialize empty array for new color
      }
    })
  }

  const updateColor = (index: number, value: string) => {
    const newColors = [...formData.colors]
    newColors[index] = value
    setFormData({ ...formData, colors: newColors })
  }

  const removeColor = (index: number) => {
    const colorToRemove = formData.colors[index]
    const newVariationImages = { ...formData.variationImages }
    delete newVariationImages[colorToRemove] // Clean up variation images for deleted color
    setFormData({ 
      ...formData, 
      colors: formData.colors.filter((_, i) => i !== index),
      variationImages: newVariationImages
    })
  }

  const addMaterial = () => {
    setFormData({ ...formData, materials: [...formData.materials, ''] })
  }

  const updateMaterial = (index: number, value: string) => {
    const newMaterials = [...formData.materials]
    newMaterials[index] = value
    setFormData({ ...formData, materials: newMaterials })
  }

  const removeMaterial = (index: number) => {
    setFormData({ ...formData, materials: formData.materials.filter((_, i) => i !== index) })
  }

  const addCareInstruction = () => {
    setFormData({ ...formData, careInstructions: [...formData.careInstructions, ''] })
  }

  const updateCareInstruction = (index: number, value: string) => {
    const newCareInstructions = [...formData.careInstructions]
    newCareInstructions[index] = value
    setFormData({ ...formData, careInstructions: newCareInstructions })
  }

  const removeCareInstruction = (index: number) => {
    setFormData({ ...formData, careInstructions: formData.careInstructions.filter((_, i) => i !== index) })
  }

  if (loading) {
    return <Container><p>Loading...</p></Container>
  }

  return (
    <Container>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <IconOnlyButton onClick={() => navigate('/admin/dashboard')} title="Back">
            <ArrowLeft size={20} />
          </IconOnlyButton>
          <h1><Package size={28} /> Product Management</h1>
        </div>
        <Actions>
          <Button onClick={openAddModal}>
            <Plus size={20} />
            Add Product
          </Button>
          <SecondaryBtn onClick={refreshProducts} title="Refresh products">
            <RotateCcw size={20} />
          </SecondaryBtn>
          <SecondaryBtn onClick={downloadCSVTemplate} title="Download CSV template">
            <Download size={20} />
          </SecondaryBtn>
          <SecondaryBtn onClick={exportToCSV} title="Export current products">
            <FileUp size={20} />
          </SecondaryBtn>
          <SecondaryBtn as="label" style={{ margin: 0 }} title="Import from CSV">
            <FileUp size={20} />
            <HiddenFileInput
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
            />
          </SecondaryBtn>
          <Button onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
            toast.success('Logged out successfully');
          }} style={{ display: 'none' }}>
            Logout
          </Button>
        </Actions>
      </Header>

      {/* Analytics */}
      <AnalyticsSection>
        <StatCard>
          <h3>Total Products</h3>
          <p>{analytics.totalProducts}</p>
        </StatCard>
        <StatCard>
          <h3>Total Revenue Value</h3>
          <p>₦{analytics.totalRevenue.toLocaleString()}</p>
        </StatCard>
        <StatCard>
          <h3>Average Price</h3>
          <p>₦{analytics.avgPrice.toLocaleString()}</p>
        </StatCard>
      </AnalyticsSection>

      {/* Filters & Search */}
      <FilterBar>
        <SearchInput
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <PriceRangeGroup>
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span>—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </PriceRangeGroup>
      </FilterBar>

      {/* Bulk Actions */}
      {selectedProducts.size > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <Button onClick={handleBulkDelete} style={{ background: '#ff6b6b' }}>
            <Trash2 size={20} />
            Delete Selected ({selectedProducts.size})
          </Button>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <EmptyState>
          <p>No products found. Start by adding your first product!</p>
          <Button onClick={openAddModal} style={{ marginTop: '20px' }}>
            <Plus size={20} />
            Add First Product
          </Button>
        </EmptyState>
      ) : (
        <ProductsTable>
          <thead>
            <tr>
              <th>
                <Checkbox
                  type="checkbox"
                  checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Description</th>
              <th>Sizes</th>
              <th>Colors</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => {
              // Extract unique sizes and colors from variations
              const uniqueSizes = (product?.variations && Array.isArray(product.variations))
                ? [...new Set(product.variations.filter(v => v && v.size).map(v => v.size))]
                : []
              const uniqueColors = (product?.variations && Array.isArray(product.variations))
                ? [...new Set(product.variations.filter(v => v && v.color).map(v => v.color))]
                : []
              
              return (
                <tr key={product._id}>
                  <td>
                    <Checkbox
                      type="checkbox"
                      checked={selectedProducts.has(product._id)}
                      onChange={(e) => handleSelectProduct(product._id, e.target.checked)}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category?.name || product.category || '—'}</td>
                  <td>₦{getProductPrice(product).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{getTotalStock(product)}</span>
                      {getOutOfStockCount(product) > 0 && (
                        <span style={{ fontSize: '12px', color: '#ff6b6b', fontWeight: 600 }}>
                          ({getOutOfStockCount(product)} out)
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{product.description?.substring(0, 50) || '—'}...</td>
                  <td>{uniqueSizes.length > 0 ? uniqueSizes.join(', ') : '—'}</td>
                  <td>{uniqueColors.length > 0 ? uniqueColors.join(', ') : '—'}</td>
                  <td>
                    <ActionButtons>
                      <EditBtn onClick={() => openEditModal(product)}>
                        <Edit2 size={16} />
                        Edit
                      </EditBtn>
                      <DeleteBtn onClick={() => handleDeleteProduct(product._id)}>
                        <Trash2 size={16} />
                        Delete
                      </DeleteBtn>
                    </ActionButtons>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </ProductsTable>
      )}

      {/* Add/Edit Modal */}
      <Modal $isOpen={isModalOpen}>
        <ModalContent>
          <CloseBtn onClick={closeModal}>
            <X />
          </CloseBtn>

          <h2 style={{ marginBottom: '24px' }}>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>

          <FormGroup>
            <label>Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Satin Slip Dress"
            />
          </FormGroup>

          <FormGroup>
            <label>Category *</label>
            <CategorySelect
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="">Select a category</option>
              {allCategories.map((cat: any) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </CategorySelect>
          </FormGroup>

          <FormGroup>
            <label>Occasions (optional)</label>
            <small style={{ color: '#666', display: 'block', marginBottom: '12px' }}>
              Select all occasions this product is suitable for
            </small>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {occasions.map((occ: any) => (
                <label key={occ._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '6px', background: '#fafafa', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.occasions.includes(occ._id)}
                    onChange={(e) => {
                      const isChecked = e.target.checked
                      const updated = isChecked 
                        ? [...formData.occasions, occ._id]
                        : formData.occasions.filter(id => id !== occ._id)
                      setFormData({ ...formData, occasions: updated })
                    }}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', color: '#333' }}>{occ.name}</span>
                </label>
              ))}
            </div>
          </FormGroup>

          <FormGroup>
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your product..."
            />
          </FormGroup>

          <FormGroup>
            <label>Price (NGN) *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g., 25000"
            />
          </FormGroup>

          <FormGroup>
            <label>Stock Quantity (per variation) *</label>
            <small style={{ color: '#666', display: 'block', marginBottom: '8px' }}>
              Set the number of items available for each size and color combination. For example, if you have 3 sizes and 2 colors, each variation will have this quantity.
            </small>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="e.g., 10"
              min="0"
            />
          </FormGroup>

          <FormGroup>
            <label>Product Images (Front, Back, Side Views)</label>
            <small style={{ color: '#666', display: 'block', marginBottom: '12px' }}>
              Upload images from different angles to help customers see your product
            </small>
            <ImageViewsSection>
              {(['front', 'back', 'side'] as const).map(view => (
                <ImageViewCard key={view}>
                  <div className="view-label">{view}</div>
                  {formData.images[view].preview ? (
                    <>
                      <img src={formData.images[view].preview} alt={`${view} view`} className="preview" />
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeImage(view)}
                        title={`Remove ${view} view`}
                      >
                        ×
                      </button>
                      <button
                        type="button"
                        className="upload-btn"
                        onClick={() => document.getElementById(`image-${view}`)?.click()}
                      >
                        Change Image
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="upload-btn"
                      onClick={() => document.getElementById(`image-${view}`)?.click()}
                    >
                      Click to upload
                    </button>
                  )}
                  <HiddenFileInput
                    id={`image-${view}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(view, e)}
                  />
                </ImageViewCard>
              ))}
            </ImageViewsSection>
          </FormGroup>

          <FormGroup>
            <label>Available Sizes *</label>
            <small style={{ color: '#666', display: 'block', marginBottom: '8px' }}>
              Add at least one size (e.g., XS, S, M, L, XL)
            </small>
            <ArrayInput>
              {formData.sizes.map((size, index) => (
                <div key={index} className="item">
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => updateSize(index, e.target.value)}
                    placeholder="e.g., XS, S, M, L, XL"
                  />
                  <button onClick={() => removeSize(index)}>Remove</button>
                </div>
              ))}
              <button className="add-btn" onClick={addSize}>+ Add Size</button>
            </ArrayInput>
          </FormGroup>

          <FormGroup>
            <label>Available Colors *</label>
            <small style={{ color: '#666', display: 'block', marginBottom: '8px' }}>
              Add at least one color (e.g., Black, White, Red, Pink, Nude, Gray, Navy, etc.)
            </small>
            <ArrayInput>
              {formData.colors.map((color, index) => (
                <div key={index} className="item">
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    placeholder="e.g., Black, White, Red"
                  />
                  <button onClick={() => removeColor(index)}>Remove</button>
                </div>
              ))}
              <button className="add-btn" onClick={addColor}>+ Add Color</button>
            </ArrayInput>
          </FormGroup>

          {formData.sizes.length > 0 && formData.colors.length > 0 && (
            <VariationsSection>
              <h4>Stock Quantity Per Variation</h4>
              <p className="preview-text">
                You have {generateVariationsList().length} variations based on your sizes and colors. Set the stock quantity for each:
              </p>
              
              <div className="bulk-controls">
                <label>Bulk Apply:</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  placeholder="Quantity"
                />
                <button type="button" onClick={bulkApplyStock}>
                  Apply to All Variations
                </button>
              </div>

              {generateVariationsList().length > 0 ? (
                <VariationsTable>
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Color</th>
                      <th>Stock Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generateVariationsList().map((variation) => (
                      <tr key={variation.key}>
                        <td>{variation.size}</td>
                        <td>{variation.color}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            value={getVariationStock(variation.key)}
                            onChange={(e) => setVariationStock(variation.key, parseInt(e.target.value) || 0)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </VariationsTable>
              ) : (
                <div className="no-variations">Add sizes and colors to manage variation stock</div>
              )}
            </VariationsSection>
          )}

          <FormGroup>
            <label>Variation Images (per color)</label>
            <small style={{ color: '#666', display: 'block', marginBottom: '8px' }}>
              Upload images specific to each color. These images will be assigned to the first variation of that color.
            </small>
            <div style={{ display: 'grid', gap: '12px' }}>
              {formData.colors.length === 0 && (
                <p style={{ color: '#999' }}>Add colors above to upload variation images.</p>
              )}
              {formData.colors.map((color, idx) => (
                <ImageViewCard key={`var-${color}-${idx}`}>
                  <div className="view-label">{color}</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(formData.variationImages[color] || []).map((img, i) => {
                      if (!img || !img.preview) return null
                      return (
                        <div key={i} style={{ position: 'relative' }}>
                          <img src={img.preview} alt={`${color}-${i}`} className="preview" />
                          <button type="button" className="remove-btn" onClick={() => removeVariationImage(color, i)}>×</button>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <button
                      type="button"
                      className="upload-btn"
                      onClick={() => document.getElementById(`variation-images-${idx}`)?.click()}
                    >
                      Upload Images for {color}
                    </button>
                    <HiddenFileInput
                      id={`variation-images-${idx}`}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleVariationImagesChange(color, e)}
                    />
                  </div>
                </ImageViewCard>
              ))}
            </div>
          </FormGroup>

          <FormGroup>
            <label>Materials (optional)</label>
            <small style={{ color: '#666', display: 'block', marginBottom: '8px' }}>
              Add materials used in the product. Use format: "percentage% name" (e.g., "95% Polyester, 5% Elastane" or just "Silk")
            </small>
            <ArrayInput>
              {formData.materials.map((material, index) => (
                <div key={index} className="item">
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => updateMaterial(index, e.target.value)}
                    placeholder="e.g., 95% Polyester or Silk"
                  />
                  <button onClick={() => removeMaterial(index)}>Remove</button>
                </div>
              ))}
              <button className="add-btn" onClick={addMaterial}>+ Add Material</button>
            </ArrayInput>
          </FormGroup>

          <FormGroup>
            <label>Care Instructions (optional)</label>
            <small style={{ color: '#666', display: 'block', marginBottom: '8px' }}>
              Add care instructions for the product (e.g., Hand wash, Dry clean only)
            </small>
            <ArrayInput>
              {formData.careInstructions.map((instruction, index) => (
                <div key={index} className="item">
                  <input
                    type="text"
                    value={instruction}
                    onChange={(e) => updateCareInstruction(index, e.target.value)}
                    placeholder="e.g., Hand wash in cold water"
                  />
                  <button onClick={() => removeCareInstruction(index)}>Remove</button>
                </div>
              ))}
              <button className="add-btn" onClick={addCareInstruction}>+ Add Care Instruction</button>
            </ArrayInput>
          </FormGroup>

          <div style={{ marginTop: '32px' }}>
            <SubmitBtn onClick={handleSubmit}>
              {editingProduct ? 'Update Product' : 'Create Product'}
            </SubmitBtn>
          </div>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default AdminProducts
