import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { formatShortDate } from '../../utils/dateUtils'

const EMPTY = { fullName: '', phoneNumber: '', email: '', residentialAddress: '', occupation: '', gender: '', maritalStatus: '', membershipType: 'Visitor', familyHead: '', familyHeadContact: '' }

export default function TravellersPage({ isAdmin }) {
  const [travellers, setTravellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { fetchTravellers() }, [])

  const fetchTravellers = async () => {
    setLoading(true)
    try { const { data } = await api.get('/travellers'); setTravellers(data) }
    catch { toast.error('Failed to load travellers') }
    finally { setLoading(false) }
  }

  const openAdd = () => { setForm(EMPTY); setEditItem(null); setShowModal(true) }
  const openEdit = (t) => {
    if (!isAdmin) return
    setForm({ fullName: t.fullName, phoneNumber: t.phoneNumber || '', email: t.email || '', residentialAddress: t.residentialAddress || '', occupation: t.occupation || '', gender: t.gender, maritalStatus: t.maritalStatus || '', membershipType: t.membershipType || 'Visitor' })
    setEditItem(t); setShowModal(true)
  }

  const handleSave = async e => {
    e.preventDefault(); setSaving(true)
    try {
      if (editItem) { await api.put(`/travellers/${editItem._id}`, form); toast.success('Traveller updated') }
      else { await api.post('/travellers', form); toast.success('Traveller added') }
      fetchTravellers(); setShowModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await api.delete(`/travellers/${id}`); toast.success('Deleted'); fetchTravellers(); setDeleteConfirm(null) }
    catch { toast.error('Failed to delete') }
  }

  const filtered = travellers.filter(t => t.fullName.toLowerCase().includes(search.toLowerCase()) || t.residentialAddress?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div><h1 className="page-title">Travellers</h1><p className="page-subtitle">{travellers.length} travellers registered</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Traveller</button>
      </div>

      <div className="filters-bar">
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search travellers..." />
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading-spinner"><div className="spinner" /></div>
          : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">✈️</div><h3>No travellers found</h3><p>Add visiting members here</p></div>
          ) : (
            <div className="table-container">
              <table>
                <thead><tr><th>Full Name</th><th>Gender</th><th>Phone</th><th>Address</th><th>Visit Date</th>{isAdmin && <th>Actions</th>}</tr></thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 600 }}>{t.fullName}</td>
                      <td>{t.gender}</td>
                      <td>{t.phoneNumber || '—'}</td>
                      <td>{t.residentialAddress || '—'}</td>
                      <td>{formatShortDate(t.visitDate)}</td>
                      {isAdmin && (
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-outline btn-sm" onClick={() => openEdit(t)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(t)}>Delete</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editItem ? 'Edit Traveller' : 'Add Traveller'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group col-span-2">
                    <label className="form-label">Full Name *</label>
                    <input className="form-control" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-control" value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label">Residential Address</label>
                    <input className="form-control" value={form.residentialAddress} onChange={e => setForm({ ...form, residentialAddress: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Occupation</label>
                    <input className="form-control" value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender *</label>
                    <select className="form-control" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} required>
                      <option value="">Select gender</option><option>Male</option><option>Female</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Marital Status</label>
                    <select className="form-control" value={form.maritalStatus} onChange={e => setForm({ ...form, maritalStatus: e.target.value })}>
                      <option value="">Select status</option><option>Single</option><option>Married</option><option>Widow</option>
                    </select>
                  </div>
                  <div className="form-group">
  <label className="form-label">Family Head</label>
  <input className="form-control" value={form.familyHead} onChange={e => setForm({ ...form, familyHead: e.target.value })} placeholder="Name of family head" />
</div>
<div className="form-group">
  <label className="form-label">Family Head Contact</label>
  <input className="form-control" value={form.familyHeadContact} onChange={e => setForm({ ...form, familyHeadContact: e.target.value })} placeholder="Phone number of family head" />
</div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update' : 'Add Traveller'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Confirm Delete</h3><button className="close-btn" onClick={() => setDeleteConfirm(null)}>✕</button></div>
            <div className="modal-body"><p>Delete <strong>{deleteConfirm.fullName}</strong>?</p></div>
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