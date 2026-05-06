import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { formatShortDate } from '../../utils/dateUtils'

export default function ReportsPage() {
  const [summary, setSummary] = useState([])
  const [flagged, setFlagged] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('summary')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sumRes, flagRes] = await Promise.all([api.get('/reports/attendance-summary'), api.get('/reports/flagged-members')])
      setSummary(sumRes.data); setFlagged(flagRes.data)
    } catch { toast.error('Failed to load reports') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    try { await api.delete(`/attendance/${id}`); toast.success('Deleted'); fetchData(); setDeleteConfirm(null) }
    catch { toast.error('Failed to delete') }
  }

  const grandTotals = summary.reduce((acc, r) => ({
    males: acc.males + (r.stats?.males || 0),
    females: acc.females + (r.stats?.females || 0),
    intermediate: acc.intermediate + (r.intermediateClass || 0),
    children: acc.children + (r.childrenService || 0),
    visitors: acc.visitors + (r.stats?.visitors || 0),
    travellers: acc.travellers + (r.stats?.travellers || 0),
    total: acc.total + (r.stats?.total || 0),
  }), { males: 0, females: 0, intermediate: 0, children: 0, visitors: 0, travellers: 0, total: 0 })

  const avgTotal = summary.length > 0 ? Math.round(grandTotals.total / summary.length) : 0

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div><h1 className="page-title">Reports</h1><p className="page-subtitle">Attendance analytics and member status</p></div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="stat-card"><div className="stat-icon blue">📅</div><div><div className="stat-value">{summary.length}</div><div className="stat-label">Sundays Recorded</div></div></div>
        <div className="stat-card"><div className="stat-icon green">🙋</div><div><div className="stat-value">{avgTotal}</div><div className="stat-label">Avg Attendance</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow">👨</div><div><div className="stat-value">{grandTotals.males}</div><div className="stat-label">Total Males</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow">👩</div><div><div className="stat-value">{grandTotals.females}</div><div className="stat-label">Total Females</div></div></div>
        <div className="stat-card"><div className="stat-icon red">⚠️</div><div><div className="stat-value">{flagged.length}</div><div className="stat-label">Flagged Members</div></div></div>
      </div>

      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(activeTab === 'summary' ? styles.tabActive : {}) }} onClick={() => setActiveTab('summary')}>📊 Attendance Summary</button>
        <button style={{ ...styles.tab, ...(activeTab === 'flagged' ? styles.tabActive : {}) }} onClick={() => setActiveTab('flagged')}>⚠️ Flagged Members ({flagged.length})</button>
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div>
        : activeTab === 'summary' ? (
          <div className="card">
            <div className="card-header"><span className="card-title">Weekly Attendance Summary</span><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{summary.length} records</span></div>
            {summary.length === 0 ? <div className="empty-state"><div className="empty-state-icon">📊</div><h3>No records yet</h3></div> : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Sunday Date</th><th>Males (Y)</th><th>Females (X)</th><th>Intermediate (U)</th><th>Children (V)</th><th>Visitors (P)</th><th>Travellers (L)</th><th>Total (J)</th><th>Actions</th></tr></thead>
                  <tbody>
                    {summary.map(rec => (
                      <tr key={rec._id}>
                        <td style={{ fontWeight: 600 }}>{formatShortDate(rec.sundayDate)}</td>
                        <td>{rec.stats?.males || 0}</td>
                        <td>{rec.stats?.females || 0}</td>
                        <td>{rec.intermediateClass || 0}</td>
                        <td>{rec.childrenService || 0}</td>
                        <td>{rec.stats?.visitors || 0}</td>
                        <td>{rec.stats?.travellers || 0}</td>
                        <td><strong style={{ color: 'var(--accent)' }}>{rec.stats?.total || 0}</strong></td>
                        <td><button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(rec)}>Delete</button></td>
                      </tr>
                    ))}
                    <tr style={{ background: 'rgba(37,99,168,0.1)', fontWeight: 700 }}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>All Time Total</td>
                      <td style={{ color: '#93c5fd' }}>{grandTotals.males}</td>
                      <td style={{ color: '#f9a8d4' }}>{grandTotals.females}</td>
                      <td style={{ color: '#fcd34d' }}>{grandTotals.intermediate}</td>
                      <td style={{ color: '#6ee7b7' }}>{grandTotals.children}</td>
                      <td style={{ color: '#c4b5fd' }}>{grandTotals.visitors}</td>
                      <td style={{ color: '#67e8f9' }}>{grandTotals.travellers}</td>
                      <td style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>{grandTotals.total}</td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="card-header"><span className="card-title">⚠️ Flagged Members (2+ Consecutive Absences)</span><span className="badge badge-danger">{flagged.length}</span></div>
            {flagged.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">✅</div><h3>No flagged members</h3><p>All members have good attendance!</p></div>
            ) : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Member ID</th><th>Full Name</th><th>Gender</th><th>Membership</th><th>Phone</th><th>Absences</th></tr></thead>
                  <tbody>
                    {flagged.map(m => (
                      <tr key={m._id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent)' }}>{m.memberId}</td>
                        <td style={{ fontWeight: 600 }}>{m.fullName}</td>
                        <td>{m.gender}</td>
                        <td>{m.membershipType}</td>
                        <td>{m.phoneNumber || '—'}</td>
                        <td><span className="badge badge-danger">{m.consecutiveAbsences} Sundays</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Delete Record</h3><button className="close-btn" onClick={() => setDeleteConfirm(null)}>✕</button></div>
            <div className="modal-body"><p>Delete attendance for <strong>{formatShortDate(deleteConfirm.sundayDate)}</strong>?</p></div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  tabs: { display: 'flex', gap: 4, marginBottom: 20, background: 'var(--dark-2)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' },
  tab: { flex: 1, padding: '10px 16px', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 500, background: 'transparent', color: 'var(--text-muted)', transition: 'all 0.2s' },
  tabActive: { background: 'var(--primary-light)', color: 'white' }
}