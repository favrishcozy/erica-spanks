import React, { useState, useEffect } from "react"
import styled from "styled-components"
import { useCartStore } from "../../stores/cartStore"
import { productAPI } from '../../services/api'
import toast from 'react-hot-toast'

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
`

const CartHeader = styled.h1`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const CartItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.primaryLight};

  img {
    width: 80px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
  }
`

const ItemDetails = styled.div`
  flex: 1;
  margin-left: ${({ theme }) => theme.spacing.md};
`

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.primaryLight};
  border-radius: 4px;
  overflow: hidden;
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
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.error}20;
    transform: scale(1.1);
  }
`

const Summary = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xl};
  text-align: right;
  font-size: 1.1rem;
`

const CheckoutButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  margin-top: ${({ theme }) => theme.spacing.md};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`

const ClearCartButton = styled.button`
  background: none;
  border: none;
  color: gray;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.2s ease;
  margin-top: 10px;

  &:hover {
    background: ${({ theme }) => theme.colors.error}20;
    color: ${({ theme }) => theme.colors.error};
  }
`

const Cart: React.FC = () => {
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

  const handleQuantityChange = (id: string, size: string, color: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(id, size, color, newQuantity)
  }

  // Editable row component to allow selecting size/color in-cart for placeholder items
  const EditableCartRow: React.FC<{ item: any }> = ({ item }) => {
    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [selectedColor, setSelectedColor] = useState(item.color || '')
    const [selectedSize, setSelectedSize] = useState(item.size || '')
    const [availableColors, setAvailableColors] = useState<{ name: string; code: string }[]>([])
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
          // compute available colors and sizes
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

    const applySelection = () => {
      if (!product) return
      if (!selectedColor || !selectedSize) {
        toast.error('Please select size and color')
        return
      }
      // find matching variation
      const v = (product.variations || []).find((x: any) => x.color === selectedColor && x.size === selectedSize)
      if (!v) {
        toast.error('Selected combination is not available')
        return
      }

      // remove old placeholder and add new item with chosen options and variation price
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

    if (loading) return <div>Loading...</div>

    return (
      <CartItem key={`${item.id}-${item.size}-${item.color}`}>
        <img src={item.image} alt={item.name} />
        <ItemDetails>
          <h4>{item.name}</h4>
          <p>₦{(item.price || 0).toLocaleString()}</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Color</div>
              <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                <option value="">Select color</option>
                {availableColors.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Size</div>
              <select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
                <option value="">Select size</option>
                {availableSizes.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <button onClick={applySelection} style={{ marginTop: 20 }}>Save Options</button>
            </div>
          </div>
        </ItemDetails>
        <Controls>
          <QuantityControl>
            <QuantityButton
              onClick={() => handleQuantityChange(item.id, item.size, item.color, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              −
            </QuantityButton>
            <QuantityInput
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(item.id, item.size, item.color, parseInt(e.target.value) || 1)}
            />
            <QuantityButton onClick={() => handleQuantityChange(item.id, item.size, item.color, item.quantity + 1)}>
              +
            </QuantityButton>
          </QuantityControl>
          <RemoveButton onClick={() => removeItem(item.id, item.size, item.color)}>✖</RemoveButton>
        </Controls>
      </CartItem>
    )
  }

  return (
    <Container>
      <CartHeader>Your Shopping Cart</CartHeader>

      {items.length === 0 ? (
        <p style={{ textAlign: "center" }}>Your cart is empty.</p>
      ) : (
        <>
          {items.map((item) => {
            if (!item.size || !item.color) {
              return <EditableCartRow key={`${item.id}-${item.size}-${item.color}`} item={item} />
            }

            return (
              <CartItem key={`${item.id}-${item.size}-${item.color}`}>
                <img src={item.image} alt={item.name} />
                <ItemDetails>
                  <h4>{item.name}</h4>
                  <p>₦{(item.price || 0).toLocaleString()}</p>
                  <p>
                    Size: <strong>{item.size}</strong> | Color:{" "}
                    <strong>{item.color}</strong>
                  </p>
                </ItemDetails>
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
                  <RemoveButton
                    onClick={() => removeItem(item.id, item.size, item.color)}
                    title="Remove item"
                  >
                    ✖
                  </RemoveButton>
                </Controls>
              </CartItem>
            )
          })}

          <Summary>
            <p>
              <strong>{totalItems}</strong> items —{" "}
              <strong>₦{totalPrice.toLocaleString()}</strong>
            </p>
            <CheckoutButton onClick={() => (window.location.href = "/checkout")}>
              Proceed to Checkout
            </CheckoutButton>
            <br />
            <ClearCartButton onClick={clearCart}>
              Clear Cart
            </ClearCartButton>
          </Summary>
        </>
      )}
    </Container>
  )
}

export default Cart