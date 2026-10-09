import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import AuthProvider from '../features/auth/AuthProvider.jsx'
import CartProvider from '../features/cart/CartProvider.jsx'
import CartDrawer from '../features/cart/CartDrawer.jsx'
import Home from '../pages/Home.jsx'

const Login = lazy(() => import('../pages/Login.jsx'))
const Cart = lazy(() => import('../pages/Cart.jsx'))
const Checkout = lazy(() => import('../pages/Checkout.jsx'))
const Payment = lazy(() => import('../pages/Payment.jsx'))
const OrderStatus = lazy(() => import('../pages/OrderStatus.jsx'))

export default function AppRouter() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/cuenta"
            element={
              <Suspense fallback={<p className="status-message">Cargando cuenta…</p>}>
                <Login />
              </Suspense>
            }
          />
          <Route
            path="/carrito"
            element={
              <Suspense fallback={<p className="status-message">Cargando carrito…</p>}>
                <Cart />
              </Suspense>
            }
          />
          <Route
            path="/checkout"
            element={
              <Suspense fallback={<p className="status-message">Cargando compra…</p>}>
                <Checkout />
              </Suspense>
            }
          />
          <Route
            path="/pagar/:id"
            element={
              <Suspense fallback={<p className="status-message">Cargando pago…</p>}>
                <Payment />
              </Suspense>
            }
          />
          <Route
            path="/pedido/:id"
            element={
              <Suspense fallback={<p className="status-message">Cargando pedido…</p>}>
                <OrderStatus />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <CartDrawer />
      </CartProvider>
    </AuthProvider>
  )
}
