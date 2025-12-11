import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

interface AdminRouteProps {
  children: ReactNode
  redirectPath?: string
}

const AdminRoute = ({ children, redirectPath = '/dashboard' }: AdminRouteProps) => {
  const location = useLocation()
  let currentUserRole: string | null = null

  try {
    const storedUser = localStorage.getItem('currentUser')
    currentUserRole = storedUser ? (JSON.parse(storedUser)?.role ?? null) : null
  } catch {
    currentUserRole = null
  }

  if (currentUserRole !== 'ADMIN') {
    return <Navigate to={redirectPath} replace state={{ from: location }} />
  }

  return <>{children}</>
}

export default AdminRoute
