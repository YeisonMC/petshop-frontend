import api from '../../services/api.js'

export async function getCategories() {
  const { data } = await api.get('/categorias')
  return data.data
}

export async function getProducts(params) {
  const { data } = await api.get('/productos', { params })
  return data
}

export async function getProduct(slug) {
  const { data } = await api.get(`/productos/${encodeURIComponent(slug)}`)
  return data.data
}
