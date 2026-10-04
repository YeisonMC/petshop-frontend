import { useState } from 'react'
import { Package } from 'lucide-react'

export default function ProductImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false)
  const isDemoPlaceholder = /^https?:\/\/cdn\.petshopdemo\.pe\//i.test(src || '')

  if (!src || failed || isDemoPlaceholder) {
    return (
      <div
        className={`product-image product-image--empty ${className}`}
        role="img"
        aria-label={`Imagen no disponible: ${alt}`}
      >
        <Package size={42} strokeWidth={1.3} aria-hidden="true" />
        <span>Imagen no disponible</span>
      </div>
    )
  }

  return (
    <div className={`product-image ${className}`}>
      <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
    </div>
  )
}
