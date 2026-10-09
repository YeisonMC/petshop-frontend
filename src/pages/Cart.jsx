import { useState } from 'react'
import { motion, MotionConfig } from 'motion/react'
import { Minus, Package, Plus, ShoppingBag, Trash2, UserRound } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import SiteFooter from '../components/common/SiteFooter.jsx'
import SiteHeader from '../components/common/SiteHeader.jsx'
import useAuth from '../features/auth/useAuth.js'
import useCart from '../features/cart/useCart.js'
import CheckoutProgress from '../features/checkout/CheckoutProgress.jsx'
import OrderSummary from '../features/checkout/OrderSummary.jsx'
import checkoutIllustrationFor from '../features/checkout/checkoutIllustrationFor.js'
import ProductImage from '../features/products/components/ProductImage.jsx'
import { getApiError } from '../services/api.js'
import formatPrice from '../utils/formatPrice.js'

export default function Cart() {
  const navigate = useNavigate()
  const { token, checkingSession } = useAuth()
  const { cart, cartLoading, cartError, updateItem, removeItem } = useCart()
  const [busyItem, setBusyItem] = useState(null)
  const [error, setError] = useState('')

  const changeQuantity = async (item, quantity) => {
    setBusyItem(item.id_variante)
    setError('')
    try {
      if (quantity < 1) await removeItem(item.id_variante)
      else await updateItem(item.id_variante, quantity)
    } catch (requestError) {
      setError(getApiError(requestError, 'No se pudo actualizar el carrito.'))
    } finally {
      setBusyItem(null)
    }
  }

  const items = cart?.items || []
  const subtotal = cart?.resumen?.subtotal || 0

  return (
    <MotionConfig reducedMotion="user">
      <div className="page-shell checkout-flow">
        <SiteHeader showAnnouncement={false} />
        <main className="checkout-page">
          <CheckoutProgress current={1} />
          {!token && !checkingSession ? (
            <section className="checkout-card checkout-auth-gate">
              <UserRound size={31} />
              <h2>Inicia sesión para ver tu carrito</h2>
              <p>Tus productos quedarán asociados a tu cuenta.</p>
              <Link className="button button--primary" to="/cuenta?volver=/carrito">
                Iniciar sesión
              </Link>
            </section>
          ) : (
            <div className="checkout-main-grid">
              <motion.section
                className="checkout-card checkout-cart-card"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="checkout-card__heading">
                  <span className="checkout-card__number">
                    <ShoppingBag size={17} />
                  </span>
                  <h2>Tu carrito</h2>
                  <span className="checkout-cart-card__count">
                    {cart?.resumen?.cantidad_total || 0} productos
                  </span>
                </div>
                {cartLoading || checkingSession ? (
                  <p className="checkout-muted">Cargando tu carrito…</p>
                ) : cartError ? (
                  <p className="form-error" role="alert">
                    No se pudo cargar tu carrito. Actualiza la página para reintentar.
                  </p>
                ) : items.length === 0 ? (
                  <div className="checkout-cart-empty">
                    <Package size={44} />
                    <h3>Tu carrito está vacío</h3>
                    <p>Explora el catálogo y elige algo especial para tu mascota.</p>
                    <Link className="button button--primary" to="/#productos">
                      Explorar productos
                    </Link>
                  </div>
                ) : (
                  <div className="checkout-cart-items">
                    {items.map((item) => {
                      const image =
                        !item.imagen_principal ||
                        /^https?:\/\/cdn\.petshopdemo\.pe\//i.test(item.imagen_principal)
                          ? checkoutIllustrationFor(item.producto)
                          : item.imagen_principal

                      return (
                        <div className="checkout-cart-item" key={item.id_variante}>
                          <ProductImage
                            key={image || item.id_variante}
                            src={image}
                            alt={item.producto}
                            className="checkout-cart-item__image"
                          />
                          <div className="checkout-cart-item__copy">
                            <strong>{item.producto}</strong>
                            <span>{item.nombre_variante || item.sku}</span>
                            <button
                              className="checkout-text-button"
                              type="button"
                              onClick={() => changeQuantity(item, 0)}
                              disabled={busyItem === item.id_variante}
                            >
                              <Trash2 size={14} /> Quitar
                            </button>
                          </div>
                          <div className="checkout-cart-item__controls">
                            <strong>{formatPrice(item.subtotal)}</strong>
                            <div
                              className="checkout-summary__quantity"
                              aria-label={`Cantidad de ${item.producto}`}
                            >
                              <button
                                type="button"
                                aria-label={`Quitar una unidad de ${item.producto}`}
                                disabled={busyItem === item.id_variante}
                                onClick={() =>
                                  changeQuantity(item, Number(item.cantidad) - 1)
                                }
                              >
                                <Minus size={14} />
                              </button>
                              <span>{item.cantidad}</span>
                              <button
                                type="button"
                                aria-label={`Agregar una unidad de ${item.producto}`}
                                disabled={
                                  busyItem === item.id_variante ||
                                  Number(item.cantidad) >= Number(item.stock_disponible)
                                }
                                onClick={() =>
                                  changeQuantity(item, Number(item.cantidad) + 1)
                                }
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
              </motion.section>
              <OrderSummary
                items={items}
                subtotal={subtotal}
                total={subtotal}
                hideProducts
                loading={cartLoading}
                actionLabel="Continuar al envío"
                actionDisabled={!items.length || cartLoading || cartError}
                onAction={() => navigate('/checkout')}
              />
            </div>
          )}
        </main>
        <SiteFooter />
      </div>
    </MotionConfig>
  )
}
