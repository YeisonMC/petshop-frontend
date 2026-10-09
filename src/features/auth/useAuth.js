import { useContext } from 'react'
import AuthContext from './auth-context.js'

export default function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth requiere AuthProvider')
  return context
}
