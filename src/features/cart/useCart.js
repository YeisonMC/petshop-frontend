import { useContext } from 'react'
import CartContext from './cart-context.js'

export default function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart requiere CartProvider')
  return context
}
