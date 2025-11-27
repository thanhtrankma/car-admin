import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CarManagement from './pages/CarManagement';
import AddCar from './pages/AddCar';
import CarDetail from './pages/CarDetail';
import OrderManagement from './pages/OrderManagement';
import CustomerManagement from './pages/CustomerManagement';
import StockIn from './pages/StockIn';
import Reports from './pages/Reports';
import Layout from './components/Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
  }, [isAuthenticated]);

  const handleLogin = (role: 'manager' | 'staff') => {
    localStorage.setItem('userRole', role);
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Layout onLogout={() => setIsAuthenticated(false)}>
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
              <Layout onLogout={() => setIsAuthenticated(false)}>
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
              <Layout onLogout={() => setIsAuthenticated(false)}>
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
              <Layout onLogout={() => setIsAuthenticated(false)}>
                <AddCar />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/cars/:code"
          element={
            isAuthenticated ? (
              <Layout onLogout={() => setIsAuthenticated(false)}>
                <CarDetail />
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
              <Layout onLogout={() => setIsAuthenticated(false)}>
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
              <Layout onLogout={() => setIsAuthenticated(false)}>
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
              <Layout onLogout={() => setIsAuthenticated(false)}>
                <StockIn />
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
              <Layout onLogout={() => setIsAuthenticated(false)}>
                <Reports />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
