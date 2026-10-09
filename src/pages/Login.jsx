import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react'
import { Brand } from '../components/common/SiteHeader.jsx'
import useAuth from '../features/auth/useAuth.js'
import { getApiError } from '../services/api.js'
import heroPets from '../assets/hero-pets.webp'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnPath = searchParams.get('volver')
  const safeReturnPath =
    returnPath?.startsWith('/') && !returnPath.startsWith('//') ? returnPath : '/'
  const { user, checkingSession, login, register, logout } = useAuth()
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const payload = {
      correo: String(form.get('correo')).trim(),
      password: String(form.get('password')),
    }
    if (mode === 'register') {
      payload.nombres = String(form.get('nombres')).trim()
      payload.apellidos = String(form.get('apellidos')).trim()
    }
    setBusy(true)
    setError('')
    try {
      if (mode === 'login') await login(payload)
      else await register(payload)
      navigate(safeReturnPath, { replace: true })
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          requestError.message || 'Revisa tus datos e inténtalo de nuevo.',
        ),
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <Link className="auth-back" to="/">
        <ArrowLeft size={17} /> Volver a la tienda
      </Link>
      <main className="auth-shell">
        <aside className="auth-visual">
          <Brand light />
          <div className="auth-visual__copy">
            <h1>
              Parte de su vida.
              <br />
              Parte de la tuya.
            </h1>
            <p>Todo lo que necesitan, en un solo lugar.</p>
          </div>
          <img src={heroPets} alt="Un perro y un gato" />
        </aside>
        <section className="auth-form-panel">
          <div className="auth-mobile-brand">
            <Brand />
          </div>
          {checkingSession ? (
            <p className="status-message">Comprobando sesión…</p>
          ) : user ? (
            <div className="account-summary">
              <UserRound size={35} strokeWidth={1.5} />
              <h2>Hola, {user.nombres}</h2>
              <p>Has iniciado sesión como {user.correo}.</p>
              <Link className="button button--primary" to="/">
                Volver al catálogo <ArrowRight size={17} />
              </Link>
              <button className="text-action" type="button" onClick={logout}>
                Cerrar sesión
              </button>
            </div>
          ) : (
            <>
              <span className="eyebrow">TU CUENTA SUPERPET</span>
              <h2>{mode === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}</h2>
              <p className="auth-intro">
                {mode === 'login'
                  ? 'Ingresa a tu cuenta para continuar.'
                  : 'Regístrate para guardar tus productos en el carrito.'}
              </p>
              <form className="auth-form" onSubmit={handleSubmit}>
                {mode === 'register' && (
                  <div className="auth-form__row">
                    <label>
                      Nombres
                      <input
                        name="nombres"
                        autoComplete="given-name"
                        required
                        minLength={2}
                        maxLength={100}
                        placeholder="Tus nombres"
                      />
                    </label>
                    <label>
                      Apellidos
                      <input
                        name="apellidos"
                        autoComplete="family-name"
                        required
                        minLength={2}
                        maxLength={100}
                        placeholder="Tus apellidos"
                      />
                    </label>
                  </div>
                )}
                <label>
                  Correo electrónico
                  <div className="input-with-icon">
                    <Mail size={18} aria-hidden="true" />
                    <input
                      name="correo"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={150}
                      placeholder="Tu correo electrónico"
                    />
                  </div>
                </label>
                <label>
                  Contraseña
                  <div className="input-with-icon">
                    <LockKeyhole size={18} aria-hidden="true" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={
                        mode === 'login' ? 'current-password' : 'new-password'
                      }
                      required
                      minLength={mode === 'register' ? 8 : 1}
                      maxLength={72}
                      placeholder="Tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
                {mode === 'register' && (
                  <small>
                    Usa al menos 8 caracteres, una mayúscula, una minúscula y un número.
                  </small>
                )}
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <button
                  className="button button--primary auth-submit"
                  type="submit"
                  disabled={busy}
                >
                  {busy
                    ? 'Un momento…'
                    : mode === 'login'
                      ? 'Iniciar sesión'
                      : 'Crear cuenta'}{' '}
                  <ArrowRight size={18} />
                </button>
              </form>
              <p className="auth-switch">
                {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login')
                    setError('')
                  }}
                >
                  {mode === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
                </button>
              </p>
            </>
          )}
        </section>
      </main>
    </div>
  )
}
