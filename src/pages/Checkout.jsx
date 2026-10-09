import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import {
  Check,
  CreditCard,
  Headset,
  LockKeyhole,
  Mail,
  MapPin,
  PackageCheck,
  Plus,
  Tag,
  Truck,
  UserRound,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import SiteHeader from '../components/common/SiteHeader.jsx'
import SiteFooter from '../components/common/SiteFooter.jsx'
import CheckoutProgress from '../features/checkout/CheckoutProgress.jsx'
import OrderSummary from '../features/checkout/OrderSummary.jsx'
import useAuth from '../features/auth/useAuth.js'
import useCart from '../features/cart/useCart.js'
import api, { getApiError } from '../services/api.js'

const emptyAddress = {
  receptor: '',
  telefono_contacto: '',
  direccion_linea1: '',
  distrito: '',
  provincia: '',
  departamento: '',
}

const addressLabels = {
  receptor: 'Nombre de quien recibe',
  telefono_contacto: 'Teléfono de contacto',
  direccion_linea1: 'Calle y número',
  distrito: 'Distrito',
  provincia: 'Provincia',
  departamento: 'Departamento',
}

const cardMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32 },
}

export default function Checkout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { token, user, checkingSession } = useAuth()
  const { cart, cartLoading, updateItem, removeItem } = useCart()
  const [addresses, setAddresses] = useState([])
  const [addressId, setAddressId] = useState('')
  const [address, setAddress] = useState(emptyAddress)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [busy, setBusy] = useState(false)
  const [busyItem, setBusyItem] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) return undefined
    let active = true
    api
      .get('/direcciones')
      .then(({ data }) => {
        if (!active) return
        setAddresses(data.data)
        setAddressId(String(data.data[0]?.id_direccion || ''))
        setShowAddressForm(data.data.length === 0)
      })
      .catch((requestError) => {
        if (active)
          setError(getApiError(requestError, 'No se pudieron cargar tus direcciones.'))
      })
      .finally(() => {
        if (active) setLoadingAddresses(false)
      })
    return () => {
      active = false
    }
  }, [token])

  const saveAddress = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { data } = await api.post('/direcciones', address)
      setAddresses((previous) => [...previous, data.data])
      setAddressId(String(data.data.id_direccion))
      setShowAddressForm(false)
      setAddress(emptyAddress)
    } catch (requestError) {
      setError(getApiError(requestError, 'No se pudo guardar la dirección.'))
    } finally {
      setBusy(false)
    }
  }

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

  const createOrder = async () => {
    if (!addressId || busy) return
    setBusy(true)
    setError('')
    try {
      const { data } = await api.post('/pedidos', { id_direccion: Number(addressId) })
      queryClient.removeQueries({ queryKey: ['cart'] })
      navigate(`/pagar/${data.data.id_pedido}`)
    } catch (requestError) {
      setError(getApiError(requestError, 'No se pudo crear el pedido.'))
    } finally {
      setBusy(false)
    }
  }

  const hasItems = Boolean(cart?.items?.length)

  return (
    <MotionConfig reducedMotion="user">
      <div className="page-shell checkout-flow">
        <SiteHeader showAnnouncement={false} />
        <main className="checkout-page">
          <CheckoutProgress current={2} />
          {!token && !checkingSession ? (
            <motion.section className="checkout-card checkout-auth-gate" {...cardMotion}>
              <UserRound size={31} />
              <h2>Inicia sesión para continuar</h2>
              <p>Así podremos asociar la dirección y el pedido a tu cuenta.</p>
              <Link className="button button--primary" to="/cuenta?volver=/checkout">
                Iniciar sesión
              </Link>
            </motion.section>
          ) : (
            <div className="checkout-main-grid">
              <div className="checkout-stack">
                <motion.section
                  className="checkout-card checkout-info-card"
                  {...cardMotion}
                >
                  <div className="checkout-card__heading">
                    <span className="checkout-card__number">1</span>
                    <h2>Información de contacto</h2>
                  </div>
                  <div className="checkout-info-line">
                    <UserRound size={22} />
                    <div>
                      <strong>
                        {user
                          ? `${user.nombres} ${user.apellidos}`
                          : 'Cargando contacto…'}
                      </strong>
                      <span>{user?.correo || ''}</span>
                    </div>
                    <Mail size={21} className="checkout-info-line__end" />
                  </div>
                </motion.section>

                <motion.section
                  className="checkout-card checkout-address-card"
                  {...cardMotion}
                  transition={{ delay: 0.06, duration: 0.32 }}
                >
                  <div className="checkout-card__heading">
                    <span className="checkout-card__number">2</span>
                    <h2>Dirección de envío</h2>
                    {addresses.length > 0 && !showAddressForm && (
                      <button
                        className="checkout-card__edit"
                        type="button"
                        onClick={() => setShowAddressForm(true)}
                      >
                        <Plus size={16} /> Agregar
                      </button>
                    )}
                  </div>
                  {loadingAddresses || checkingSession ? (
                    <p className="checkout-muted">Cargando direcciones…</p>
                  ) : (
                    <>
                      {addresses.map((item) => (
                        <label
                          className="checkout-address-option"
                          key={item.id_direccion}
                        >
                          <input
                            type="radio"
                            name="delivery-address"
                            value={item.id_direccion}
                            checked={addressId === String(item.id_direccion)}
                            onChange={(event) => setAddressId(event.target.value)}
                          />
                          <MapPin size={23} aria-hidden="true" />
                          <span>
                            <strong>{item.direccion_linea1}</strong>
                            <small>
                              {item.distrito}, {item.provincia}, {item.departamento} ·{' '}
                              {item.receptor}
                            </small>
                          </span>
                          {addressId === String(item.id_direccion) && (
                            <Check
                              size={18}
                              className="checkout-address-option__check"
                              aria-hidden="true"
                            />
                          )}
                        </label>
                      ))}
                      <AnimatePresence initial={false}>
                        {showAddressForm && (
                          <motion.form
                            className="checkout-address-form"
                            onSubmit={saveAddress}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <h3>Nueva dirección</h3>
                            <div className="checkout-address-form__grid">
                              {Object.keys(emptyAddress).map((field) => (
                                <label key={field}>
                                  {addressLabels[field]}
                                  <input
                                    required
                                    value={address[field]}
                                    onChange={(event) =>
                                      setAddress((previous) => ({
                                        ...previous,
                                        [field]: event.target.value,
                                      }))
                                    }
                                    maxLength={field === 'telefono_contacto' ? 20 : 150}
                                    autoComplete={
                                      field === 'direccion_linea1'
                                        ? 'street-address'
                                        : 'off'
                                    }
                                  />
                                </label>
                              ))}
                            </div>
                            <div className="checkout-actions">
                              <button
                                className="button button--primary"
                                type="submit"
                                disabled={busy}
                              >
                                {busy ? 'Guardando…' : 'Guardar dirección'}
                              </button>
                              {addresses.length > 0 && (
                                <button
                                  className="checkout-text-button"
                                  type="button"
                                  onClick={() => setShowAddressForm(false)}
                                >
                                  Cancelar
                                </button>
                              )}
                            </div>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </motion.section>

                <motion.section
                  className="checkout-card checkout-info-card"
                  {...cardMotion}
                  transition={{ delay: 0.12, duration: 0.32 }}
                >
                  <div className="checkout-card__heading">
                    <span className="checkout-card__number">3</span>
                    <h2>Método de envío</h2>
                  </div>
                  <div className="checkout-info-line">
                    <Truck size={23} />
                    <div>
                      <strong>Envío estándar</strong>
                      <span>Disponible en esta simulación</span>
                    </div>
                    <strong className="checkout-info-line__end checkout-info-line__price">
                      Gratis
                    </strong>
                  </div>
                </motion.section>

                <motion.section
                  className="checkout-card checkout-info-card"
                  {...cardMotion}
                  transition={{ delay: 0.18, duration: 0.32 }}
                >
                  <div className="checkout-card__heading">
                    <span className="checkout-card__number">4</span>
                    <h2>Método de pago</h2>
                    <LockKeyhole size={19} className="checkout-card__heading-icon" />
                  </div>
                  <div className="checkout-info-line">
                    <CreditCard size={23} />
                    <div>
                      <strong>Tarjeta de prueba</strong>
                      <span>
                        El formulario seguro de Stripe aparece en el siguiente paso.
                      </span>
                    </div>
                  </div>
                </motion.section>

                <motion.section
                  className="checkout-card checkout-coupon"
                  {...cardMotion}
                  transition={{ delay: 0.22, duration: 0.32 }}
                >
                  <Tag size={22} />
                  <strong>Código de descuento</strong>
                  <input
                    aria-label="Código de descuento"
                    placeholder="Próximamente"
                    disabled
                  />
                  <button type="button" disabled>
                    Aplicar
                  </button>
                </motion.section>
                <div className="checkout-help">
                  <Headset size={26} />
                  <div>
                    <strong>¿Necesitas ayuda con tu compra?</strong>
                    <span>Revisa tu dirección antes de continuar al pago de prueba.</span>
                  </div>
                  <PackageCheck size={23} className="checkout-help__end" />
                </div>
              </div>
              <OrderSummary
                items={cart?.items || []}
                subtotal={cart?.resumen?.subtotal || 0}
                shipping={0}
                total={cart?.resumen?.subtotal || 0}
                loading={cartLoading}
                error={error}
                onQuantity={changeQuantity}
                busyItem={busyItem}
                actionLabel={busy ? 'Preparando…' : 'Continuar al pago'}
                onAction={createOrder}
                actionDisabled={
                  busy || !hasItems || !addressId || showAddressForm || loadingAddresses
                }
              />
            </div>
          )}
        </main>
        <SiteFooter />
      </div>
    </MotionConfig>
  )
}
