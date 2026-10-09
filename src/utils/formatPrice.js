const soles = new Intl.NumberFormat('es-PE', {
  style: 'currency',
  currency: 'PEN',
  minimumFractionDigits: 2,
})

export default function formatPrice(value) {
  return soles.format(Number(value) || 0)
}
