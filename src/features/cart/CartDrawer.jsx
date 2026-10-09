import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import formatPrice from '../../utils/formatPrice.js'
import { getApiError } from '../../services/api.js'
import useAuth from '../auth/useAuth.js'
import ProductImage from '../products/components/ProductImage.jsx'
import useCart from './useCart.js'

export default function CartDrawer() {
  const {
    isOpen,
    closeCart,
    cart,
    cartLoading,
    cartError,
    count,
    updateItem,
    removeItem,
  } = useCart()
  const { token } = useAuth()
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeCart])

  const changeItem = async (item, nextQuantity) => {
    setBusyId(item.id_variante)
    setError('')
    try {
      if (nextQuantity < 1) await removeItem(item.id_variante)
      else await updateItem(item.id_variante, nextQuantity)
    } catch (requestError) {
      setError(getApiError(requestError))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="drawer-layer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="drawer-scrim" onClick={closeCart} aria-hidden="true" />
          <motion.aside
            className="cart-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Tu carrito"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 330, damping: 32 }}
          >
            <div className="cart-drawer__header">
              <div>
                <h2>
                  Tu carrito <span>({count})</span>
                </h2>
                <p>Lo mejor para tu mascota</p>
              </div>
              <button
                className="close-button"
                type="button"
                onClick={closeCart}
                aria-label="Cerrar carrito"
              >
                <X size={20} />
              </button>
            </div>
            {!token ? (
              <div className="cart-empty">
                <ShoppingCart size={46} strokeWidth={1.5} />
                <h3>Tu carrito está vacío</h3>
                <p>Inicia sesión para guardar y consultar tus productos.</p>
                <Link className="button button--primary" to="/cuenta" onClick={closeCart}>
                  Iniciar sesión
                </Link>
              </div>
            ) : cartLoading ? (
              <p className="status-message">Cargando carrito…</p>
            ) : cartError ? (
              <p className="status-message status-message--error">
                No pudimos cargar el carrito. Vuelve a intentarlo.
              </p>
            ) : !cart?.items?.length ? (
              <div className="cart-empty">
                <ShoppingCart size={46} strokeWidth={1.5} />
                <h3>Tu carrito está vacío</h3>
                <Link
                  className="button button--primary"
                  to="/#productos"
                  onClick={closeCart}
                >
                  Seguir comprando
                </Link>
              </div>
            ) : (
              <>
                <div className="cart-drawer__items">
                  {cart.items.map((item) => (
                    <article className="cart-item" key={item.id_variante}>
                      <ProductImage
                        key={item.imagen_principal || item.id_variante}
                        src={item.imagen_principal}
                        alt={item.producto}
                      />
                      <div className="cart-item__detail">
                        <strong>{item.producto}</strong>
                        <span>{item.nombre_variante}</span>
                        <b>{formatPrice(item.subtotal)}</b>
                        <div className="quantity-control">
                          <button
                            type="button"
                            disabled={busyId === item.id_variante}
                            onClick={() => changeItem(item, item.cantidad - 1)}
                            aria-label={`Quitar una unidad de ${item.producto}`}
                          >
                            <Minus size={14} />
                          </button>
                          <span>{item.cantidad}</span>
                          <button
                            type="button"
                            disabled={
                              busyId === item.id_variante ||
                              item.cantidad >= item.stock_disponible
                            }
                            onClick={() => changeItem(item, item.cantidad + 1)}
                            aria-label={`Agregar una unidad de ${item.producto}`}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <button
                        className="cart-item__remove"
                        type="button"
                        disabled={busyId === item.id_variante}
                        onClick={() => changeItem(item, 0)}
                        aria-label={`Eliminar ${item.producto}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </article>
                  ))}
                </div>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <div className="cart-drawer__footer">
                  <div>
                    <span>Subtotal</span>
                    <strong>{formatPrice(cart.resumen.subtotal)}</strong>
                  </div>
                  <Link
                    className="button button--primary checkout-submit"
                    to="/carrito"
                    onClick={closeCart}
                  >
                    Ver carrito <ArrowRight size={17} />
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
