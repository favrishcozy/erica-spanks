// pages/cart.tsx
import React, { useState, useEffect } from "react"
import styled, { keyframes } from "styled-components"
import { useCartStore } from "../stores/cartStore"
import { Link, useNavigate } from "react-router-dom"
import { productAPI } from '../services/api'
import toast from 'react-hot-toast'

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`

// Styled Components (copy all the styled components from the first example)
const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 800px;
  margin: 0 auto;
  animation: ${fadeIn} 0.3s ease-out;
`

const CartHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  position: relative;

  h1 {
    margin: 0;
    color: ${({ theme }) => theme.colors.primaryDark};
    font-size: 2.5rem;
    font-weight: 700;
  }

  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
    margin: ${({ theme }) => theme.spacing.sm} auto;
    border-radius: 2px;
  }
`

const EmptyCart = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  animation: ${fadeIn} 0.5s ease-out;

  svg {
    width: 80px;
    height: 80px;
    margin-bottom: ${({ theme }) => theme.spacing.md};
    opacity: 0.5;
  }

  p {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.textLight};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  button {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    padding: 12px 32px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: ${({ theme }) => theme.colors.primaryDark};
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
  }
`

const CartItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: ${({ theme }) => theme.spacing.md};
  animation: ${slideIn} 0.3s ease-out;
  transition: all 0.3s ease;
  border: 1px solid transparent;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primaryLight};
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: ${({ theme }) => theme.spacing.md};
  }
`

const ItemImage = styled.div`
  width: 100px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 100%;
    height: 200px;
  }
`

const ItemContent = styled.div`
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`

const ItemDetails = styled.div`
  flex: 1;
  min-width: 0;

  h4 {
    margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.primaryDark};
    line-height: 1.4;
  }

  .price {
    font-size: 1.2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .attributes {
    display: flex;
    gap: ${({ theme }) => theme.spacing.md};
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.textLight};
    flex-wrap: wrap;

    span {
      background: ${({ theme }) => theme.colors.background};
      padding: 4px 8px;
      border-radius: 6px;
      border: 1px solid ${({ theme }) => theme.colors.border};
    }
  }
`

const ItemControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 120px;

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    min-width: auto;
    margin-top: ${({ theme }) => theme.spacing.sm};
  }
`

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 768px) {
    order: 1;
  }
`

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
  background: white;
`

const QuantityButton = styled.button`
  background: ${({ theme }) => theme.colors.background};
  border: none;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primaryLight};
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const QuantityInput = styled.input`
  width: 50px;
  height: 36px;
  border: none;
  text-align: center;
  font-size: 1rem;
  background: white;
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  &:focus {
    outline: none;
    background: ${({ theme }) => theme.colors.primaryLight}10;
  }
`

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.error};
  font-size: 1.4rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.error}20;
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    order: 2;
  }
`

const MobilePrice = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    font-size: 1.3rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
    order: 3;
    text-align: right;
    flex: 1;
  }
`

const DesktopPrice = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`

const Summary = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  animation: ${fadeIn} 0.5s ease-out;
`

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
    font-weight: 700;
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.primaryDark};
  }
`

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
  justify-content: flex-end;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`

const SecondaryButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.textLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: 768px) {
    order: 2;
  }
`

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.accent});
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    animation: ${pulse} 1s infinite;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    order: 1;
  }
`

const StyledLink = styled(Link)`
  text-decoration: none;
  display: inline-block;
