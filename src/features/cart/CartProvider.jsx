import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api.js'
import useAuth from '../auth/useAuth.js'
import CartContext from './cart-context.js'

export default function CartProvider({ children }) {
  const { token, logout } = useAuth()
  const [isOpen, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const cartKey = ['cart', token]

  const cartQuery = useQuery({
    queryKey: cartKey,
    queryFn: async () => (await api.get('/carrito')).data.data,
    enabled: Boolean(token),
    retry: false,
  })

  const send = async (method, path, body) => {
    try {
      const { data } = await api({ method, url: path, data: body })
      queryClient.setQueryData(cartKey, data.data)
      return data.data
    } catch (error) {
      if (error.response?.status === 401) logout()
      throw error
    }
  }

  const value = {
    isOpen,
    openCart: () => setOpen(true),
    closeCart: () => setOpen(false),
    cart: cartQuery.data,
    cartLoading: cartQuery.isPending && Boolean(token),
    cartError: cartQuery.isError,
    count: cartQuery.data?.resumen?.cantidad_total || 0,
    addItem: (idVariante) =>
      send('post', '/carrito/items', { id_variante: idVariante, cantidad: 1 }),
    updateItem: (idVariante, cantidad) =>
      send('patch', `/carrito/items/${idVariante}`, { cantidad }),
    removeItem: (idVariante) => send('delete', `/carrito/items/${idVariante}`),
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
