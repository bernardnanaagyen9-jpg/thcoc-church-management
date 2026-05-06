import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import { formatShortDate } from '../../utils/dateUtils'

export default function UserHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recentAttendance, setRecentAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/attendance').then(res => setRecentAttendance(res.data.slice(0, 3)))
      .catch(console.error).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.name}</h1>
          <p className="page-subtitle">Twifo Hemang Church of Christ — Attendance Portal</p>
        </div>
      </div>

      <div style={styles.quickActions}>
        {[
          { icon: '✅', label: 'Mark Attendance', desc: 'Record Sunday attendance', path: '/dashboard/attendance', color: '#1a3a5c' },
          { icon: '✈️', label: 'Add Traveller', desc: 'Register visiting members', path: '/dashboard/travellers', color: '#064e3b' },
          { icon: '🙏', label: 'Thanksgiving', desc: 'Log thanksgiving entries', path: '/dashboard/thanksgiving', color: '#78350f' },
          { icon: '🤝', label: 'Joint Service', desc: 'View joint service records', path: '/dashboard/joint', color: '#312e81' },
        ].map(action => (
          <div key={action.path} style={{ ...styles.actionCard, background: action.color }} onClick={() => navigate(action.path)}>
            <div style={styles.actionIcon}>{action.icon}</div>
            <div style={styles.actionLabel}>{action.label}</div>
            <div style={styles.actionDesc}>{action.desc}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Recent Attendance Records</span></div>
        {loading ? <div className="loading-spinner"><div className="spinner" /></div>
          : recentAttendance.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">📋</div><p>No attendance records yet</p></div>
          ) : (
            <div className="table-container">
              <table>
                <thead><tr><th>Date</th><th>Males</th><th>Females</th><th>Travellers</th><th>Total</th></tr></thead>
                <tbody>
                  {recentAttendance.map(rec => (
                    <tr key={rec._id}>
                      <td>{formatShortDate(rec.sundayDate)}</td>
                      <td>{rec.stats?.males || 0}</td>
                      <td>{rec.stats?.females || 0}</td>
                      <td>{rec.stats?.travellers || 0}</td>
                      <td><strong style={{ color: 'var(--accent)' }}>{rec.stats?.total || 0}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </div>
  )
}

const styles = {
  quickActions: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 },
  actionCard: { borderRadius: 'var(--radius)', padding: '24px 20px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' },
  actionIcon: { fontSize: '1.8rem', marginBottom: 10 },
  actionLabel: { fontWeight: 700, fontSize: '1rem', color: 'white', marginBottom: 4 },
  actionDesc: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }
}