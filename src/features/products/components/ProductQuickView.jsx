import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ShoppingCart, X } from 'lucide-react'
import { getApiError } from '../../../services/api.js'
import formatPrice from '../../../utils/formatPrice.js'
import useAuth from '../../auth/useAuth.js'
import useCart from '../../cart/useCart.js'
import { useProduct } from '../hooks/useCatalog.js'
import ProductImage from './ProductImage.jsx'

export default function ProductQuickView({ slug, onClose }) {
  const [selectedId, setSelectedId] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { data: product, isPending, isError } = useProduct(slug)
  const { token } = useAuth()
  const { addItem } = useCart()
  const navigate = useNavigate()
  const variants = product?.variantes || []
  const variant = variants.find((item) => item.id_variante === selectedId) || variants[0]

  const handleAdd = async () => {
    if (!token) {
      onClose()
      navigate('/cuenta')
      return
    }
    if (!variant?.disponible) return
    setBusy(true)
    setError('')
    try {
      await addItem(variant.id_variante)
      onClose()
    } catch (requestError) {
      setError(getApiError(requestError, 'No pudimos agregar el producto al carrito.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      {slug && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.section
            className="quick-view"
            role="dialog"
            aria-modal="true"
            aria-label="Detalle del producto"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.2 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="close-button"
              type="button"
              onClick={onClose}
              aria-label="Cerrar detalle"
            >
              <X size={19} />
            </button>
            {isPending && <p className="status-message">Cargando producto…</p>}
            {isError && (
              <p className="status-message status-message--error">
                No se pudo cargar el producto. Inténtalo de nuevo.
              </p>
            )}
            {product && (
              <div className="quick-view__grid">
                <ProductImage
                  key={product.imagenes?.[0]?.url_imagen || slug}
                  src={product.imagenes?.[0]?.url_imagen}
                  alt={product.nombre}
                />
                <div className="quick-view__content">
                  <span className="eyebrow">{product.marca}</span>
                  <h2>{product.nombre}</h2>
                  <p>{product.descripcion_corta || product.descripcion_larga}</p>
                  {variants.length > 1 && (
                    <label className="field-label" htmlFor="product-variant">
                      Presentación
                      <select
                        id="product-variant"
                        value={variant?.id_variante || ''}
                        onChange={(event) => setSelectedId(Number(event.target.value))}
                      >
                        {variants.map((item) => (
                          <option key={item.id_variante} value={item.id_variante}>
                            {item.nombre_variante}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {variants.length === 1 && (
                    <span className="variant-name">{variant.nombre_variante}</span>
                  )}
                  <div className="quick-view__price">
                    <strong>{formatPrice(variant?.precio_actual)}</strong>
                    {Number(variant?.precio) > Number(variant?.precio_actual) && (
                      <del>{formatPrice(variant.precio)}</del>
                    )}
                  </div>
                  <p className="availability">
                    {variant?.disponible
                      ? `${variant.stock_disponible} disponibles`
                      : 'Sin stock disponible'}
                  </p>
                  {error && (
                    <p className="form-error" role="alert">
                      {error}
                    </p>
                  )}
                  <button
                    className="button button--primary"
                    type="button"
                    disabled={!variant?.disponible || busy}
                    onClick={handleAdd}
                  >
                    <ShoppingCart size={17} aria-hidden="true" />{' '}
                    {token
                      ? busy
                        ? 'Agregando…'
                        : 'Agregar al carrito'
                      : 'Inicia sesión para comprar'}
                  </button>
                </div>
              </div>
            )}
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
