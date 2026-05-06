import React from 'react'
import { Navigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import UserHome from '../components/user/UserHome'
import AttendancePage from '../components/attendance/AttendancePage'
import TravellersPage from '../components/travellers/TravellersPage'
import ThanksgivingPage from '../components/thanksgiving/ThanksgivingPage'
import JointServicePage from '../components/joint/JointServicePage'

const userLinks = [
  { path: '', label: 'Dashboard', icon: '🏠' },
  { path: '/attendance', label: 'Mark Attendance', icon: '✅' },
  { path: '/travellers', label: 'Travellers', icon: '✈️' },
  { path: '/thanksgiving', label: 'Thanksgiving', icon: '🙏' },
  { path: '/joint', label: 'Joint Service', icon: '🤝' },
]

const userRoutes = [
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/', element: <UserHome /> },
  { path: 'attendance', element: <AttendancePage isAdmin={false} /> },
  { path: 'travellers', element: <TravellersPage isAdmin={false} /> },
  { path: 'thanksgiving', element: <ThanksgivingPage isAdmin={false} /> },
  { path: 'joint', element: <JointServicePage isAdmin={false} /> },
]

export default function UserDashboard() {
  return <DashboardLayout links={userLinks} basePath="/dashboard" routes={userRoutes} />
}