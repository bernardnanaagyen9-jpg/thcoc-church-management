import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider, useAuth } from './context/AuthContext'

// Layout
import Sidebar from './components/layout/Sidebar'

// Admin pages
import AdminHome from './components/admin/AdminHome'
import MembersPage from './components/members/MembersPage'
import TravellersPage from './components/travellers/TravellersPage'
import AttendancePage from './components/attendance/AttendancePage'
import ReportsPage from './components/reports/ReportsPage'
import ThanksgivingPage from './components/thanksgiving/ThanksgivingPage'
import JointServicePage from './components/joint/JointServicePage'
import SettingsPage from './components/admin/SettingsPage'

// User pages
import UserHome from './components/user/UserHome'

// Auth
import AuthPage from './pages/AuthPage'

const adminLinks = [
  { path: '/admin', label: 'Dashboard', icon: '🏠' },
  { path: '/admin/members', label: 'Members', icon: '👥' },
  { path: '/admin/travellers', label: 'Travellers', icon: '✈️' },
  { path: '/admin/attendance', label: 'Attendance', icon: '✅' },
  { path: '/admin/reports', label: 'Reports', icon: '📊' },
  { path: '/admin/thanksgiving', label: 'Thanksgiving', icon: '🙏' },
  { path: '/admin/joint', label: 'Joint Service', icon: '🤝' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

const userLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/dashboard/attendance', label: 'Mark Attendance', icon: '✅' },
  { path: '/dashboard/travellers', label: 'Travellers', icon: '✈️' },
  { path: '/dashboard/thanksgiving', label: 'Thanksgiving', icon: '🙏' },
  { path: '/dashboard/joint', label: 'Joint Service', icon: '🤝' },
]

const AdminLayout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh', background: '#1e2535' }}>
    <Sidebar links={adminLinks} basePath="/admin" />
    <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>{children}</main>
  </div>
)

const UserLayout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh', background: '#1e2535' }}>
    <Sidebar links={userLinks} basePath="/dashboard" />
    <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>{children}</main>
  </div>
)

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="loading-spinner" style={{ height: '100vh' }}>
      <div className="spinner" />
    </div>
  )
  if (!user) return <Navigate to="/" replace />
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  }
  return children
}

const AppRoutes = () => {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/" element={
        user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <AuthPage />
      } />
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminHome /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/members" element={<ProtectedRoute requiredRole="admin"><AdminLayout><MembersPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/travellers" element={<ProtectedRoute requiredRole="admin"><AdminLayout><TravellersPage isAdmin={true} /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/attendance" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AttendancePage isAdmin={true} /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><AdminLayout><ReportsPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/thanksgiving" element={<ProtectedRoute requiredRole="admin"><AdminLayout><ThanksgivingPage isAdmin={true} /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/joint" element={<ProtectedRoute requiredRole="admin"><AdminLayout><JointServicePage isAdmin={true} /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminLayout><SettingsPage /></AdminLayout></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute requiredRole="user"><UserLayout><UserHome /></UserLayout></ProtectedRoute>} />
      <Route path="/dashboard/attendance" element={<ProtectedRoute requiredRole="user"><UserLayout><AttendancePage isAdmin={false} /></UserLayout></ProtectedRoute>} />
      <Route path="/dashboard/travellers" element={<ProtectedRoute requiredRole="user"><UserLayout><TravellersPage isAdmin={false} /></UserLayout></ProtectedRoute>} />
      <Route path="/dashboard/thanksgiving" element={<ProtectedRoute requiredRole="user"><UserLayout><ThanksgivingPage isAdmin={false} /></UserLayout></ProtectedRoute>} />
      <Route path="/dashboard/joint" element={<ProtectedRoute requiredRole="user"><UserLayout><JointServicePage isAdmin={false} /></UserLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  // Keep backend alive - ping every 14 minutes
  useEffect(() => {
    const keepAlive = () => {
      fetch('https://thcoc-backend.onrender.com/api/health')
        .catch(() => {})
    }
    keepAlive()
    const interval = setInterval(keepAlive, 840000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
        />
      </Router>
    </AuthProvider>
  )
}

export default App