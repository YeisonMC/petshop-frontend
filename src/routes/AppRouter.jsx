import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import AuthProvider from '../features/auth/AuthProvider.jsx'
import CartProvider from '../features/cart/CartProvider.jsx'
import CartDrawer from '../features/cart/CartDrawer.jsx'
import Home from '../pages/Home.jsx'

const Login = lazy(() => import('../pages/Login.jsx'))

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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <CartDrawer />
      </CartProvider>
    </AuthProvider>
  )
}
