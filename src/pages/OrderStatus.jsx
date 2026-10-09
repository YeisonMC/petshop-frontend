import { useEffect, useState } from 'react'
import { motion, MotionConfig } from 'motion/react'
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  PackageCheck,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import SiteHeader from '../components/common/SiteHeader.jsx'
import SiteFooter from '../components/common/SiteFooter.jsx'
import CheckoutProgress from '../features/checkout/CheckoutProgress.jsx'
import OrderSummary from '../features/checkout/OrderSummary.jsx'
import useAuth from '../features/auth/useAuth.js'
import api, { getApiError } from '../services/api.js'

export default function OrderStatus() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, checkingSession } = useAuth()
  const [status, setStatus] = useState(null)
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return undefined
    let active = true
    let timer
    api
      .get(`/pedidos/${id}`)
      .then(({ data }) => {
        if (active) setOrder(data.data)
      })
      .catch(() => {})

    const refresh = async () => {
      try {
        const { data } = await api.get(`/pedidos/${id}/pago`)
        if (!active) return
        setStatus(data.data)
        setError('')
        if (data.data.estado_pedido === 'PENDIENTE') timer = setTimeout(refresh, 3000)
      } catch (requestError) {
        if (active) setError(getApiError(requestError, 'No se pudo consultar el pedido.'))
      } finally {
        if (active) setLoading(false)
      }
    }
    refresh()
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [id, token])

  const paid = status?.estado_pedido === 'PAGADO'
  const canceled = status?.estado_pedido === 'CANCELADO'

  return (
    <MotionConfig reducedMotion="user">
      <div className="page-shell checkout-flow">
        <SiteHeader showAnnouncement={false} />
        <main className="checkout-page">
          <CheckoutProgress current={4} />
          {!token && !checkingSession ? (
            <section className="checkout-card checkout-auth-gate">
              <UserRound size={32} />
              <h2>Inicia sesión para ver tu pedido</h2>
              <Link
                className="button button--primary"
                to={`/cuenta?volver=/pedido/${id}`}
              >
                Iniciar sesión
              </Link>
            </section>
          ) : loading || checkingSession ? (
            <p className="status-message">Consultando tu pedido…</p>
          ) : error ? (
            <section className="checkout-card checkout-auth-gate">
              <p className="form-error" role="alert">
                {error}
              </p>
              <button
                className="checkout-text-button"
                type="button"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </button>
            </section>
          ) : (
            <div className="checkout-main-grid">
              <div className="checkout-stack">
                <motion.section
                  className={`checkout-card checkout-confirmation${paid ? ' is-paid' : canceled ? ' is-canceled' : ' is-pending'}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="checkout-confirmation__icon">
                    {paid ? (
                      <CheckCircle2 size={46} />
                    ) : canceled ? (
                      <XCircle size={46} />
                    ) : (
                      <Clock3 size={46} />
                    )}
                  </div>
                  <span className="eyebrow">
                    PEDIDO {order?.codigo_pedido || `#${id}`}
                  </span>
                  <h1>
                    {paid
                      ? '¡Tu pago fue confirmado!'
                      : canceled
                        ? 'El pedido fue cancelado'
                        : 'Tu pago está pendiente'}
                  </h1>
                  <p>
                    {paid
                      ? '¡Gracias por confiar en SUPERPET! La reserva se convirtió en una compra y tu pedido quedó registrado.'
                      : canceled
                        ? 'La reserva del inventario fue liberada. Puedes volver a elegir tus productos.'
                        : 'Estamos comprobando el resultado. Esta pantalla se actualiza automáticamente y no realiza un nuevo cobro.'}
                  </p>
                  <div className="checkout-confirmation__facts">
                    <span>
                      <CreditCard size={19} />{' '}
                      {paid
                        ? 'Pago aprobado'
                        : canceled
                          ? 'Pago no completado'
                          : 'Esperando confirmación'}
                    </span>
                    <span>
                      <ShieldCheck size={19} /> Modo de prueba de Stripe
                    </span>
                  </div>
                  <div className="checkout-confirmation__actions">
                    <Link className="button button--primary" to="/">
                      Seguir comprando
                    </Link>
                    {!paid && !canceled && (
                      <Link className="checkout-text-button" to={`/pagar/${id}`}>
                        Volver al formulario de pago
                      </Link>
                    )}
                  </div>
                </motion.section>
                <div className="checkout-help">
                  <PackageCheck size={26} />
                  <div>
                    <strong>Tu pedido permanece en tu cuenta</strong>
                    <span>Puedes consultar su estado cuando lo necesites.</span>
                  </div>
                  <ShieldCheck size={23} className="checkout-help__end" />
                </div>
              </div>
              {order && (
                <OrderSummary
                  items={order.detalles || []}
                  subtotal={order.subtotal}
                  shipping={order.costo_envio}
                  discount={order.descuento}
                  total={order.total}
                  actionLabel={paid || canceled ? 'Volver a la tienda' : 'Volver al pago'}
                  onAction={() => navigate(paid || canceled ? '/' : `/pagar/${id}`)}
                />
              )}
            </div>
          )}
        </main>
        <SiteFooter />
      </div>
    </MotionConfig>
  )
}
