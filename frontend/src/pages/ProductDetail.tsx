import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Heart, ShoppingBag, Star, Truck, RotateCcw, Shield, Info, ChevronLeft, ChevronRight, X, Plus, Minus } from 'lucide-react'
import { useCartStore } from '../stores/cartStore'
import { useWishlistStore } from '../stores/wishlistStore'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { productAPI } from '../services/api'
import { formatPrice } from '../utils/currency'

// Types
interface Product {
  _id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  variations: Variation[]
  features: string[]
  materials: Material[]
  careInstructions: string[]
  rating: {
    average: number
    count: number
  }
  isNew?: boolean
  onSale?: boolean
  tags: string[]
  relatedProducts?: Product[]
}

interface Variation {
  _id?: string
  size: string
  color: string
  colorCode: string
  price: number
  compareAtPrice?: number
  inventory: {
    quantity: number
  }
  images: ProductImage[]
}

interface ProductImage {
  url: string
  alt: string
  isPrimary?: boolean
}

interface Material {
  name: string
  percentage?: number
}

interface SizeGuide {
  size: string
  bust: string
  waist: string
  hips: string
  length: string
}

// Styled Components (keep all your styled components exactly as they were)
const Container = styled.div`
  width: 100%;
  padding-top: 80px;
`

const Breadcrumbs = styled.nav`
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.lg};
  max-width: 1400px;
  margin: 0 auto;
  
  a, span {
    color: ${({ theme }) => theme.colors.darkGray};
    text-decoration: none;
    font-size: ${({ theme }) => theme.fontSizes.sm};
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
  
  span {
    margin: 0 ${({ theme }) => theme.spacing.sm};
  }
`

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing['4xl']};
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing['4xl']};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing['2xl']};
  }
`

// ... (keep ALL your existing styled components exactly as they were)
// Image Gallery
const ImageSection = styled.div``

const MainImageContainer = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  aspect-ratio: 1;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const ImageNavigation = styled.div`
  position: absolute;
  top: 50%;
  left: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  pointer-events: none;
`

const ImageNavButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: none;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: all;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.white};
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const WishlistButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: none;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.primary};
  }
`

const ImageThumbnails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  max-width: 400px;
`

const Thumbnail = styled.button<{ $active: boolean }>`
  aspect-ratio: 1;
  border: 2px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.lightGray};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  background: none;
  padding: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

// Product Info
const InfoSection = styled.div``

const ProductTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.secondary};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: ${({ theme }) => theme.lineHeights.tight};
`

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.darkGray};
`

const PriceSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const CurrentPrice = styled.span`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.black};
  margin-right: ${({ theme }) => theme.spacing.md};
`

const OriginalPrice = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.mediumGray};
  text-decoration: line-through;
  margin-right: ${({ theme }) => theme.spacing.sm};
`

const DiscountBadge = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`

const OptionsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const OptionGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const OptionLabel = styled.label`
  display: block;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
`

const ColorOptions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

const ColorOption = styled.button<{ color: string; $active: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 3px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.lightGray};
  background: ${({ color }) => color};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.05);
  }
`

const SizeOptions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`

const SizeOption = styled.button<{ $active: boolean; $unavailable?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border: 2px solid ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.lightGray};
  background: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.white};
  color: ${({ theme, $active }) => $active ? theme.colors.white : theme.colors.black};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: ${({ $unavailable }) => $unavailable ? 'not-allowed' : 'pointer'};
  opacity: ${({ $unavailable }) => $unavailable ? 0.5 : 1};
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme, $active }) => $active ? theme.colors.primaryDark : theme.colors.primaryLight};
  }
`

const SizeGuideLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: underline;
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin-left: ${({ theme }) => theme.spacing.sm};
`

const QuantitySection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const QuantityLabel = styled.span`
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.black};
`

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.mediumGray};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  overflow: hidden;
`

const QuantityButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: ${({ theme }) => theme.colors.lightGray};
  color: ${({ theme }) => theme.colors.black};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.mediumGray};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const QuantityInput = styled.input`
  width: 60px;
  height: 40px;
  border: none;
  text-align: center;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  background: ${({ theme }) => theme.colors.white};
  
  &:focus {
    outline: none;
  }
`

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`

const AddToCartButton = styled.button`
  flex: 2;
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.normal};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: ${({ theme }) => theme.colors.mediumGray};
    cursor: not-allowed;
    transform: none;
  }
`

