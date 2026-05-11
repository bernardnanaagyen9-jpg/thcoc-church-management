import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'

const EMPTY = { fullName: '', phoneNumber: '', email: '', residentialAddress: '', occupation: '', gender: '', maritalStatus: '', membershipType: '', familyHead: '', familyHeadContact: '' }

export default function MembersPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { fetchMembers() }, [])

  const fetchMembers = async () => {
    setLoading(true)
    try { const { data } = await api.get('/members'); setMembers(data) }
    catch { toast.error('Failed to load members') }
    finally { setLoading(false) }
  }

  const openAdd = () => { setForm(EMPTY); setEditMember(null); setShowModal(true) }
  const openEdit = (m) => {
    setForm({ fullName: m.fullName, phoneNumber: m.phoneNumber || '', email: m.email || '', residentialAddress: m.residentialAddress || '', occupation: m.occupation || '', gender: m.gender, maritalStatus: m.maritalStatus, membershipType: m.membershipType })
    setEditMember(m); setShowModal(true)
  }

  const handleSave = async e => {
    e.preventDefault(); setSaving(true)
    try {
      if (editMember) { await api.put(`/members/${editMember._id}`, form); toast.success('Member updated') }
      else { await api.post('/members', form); toast.success('Member added') }
      fetchMembers(); setShowModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await api.delete(`/members/${id}`); toast.success('Member deleted'); fetchMembers(); setDeleteConfirm(null) }
    catch { toast.error('Failed to delete') }
  }

  const filtered = members.filter(m => {
    const s = search.toLowerCase()
    return (m.fullName.toLowerCase().includes(s) || m.memberId?.toLowerCase().includes(s) || m.email?.toLowerCase().includes(s)) && (!filterType || m.membershipType === filterType)
  })

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div><h1 className="page-title">Members</h1><p className="page-subtitle">{members.length} registered members</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Member</button>
      </div>

      <div className="filters-bar">
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID or email..." />
        </div>
        <select className="form-control" style={{ width: 'auto' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option>Full Member</option><option>New Convert</option><option>Visitor</option>
        </select>
      </div>

      <div className="card">
        {loading ? <div className="loading-spinner"><div className="spinner" /></div>
          : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">👥</div><h3>No members found</h3><p>{search ? 'Try a different search' : 'Add your first member'}</p></div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Member ID</th><th>Full Name</th><th>Gender</th><th>Phone</th><th>Membership</th><th>Marital Status</th><th>Family Head</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(m => (
                    <tr key={m._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent)' }}>{m.memberId}</td>
                      <td style={{ fontWeight: 600 }}>{m.fullName}</td>
                      <td>{m.gender}</td>
                      <td>{m.phoneNumber || '—'}</td>
                      <td><span className={`badge ${m.membershipType === 'Full Member' ? 'badge-success' : m.membershipType === 'New Convert' ? 'badge-info' : 'badge-gray'}`}>{m.membershipType}</span></td>
                      <td>{m.maritalStatus}</td>
                      <td>{m.familyHead || '—'}</td>
                      <td>{m.isFlagged ? <span className="badge badge-danger">⚠️ Flagged</span> : <span className="badge badge-success">Active</span>}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(m)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(m)}>Delete</button>
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
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editMember ? 'Edit Member' : 'Add New Member'}</h3>
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
                    <label className="form-label">Marital Status *</label>
                    <select className="form-control" value={form.maritalStatus} onChange={e => setForm({ ...form, maritalStatus: e.target.value })} required>
                      <option value="">Select status</option><option>Single</option><option>Married</option><option>Widow</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Membership Type *</label>
                    <select className="form-control" value={form.membershipType} onChange={e => setForm({ ...form, membershipType: e.target.value })} required>
                      <option value="">Select type</option><option>Full Member</option><option>New Convert</option><option>Visitor</option>
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
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editMember ? 'Update Member' : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Confirm Delete</h3><button className="close-btn" onClick={() => setDeleteConfirm(null)}>✕</button></div>
            <div className="modal-body"><p>Are you sure you want to delete <strong>{deleteConfirm.fullName}</strong>? This cannot be undone.</p></div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>Delete Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}