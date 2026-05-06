import React from 'react'
import { Navigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import AdminHome from '../components/admin/AdminHome'
import MembersPage from '../components/members/MembersPage'
import TravellersPage from '../components/travellers/TravellersPage'
import AttendancePage from '../components/attendance/AttendancePage'
import ReportsPage from '../components/reports/ReportsPage'
import JointServicePage from '../components/joint/JointServicePage'
import ThanksgivingPage from '../components/thanksgiving/ThanksgivingPage'
import SettingsPage from '../components/admin/SettingsPage'

const adminLinks = [
  { path: '', label: 'Dashboard', icon: '🏠' },
  { path: '/members', label: 'Members', icon: '👥' },
  { path: '/travellers', label: 'Travellers', icon: '✈️' },
  { path: '/attendance', label: 'Attendance', icon: '✅' },
  { path: '/reports', label: 'Reports', icon: '📊' },
  { path: '/thanksgiving', label: 'Thanksgiving', icon: '🙏' },
  { path: '/joint', label: 'Joint Service', icon: '🤝' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

const adminRoutes = [
  { path: '/', element: <Navigate to="/admin" replace /> },
  { path: '', element: <AdminHome /> },
  { path: '/members', element: <MembersPage /> },
  { path: '/travellers', element: <TravellersPage isAdmin={true} /> },
  { path: '/attendance', element: <AttendancePage isAdmin={true} /> },
  { path: '/reports', element: <ReportsPage /> },
  { path: '/thanksgiving', element: <ThanksgivingPage isAdmin={true} /> },
  { path: '/joint', element: <JointServicePage isAdmin={true} /> },
  { path: '/settings', element: <SettingsPage /> },
]

export default function AdminDashboard() {
  return <DashboardLayout links={adminLinks} basePath="/admin" routes={adminRoutes} />
}