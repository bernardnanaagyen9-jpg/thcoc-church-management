
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { formatShortDate } from '../../utils/dateUtils'
import axios from 'axios'
import { SkeletonStats, SkeletonTable, SkeletonCard } from '../layout/SkeletonLoader'
const BASE = 'https://thcoc-backend.onrender.com/api'

export default function AdminHome() {
  const { user } = useAuth()
  const [overview, setOverview] = useState({ totalMembers: 0, totalSundays: 0, lastAttendanceTotal: 0, flaggedMembers: 0 })
  const [flagged, setFlagged] = useState([])
  const [recentAttendance, setRecentAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stored = localStorage.getItem('thcoc_user')
        if (!stored) { setError('Not logged in'); setLoading(false); return }
        const { token } = JSON.parse(stored)
        const headers = { Authorization: `Bearer ${token}` }

        const [ovRes, flagRes, attRes] = await Promise.all([
          axios.get(`${BASE}/reports/overview`, { headers }),
          axios.get(`${BASE}/reports/flagged-members`, { headers }),
          axios.get(`${BASE}/attendance`, { headers })
        ])

        setOverview(ovRes.data)
        setFlagged(flagRes.data)
        setRecentAttendance(attRes.data.slice(0, 5))
      } catch (err) {
        console.error(err)
        setError(err.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

 if (loading) return (
  <div className="page-wrapper">
    <SkeletonStats />
    <SkeletonTable />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
)

  if (error) return (
    <div className="page-wrapper">
      <div className="alert alert-error">❌ Error: {error}</div>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>
        🔄 Refresh
      </button>
    </div>
  )

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
       <p className="page-subtitle">Welcome back, {user?.name} — {user?.churchName || 'Church Management'}</p>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-GH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

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