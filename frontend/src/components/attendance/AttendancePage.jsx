import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { formatShortDate } from '../../utils/dateUtils'

export default function AttendancePage({ isAdmin }) {
  const [records, setRecords] = useState([])
  const [members, setMembers] = useState([])
  const [travellers, setTravellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMarkModal, setShowMarkModal] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [viewRecord, setViewRecord] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [sundayDate, setSundayDate] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [memberAttendance, setMemberAttendance] = useState([])
  const [travellerAttendance, setTravellerAttendance] = useState([])
  const [intermediate, setIntermediate] = useState(0)
  const [children, setChildren] = useState(0)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [recRes, memRes, travRes] = await Promise.all([api.get('/attendance'), api.get('/members'), api.get('/travellers')])
      setRecords(recRes.data); setMembers(memRes.data); setTravellers(travRes.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  const toInputDate = (date) => date ? new Date(date).toISOString().split('T')[0] : ''

  const openMark = (existing = null) => {
    if (existing) {
      setSundayDate(toInputDate(existing.sundayDate))
      setIntermediate(existing.intermediateClass || 0)
      setChildren(existing.childrenService || 0)
      setMemberAttendance(members.map(m => {
        const rec = existing.memberAttendance?.find(a => (a.member?._id || a.member)?.toString() === m._id?.toString())
        return { memberId: m._id, fullName: m.fullName, gender: m.gender, membershipType: m.membershipType, status: rec?.status || 'Absent' }
      }))
      setTravellerAttendance(travellers.map(t => {
        const rec = existing.travellerAttendance?.find(a => (a.traveller?._id || a.traveller)?.toString() === t._id?.toString())
        return { travellerId: t._id, fullName: t.fullName, status: rec?.status || 'Absent' }
      }))
      setEditRecord(existing)
    } else {
      setSundayDate(''); setIntermediate(0); setChildren(0)
      setMemberAttendance(members.map(m => ({ memberId: m._id, fullName: m.fullName, gender: m.gender, membershipType: m.membershipType, status: 'Absent' })))
      setTravellerAttendance(travellers.map(t => ({ travellerId: t._id, fullName: t.fullName, status: 'Absent' })))
      setEditRecord(null)
    }
    setShowMarkModal(true)
  }

  const toggleMember = (idx, status) => { const u = [...memberAttendance]; u[idx].status = status; setMemberAttendance(u) }
  const toggleTraveller = (idx, status) => { const u = [...travellerAttendance]; u[idx].status = status; setTravellerAttendance(u) }
  const markAll = (status) => setMemberAttendance(memberAttendance.map(m => ({ ...m, status })))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!sundayDate) { toast.error('Please select a Sunday date'); return }
    setSaving(true)
    try {
      const payload = {
        sundayDate,
        memberAttendance: memberAttendance.map(m => ({ member: m.memberId, status: m.status, gender: m.gender, membershipType: m.membershipType })),
        travellerAttendance: travellerAttendance.map(t => ({ traveller: t.travellerId, status: t.status })),
        intermediateClass: parseInt(intermediate) || 0,
        childrenService: parseInt(children) || 0
      }
      if (editRecord) { await api.put(`/attendance/${editRecord._id}`, payload); toast.success('Attendance updated') }
      else { await api.post('/attendance', payload); toast.success('Attendance submitted') }
      fetchAll(); setShowMarkModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await api.delete(`/attendance/${id}`); toast.success('Record deleted'); fetchAll(); setDeleteConfirm(null) }
    catch { toast.error('Failed to delete') }
  }

  const presentCount = memberAttendance.filter(m => m.status === 'Present').length

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div><h1 className="page-title">Attendance</h1><p className="page-subtitle">{records.length} Sunday records</p></div>
        <button className="btn btn-primary" onClick={() => openMark()}>+ Mark Attendance</button>
      </div>

      <div className="card">
        {loading ? <div className="loading-spinner"><div className="spinner" /></div>
          : records.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">✅</div><h3>No attendance records yet</h3><p>Mark the first Sunday attendance</p></div>
          ) : (
            <div className="table-container">
              <table>
                <thead><tr><th>Date</th><th>Males (Y)</th><th>Females (X)</th><th>Intermediate (U)</th><th>Children (V)</th><th>Visitors (P)</th><th>Travellers (L)</th><th>Total (J)</th><th>Actions</th></tr></thead>
                <tbody>
                  {records.map(rec => (
                    <tr key={rec._id}>
                      <td style={{ fontWeight: 600 }}>{formatShortDate(rec.sundayDate)}</td>
                      <td>{rec.stats?.males || 0}</td>
                      <td>{rec.stats?.females || 0}</td>
                      <td>{rec.intermediateClass || 0}</td>
                      <td>{rec.childrenService || 0}</td>
                      <td>{rec.stats?.visitors || 0}</td>
                      <td>{rec.stats?.travellers || 0}</td>
                      <td><strong style={{ color: 'var(--accent)', fontSize: '1rem' }}>{rec.stats?.total || 0}</strong></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => setViewRecord(rec)}>View</button>
                          <button className="btn btn-warning btn-sm" onClick={() => openMark(rec)}>Edit</button>
                          {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(rec)}>Delete</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {showMarkModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 860, maxHeight: '95vh' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editRecord ? `Edit — ${formatShortDate(editRecord.sundayDate)}` : 'Mark Sunday Attendance'}</h3>
              <button className="close-btn" onClick={() => setShowMarkModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Sunday Date *</label>
                    <input className="form-control" type="date" value={sundayDate} onChange={e => setSundayDate(e.target.value)} disabled={!!editRecord} required />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Intermediate Class (U)</label>
                    <input className="form-control" type="number" min="0" value={intermediate} onChange={e => setIntermediate(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Children Service (V)</label>
                    <input className="form-control" type="number" min="0" value={children} onChange={e => setChildren(e.target.value)} />
                  </div>
                </div>

               <div style={styles.sectionHeader}>
  <div>
    <span style={styles.sectionTitle}>👥 Members</span>
    <span style={styles.sectionCount}>{presentCount} / {memberAttendance.length} present</span>
  </div>
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    <button type="button" className="btn btn-success btn-sm" onClick={() => markAll('Present')}>Mark All Present</button>
    <button type="button" className="btn btn-danger btn-sm" onClick={() => markAll('Absent')}>Mark All Absent</button>
  </div>
</div>

{/* Search bar */}
<div style={{ marginBottom: 12, position: 'relative' }}>
  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dark)' }}>🔍</span>
  <input
    style={{ width: '100%', padding: '8px 12px 8px 32px', background: 'var(--dark-3)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontSize: '0.875rem', outline: 'none' }}
    placeholder="Search member by name..."
    value={memberSearch}
    onChange={e => setMemberSearch(e.target.value)}
  />
</div>

               {memberAttendance.length === 0
  ? <div className="alert alert-info">No members yet. Add members first.</div>
  : (
    <div style={styles.attendanceGrid}>
      {memberAttendance
        .map((m, originalIdx) => ({ ...m, originalIdx }))
        .filter(m => m.fullName.toLowerCase().includes(memberSearch.toLowerCase()))
        .map((m) => (
          <div key={m.memberId} style={styles.attendanceCard}>
            <div style={styles.memberInfo}>
              <div style={styles.memberAvatar}>{m.fullName[0]}</div>
              <div>
                <div style={styles.memberName}>{m.fullName}</div>
                <div style={styles.memberMeta}>{m.gender} · {m.membershipType}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button"
                className={`check-btn present ${m.status === 'Present' ? 'active' : ''}`}
                onClick={() => toggleMember(m.originalIdx, 'Present')}>Present</button>
              <button type="button"
                className={`check-btn absent ${m.status === 'Absent' ? 'active' : ''}`}
                onClick={() => toggleMember(m.originalIdx, 'Absent')}>Absent</button>
            </div>
          </div>
        ))}
    </div>
  )}

                {travellerAttendance.length > 0 && (
                  <>
                    <div style={{ ...styles.sectionHeader, marginTop: 24 }}>
                      <div>
                        <span style={styles.sectionTitle}>✈️ Travellers</span>
                        <span style={styles.sectionCount}>{travellerAttendance.filter(t => t.status === 'Present').length} / {travellerAttendance.length} present</span>
                      </div>
                    </div>
                    <div style={styles.attendanceGrid}>
                      {travellerAttendance.map((t, idx) => (
                        <div key={t.travellerId} style={styles.attendanceCard}>
                          <div style={styles.memberInfo}>
                            <div style={{ ...styles.memberAvatar, background: 'var(--warning-bg)', color: 'var(--warning)' }}>{t.fullName[0]}</div>
                            <div>
                              <div style={styles.memberName}>{t.fullName}</div>
                              <div style={styles.memberMeta}>Traveller</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button type="button" className={`check-btn present ${t.status === 'Present' ? 'active' : ''}`} onClick={() => toggleTraveller(idx, 'Present')}>Present</button>
                            <button type="button" className={`check-btn absent ${t.status === 'Absent' ? 'active' : ''}`} onClick={() => toggleTraveller(idx, 'Absent')}>Absent</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowMarkModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editRecord ? 'Update Attendance' : 'Submit Attendance'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewRecord && (
        <div className="modal-overlay" onClick={() => setViewRecord(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Attendance — {formatShortDate(viewRecord.sundayDate)}</h3>
              <button className="close-btn" onClick={() => setViewRecord(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={styles.summaryBanner}>
                Total in attendance: Males ({viewRecord.stats?.males || 0}), Females ({viewRecord.stats?.females || 0}), Intermediate ({viewRecord.intermediateClass || 0}), Children ({viewRecord.childrenService || 0}), Visitors ({viewRecord.stats?.visitors || 0}), Travellers ({viewRecord.stats?.travellers || 0}), <strong>Total ({viewRecord.stats?.total || 0})</strong>
              </div>
              <div style={styles.statsRow}>
                {[
                  { label: 'Males (Y)', value: viewRecord.stats?.males || 0, color: '#3b82f6' },
                  { label: 'Females (X)', value: viewRecord.stats?.females || 0, color: '#ec4899' },
                  { label: 'Intermediate (U)', value: viewRecord.intermediateClass || 0, color: '#f59e0b' },
                  { label: 'Children (V)', value: viewRecord.childrenService || 0, color: '#10b981' },
                  { label: 'Visitors (P)', value: viewRecord.stats?.visitors || 0, color: '#8b5cf6' },
                  { label: 'Travellers (L)', value: viewRecord.stats?.travellers || 0, color: '#06b6d4' },
                  { label: 'Total (J)', value: viewRecord.stats?.total || 0, color: '#e2e8f0', big: true },
                ].map(s => (
                  <div key={s.label} style={{ ...styles.statPill, borderColor: s.color }}>
                    <div style={{ ...styles.statNum, color: s.color, fontSize: s.big ? '1.6rem' : '1.3rem' }}>{s.value}</div>
                    <div style={styles.statLbl}>{s.label}</div>
                  </div>
                ))}
              </div>
              <h4 style={{ margin: '20px 0 12px', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Present Members</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {viewRecord.memberAttendance?.filter(a => a.status === 'Present').map((a, i) => (
                  <span key={i} style={styles.presentBadge}>{a.member?.fullName || 'Unknown'}</span>
                ))}
                {viewRecord.memberAttendance?.filter(a => a.status === 'Present').length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No members present</span>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewRecord(null)}>Close</button>
              <button className="btn btn-warning" onClick={() => { setViewRecord(null); openMark(viewRecord) }}>Edit</button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Delete Record</h3><button className="close-btn" onClick={() => setDeleteConfirm(null)}>✕</button></div>
            <div className="modal-body"><p>Delete attendance for <strong>{formatShortDate(deleteConfirm.sundayDate)}</strong>? This cannot be undone.</p></div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>Delete Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' },
  sectionTitle: { fontWeight: 600, fontSize: '0.95rem' },
  sectionCount: { marginLeft: 10, fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--dark-3)', padding: '2px 8px', borderRadius: 20 },
  attendanceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 },
  attendanceCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--dark-3)', borderRadius: 8, border: '1px solid var(--border)' },
  memberInfo: { display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  memberAvatar: { width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'white', flexShrink: 0 },
  memberName: { fontWeight: 500, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 },
  memberMeta: { fontSize: '0.72rem', color: 'var(--text-muted)' },
  summaryBanner: { background: 'rgba(37,99,168,0.15)', border: '1px solid rgba(37,99,168,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: '0.875rem', lineHeight: 1.7 },
  statsRow: { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statPill: { border: '1px solid', borderRadius: 8, padding: '10px 16px', textAlign: 'center', minWidth: 90, background: 'var(--dark-3)' },
  statNum: { fontWeight: 700, lineHeight: 1 },
  statLbl: { fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 },
  presentBadge: { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#6ee7b7', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem' }
}