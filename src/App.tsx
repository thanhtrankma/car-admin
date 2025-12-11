import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { message } from 'antd'
import { logout as logoutService } from './services/authService'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CarManagement from './pages/CarManagement'
import AddCar from './pages/AddCar'
import EditCar from './pages/EditCar'
import CarDetail from './pages/CarDetail'
import OrderManagement from './pages/OrderManagement'
import CustomerManagement from './pages/CustomerManagement'
import AccountManagement from './pages/AccountManagement'
import StockIn from './pages/StockIn'
import Reports from './pages/Reports'
import Profile from './pages/Profile'
import PendingCarUpdate from './pages/PendingCarUpdate'
import Layout from './components/Layout'
import AdminRoute from './middleware/adminOnly'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return (
      localStorage.getItem('isAuthenticated') === 'true' ||
      Boolean(localStorage.getItem('accessToken'))
    )
  })

  useEffect(() => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated))
  }, [isAuthenticated])

  const handleLogin = (role: 'manager' | 'staff') => {
    localStorage.setItem('userRole', role)
    setIsAuthenticated(true)
  }

  const handleLogout = async () => {
    try {
      await logoutService()
      message.success('Đăng xuất thành công')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Đăng xuất thất bại'
      message.error(errorMessage)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('currentUser')
      localStorage.removeItem('userRole')
      setIsAuthenticated(false)
    }
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Dashboard />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/cars"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <CarManagement />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/cars/add"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <AddCar />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/cars/:id"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <CarDetail />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/cars/:id/edit"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <EditCar />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/orders"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <OrderManagement />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/customers"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <CustomerManagement />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/stock-in"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <StockIn />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/pending-cars"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <PendingCarUpdate />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/reports"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Reports />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/accounts"
          element={
            isAuthenticated ? (
              <AdminRoute>
                <Layout onLogout={handleLogout}>
                  <AccountManagement />
                </Layout>
              </AdminRoute>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Profile />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App