const AddToWishlistButton = styled.button`
  flex: 1;
  background: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.black};
  border: 2px solid ${({ theme }) => theme.colors.lightGray};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`

const ProductFeatures = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.darkGray};
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
    flex-shrink: 0;
  }
`

// Product Details Tabs
const TabsContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing['2xl']};
`

const TabsList = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const TabButton = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  border: none;
  background: none;
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.darkGray};
  border-bottom: 2px solid ${({ theme, $active }) => $active ? theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const TabContent = styled.div`
  max-width: 800px;
`

const Description = styled.div`
  p {
    color: ${({ theme }) => theme.colors.darkGray};
    line-height: ${({ theme }) => theme.lineHeights.relaxed};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
`

const MaterialsList = styled.ul`
  list-style: none;
  padding: 0;
  
  li {
    display: flex;
    justify-content: space-between;
    padding: ${({ theme }) => theme.spacing.sm} 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
    color: ${({ theme }) => theme.colors.darkGray};
    
    &:last-child {
      border-bottom: none;
    }
  }
`

const CareList = styled.ul`
  list-style: none;
  padding: 0;
  
  li {
    padding: ${({ theme }) => theme.spacing.sm} 0;
    color: ${({ theme }) => theme.colors.darkGray};
    position: relative;
    padding-left: ${({ theme }) => theme.spacing.lg};
    
    &:before {
      content: '•';
      color: ${({ theme }) => theme.colors.primary};
      position: absolute;
      left: 0;
    }
  }
`

// Size Guide Modal
const SizeGuideOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex.modal};
  padding: ${({ theme }) => theme.spacing.lg};
`

const SizeGuideModal = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing['2xl']};
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  h3 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
  }
`

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: none;
  background: ${({ theme }) => theme.colors.lightGray};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.mediumGray};
  }
`

const SizeGuideTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: ${({ theme }) => theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
  }
  
  th {
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    background: ${({ theme }) => theme.colors.cream};
  }
`

// Related Products
const RelatedSection = styled.section`
  margin-top: ${({ theme }) => theme.spacing['4xl']};
  padding-top: ${({ theme }) => theme.spacing['2xl']};
  border-top: 1px solid ${({ theme }) => theme.colors.lightGray};
`

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.secondary};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  color: ${({ theme }) => theme.colors.black};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const RelatedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const RelatedCard = styled(Link)`
  text-decoration: none;
  color: inherit;
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    transform: translateY(-5px);
  }
`

const RelatedImage = styled.div`
  aspect-ratio: 1;
  background: ${({ theme }) => theme.colors.accent};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const RelatedInfo = styled.div`
  h4 {
    font-size: ${({ theme }) => theme.fontSizes.md};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    color: ${({ theme }) => theme.colors.black};
  }
  
  p {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.primary};
  }
`

const RatingSection = styled.div`
  background: ${({ theme }) => theme.colors.cream};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-top: ${({ theme }) => theme.spacing['2xl']};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`

const RatingHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.mediumGray};
`

const RatingScore = styled.div`
  text-align: center;
  
  .score {
    font-size: 48px;
    font-weight: ${({ theme }) => theme.fontWeights.bold};
    color: ${({ theme }) => theme.colors.primary};
  }
  
  .stars {
    color: #ffc107;
    font-size: 20px;
    margin: 4px 0;
  }
  
  .count {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    color: ${({ theme }) => theme.colors.darkGray};
  }
`

const ReviewForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
`

const RatingInput = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  
  label {
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    color: ${({ theme }) => theme.colors.black};
  }
  
  .stars {
    display: flex;
    gap: 8px;
    cursor: pointer;
  }
  
  .star {
    font-size: 28px;
    cursor: pointer;
    color: #ddd;
    transition: color 0.2s;
    
    &:hover,
    &.${'active'} {
      color: #ffc107;
    }
  }
`

const FormInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.mediumGray};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
  }
`

const FormTextarea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.mediumGray};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-family: inherit;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
  }
`