`

const Cart: React.FC = () => {
  const navigate = useNavigate()
  const {
    items,
    addItem,
    updateQuantity,
    removeItem,
    getTotalPrice,
    getTotalItems,
    clearCart,
  } = useCartStore()

  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()

  const handleQuantityChange = (id: string, size?: string, color?: string, newQuantity?: number) => {
    if (newQuantity === undefined || newQuantity < 1) return
    updateQuantity(id, size, color, newQuantity)
  }

  const EditableCartRow: React.FC<{ item: any }> = ({ item }) => {
    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [selectedColor, setSelectedColor] = useState(item.color || '')
    const [selectedSize, setSelectedSize] = useState(item.size || '')
    const [availableColors, setAvailableColors] = useState<any[]>([])
    const [availableSizes, setAvailableSizes] = useState<string[]>([])

    useEffect(() => {
      let mounted = true
      const load = async () => {
        setLoading(true)
        try {
          const res = await productAPI.getProduct(item.id)
          const prod = res?.data || res
          if (!mounted) return
          setProduct(prod)
          const colors = Array.from(new Map(
            (prod.variations || []).filter((v: any) => v.inventory?.quantity > 0).map((v: any) => [v.color, { name: v.color, code: v.colorCode }])
          ).values())
          setAvailableColors(colors)
          setAvailableSizes(Array.from(new Set((prod.variations || []).map((v: any) => v.size))))
        } catch (e) {
          console.error('Failed to load product for cart item', e)
        } finally {
          if (mounted) setLoading(false)
        }
      }
      load()
      return () => { mounted = false }
    }, [item.id])

    // Auto-save when both color and size are selected
    useEffect(() => {
      if (!product || !selectedColor || !selectedSize) return

      const v = (product.variations || []).find((x: any) => x.color === selectedColor && x.size === selectedSize)
      if (!v) return

      // Only update if the variation changed from the original
      if (selectedColor !== item.color || selectedSize !== item.size) {
        removeItem(item.id, item.size, item.color)
        addItem({
          id: item.id,
          name: item.name,
          price: v.price || item.price,
          image: v.images?.[0]?.url || item.image,
          size: selectedSize,
          color: selectedColor,
          quantity: item.quantity,
          variationId: v._id || `${selectedColor}-${selectedSize}`
        })
        toast.success('Item updated in cart')
      }
    }, [selectedColor, selectedSize])

    if (loading) return <CartItem><div>Loading...</div></CartItem>

    return (
      <CartItem key={`${item.id}-${item.size}-${item.color}`}>
        <ItemImage>
          <img src={item.image || '/api/placeholder/100/120'} alt={item.name} />
        </ItemImage>
        <ItemContent>
          <ItemDetails>
            <h4>{item.name}</h4>
            <DesktopPrice className="price">₦{(item.price || 0).toLocaleString()}</DesktopPrice>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <div>
                <div style={{ fontSize: 12, color: '#666' }}>Color</div>
                <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                  <option value="">Select color</option>
                  {availableColors.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#666' }}>Size</div>
                <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                  <option value="">Select size</option>
                  {availableSizes.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </ItemDetails>
          <ItemControls>
            <MobilePrice>₦{(item.price || 0).toLocaleString()}</MobilePrice>
            <Controls>
              <QuantityControl>
                <QuantityButton
                  onClick={() => handleQuantityChange(item.id, item.size, item.color, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >−</QuantityButton>
                <QuantityInput type="number" min="1" value={item.quantity} onChange={(e) => handleQuantityChange(item.id, item.size, item.color, parseInt(e.target.value) || 1)} />
                <QuantityButton onClick={() => handleQuantityChange(item.id, item.size, item.color, item.quantity + 1)}>+</QuantityButton>
              </QuantityControl>
            </Controls>
            <RemoveButton onClick={() => removeItem(item.id, item.size, item.color)}>✕</RemoveButton>
          </ItemControls>
        </ItemContent>
      </CartItem>
    )
  }

  const handleContinueShopping = () => {
    navigate('/products')
  }

  return (
    <Container>
      <CartHeader>
        <h1>Your Shopping Cart</h1>
        <p>{totalItems} {totalItems === 1 ? 'item' : 'items'} in cart</p>
      </CartHeader>

      {items.length === 0 ? (
        <EmptyCart>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p>Your cart is feeling lonely</p>
          <button onClick={handleContinueShopping}>
            Start Shopping
          </button>
        </EmptyCart>
      ) : (
        <>
          {items.map((item) => {
            if (!item.size || !item.color) {
              return <EditableCartRow key={`${item.id}-${item.size}-${item.color}`} item={item} />
            }

            return (
              <CartItem key={`${item.id}-${item.size}-${item.color}`}>
                <ItemImage>
                  <img 
                    src={item.image || '/api/placeholder/100/120'} 
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/api/placeholder/100/120'
                    }}
                  />
                </ItemImage>
                
                <ItemContent>
                  <ItemDetails>
                    <h4>{item.name}</h4>
                    <DesktopPrice className="price">
                      ₦{(item.price || 0).toLocaleString()}
                    </DesktopPrice>
                    <div className="attributes">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>
                  </ItemDetails>

                  <ItemControls>
                    <MobilePrice>
                      ₦{(item.price || 0).toLocaleString()}
                    </MobilePrice>
                    
                    <Controls>
                      <QuantityControl>
                        <QuantityButton
                          onClick={() => 
                            handleQuantityChange(
                              item.id, 
                              item.size, 
                              item.color, 
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          −
                        </QuantityButton>
                        <QuantityInput
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => 
                            handleQuantityChange(
                              item.id, 
                              item.size, 
                              item.color, 
                              parseInt(e.target.value) || 1
                            )
                          }
                        />
                        <QuantityButton
                          onClick={() => 
                            handleQuantityChange(
                              item.id, 
                              item.size, 
                              item.color, 
                              item.quantity + 1
                            )
                          }
                        >
                          +
                        </QuantityButton>
                      </QuantityControl>
                    </Controls>

                    <RemoveButton
                      onClick={() => 
                        removeItem(item.id, item.size, item.color)
                      }
                      title="Remove item"
                    >
                      ✕
                    </RemoveButton>
                  </ItemControls>
                </ItemContent>
              </CartItem>
            )
          })}

          <Summary>
            <SummaryRow>
              <span>Subtotal ({totalItems} items):</span>
              <span>₦{totalPrice.toLocaleString()}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Shipping:</span>
              <span>Calculated at checkout</span>
            </SummaryRow>
            <SummaryRow>
              <span>Total:</span>
              <span>₦{totalPrice.toLocaleString()}</span>
            </SummaryRow>

            <ActionButtons>
              <SecondaryButton onClick={clearCart}>
                Clear Cart
              </SecondaryButton>
              <StyledLink to="/checkout">
                <PrimaryButton>
                  Proceed to Checkout
                </PrimaryButton>
              </StyledLink>
            </ActionButtons>
          </Summary>
        </>
      )}
    </Container>
  )
}

export default Cart