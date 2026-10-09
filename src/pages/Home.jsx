import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { motion } from 'motion/react'
import {
  ArrowRight,
  BadgeCheck,
  Package,
  PawPrint,
  Search,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react'
import SiteHeader from '../components/common/SiteHeader.jsx'
import SiteFooter from '../components/common/SiteFooter.jsx'
import ProductCard from '../features/products/components/ProductCard.jsx'
import { useCategories, useProducts } from '../features/products/hooks/useCatalog.js'
import heroPets from '../assets/hero-pets.webp'
import heroPetsMobile from '../assets/hero-pets-mobile.webp'
import aquarium from '../assets/categories/acuarios.webp'
import wetFood from '../assets/categories/alimento-humedo.webp'
import dryFood from '../assets/categories/alimento-seco.webp'
import fleaCare from '../assets/categories/antipulgas.webp'
import bed from '../assets/categories/camas.webp'
import collar from '../assets/categories/collares.webp'

const categoryImages = {
  'acuarios-demo': aquarium,
  'alimento-humedo-demo': wetFood,
  'alimento-seco-demo': dryFood,
  'antipulgas-demo': fleaCare,
  'camas-demo': bed,
  'collares-demo': collar,
}

const benefits = [
  {
    Icon: ShoppingBag,
    title: 'Catálogo actualizado',
    detail: 'Productos para descubrir',
  },
  { Icon: BadgeCheck, title: 'Precios visibles', detail: 'Información de cada producto' },
  { Icon: ShieldCheck, title: 'Stock disponible', detail: 'Consulta antes de elegir' },
  { Icon: PawPrint, title: 'Compra desde tu cuenta', detail: 'Carrito personal' },
]

const ProductQuickView = lazy(
  () => import('../features/products/components/ProductQuickView.jsx'),
)

export default function Home() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [selectedSlug, setSelectedSlug] = useState(null)
  const search = searchParams.get('buscar')?.trim() || ''
  const category = searchParams.get('categoria') || ''
  const offersOnly = searchParams.get('vista') === 'ofertas'
  const hasFilter = Boolean(search || category || offersOnly)
  const params = useMemo(
    () => ({
      ...(search ? { search } : {}),
      ...(category ? { categoria: category } : {}),
      ...(!hasFilter ? { destacado: true } : {}),
      limit: hasFilter ? 50 : 5,
    }),
    [search, category, hasFilter],
  )
  const {
    data: categories = [],
    isPending: categoriesLoading,
    isError: categoriesError,
    refetch: retryCategories,
  } = useCategories()
  const {
    data: productResponse,
    isPending: productsLoading,
    isError: productsError,
    refetch: retryProducts,
  } = useProducts(params)
  const visibleCategories = showAllCategories ? categories : categories.slice(0, 6)
  const categoryName = categories.find((item) => item.slug === category)?.nombre
  const products = offersOnly
    ? (productResponse?.data || []).filter((item) => item.tiene_oferta)
    : productResponse?.data || []
  const sectionTitle = search
    ? `Resultados para “${search}”`
    : category
      ? categoryName || 'Productos de la categoría'
      : offersOnly
        ? 'Productos en oferta'
        : 'Productos destacados'

  useEffect(() => {
    if (!location.hash) return
    requestAnimationFrame(() =>
      document
        .getElementById(location.hash.slice(1))
        ?.scrollIntoView({ behavior: 'smooth' }),
    )
  }, [location.hash, location.search])

  useEffect(() => {
    if (!selectedSlug) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setSelectedSlug(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selectedSlug])

  return (
    <div className="page-shell">
      <SiteHeader />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__inner">
            <div className="hero__copy">
              <span className="eyebrow eyebrow--line">TODO PARA SU BIENESTAR</span>
              <h1 id="hero-title">
                Mascotas
                <br />
                más felices,
                <br />
                vidas mejores
              </h1>
              <p>Encuentra alimentos, accesorios y mucho más para su cuidado.</p>
              <Link to="/#productos" className="button button--primary">
                Comprar ahora <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <div className="hero__art" aria-hidden="true">
              <span className="hero__shape" />
              <picture>
                <source media="(max-width: 650px)" srcSet={heroPetsMobile} />
                <img src={heroPets} alt="" />
              </picture>
              <span className="hero__hand">
                Siempre
                <br />a tu lado <PawPrint size={22} />
              </span>
            </div>
          </div>
        </section>
        <div className="benefits" aria-label="Características del catálogo">
          {benefits.map(({ Icon, title, detail }) => (
            <div className="benefit" key={title}>
              <Icon size={30} strokeWidth={1.5} aria-hidden="true" />
              <div>
                <strong>{title}</strong>
                <span>{detail}</span>
              </div>
            </div>
          ))}
        </div>

        <section
          className="categories-section content-section"
          id="categorias"
          aria-labelledby="categories-title"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow eyebrow--line">NUESTRAS CATEGORÍAS</span>
              <h2 id="categories-title">Todo lo que tu mascota necesita</h2>
            </div>
            {categories.length > 6 && (
              <button
                className="text-action"
                type="button"
                onClick={() => setShowAllCategories((value) => !value)}
              >
                {showAllCategories ? 'Ver menos' : 'Ver todas'} <ArrowRight size={17} />
              </button>
            )}
          </div>
          {categoriesLoading && <p className="status-message">Cargando categorías…</p>}
          {categoriesError && (
            <div className="status-message status-message--error">
              No se pudieron cargar las categorías.{' '}
              <button type="button" onClick={() => retryCategories()}>
                Reintentar
              </button>
            </div>
          )}
          {!categoriesLoading && !categoriesError && (
            <div className="category-grid">
              {visibleCategories.map((item, index) => (
                <motion.div
                  key={item.id_categoria}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ delay: Math.min(index * 0.035, 0.2) }}
                >
                  <Link
                    className="category-card"
                    to={`/?categoria=${encodeURIComponent(item.slug)}#productos`}
                  >
                    <div className="category-card__image">
                      {categoryImages[item.slug] ? (
                        <img src={categoryImages[item.slug]} alt="" loading="lazy" />
                      ) : (
                        <Package size={48} strokeWidth={1.1} aria-hidden="true" />
                      )}
                    </div>
                    <span>{item.nombre}</span>
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <section
          className="products-section content-section"
          id="productos"
          aria-labelledby="products-title"
        >
          <div className="section-heading section-heading--products">
            <div>
              <span className="eyebrow eyebrow--line">LO MÁS POPULAR</span>
              <h2 id="products-title">{sectionTitle}</h2>
            </div>
            <div className="product-tabs">
              <Link className={!hasFilter ? 'is-active' : ''} to="/#productos">
                Destacados
              </Link>
              <Link
                className={offersOnly ? 'is-active' : ''}
                to="/?vista=ofertas#productos"
              >
                Ofertas
              </Link>
              {hasFilter && (
                <Link to="/#productos">
                  Limpiar filtros <ArrowRight size={15} />
                </Link>
              )}
            </div>
          </div>
          {hasFilter && !productsLoading && !productsError && (
            <p className="results-caption">
              {products.length}{' '}
              {products.length === 1 ? 'producto encontrado' : 'productos encontrados'}
              {categoryName ? ` en ${categoryName}` : ''}
            </p>
          )}
          {productsLoading && (
            <div className="product-grid" aria-label="Cargando productos">
              {Array.from({ length: 5 }, (_, index) => (
                <div className="product-card product-card--skeleton" key={index} />
              ))}
            </div>
          )}
          {productsError && (
            <div className="status-message status-message--error">
              No se pudieron cargar los productos.{' '}
              <button type="button" onClick={() => retryProducts()}>
                Reintentar
              </button>
            </div>
          )}
          {!productsLoading && !productsError && products.length === 0 && (
            <div className="empty-results">
              <Search size={35} strokeWidth={1.5} />
              <h3>No encontramos productos</h3>
              <p>Prueba otra búsqueda o explora el catálogo destacado.</p>
              <Link to="/#productos" className="button button--primary">
                Ver destacados
              </Link>
            </div>
          )}
          {!productsLoading && !productsError && products.length > 0 && (
            <div className="product-grid">
              {products.map((item) => (
                <ProductCard
                  key={item.id_producto}
                  product={item}
                  onSelect={setSelectedSlug}
                />
              ))}
            </div>
          )}
          {!hasFilter && (
            <p className="product-footnote">
              Precios y disponibilidad proporcionados por nuestro catálogo.
            </p>
          )}
        </section>
      </main>
      <SiteFooter />
      {selectedSlug && (
        <Suspense fallback={null}>
          <ProductQuickView
            key={selectedSlug}
            slug={selectedSlug}
            onClose={() => setSelectedSlug(null)}
          />
        </Suspense>
      )}
    </div>
  )
}
