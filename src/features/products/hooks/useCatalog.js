import { useQuery } from '@tanstack/react-query'
import { getCategories, getProduct, getProducts } from '../services.js'

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: getCategories })
}

export function useProducts(params) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
  })
}

export function useProduct(slug) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProduct(slug),
    enabled: Boolean(slug),
  })
}
