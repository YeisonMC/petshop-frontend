import dryFood from '../../assets/categories/alimento-seco.webp'
import wetFood from '../../assets/categories/alimento-humedo.webp'
import beds from '../../assets/categories/camas.webp'

export default function checkoutIllustrationFor(name = '') {
  const lower = name.toLocaleLowerCase('es')
  if (lower.includes('cama') || lower.includes('cojín')) return beds
  if (lower.includes('húmed') || lower.includes('lata')) return wetFood
  if (
    lower.includes('alimento') ||
    lower.includes('science') ||
    lower.includes('croqueta')
  )
    return dryFood
  return null
}
