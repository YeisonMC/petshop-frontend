import { useEffect, useMemo, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { motion, MotionConfig } from 'motion/react'
import {
  Check,
  ChevronDown,
  CreditCard,
  Headset,
  Link2,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Smartphone,
  Tag,
  Truck,
  UserRound,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import heroPets from '../assets/hero-pets.webp'
import SiteHeader from '../components/common/SiteHeader.jsx'
import SiteFooter from '../components/common/SiteFooter.jsx'
import CheckoutProgress from '../features/checkout/CheckoutProgress.jsx'
import OrderSummary from '../features/checkout/OrderSummary.jsx'
import useAuth from '../features/auth/useAuth.js'
import api, { getApiError } from '../services/api.js'

const enter = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.33 },
}

function DetailCard({ number, title, icon: Icon = UserRound, children, delay = 0 }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <motion.section
      className="checkout-card checkout-detail-card"
      {...enter}
      transition={{ duration: 0.33, delay }}
    >
      <button
        className="checkout-card__heading checkout-detail-card__toggle"
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
      >
        <span className="checkout-card__number">{number}</span>
        <h2>{title}</h2>
        <ChevronDown
          className="checkout-detail-card__chevron"
          size={18}
          aria-hidden="true"
        />
      </button>
      <div className={`checkout-detail-card__content${expanded ? ' is-expanded' : ''}`}>
        <Icon size={23} aria-hidden="true" />
        {children}
      </div>
    </motion.section>
  )
}

