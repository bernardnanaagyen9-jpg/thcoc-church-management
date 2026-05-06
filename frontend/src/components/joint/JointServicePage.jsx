import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { formatShortDate } from '../../utils/dateUtils'

export default function JointServicePage({ isAdmin }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [viewItem, setViewItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [serviceDate, setServiceDate] = useState('')
  const [title, setTitle] = useState('')
  const [congregations, setCongregations] = useState([{ name: '', totalAttendance: '' }])

  useEffect(() => { fetchRecords() }, [])

  const fetchRecords = async () => {
    setLoading(true)
    try { const { data } = await api.get('/joint'); setRecords(data) }
    catch { toast.error('Failed to load records') }
    finally { setLoading(false) }
  }

  const openAdd = () => { setServiceDate(''); setTitle(''); setCongregations([{ name: '', totalAttendance: '' }]); setEditItem(null); setShowModal(true) }
  const openEdit = (rec) => {
    setServiceDate(new Date(rec.serviceDate).toISOString().split('T')[0])
    setTitle(rec.title || '')
    setCongregations(rec.congregations.map(c => ({ name: c.name, totalAttendance: c.totalAttendance })))
    setEditItem(rec); setShowModal(true)
  }

  const addCong = () => setCongregations([...congregations, { name: '', totalAttendance: '' }])
  const removeCong = (idx) => setCongregations(congregations.filter((_, i) => i !== idx))
  const updateCong = (idx, field, value) => { const u = [...congregations]; u[idx][field] = value; setCongregations(u) }
  const grandTotalPreview = congregations.reduce((s, c) => s + (parseInt(c.totalAttendance) || 0), 0)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!serviceDate) { toast.error('Please select a date'); return }
    const valid = congregations.filter(c => c.name && c.totalAttendance !== '')
    if (valid.length === 0) { toast.error('Add at least one congregation'); return }
    setSaving(true)
    try {
      const payload = { serviceDate, title, congregations: valid.map(c => ({ name: c.name, totalAttendance: parseInt(c.totalAttendance) || 0 })) }
      if (editItem) { await api.put(`/joint/${editItem._id}`, payload); toast.success('Updated') }
      else { await api.post('/joint', payload); toast.success('Joint service added') }
      fetchRecords(); setShowModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await api.delete(`/joint/${id}`); toast.success('Deleted'); fetchRecords(); setDeleteConfirm(null) }
    catch { toast.error('Failed to delete') }
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div><h1 className="page-title">Joint Service</h1><p className="page-subtitle">{records.length} records</p></div>
        {isAdmin && <button className="btn btn-primary" onClick={openAdd}>+ Add Joint Service</button>}
      </div>

      {!isAdmin && <div className="alert alert-info" style={{ marginBottom: 20 }}>👁️ View only — contact admin to add or edit records.</div>}

      <div className="card">
        {loading ? <div className="loading-spinner"><div className="spinner" /></div>
          : records.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">🤝</div><h3>No joint service records</h3><p>{isAdmin ? 'Add the first one' : 'No records yet'}</p></div>
          ) : (
            <div className="table-container">
              <table>
                <thead><tr><th>Date</th><th>Title</th><th>Congregations</th><th>Grand Total</th><th>Actions</th></tr></thead>
                <tbody>
                  {records.map(rec => (
                    <tr key={rec._id}>
                      <td style={{ fontWeight: 600 }}>{formatShortDate(rec.serviceDate)}</td>
                      <td>{rec.title || '—'}</td>
                      <td><span className="badge badge-info">{rec.congregations?.length || 0} congregations</span></td>
                      <td><strong style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>{rec.grandTotal}</strong></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => setViewItem(rec)}>View</button>
                          {isAdmin && <>
                            <button className="btn btn-warning btn-sm" onClick={() => openEdit(rec)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(rec)}>Delete</button>
                          </>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {showModal && isAdmin && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 600, maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Edit Joint Service' : 'Add Joint Service'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Service Date *</label>
                    <input className="form-control" type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input className="form-control" placeholder="e.g. Zone Rally" value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                </div>
                <div style={styles.congHeader}>
                  <span style={{ fontWeight: 600 }}>Congregations</span>
                  <button type="button" className="btn btn-outline btn-sm" onClick={addCong}>+ Add</button>
                </div>
                {congregations.map((c, idx) => (
                  <div key={idx} style={styles.congRow}>
                    <div className="form-group" style={{ flex: 2, margin: 0 }}>
                      <input className="form-control" placeholder="Congregation name" value={c.name} onChange={e => updateCong(idx, 'name', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                      <input className="form-control" type="number" min="0" placeholder="Attendance" value={c.totalAttendance} onChange={e => updateCong(idx, 'totalAttendance', e.target.value)} />
                    </div>
                    {congregations.length > 1 && <button type="button" style={styles.removeBtn} onClick={() => removeCong(idx)}>✕</button>}
                  </div>
                ))}
                <div style={styles.totalPreview}>Grand Total: <strong style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>{grandTotalPreview}</strong></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{viewItem.title || 'Joint Service'} — {formatShortDate(viewItem.serviceDate)}</h3>
              <button className="close-btn" onClick={() => setViewItem(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="table-container">
                <table>
                  <thead><tr><th>Congregation</th><th>Attendance</th></tr></thead>
                  <tbody>
                    {viewItem.congregations?.map((c, i) => <tr key={i}><td style={{ fontWeight: 500 }}>{c.name}</td><td><strong style={{ color: 'var(--accent)' }}>{c.totalAttendance}</strong></td></tr>)}
                    <tr style={{ background: 'var(--dark-3)' }}>
                      <td style={{ fontWeight: 700 }}>GRAND TOTAL</td>
                      <td><strong style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>{viewItem.grandTotal}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer"><button className="btn btn-outline" onClick={() => setViewItem(null)}>Close</button></div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Delete Record</h3><button className="close-btn" onClick={() => setDeleteConfirm(null)}>✕</button></div>
            <div className="modal-body"><p>Delete joint service for <strong>{formatShortDate(deleteConfirm.serviceDate)}</strong>?</p></div>
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
  congHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' },
  congRow: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 },
  removeBtn: { background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: 6, cursor: 'pointer', padding: '8px 10px', flexShrink: 0 },
  totalPreview: { marginTop: 16, padding: '12px 16px', background: 'var(--dark-3)', borderRadius: 8, textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-muted)' }
}