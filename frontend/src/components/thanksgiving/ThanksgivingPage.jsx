import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { formatShortDate } from '../../utils/dateUtils'

export default function ThanksgivingPage({ isAdmin }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [sundayDate, setSundayDate] = useState('')
  const [entries, setEntries] = useState([{ type: '', totalNumber: '' }])

  useEffect(() => { fetchRecords() }, [])

  const fetchRecords = async () => {
    setLoading(true)
    try { const { data } = await api.get('/thanksgiving'); setRecords(data) }
    catch { toast.error('Failed to load records') }
    finally { setLoading(false) }
  }

  const openAdd = () => { setSundayDate(''); setEntries([{ type: '', totalNumber: '' }]); setEditItem(null); setShowModal(true) }
  const openEdit = (rec) => {
    setSundayDate(new Date(rec.sundayDate).toISOString().split('T')[0])
    setEntries(rec.entries.map(e => ({ type: e.type, totalNumber: e.totalNumber })))
    setEditItem(rec); setShowModal(true)
  }

  const addEntry = () => setEntries([...entries, { type: '', totalNumber: '' }])
  const removeEntry = (idx) => setEntries(entries.filter((_, i) => i !== idx))
  const updateEntry = (idx, field, value) => { const u = [...entries]; u[idx][field] = value; setEntries(u) }
  const totalPreview = entries.reduce((s, e) => s + (parseInt(e.totalNumber) || 0), 0)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!sundayDate) { toast.error('Please select a date'); return }
    const valid = entries.filter(e => e.type && e.totalNumber !== '')
    if (valid.length === 0) { toast.error('Add at least one entry'); return }
    setSaving(true)
    try {
      const payload = { sundayDate, entries: valid.map(e => ({ type: e.type, totalNumber: parseInt(e.totalNumber) || 0 })) }
      if (editItem) { await api.put(`/thanksgiving/${editItem._id}`, payload); toast.success('Updated') }
      else { await api.post('/thanksgiving', payload); toast.success('Entry added') }
      fetchRecords(); setShowModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await api.delete(`/thanksgiving/${id}`); toast.success('Deleted'); fetchRecords(); setDeleteConfirm(null) }
    catch { toast.error('Failed to delete') }
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div><h1 className="page-title">Thanksgiving Service</h1><p className="page-subtitle">{records.length} records</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Thanksgiving</button>
      </div>

      <div className="card">
        {loading ? <div className="loading-spinner"><div className="spinner" /></div>
          : records.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">🙏</div><h3>No thanksgiving records</h3><p>Add the first entry</p></div>
          ) : (
            <div className="table-container">
              <table>
                <thead><tr><th>Date</th><th>Types</th><th>Total Attendance</th><th>Actions</th></tr></thead>
                <tbody>
                  {records.map(rec => (
                    <tr key={rec._id}>
                      <td style={{ fontWeight: 600 }}>{formatShortDate(rec.sundayDate)}</td>
                      <td><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{rec.entries.map((e, i) => <span key={i} className="badge badge-info">{e.type}: {e.totalNumber}</span>)}</div></td>
                      <td><strong style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>{rec.totalAttendance}</strong></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-warning btn-sm" onClick={() => openEdit(rec)}>Edit</button>
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 600, maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Edit Thanksgiving' : 'Add Thanksgiving'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Service Date *</label>
                  <input className="form-control" type="date" value={sundayDate} onChange={e => setSundayDate(e.target.value)} required />
                </div>
                <div style={styles.entriesHeader}>
                  <span style={{ fontWeight: 600 }}>Thanksgiving Entries</span>
                  <button type="button" className="btn btn-outline btn-sm" onClick={addEntry}>+ Add Entry</button>
                </div>
                {entries.map((entry, idx) => (
                  <div key={idx} style={styles.entryRow}>
                    <div className="form-group" style={{ flex: 2, margin: 0 }}>
                      <input className="form-control" placeholder="Type (e.g. Wedding, Funeral...)" value={entry.type} onChange={e => updateEntry(idx, 'type', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                      <input className="form-control" type="number" min="0" placeholder="Count" value={entry.totalNumber} onChange={e => updateEntry(idx, 'totalNumber', e.target.value)} />
                    </div>
                    {entries.length > 1 && <button type="button" style={styles.removeBtn} onClick={() => removeEntry(idx)}>✕</button>}
                  </div>
                ))}
                <div style={styles.totalPreview}>Total: <strong style={{ color: 'var(--accent)', fontSize: '1.2rem' }}>{totalPreview}</strong></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update' : 'Save Entry'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Delete Record</h3><button className="close-btn" onClick={() => setDeleteConfirm(null)}>✕</button></div>
            <div className="modal-body"><p>Delete thanksgiving record for <strong>{formatShortDate(deleteConfirm.sundayDate)}</strong>?</p></div>
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
  entriesHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' },
  entryRow: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 },
  removeBtn: { background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: 6, cursor: 'pointer', padding: '8px 10px', flexShrink: 0 },
  totalPreview: { marginTop: 16, padding: '12px 16px', background: 'var(--dark-3)', borderRadius: 8, textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-muted)' }
}