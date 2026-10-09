import { useCallback, useEffect, useState } from 'react'
import api, { TOKEN_KEY } from '../../services/api.js'
import AuthContext from './auth-context.js'

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(null)
  const [checkingSession, setCheckingSession] = useState(Boolean(token))

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setCheckingSession(false)
  }, [])

  useEffect(() => {
    if (!token) return undefined
    let active = true
    api
      .get('/auth/perfil')
      .then(({ data }) => {
        if (active) setUser(data.data)
      })
      .catch(() => {
        if (active) logout()
      })
      .finally(() => {
        if (active) setCheckingSession(false)
      })
    return () => {
      active = false
    }
  }, [token, logout])

  const authenticate = async (path, payload) => {
    const { data } = await api.post(path, payload)
    if (data.data.usuario.rol !== 'CLIENTE_WEB') {
      throw new Error('Esta cuenta no pertenece al portal de clientes.')
    }
    sessionStorage.setItem(TOKEN_KEY, data.data.accessToken)
    setToken(data.data.accessToken)
    setUser(data.data.usuario)
    return data.data.usuario
  }

  const value = {
    token,
    user,
    checkingSession,
    login: (payload) => authenticate('/auth/login', payload),
    register: (payload) => authenticate('/auth/registro', payload),
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
