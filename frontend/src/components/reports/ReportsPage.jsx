import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import { formatShortDate, formatDate } from '../../utils/dateUtils'

const BASE = 'https://thcoc-backend.onrender.com/api'

export default function ReportsPage() {
  const [summary, setSummary] = useState([])
  const [flagged, setFlagged] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('summary')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Absentees
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [selectedSunday, setSelectedSunday] = useState('')
  const [absentees, setAbsentees] = useState([])
  const [absenteesDate, setAbsenteesDate] = useState(null)
  const [loadingAbsentees, setLoadingAbsentees] = useState(false)

  // Annual Report
  const [annualYear, setAnnualYear] = useState(new Date().getFullYear())
  const [annualReport, setAnnualReport] = useState(null)
  const [loadingAnnual, setLoadingAnnual] = useState(false)
  const [annualDeleteConfirm, setAnnualDeleteConfirm] = useState(null)

  const getToken = () => {
    const stored = localStorage.getItem('thcoc_user')
    return stored ? JSON.parse(stored).token : null
  }

  const headers = { Authorization: `Bearer ${getToken()}` }

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [sumRes, flagRes, attRes] = await Promise.all([
        axios.get(`${BASE}/reports/attendance-summary`, { headers }),
        axios.get(`${BASE}/reports/flagged-members`, { headers }),
        axios.get(`${BASE}/attendance`, { headers })
      ])
      setSummary(sumRes.data)
      setFlagged(flagRes.data)
      setAttendanceRecords(attRes.data)
    } catch { toast.error('Failed to load reports') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE}/attendance/${id}`, { headers })
      toast.success('Deleted')
      fetchData()
      setDeleteConfirm(null)
    } catch { toast.error('Failed to delete') }
  }

  const fetchAbsentees = async () => {
    if (!selectedSunday) { toast.error('Please select a Sunday'); return }
    setLoadingAbsentees(true)
    try {
      const { data } = await axios.get(`${BASE}/reports/absentees/${selectedSunday}`, { headers })
      setAbsentees(data.absentees)
      setAbsenteesDate(data.sundayDate)
    } catch { toast.error('Failed to load absentees') }
    finally { setLoadingAbsentees(false) }
  }

  const fetchAnnualReport = async () => {
    setLoadingAnnual(true)
    try {
      const { data } = await axios.get(`${BASE}/reports/annual/${annualYear}`, { headers })
      setAnnualReport(data)
    } catch { toast.error('Failed to load annual report') }
    finally { setLoadingAnnual(false) }
  }

  const handleAnnualDelete = async (id) => {
    try {
      await axios.delete(`${BASE}/attendance/${id}`, { headers })
      toast.success('Record deleted')
      fetchAnnualReport()
      setAnnualDeleteConfirm(null)
    } catch { toast.error('Failed to delete') }
  }

  const handlePrint = () => {
    window.print()
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

  // Check if today is last Sunday of the year
  const isLastSundayOfYear = () => {
    const today = new Date()
    const month = today.getMonth()
    const day = today.getDate()
    const dayOfWeek = today.getDay()
    const daysInMonth = new Date(today.getFullYear(), month + 1, 0).getDate()
    return dayOfWeek === 0 && month === 11 && day > daysInMonth - 7
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div><h1 className="page-title">Reports</h1><p className="page-subtitle">Attendance analytics and member status</p></div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <div className="stat-card"><div className="stat-icon blue">📅</div><div><div className="stat-value">{summary.length}</div><div className="stat-label">Sundays Recorded</div></div></div>
        <div className="stat-card"><div className="stat-icon green">🙋</div><div><div className="stat-value">{avgTotal}</div><div className="stat-label">Avg Attendance</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow">👨</div><div><div className="stat-value">{grandTotals.males}</div><div className="stat-label">Total Males</div></div></div>
        <div className="stat-card"><div className="stat-icon yellow">👩</div><div><div className="stat-value">{grandTotals.females}</div><div className="stat-label">Total Females</div></div></div>
        <div className="stat-card"><div className="stat-icon red">⚠️</div><div><div className="stat-value">{flagged.length}</div><div className="stat-label">Flagged Members</div></div></div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(activeTab === 'summary' ? styles.tabActive : {}) }} onClick={() => setActiveTab('summary')}>📊 Attendance</button>
        <button style={{ ...styles.tab, ...(activeTab === 'flagged' ? styles.tabActive : {}) }} onClick={() => setActiveTab('flagged')}>⚠️ Flagged ({flagged.length})</button>
        <button style={{ ...styles.tab, ...(activeTab === 'absentees' ? styles.tabActive : {}) }} onClick={() => setActiveTab('absentees')}>🚫 Absentees</button>
        {isLastSundayOfYear() && (
          <button style={{ ...styles.tab, ...(activeTab === 'annual' ? styles.tabActive : {}) }} onClick={() => setActiveTab('annual')}>📅 Annual Report</button>
        )}
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner" /></div> : (

        <>
          {/* Attendance Summary Tab */}
          {activeTab === 'summary' && (
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
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ALL TIME TOTAL</td>
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
          )}

          {/* Flagged Members Tab */}
          {activeTab === 'flagged' && (
            <div className="card">
              <div className="card-header"><span className="card-title">⚠️ Flagged Members</span><span className="badge badge-danger">{flagged.length}</span></div>
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

          {/* Absentees Tab */}
          {activeTab === 'absentees' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">🚫 Absentees Report</span>
                {absentees.length > 0 && (
                  <button className="btn btn-outline btn-sm" onClick={handlePrint}>🖨️ Print</button>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 200 }}>
                  <label className="form-label">Select Sunday</label>
                  <select className="form-control" value={selectedSunday} onChange={e => setSelectedSunday(e.target.value)}>
                    <option value="">-- Select a Sunday --</option>
                    {attendanceRecords.map(rec => (
                      <option key={rec._id} value={rec._id}>
                        {formatShortDate(rec.sundayDate)}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="btn btn-primary" onClick={fetchAbsentees} disabled={loadingAbsentees}>
                  {loadingAbsentees ? 'Loading...' : 'Get Absentees'}
                </button>
              </div>

              {absentees.length > 0 ? (
                <>
                  <div style={styles.printHeader}>
                    <h2 style={{ fontFamily: 'Cinzel, serif', marginBottom: 4 }}>Twifo Hemang Church of Christ</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      Absentees Report — {formatDate(absenteesDate)}
                    </p>
                    <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: 4 }}>
                      Total Absentees: <strong>{absentees.length}</strong>
                    </p>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr><th>#</th><th>Member ID</th><th>Full Name</th><th>Gender</th><th>Membership Type</th><th>Phone</th></tr>
                      </thead>
                      <tbody>
                        {absentees.map((m, i) => (
                          <tr key={m._id}>
                            <td>{i + 1}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent)' }}>{m.memberId}</td>
                            <td style={{ fontWeight: 600 }}>{m.fullName}</td>
                            <td>{m.gender}</td>
                            <td>{m.membershipType}</td>
                            <td>{m.phoneNumber || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">🚫</div>
                  <h3>Select a Sunday to view absentees</h3>
                  <p>Choose a date from the dropdown above</p>
                </div>
              )}
            </div>
          )}

          {/* Annual Report Tab - Only on last Sunday of year */}
          {activeTab === 'annual' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">📅 Annual Report</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    className="form-control"
                    style={{ width: 'auto' }}
                    value={annualYear}
                    onChange={e => setAnnualYear(parseInt(e.target.value))}
                  >
                    {[...Array(5)].map((_, i) => {
                      const y = new Date().getFullYear() - i
                      return <option key={y} value={y}>{y}</option>
                    })}
                  </select>
                  <button className="btn btn-primary btn-sm" onClick={fetchAnnualReport} disabled={loadingAnnual}>
                    {loadingAnnual ? 'Loading...' : 'Generate'}
                  </button>
                  {annualReport && (
                    <button className="btn btn-outline btn-sm" onClick={handlePrint}>🖨️ Print</button>
                  )}
                </div>
              </div>

              {!annualReport ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📅</div>
                  <h3>Select a year and click Generate</h3>
                </div>
              ) : annualReport.records?.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📅</div>
                  <h3>No records for {annualYear}</h3>
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div style={styles.printHeader}>
                    <h2 style={{ fontFamily: 'Cinzel, serif', marginBottom: 4 }}>Twifo Hemang Church of Christ</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Annual Attendance Report — {annualYear}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
                    <div style={styles.annualCard}>
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>🏆</div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{annualReport.highest?.total}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Highest Attendance</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{formatShortDate(annualReport.highest?.date)}</div>
                    </div>
                    <div style={styles.annualCard}>
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>📉</div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>{annualReport.lowest?.total}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Lowest Attendance</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{formatShortDate(annualReport.lowest?.date)}</div>
                    </div>
                    <div style={styles.annualCard}>
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>📊</div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>{annualReport.average}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Average Attendance</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Per Sunday</div>
                    </div>
                    <div style={styles.annualCard}>
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>📅</div>
                      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>{annualReport.totalSundays}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>Sundays Recorded</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>In {annualYear}</div>
                    </div>
                  </div>

                  {/* Full records table */}
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr><th>Sunday Date</th><th>Males</th><th>Females</th><th>Total</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {annualReport.records.map(rec => (
                          <tr key={rec._id} style={rec.total === annualReport.highest?.total ? { background: 'rgba(16,185,129,0.1)' } : rec.total === annualReport.lowest?.total ? { background: 'rgba(239,68,68,0.1)' } : {}}>
                            <td style={{ fontWeight: 600 }}>{formatShortDate(rec.sundayDate)}</td>
                            <td>{rec.males}</td>
                            <td>{rec.females}</td>
                            <td>
                              <strong style={{ color: rec.total === annualReport.highest?.total ? 'var(--success)' : rec.total === annualReport.lowest?.total ? 'var(--danger)' : 'var(--accent)' }}>
                                {rec.total}
                                {rec.total === annualReport.highest?.total && ' 🏆'}
                                {rec.total === annualReport.lowest?.total && ' 📉'}
                              </strong>
                            </td>
                            <td>
                              <button className="btn btn-danger btn-sm" onClick={() => setAnnualDeleteConfirm(rec)}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Delete Confirm Modal */}
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

      {/* Annual Delete Confirm */}
      {annualDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setAnnualDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Delete Record</h3><button className="close-btn" onClick={() => setAnnualDeleteConfirm(null)}>✕</button></div>
            <div className="modal-body"><p>Delete attendance record for <strong>{formatShortDate(annualDeleteConfirm.sundayDate)}</strong>?</p></div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setAnnualDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleAnnualDelete(annualDeleteConfirm._id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .card, .card * { visibility: visible; }
          .card { position: absolute; left: 0; top: 0; width: 100%; }
          .btn { display: none !important; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; color: black !important; }
          thead { background: #f0f0f0 !important; }
        }
      `}</style>
    </div>
  )
}

const styles = {
  tabs: {
    display: 'flex', gap: 4, marginBottom: 20, background: 'var(--dark-2)',
    padding: 4, borderRadius: 10, border: '1px solid var(--border)', flexWrap: 'wrap'
  },
  tab: {
    flex: 1, padding: '10px 16px', border: 'none', borderRadius: 8, cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 500,
    background: 'transparent', color: 'var(--text-muted)', transition: 'all 0.2s',
    minWidth: 100
  },
  tabActive: { background: 'var(--primary-light)', color: 'white' },
  printHeader: {
    textAlign: 'center', marginBottom: 20, padding: '16px',
    background: 'var(--dark-3)', borderRadius: 8
  },
  annualCard: {
    background: 'var(--dark-3)', border: '1px solid var(--border)',
    borderRadius: 10, padding: 20, textAlign: 'center'
  }
}