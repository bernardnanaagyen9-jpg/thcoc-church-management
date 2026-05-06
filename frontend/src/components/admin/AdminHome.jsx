import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { formatShortDate } from '../../utils/dateUtils'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'

const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6']

export default function AdminHome() {
  const { user } = useAuth()
  const [overview, setOverview] = useState({ totalMembers: 0, totalSundays: 0, lastAttendanceTotal: 0, flaggedMembers: 0 })
  const [flagged, setFlagged] = useState([])
  const [recentAttendance, setRecentAttendance] = useState([])
  const [allAttendance, setAllAttendance] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

 useEffect(() => {
    const fetchData = async () => {
      try {
        const stored = localStorage.getItem('thcoc_user')
        const token = stored ? JSON.parse(stored).token : null
        const config = { headers: { Authorization: `Bearer ${token}` } }

        const [ovRes, flagRes, attRes, memRes] = await Promise.all([
          api.get('/reports/overview', config),
          api.get('/reports/flagged-members', config),
          api.get('/attendance', config),
          api.get('/members', config)
        ])
        setOverview(ovRes.data)
        setFlagged(flagRes.data)
        setRecentAttendance(attRes.data.slice(0, 5))
        setAllAttendance(attRes.data.slice(0, 10).reverse())
        setMembers(memRes.data)
      } catch (err) {
        console.error('Dashboard error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return (
    <div className="loading-spinner" style={{ height: '60vh' }}>
      <div className="spinner" />
    </div>
  )

  if (error) return (
    <div className="page-wrapper">
      <div className="alert alert-error">
        ❌ Failed to load dashboard: {error}. Please refresh the page.
      </div>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>
        🔄 Refresh Page
      </button>
    </div>
  )

  // Chart data
  const attendanceTrendData = allAttendance.map(rec => ({
    date: formatShortDate(rec.sundayDate),
    Males: rec.stats?.males || 0,
    Females: rec.stats?.females || 0,
    Total: rec.stats?.total || 0
  }))

  const genderData = [
    { name: 'Male', value: members.filter(m => m.gender === 'Male').length },
    { name: 'Female', value: members.filter(m => m.gender === 'Female').length }
  ]

  const membershipData = [
    { name: 'Full Member', value: members.filter(m => m.membershipType === 'Full Member').length },
    { name: 'New Convert', value: members.filter(m => m.membershipType === 'New Convert').length },
    { name: 'Visitor', value: members.filter(m => m.membershipType === 'Visitor').length }
  ]

  const lastAttendance = recentAttendance[0]
  const attendanceBreakdown = lastAttendance ? [
    { name: 'Males', value: lastAttendance.stats?.males || 0 },
    { name: 'Females', value: lastAttendance.stats?.females || 0 },
    { name: 'Intermediate', value: lastAttendance.intermediateClass || 0 },
    { name: 'Children', value: lastAttendance.childrenService || 0 },
    { name: 'Travellers', value: lastAttendance.stats?.travellers || 0 }
  ] : []

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name}. Here's your church overview.</p>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-GH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div><div className="stat-value">{overview?.totalMembers || 0}</div><div className="stat-label">Total Members</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📅</div>
          <div><div className="stat-value">{overview?.totalSundays || 0}</div><div className="stat-label">Sundays Recorded</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">🙋</div>
          <div><div className="stat-value">{overview?.lastAttendanceTotal || 0}</div><div className="stat-label">Last Sunday Total</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">⚠️</div>
          <div><div className="stat-value">{overview?.flaggedMembers || 0}</div><div className="stat-label">Flagged Members</div></div>
        </div>
      </div>

      {/* Attendance Trend Chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header">
          <span className="card-title">📈 Attendance Trend</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Last {attendanceTrendData.length} Sundays</span>
        </div>
        {attendanceTrendData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📈</div>
            <h3>No attendance data yet</h3>
            <p>Start marking Sunday attendance to see trends</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={attendanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tick={{ fill: 'var(--text-muted)' }} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tick={{ fill: 'var(--text-muted)' }} />
              <Tooltip contentStyle={{ background: 'var(--dark-2)', border: '1px solid var(--border)', borderRadius: 8 }} labelStyle={{ color: 'var(--text)' }} />
              <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              <Line type="monotone" dataKey="Males" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa' }} />
              <Line type="monotone" dataKey="Females" stroke="#ec4899" strokeWidth={2} dot={{ fill: '#ec4899' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">👥 Gender Split</span></div>
          {genderData.every(d => d.value === 0) ? (
            <div className="empty-state"><div className="empty-state-icon">👥</div><p>No member data yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {genderData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--dark-2)', border: '1px solid var(--border)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">🏷️ Membership Types</span></div>
          {membershipData.every(d => d.value === 0) ? (
            <div className="empty-state"><div className="empty-state-icon">🏷️</div><p>No member data yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={membershipData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tick={{ fill: 'var(--text-muted)' }} />
                <YAxis stroke="var(--text-muted)" fontSize={10} tick={{ fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--dark-2)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {membershipData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">📊 Last Sunday Breakdown</span></div>
          {attendanceBreakdown.length === 0 || attendanceBreakdown.every(d => d.value === 0) ? (
            <div className="empty-state"><div className="empty-state-icon">📊</div><p>No attendance data yet</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={attendanceBreakdown} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}>
                  {attendanceBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--dark-2)', border: '1px solid var(--border)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Attendance & Flagged */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Recent Attendance</span></div>
          {recentAttendance.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📋</div><p>No attendance records yet</p></div>
          ) : (
            <div className="table-container">
              <table>
                <thead><tr><th>Date</th><th>Males</th><th>Females</th><th>Total</th></tr></thead>
                <tbody>
                  {recentAttendance.map(rec => (
                    <tr key={rec._id}>
                      <td>{formatShortDate(rec.sundayDate)}</td>
                      <td>{rec.stats?.males || 0}</td>
                      <td>{rec.stats?.females || 0}</td>
                      <td><strong style={{ color: 'var(--accent)' }}>{rec.stats?.total || 0}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">⚠️ Flagged Members</span>
            <span className="badge badge-danger">{flagged.length}</span>
          </div>
          {flagged.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">✅</div><p>No flagged members!</p></div>
          ) : (
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {flagged.map(m => (
                <div key={m._id} style={styles.flaggedRow}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{m.fullName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{m.memberId}</div>
                  </div>
                  <span className="badge badge-danger">{m.consecutiveAbsences} absent</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={styles.infoBox}>
        <div>🏛️</div>
        <div>
          <strong>Twifo Hemang Church of Christ</strong> — Ghana
          <br />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Church Management System — Managing members, attendance, and services with excellence.
          </span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  flaggedRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' },
  infoBox: { marginTop: 24, background: 'rgba(37,99,168,0.1)', border: '1px solid rgba(37,99,168,0.3)', borderRadius: 'var(--radius)', padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center', fontSize: '0.9rem', color: 'var(--text)' }
}