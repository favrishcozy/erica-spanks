import React from "react"
import styled from "styled-components"
import { useCartStore } from "../../stores/cartStore"

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

  return (
    <Container>
      <CartHeader>Your Shopping Cart</CartHeader>

      {items.length === 0 ? (
        <p style={{ textAlign: "center" }}>Your cart is empty.</p>
      ) : (
        <>
          {items.map((item) => (
            <CartItem key={`${item.id}-${item.size}-${item.color}`}>
              <img src={item.image} alt={item.name} />
              <ItemDetails>
                <h4>{item.name}</h4>
                <p>₦{item.price.toLocaleString()}</p>
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
                        item.size || '', 
                        item.color || '', 
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
                        item.size || '', 
                        item.color || '', 
                        parseInt(e.target.value) || 1
                      )
                    }
                  />
                  <QuantityButton
                    onClick={() => 
                      handleQuantityChange(
                        item.id, 
                        item.size || '', 
                        item.color || '', 
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
          ))}

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