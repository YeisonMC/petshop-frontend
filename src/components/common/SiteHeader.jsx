import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowRight,
  ChevronDown,
  Menu,
  Package,
  PawPrint,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from 'lucide-react'
import { useCategories } from '../../features/products/hooks/useCatalog.js'
import useAuth from '../../features/auth/useAuth.js'
import useCart from '../../features/cart/useCart.js'

export function Brand({ light = false, onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={`brand${light ? ' brand--light' : ''}`}
      aria-label="Superpet, ir al inicio"
    >
      <PawPrint size={31} strokeWidth={2.9} aria-hidden="true" />
      <span>SUPERPET</span>
    </Link>
  )
}

export default function SiteHeader() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileCategories, setMobileCategories] = useState(false)
  const { data: categories = [], isPending: loadingCategories } = useCategories()
  const { user } = useAuth()
  const { count, openCart } = useCart()

  const submitSearch = (event) => {
    event.preventDefault()
    const query = search.trim()
    setMobileOpen(false)
    navigate(query ? `/?buscar=${encodeURIComponent(query)}#productos` : '/#productos')
  }

  const categoryLink = (category) =>
    `/?categoria=${encodeURIComponent(category.slug)}#productos`

  return (
    <>
      <div className="announcement">
        <span className="announcement__dot" /> Un mundo mejor para sus cuatro patas{' '}
        <span className="announcement__spark">✦</span> Descubre nuestro catálogo
      </div>
      <header className="site-header">
        <div className="site-header__inner">
          <button
            className="mobile-menu-trigger"
            type="button"
            aria-label="Abrir menú"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={22} />
          </button>
          <Brand />
          <nav className="desktop-nav" aria-label="Navegación principal">
            <div
              className="nav-dropdown-zone"
              onMouseLeave={() => setMenuOpen(false)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setMenuOpen(false)
              }}
            >
              <button
                className={`nav-link${menuOpen ? ' nav-link--active' : ''}`}
                type="button"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((value) => !value)}
              >
                Categorías <ChevronDown size={14} aria-hidden="true" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    className="mega-menu"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                  >
                    <div className="mega-menu__heading">
                      <strong>Explora por categoría</strong>
                      <span>Encuentra lo que buscas para tu mascota</span>
                    </div>
                    <div className="mega-menu__grid">
                      {loadingCategories && <span>Cargando categorías…</span>}
                      {categories.map((category) => (
                        <Link
                          key={category.id_categoria}
                          to={categoryLink(category)}
                          onClick={() => setMenuOpen(false)}
                        >
                          <Package size={17} strokeWidth={1.7} aria-hidden="true" />
                          <span>{category.nombre}</span>
                          <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link className="nav-link" to="/#categorias">
              Catálogo
            </Link>
            <Link className="nav-link" to="/#productos">
              Destacados
            </Link>
            <Link className="nav-link" to="/?vista=ofertas#productos">
              Ofertas
            </Link>
          </nav>
          <form className="header-search" role="search" onSubmit={submitSearch}>
            <Search size={18} aria-hidden="true" />
            <input
              aria-label="Buscar productos"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Busca tus productos favoritos..."
            />
            <button type="submit" aria-label="Buscar">
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="header-actions">
            <Link
              to="/cuenta"
              className="header-action"
              aria-label={user ? `Cuenta de ${user.nombres}` : 'Iniciar sesión'}
            >
              <UserRound size={23} strokeWidth={1.7} />
              <span>{user ? `Hola, ${user.nombres.split(' ')[0]}` : 'Cuenta'}</span>
            </Link>
            <button
              type="button"
              className="header-action cart-trigger"
              onClick={openCart}
              aria-label={`Abrir carrito, ${count} productos`}
            >
              <ShoppingCart size={24} strokeWidth={1.7} />
              <span>Carrito</span>
              <b>{count}</b>
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="mobile-layer__scrim"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.nav
              className="mobile-panel"
              aria-label="Menú móvil"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 330, damping: 32 }}
            >
              <div className="mobile-panel__top">
                <Brand onClick={() => setMobileOpen(false)} />
                <button
                  className="close-button"
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Cerrar menú"
                >
                  <X size={19} />
                </button>
              </div>
              <form className="mobile-search" role="search" onSubmit={submitSearch}>
                <Search size={18} />
                <input
                  aria-label="Buscar productos"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Busca tus productos favoritos..."
                />
                <button type="submit" aria-label="Buscar">
                  <ArrowRight size={17} />
                </button>
              </form>
              <Link to="/" onClick={() => setMobileOpen(false)}>
                Inicio
              </Link>
              <button
                className="mobile-panel__accordion"
                type="button"
                aria-expanded={mobileCategories}
                onClick={() => setMobileCategories((value) => !value)}
              >
                Categorías{' '}
                <ChevronDown size={16} className={mobileCategories ? 'rotate' : ''} />
              </button>
              {mobileCategories && (
                <div className="mobile-panel__categories">
                  {categories.map((category) => (
                    <Link
                      key={category.id_categoria}
                      to={categoryLink(category)}
                      onClick={() => setMobileOpen(false)}
                    >
                      {category.nombre}
                    </Link>
                  ))}
                </div>
              )}
              <Link to="/#productos" onClick={() => setMobileOpen(false)}>
                Destacados
              </Link>
              <Link to="/?vista=ofertas#productos" onClick={() => setMobileOpen(false)}>
                Ofertas
              </Link>
              <Link to="/cuenta" onClick={() => setMobileOpen(false)}>
                Mi cuenta
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