const SubmitRatingBtn = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
`

const ReviewCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.mediumGray};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  
  .review-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
  
  .reviewer-info {
    h4 {
      font-weight: ${({ theme }) => theme.fontWeights.semibold};
      color: ${({ theme }) => theme.colors.black};
      margin: 0;
    }
    
    p {
      font-size: ${({ theme }) => theme.fontSizes.sm};
      color: ${({ theme }) => theme.colors.darkGray};
      margin: 4px 0 0 0;
    }
  }
  
  .stars {
    color: #ffc107;
    font-size: 16px;
  }
  
  .review-content {
    h5 {
      font-weight: ${({ theme }) => theme.fontWeights.semibold};
      color: ${({ theme }) => theme.colors.black};
      margin: 0 0 8px 0;
    }
    
    p {
      color: ${({ theme }) => theme.colors.darkGray};
      margin: 0;
      line-height: 1.6;
    }
  }
`

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCartStore()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore()
  const { user } = useAuth()
  
  // State
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', comment: '' })
  const [submitingReview, setSubmittingReview] = useState(false)
  
  // Size guide data
  const sizeGuide: SizeGuide[] = [
    { size: 'XXS', bust: '30-32"', waist: '23-25"', hips: '33-35"', length: '45"' },
    { size: 'XS', bust: '32-34"', waist: '25-27"', hips: '35-37"', length: '45.5"' },
    { size: 'S', bust: '34-36"', waist: '27-29"', hips: '37-39"', length: '46"' },
    { size: 'M', bust: '36-38"', waist: '29-31"', hips: '39-41"', length: '46.5"' },
    { size: 'L', bust: '38-40"', waist: '31-33"', hips: '41-43"', length: '47"' },
    { size: 'XL', bust: '40-42"', waist: '33-35"', hips: '43-45"', length: '47.5"' },
    { size: 'XXL', bust: '42-44"', waist: '35-37"', hips: '45-47"', length: '48"' }
  ]

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await productAPI.getProduct(id!)
        
        if (response.success) {
          setProduct(response.data)
          
          // Set default selections
          // Do NOT auto-select color/size: require explicit user selection
        } else {
          setError(response.error || 'Failed to load product')
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load product')
        console.error('Error fetching product:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await productAPI.getProductReviews(id!)
        if (response.success) {
          setReviews(response.data.reviews || [])
        }
      } catch (err) {
        console.error('Error fetching reviews:', err)
      }
    }

    if (id) {
      fetchReviews()
    }
  }, [id])

  // Reset thumbnail index when images or selection changes (MUST be before conditional returns)
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0)
    }
  }, [product?.variations, selectedColor, selectedSize])

  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <p>Loading product...</p>
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>Product not found</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>{error}</p>
          <Link to="/products">← Back to Products</Link>
        </div>
      </Container>
    )
  }
  
  if (!product) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>Product not found</h2>
          <Link to="/products">← Back to Products</Link>
        </div>
      </Container>
    )
  }
  
  // Determine current variation:
  // - If both color and size selected => exact match
  // - If only color selected => first variation matching color
  // - Otherwise fallback to first variation
  const currentVariation = (selectedColor && selectedSize)
    ? product.variations.find(v => v.color === selectedColor && v.size === selectedSize)
    : selectedColor
      ? product.variations.find(v => v.color === selectedColor)
      : product.variations[0]

  // All possible sizes and colors
  const allSizes = [...new Set(product.variations.map(v => v.size))]
  const availableColors = [...new Map(
    product.variations
      .filter(v => v.inventory.quantity > 0)
      .map(v => [v.color, { name: v.color, code: v.colorCode }])
  ).values()]

  // Current images should ONLY depend on color, not size
  // Find first variation with matching color that has images
  const colorBasedVariation = selectedColor
    ? product.variations.find(v => v.color === selectedColor && v.images?.length > 0)
    : product.variations.find(v => v.images?.length > 0)
  
  const currentImages = colorBasedVariation?.images || []

  const discount = currentVariation?.compareAtPrice ? 
    Math.round(((currentVariation.compareAtPrice - currentVariation.price) / currentVariation.compareAtPrice) * 100) : 0
  const inWishlist = isInWishlist(product._id)
  
  const handleAddToCart = () => {
    // Require explicit color and size selection
    if (!selectedColor || !selectedSize) {
      toast.error('Please select color and size')
      return
    }

    const variation = product.variations.find(v => v.color === selectedColor && v.size === selectedSize)
    if (!variation) {
      toast.error('Selected combination not available')
      return
    }

    addItem({
      id: product._id,
      name: product.name,
      price: variation.price,
      image: currentImages[0]?.url || '/placeholder.jpg',
      size: selectedSize,
      color: selectedColor,
      quantity,
      variationId: variation._id || `${selectedColor}-${selectedSize}`
    })
    toast.success(`${product.name} added to cart!`)
  }
  
  const toggleWishlist = () => {
    if (!product) return
    
    // Check if user is signed in before allowing wishlist operations
    if (!user) {
      toast.error('Please sign in to add items to wishlist')
      navigate('/login')
      return
    }
    
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist(product._id)
      toast.success('Added to wishlist')
    }
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color)
    // If previously selected size is incompatible with new color, clear it so user must re-select
    const hasSelectedSizeForColor = product.variations.some(v => v.color === color && v.size === selectedSize)
    if (selectedSize && !hasSelectedSizeForColor) setSelectedSize('')
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reviewForm.rating) {
      toast.error('Please select a rating')
      return
    }

    if (!reviewForm.title.trim()) {
      toast.error('Please enter a review title')
      return
    }

    if (!reviewForm.comment.trim()) {
      toast.error('Please enter a review comment')
      return
    }

    try {
      setSubmittingReview(true)
      const response = await productAPI.submitRating(product._id, reviewForm)
      
      if (response.success) {
        toast.success('Thank you for your review!')
        setReviewForm({ rating: 0, title: '', comment: '' })
        
        // Refresh reviews
        const updatedReviews = await productAPI.getProductReviews(product._id)
        if (updatedReviews.success) {
          setReviews(updatedReviews.data.reviews || [])
          setProduct(prev => prev ? { ...prev, rating: updatedReviews.data.rating } : null)
        }
      }
    } catch (err) {
      console.error('Error submitting review:', err)
      toast.error('Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={16}
          fill={i <= rating ? '#D4A574' : 'none'}
          color={i <= rating ? '#D4A574' : '#cccccc'}
        />
      )
    }
    return stars
  }
  
  return (
    <Container>
      <Breadcrumbs>
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Products</Link>
        <span>/</span>
        <span>{product.name}</span>
      </Breadcrumbs>
      
      <MainContent>
        <ImageSection>
          <MainImageContainer>
            <img
              src={currentImages[selectedImageIndex]?.url || '/placeholder.jpg'}
              alt={currentImages[selectedImageIndex]?.alt || product.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI0Y1RTZEMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNHB4IiBmaWxsPSIjNjY2NjY2Ij5Qcm9kdWN0IEltYWdlPC90ZXh0Pjwvc3ZnPg=='
              }}
            />
            
            <ImageNavigation>
              <ImageNavButton
                onClick={() => setSelectedImageIndex(prev => Math.max(0, prev - 1))}
                disabled={selectedImageIndex === 0}
              >
                <ChevronLeft size={20} />
              </ImageNavButton>
              <ImageNavButton
                onClick={() => setSelectedImageIndex(prev => Math.min(currentImages.length - 1, prev + 1))}
                disabled={selectedImageIndex === currentImages.length - 1}
              >
                <ChevronRight size={20} />
              </ImageNavButton>
            </ImageNavigation>
            
            <WishlistButton onClick={toggleWishlist}>
              <Heart
                size={20}
                fill={inWishlist ? '#F4C2C2' : 'none'}
                color={inWishlist ? '#F4C2C2' : '#666666'}
              />
            </WishlistButton>
          </MainImageContainer>
          
          <ImageThumbnails>
            {currentImages.map((image, index) => (
              <Thumbnail
                key={index}
                $active={selectedImageIndex === index}
                onClick={() => setSelectedImageIndex(index)}
              >
                <img src={image.url} alt={image.alt} />
              </Thumbnail>
            ))}
          </ImageThumbnails>
        </ImageSection>
        
        <InfoSection>
          <ProductTitle>{product.name}</ProductTitle>
          
          <ProductRating>
            {renderStars(Math.floor(product.rating.average))}
            <span>({product.rating.count} reviews)</span>
          </ProductRating>
          
          <PriceSection>
            <CurrentPrice>{formatPrice(currentVariation.price)}</CurrentPrice>
            {currentVariation.compareAtPrice && currentVariation.compareAtPrice > currentVariation.price && (
              <>
                <OriginalPrice>{formatPrice(currentVariation.compareAtPrice)}</OriginalPrice>
                <DiscountBadge>-{discount}% OFF</DiscountBadge>
              </>
            )}
          </PriceSection>
          
          <OptionsSection>
            <OptionGroup>
              <OptionLabel>
                  Color: {selectedColor || '—'}
                </OptionLabel>
              <ColorOptions>
                {availableColors.map(color => (
                  <ColorOption
                    key={color.name}
                    color={color.code}
                      $active={selectedColor === color.name}
                      onClick={() => handleColorChange(color.name)}
                    title={color.name}
                  />
                ))}
              </ColorOptions>
            </OptionGroup>
            
            <OptionGroup>
                <OptionLabel>
                  Size: {selectedSize || '—'}
                  <SizeGuideLink onClick={() => setShowSizeGuide(true)}>
                    Size Guide
                  </SizeGuideLink>
                </OptionLabel>
                <SizeOptions>
                  {allSizes.map(size => {
                    // If a color is selected, only sizes available for that color are enabled
                    const sizeAvailableForColor = selectedColor
                      ? product.variations.some(v => v.size === size && v.color === selectedColor && v.inventory.quantity > 0)
                      : product.variations.some(v => v.size === size && v.inventory.quantity > 0)
                    const unavailable = !sizeAvailableForColor

                    return (
                      <SizeOption
                        key={size}
                        $active={selectedSize === size}
                        $unavailable={unavailable}
                        disabled={unavailable}
                        onClick={() => !unavailable && setSelectedSize(size)}
                      >
                        {size}
                      </SizeOption>
                    )
                  })}
                </SizeOptions>
            </OptionGroup>
          </OptionsSection>
          
          <QuantitySection>
            <QuantityLabel>Quantity:</QuantityLabel>
            <QuantityControls>
              <QuantityButton
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </QuantityButton>
              <QuantityInput
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="10"
              />
              <QuantityButton
                onClick={() => setQuantity(prev => Math.min(10, prev + 1))}
                disabled={quantity >= 10}
              >
                <Plus size={16} />
              </QuantityButton>
            </QuantityControls>
          </QuantitySection>
          
          <ActionButtons>
            {/* Determine if user can add to cart: must have selected color and size and a matching variation in stock */}
            {(() => {
              const canAdd = Boolean(currentVariation && currentVariation.inventory.quantity > 0 && selectedColor && selectedSize)
              const outOfStock = Boolean(currentVariation && currentVariation.inventory.quantity === 0)

              return (
                <AddToCartButton
                  onClick={handleAddToCart}
                  disabled={!canAdd}
                >
                  <ShoppingBag size={18} />
                  {!selectedColor || !selectedSize ? 'Select size & color' : (outOfStock ? 'Out of Stock' : 'Add to Cart')}
                </AddToCartButton>
              )
            })()}

            <AddToWishlistButton onClick={toggleWishlist}>
              <Heart size={18} />
              {inWishlist ? 'Saved' : 'Save'}
            </AddToWishlistButton>
          </ActionButtons>
          
          <ProductFeatures>
            <FeatureItem>
              <Truck size={20} />
              <span>Free shipping on orders over ₦100,000</span>
            </FeatureItem>
            <FeatureItem>
              <RotateCcw size={20} />
              <span>30-day easy returns</span>
            </FeatureItem>
            <FeatureItem>
              <Shield size={20} />
              <span>1-year warranty</span>
            </FeatureItem>
          </ProductFeatures>
        </InfoSection>
      </MainContent>
      
      <MainContent style={{ gridTemplateColumns: '1fr', maxWidth: '1000px' }}>
        <TabsContainer>
          <TabsList>
            <TabButton
              $active={activeTab === 'description'}
              onClick={() => setActiveTab('description')}
            >
              Description
            </TabButton>
            <TabButton
              $active={activeTab === 'materials'}
              onClick={() => setActiveTab('materials')}
            >
              Materials & Care
            </TabButton>
          </TabsList>
          
          <TabContent>
            {activeTab === 'description' && (
              <Description>
                <p>{product.description}</p>
                {product.features.length > 0 && (
                  <>
                    <h4>Key Features:</h4>
                    <ul>
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </>
                )}
              </Description>
            )}
            
            {activeTab === 'materials' && (
              <div>
                <h4>Materials:</h4>
                <MaterialsList>
                  {product.materials.map((material, index) => (
                    <li key={index}>
                      <span>{material.name}</span>
                      {material.percentage && <span>{material.percentage}%</span>}
                    </li>
                  ))}
                </MaterialsList>
                
                <h4 style={{ marginTop: '2rem' }}>Care Instructions:</h4>
                <CareList>
                  {product.careInstructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </CareList>
              </div>
            )}
          </TabContent>
        </TabsContainer>

        {/* Rating & Reviews Section */}
        <RatingSection>
          <RatingHeader>
            <RatingScore>
              <div className="score">{(product.rating?.average || 0).toFixed(1)}</div>
              <div className="stars">{renderStars(product.rating?.average || 0)}</div>
              <div className="count">Based on {product.rating?.count || 0} reviews</div>
            </RatingScore>
          </RatingHeader>

          {/* Review Form */}
          <h3 style={{ marginBottom: '1rem' }}>Share Your Review</h3>
          <ReviewForm onSubmit={handleSubmitReview}>
            <RatingInput>
              <label>Your Rating *</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    className={`star ${reviewForm.rating >= star ? 'active' : ''}`}
                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  >
                    ★
                  </span>
                ))}
              </div>
            </RatingInput>

            <div>
              <label htmlFor="review-title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Review Title *
              </label>
              <FormInput
                id="review-title"
                type="text"
                placeholder="Sum up your experience in a few words"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
              />
            </div>

            <div>
              <label htmlFor="review-comment" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Your Review *
              </label>
              <FormTextarea
                id="review-comment"
                placeholder="Share your experience with this product..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              />
            </div>

            <SubmitRatingBtn type="submit" disabled={submitingReview}>
              {submitingReview ? 'Submitting...' : 'Submit Review'}
            </SubmitRatingBtn>
          </ReviewForm>

          {/* Reviews List */}
          {reviews.length > 0 && (
            <>
              <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Customer Reviews</h3>
              <ReviewList>
                {reviews.map((review, index) => (
                  <ReviewCard key={index}>
                    <div className="review-header">
                      <div className="reviewer-info">
                        <h4>{review.user?.name || 'Anonymous'}</h4>
                        <p>{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="stars">{renderStars(review.rating)}</div>
                    </div>
                    <div className="review-content">
                      <h5>{review.title}</h5>
                      <p>{review.comment}</p>
                    </div>
                  </ReviewCard>
                ))}
              </ReviewList>
            </>
          )}
        </RatingSection>
      </MainContent>

      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
          <RelatedSection>
            <SectionTitle>You May Also Like</SectionTitle>
            <RelatedGrid>
              {product.relatedProducts.map(relatedProduct => (
                <RelatedCard key={relatedProduct._id} to={`/product/${relatedProduct.slug}`}>
                  <RelatedImage>
                    <img
                      src={relatedProduct.variations[0]?.images[0]?.url || '/placeholder.jpg'}
                      alt={relatedProduct.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0Y1RTZEMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOHB4IiBmaWxsPSIjNjY2NjY2Ij5Qcm9kdWN0IEltYWdlPC90ZXh0Pjwvc3ZnPg=='
                      }}
                    />
                  </RelatedImage>
                  <RelatedInfo>
                    <h4>{relatedProduct.name}</h4>
                    <p>{formatPrice(relatedProduct.variations[0]?.price)}</p>
                  </RelatedInfo>
                </RelatedCard>
              ))}
            </RelatedGrid>
          </RelatedSection>
        </div>
      )}
      
      {/* Size Guide Modal */}
      <SizeGuideOverlay $isOpen={showSizeGuide} onClick={() => setShowSizeGuide(false)}>
        <SizeGuideModal onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <h3>Size Guide</h3>
            <CloseButton onClick={() => setShowSizeGuide(false)}>
              <X size={16} />
            </CloseButton>
          </ModalHeader>
          
          <SizeGuideTable>
            <thead>
              <tr>
                <th>Size</th>
                <th>Bust</th>
                <th>Waist</th>
                <th>Hips</th>
                <th>Length</th>
              </tr>
            </thead>
            <tbody>
              {sizeGuide.map(size => (
                <tr key={size.size}>
                  <td><strong>{size.size}</strong></td>
                  <td>{size.bust}</td>
                  <td>{size.waist}</td>
                  <td>{size.hips}</td>
                  <td>{size.length}</td>
                </tr>
              ))}
            </tbody>
          </SizeGuideTable>
          
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
            All measurements are in inches. For the best fit, we recommend measuring yourself 
            and comparing with our size guide.
          </p>
        </SizeGuideModal>
      </SizeGuideOverlay>
    </Container>
  )
}

export default ProductDetail