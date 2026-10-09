import { ArrowUpRight, ShoppingCart } from 'lucide-react'
import { motion } from 'motion/react'
import formatPrice from '../../../utils/formatPrice.js'
import ProductImage from './ProductImage.jsx'

export default function ProductCard({ product, onSelect }) {
  const price = Number(product.precio_desde)
  const regular = Number(product.precio_regular_desde)
  const onSale = product.tiene_oferta && regular > price
  const discount = onSale ? Math.round((1 - price / regular) * 100) : 0

  return (
    <motion.article
      className="product-card"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18 }}
    >
      <button
        className="product-card__main"
        type="button"
        onClick={() => onSelect(product.slug)}
        aria-label={`Ver ${product.nombre}`}
      >
        {discount > 0 && <span className="discount-badge">-{discount}%</span>}
        <ProductImage
          key={product.imagen_principal || product.slug}
          src={product.imagen_principal}
          alt={product.nombre}
        />
        <span className="product-card__brand">{product.marca}</span>
        <span className="product-card__name">{product.nombre}</span>
        <span className="product-card__detail">
          Ver detalle <ArrowUpRight size={14} aria-hidden="true" />
        </span>
      </button>
      <div className="product-card__bottom">
        <div className="product-card__prices">
          <strong>{formatPrice(price)}</strong>
          {onSale && <del>{formatPrice(regular)}</del>}
        </div>
        <button
          className="icon-button icon-button--coral"
          type="button"
          onClick={() => onSelect(product.slug)}
          aria-label={`Elegir ${product.nombre} para el carrito`}
          disabled={!product.disponible}
        >
          <ShoppingCart size={18} aria-hidden="true" />
        </button>
      </div>
      {!product.disponible && <span className="stock-note">Sin stock</span>}
    </motion.article>
  )
}
