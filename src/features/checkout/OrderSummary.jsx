import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import {
  ArrowRight,
  ChevronDown,
  Minus,
  PawPrint,
  Plus,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import ProductImage from '../products/components/ProductImage.jsx'
import formatPrice from '../../utils/formatPrice.js'
import checkoutIllustrationFor from './checkoutIllustrationFor.js'

export default function OrderSummary({
  items = [],
  subtotal = 0,
  shipping = 0,
  discount = 0,
  total = 0,
  actionLabel,
  onAction,
  actionDisabled = false,
  actionType = 'button',
  loading = false,
  error,
  onQuantity,
  busyItem,
  hideProducts = false,
}) {
  const [expanded, setExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 760px)').matches
      : false,
  )
  const itemCount = items.reduce((sum, item) => sum + Number(item.cantidad || 0), 0)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const onChange = (event) => setIsMobile(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const headingContents = (
    <>
      <strong>Resumen de tu pedido</strong>
      <span>
        {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
      </span>
      {!hideProducts && <ChevronDown size={17} aria-hidden="true" />}
    </>
  )

  return (
    <motion.aside
      className="checkout-summary-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, delay: 0.15 }}
    >
      <div className="checkout-summary-card">
        {hideProducts ? (
          <div className="checkout-summary__heading">{headingContents}</div>
        ) : (
          <button
            className="checkout-summary__heading"
            type="button"
            aria-expanded={isMobile ? expanded : true}
            aria-controls="checkout-summary-products"
            tabIndex={isMobile ? 0 : -1}
            onClick={() => {
              if (isMobile) setExpanded((value) => !value)
            }}
          >
            {headingContents}
          </button>
        )}

        {hideProducts ? null : loading ? (
          <p className="checkout-summary__status">Cargando productos…</p>
        ) : items.length ? (
          <div
            id="checkout-summary-products"
            className={`checkout-summary__products${expanded ? ' is-expanded' : ''}`}
          >
            {items.map((item) => {
              const id = item.id_variante
              const name = item.producto || item.nombre_producto
              const image =
                !item.imagen_principal ||
                /^https?:\/\/cdn\.petshopdemo\.pe\//i.test(item.imagen_principal)
                  ? checkoutIllustrationFor(name)
                  : item.imagen_principal
              const canChange = Boolean(onQuantity)
              const count = Number(item.cantidad)

              return (
                <div className="checkout-summary__item" key={id}>
                  <ProductImage
                    key={image || id}
                    src={image}
                    alt={name}
                    className="checkout-summary__image"
                  />
                  <div className="checkout-summary__item-copy">
                    <strong>{name}</strong>
                    <small>
                      {item.nombre_variante || item.sku || 'Producto SUPERPET'}
                    </small>
                    {canChange ? (
                      <div
                        className="checkout-summary__quantity"
                        aria-label={`Cantidad de ${name}`}
                      >
                        <button
                          type="button"
                          aria-label={`Quitar una unidad de ${name}`}
                          disabled={busyItem === id}
                          onClick={() => onQuantity(item, count - 1)}
                        >
                          <Minus size={13} />
                        </button>
                        <span>{count}</span>
                        <button
                          type="button"
                          aria-label={`Agregar una unidad de ${name}`}
                          disabled={
                            busyItem === id || count >= Number(item.stock_disponible)
                          }
                          onClick={() => onQuantity(item, count + 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    ) : (
                      <span className="checkout-summary__quantity-readonly">
                        Cantidad: {count}
                      </span>
                    )}
                  </div>
                  <b>{formatPrice(item.subtotal)}</b>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="checkout-summary__status">Tu carrito está vacío.</p>
        )}

        <div className="checkout-summary__totals">
          <div>
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div>
            <span>Envío estándar</span>
            <span>{Number(shipping) === 0 ? 'Gratis' : formatPrice(shipping)}</span>
          </div>
          {Number(discount) > 0 && (
            <div className="checkout-summary__discount">
              <span>Descuento</span>
              <span>− {formatPrice(discount)}</span>
            </div>
          )}
        </div>
        <div className="checkout-summary__grand-total">
          <span>Total a pagar</span>
          <strong>{formatPrice(total)}</strong>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {actionLabel && (
          <button
            className="button button--primary checkout-summary__action"
            type={actionType}
            onClick={onAction}
            disabled={actionDisabled}
          >
            {actionLabel} <ArrowRight size={19} />
          </button>
        )}
        <p className="checkout-summary__fineprint">
          <ShieldCheck size={14} /> Pago de prueba protegido por Stripe. No introduzcas
          una tarjeta real.
        </p>
      </div>
      <div className="checkout-assurances" aria-label="Beneficios de compra">
        <div>
          <Truck size={25} />
          <span>
            Envío estándar
            <br />
            sin costo
          </span>
        </div>
        <div>
          <ShieldCheck size={25} />
          <span>
            Pago protegido
            <br />
            por Stripe
          </span>
        </div>
        <div>
          <PawPrint size={25} />
          <span>
            Productos para
            <br />
            tus mascotas
          </span>
        </div>
      </div>
      <div className="checkout-summary__mobile-bar">
        <span>
          <small>Total a pagar</small>
          <strong>{formatPrice(total)}</strong>
        </span>
        {actionLabel && (
          <button
            className="button button--primary"
            type={actionType}
            onClick={onAction}
            disabled={actionDisabled}
          >
            {actionLabel} <ArrowRight size={17} />
          </button>
        )}
      </div>
    </motion.aside>
  )
}