function PaymentForm({ order, address, user }) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [paymentReady, setPaymentReady] = useState(false)
  const [error, setError] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    if (!stripe || !elements || busy) return
    setBusy(true)
    setError('')
    try {
      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/pedido/${order.id_pedido}`,
        },
        redirect: 'if_required',
      })
      if (paymentError) setError(paymentError.message || 'No se pudo completar el pago.')
      else navigate(`/pedido/${order.id_pedido}`, { replace: true })
    } catch {
      setError('No se pudo contactar a Stripe. Inténtalo de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="checkout-main-grid checkout-payment-form" onSubmit={submit}>
      <div className="checkout-stack">
        <DetailCard number={1} title="Información de contacto">
          <div>
            <strong>
              {user ? `${user.nombres} ${user.apellidos}` : 'Cliente SUPERPET'}
            </strong>
            <span>{user?.correo || 'Cuenta de cliente'}</span>
          </div>
          <span className="checkout-detail-card__aside">
            {address?.telefono_contacto || ''}
          </span>
        </DetailCard>

        <DetailCard number={2} title="Dirección de envío" icon={MapPin} delay={0.05}>
          <div>
            <strong>
              {address?.direccion_linea1 || 'Dirección registrada en el pedido'}
            </strong>
            <span>
              {address
                ? `${address.distrito}, ${address.provincia}, ${address.departamento}`
                : 'Tu dirección de entrega'}
            </span>
          </div>
        </DetailCard>

        <DetailCard number={3} title="Método de envío" icon={Truck} delay={0.1}>
          <div>
            <strong>Envío estándar</strong>
            <span>Entrega de prueba; sin costo de envío</span>
          </div>
          <strong className="checkout-detail-card__aside">
            {Number(order.costo_envio) === 0
              ? 'Gratis'
              : `S/ ${Number(order.costo_envio).toFixed(2)}`}
          </strong>
        </DetailCard>

        <motion.section
          className="checkout-card checkout-payment-card"
          {...enter}
          transition={{ duration: 0.33, delay: 0.15 }}
        >
          <div className="checkout-card__heading">
            <span className="checkout-card__number">4</span>
            <h2>Método de pago</h2>
            <span className="checkout-payment-card__provider">
              <LockKeyhole size={16} /> Pago seguro con <b>stripe</b>
            </span>
          </div>
          <div className="checkout-methods" aria-label="Métodos de pago">
            <span className="checkout-method is-selected">
              <CreditCard size={24} />
              <strong>Tarjeta</strong>
              <small>Crédito o débito</small>
            </span>
            <span className="checkout-method is-unavailable" aria-disabled="true">
              <Link2 size={22} />
              <strong>Link</strong>
              <small>No disponible en demo</small>
            </span>
            <span className="checkout-method is-unavailable" aria-disabled="true">
              <Smartphone size={22} />
              <strong>Wallets</strong>
              <small>No disponible en demo</small>
            </span>
          </div>

          <div className="checkout-payment-card__body">
            <div className="checkout-stripe-panel">
              <div className="checkout-stripe-panel__notice">
                <LockKeyhole size={20} />
                <div>
                  <strong>Tus datos se procesan de forma segura con Stripe</strong>
                  <span>SUPERPET no almacena la información de tu tarjeta.</span>
                </div>
              </div>
              {!paymentReady && (
                <p className="checkout-muted">Cargando formulario seguro…</p>
              )}
              <PaymentElement
                options={{ layout: 'tabs' }}
                onReady={() => setPaymentReady(true)}
              />
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <p className="checkout-stripe-panel__caption">
                Formulario de prueba protegido por Stripe. Utiliza únicamente tarjetas de
                prueba.
              </p>
            </div>
            <div className="checkout-security-card">
              <ShieldCheck size={31} />
              <h3>Pago 100% seguro</h3>
              <ul>
                <li>
                  <Check size={16} /> Los datos viajan cifrados a Stripe.
                </li>
                <li>
                  <Check size={16} /> No guardamos tu número de tarjeta.
                </li>
                <li>
                  <Check size={16} /> Tu pedido se confirma tras aprobar el pago.
                </li>
              </ul>
              <span className="checkout-security-card__script">
                Compras seguras para ellos ♡
              </span>
              <img src={heroPets} alt="Perro y gato" />
            </div>
          </div>
        </motion.section>

        <motion.section
          className="checkout-card checkout-coupon"
          {...enter}
          transition={{ duration: 0.33, delay: 0.2 }}
        >
          <Tag size={22} />
          <strong>Código de descuento</strong>
          <input aria-label="Código de descuento" placeholder="Próximamente" disabled />
          <button type="button" disabled>
            Aplicar
          </button>
        </motion.section>
        <div className="checkout-help">
          <Headset size={26} />
          <div>
            <strong>¿Necesitas ayuda con tu pago?</strong>
            <span>Este es un entorno de prueba: no se realizará un cobro real.</span>
          </div>
          <ShieldCheck size={23} className="checkout-help__end" />
        </div>
      </div>
      <OrderSummary
        items={order.detalles || []}
        subtotal={order.subtotal}
        shipping={order.costo_envio}
        discount={order.descuento}
        total={order.total}
        actionLabel={busy ? 'Procesando…' : 'Pagar ahora'}
        actionType="submit"
        actionDisabled={!stripe || !elements || !paymentReady || busy}
      />
    </form>
  )
}

export default function Payment() {
  const { id } = useParams()
  const { token, user, checkingSession } = useAuth()
  const [order, setOrder] = useState(null)
  const [intent, setIntent] = useState(null)
  const [address, setAddress] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const stripePromise = useMemo(
    () => (intent?.publishable_key ? loadStripe(intent.publishable_key) : null),
    [intent],
  )

  useEffect(() => {
    if (!token) return undefined
    let active = true
    Promise.all([
      api.get(`/pedidos/${id}`),
      api.post(`/pedidos/${id}/pago/intento`),
      api.get('/direcciones').catch(() => ({ data: { data: [] } })),
    ])
      .then(([orderResponse, intentResponse, addressesResponse]) => {
        if (!active) return
        const loadedOrder = orderResponse.data.data
        setOrder(loadedOrder)
        setIntent(intentResponse.data.data)
        setAddress(
          addressesResponse.data.data.find(
            (item) => item.id_direccion === loadedOrder.id_direccion,
          ) || null,
        )
      })
      .catch((requestError) => {
        if (active) setError(getApiError(requestError, 'No se pudo preparar el pago.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id, token])

  return (
    <MotionConfig reducedMotion="user">
      <div className="page-shell checkout-flow">
        <SiteHeader showAnnouncement={false} />
        <main className="checkout-page">
          <CheckoutProgress current={3} />
          {!token && !checkingSession ? (
            <section className="checkout-card checkout-auth-gate">
              <UserRound size={31} />
              <h2>Tu sesión terminó</h2>
              <p>Inicia sesión para continuar con el pedido.</p>
              <Link className="button button--primary" to={`/cuenta?volver=/pagar/${id}`}>
                Iniciar sesión
              </Link>
            </section>
          ) : loading || checkingSession ? (
            <p className="status-message">Preparando tu pago seguro…</p>
          ) : error ? (
            <section className="checkout-card checkout-auth-gate">
              <p className="form-error" role="alert">
                {error}
              </p>
              <Link className="checkout-text-button" to={`/pedido/${id}`}>
                Consultar estado del pedido
              </Link>
            </section>
          ) : intent?.estado === 'APROBADO' || !intent?.client_secret ? (
            <section className="checkout-card checkout-auth-gate">
              <ShieldCheck size={38} />
              <h2>Este pedido ya está pagado</h2>
              <Link className="button button--primary" to={`/pedido/${id}`}>
                Ver pedido
              </Link>
            </section>
          ) : (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: intent.client_secret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#ff553e',
                    colorText: '#073e47',
                    colorBackground: '#ffffff',
                    colorDanger: '#d93025',
                    fontFamily: 'Roboto, sans-serif',
                    borderRadius: '8px',
                  },
                },
                locale: 'es',
              }}
            >
              <PaymentForm order={order} address={address} user={user} />
            </Elements>
          )}
        </main>
        <SiteFooter />
      </div>
    </MotionConfig>
  )
}
