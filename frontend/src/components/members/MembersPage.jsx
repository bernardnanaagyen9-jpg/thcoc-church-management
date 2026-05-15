import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../utils/api'
import { formatShortDate } from '../../utils/dateUtils'

const EMPTY = {
  // Personal
  fullName: '', birthday: '', age: '', address: '', gpsCode: '',
  placeOfBirth: '', townOfResidence: '', phoneNumber: '', email: '',
  gender: '', maritalStatus: '', occupation: '', residentialAddress: '',
  // Family
  spouseName: '', spouseMobile: '', numberOfChildren: 0,
  children: [],
  motherName: '', motherStatus: '', motherMobile: '',
  fatherName: '', fatherStatus: '', fatherMobile: '',
  familyType: '', familyHead: '', familyHeadContact: '',
  emergencyContactName: '', emergencyContactMobile: '',
  // Church
  dateOfBaptism: '', placeOfBaptism: '', membershipType: '', dateJoined: ''
}

export default function MembersPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [viewMember, setViewMember] = useState(null)
  const [editMember, setEditMember] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [activeTab, setActiveTab] = useState('personal')

  useEffect(() => { fetchMembers() }, [])

  const fetchMembers = async () => {
    setLoading(true)
    try {
      const stored = localStorage.getItem('thcoc_user')
      const token = stored ? JSON.parse(stored).token : null
      const { data } = await api.get('/members', { headers: { Authorization: `Bearer ${token}` } })
      setMembers(data)
    } catch { toast.error('Failed to load members') }
    finally { setLoading(false) }
  }

  const openAdd = () => {
    setForm(EMPTY)
    setEditMember(null)
    setActiveTab('personal')
    setShowModal(true)
  }

  const openEdit = (m) => {
    setForm({
      fullName: m.fullName || '', birthday: m.birthday || '', age: m.age || '',
      address: m.address || '', gpsCode: m.gpsCode || '', placeOfBirth: m.placeOfBirth || '',
      townOfResidence: m.townOfResidence || '', phoneNumber: m.phoneNumber || '',
      email: m.email || '', gender: m.gender || '', maritalStatus: m.maritalStatus || '',
      occupation: m.occupation || '', residentialAddress: m.residentialAddress || '',
      spouseName: m.spouseName || '', spouseMobile: m.spouseMobile || '',
      numberOfChildren: m.numberOfChildren || 0,
      children: m.children || [],
      motherName: m.motherName || '', motherStatus: m.motherStatus || '',
      motherMobile: m.motherMobile || '', fatherName: m.fatherName || '',
      fatherStatus: m.fatherStatus || '', fatherMobile: m.fatherMobile || '',
      familyType: m.familyType || '', familyHead: m.familyHead || '',
      familyHeadContact: m.familyHeadContact || '',
      emergencyContactName: m.emergencyContactName || '',
      emergencyContactMobile: m.emergencyContactMobile || '',
      dateOfBaptism: m.dateOfBaptism || '', placeOfBaptism: m.placeOfBaptism || '',
      membershipType: m.membershipType || '', dateJoined: m.dateJoined || ''
    })
    setEditMember(m)
    setActiveTab('personal')
    setShowModal(true)
  }

  const addChild = () => setForm({ ...form, children: [...form.children, { name: '', gender: '', birthDate: '' }] })
  const removeChild = (idx) => setForm({ ...form, children: form.children.filter((_, i) => i !== idx) })
  const updateChild = (idx, field, value) => {
    const updated = [...form.children]
    updated[idx][field] = value
    setForm({ ...form, children: updated })
  }

  const handleSave = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      const stored = localStorage.getItem('thcoc_user')
      const token = stored ? JSON.parse(stored).token : null
      const config = { headers: { Authorization: `Bearer ${token}` } }
      if (editMember) {
        await api.put(`/members/${editMember._id}`, form, config)
        toast.success('Member updated')
      } else {
        await api.post('/members', form, config)
        toast.success('Member added')
      }
      fetchMembers()
      setShowModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try {
      const stored = localStorage.getItem('thcoc_user')
      const token = stored ? JSON.parse(stored).token : null
      await api.delete(`/members/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      toast.success('Member deleted')
      fetchMembers()
      setDeleteConfirm(null)
    } catch { toast.error('Failed to delete') }
  }

  const filtered = members.filter(m => {
    const s = search.toLowerCase()
    return (m.fullName?.toLowerCase().includes(s) || m.memberId?.toLowerCase().includes(s) ||
      m.email?.toLowerCase().includes(s) || m.phoneNumber?.includes(s)) &&
      (!filterType || m.membershipType === filterType)
  })

  const F = ({ label, value }) => (
    <div style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      <span style={styles.fieldValue}>{value || '—'}</span>
    </div>
  )

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div><h1 className="page-title">Members</h1><p className="page-subtitle">{members.length} registered members</p></div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Member</button>
      </div>

      <div className="filters-bar">
        <div className="search-input">
          <span className="search-icon">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, phone or email..." />
        </div>
        <select className="form-control" style={{ width: 'auto' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option>Full Member</option><option>New Convert</option><option>Visitor</option>
        </select>
      </div>

      <div className="card">
        {loading ? <div className="loading-spinner"><div className="spinner" /></div>
          : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">👥</div><h3>No members found</h3></div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Member ID</th><th>Full Name</th><th>Gender</th>
                    <th>Phone</th><th>Membership</th><th>Marital Status</th>
                    <th>Family Head</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(m => (
                    <tr key={m._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent)' }}>{m.memberId}</td>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {m.photo?.url ? (
                            <img src={m.photo.url} alt="" style={styles.avatar} />
                          ) : (
                            <div style={styles.avatarPlaceholder}>{m.fullName?.[0]}</div>
                          )}
                          {m.fullName}
                        </div>
                      </td>
                      <td>{m.gender}</td>
                      <td>{m.phoneNumber || '—'}</td>
                      <td><span className={`badge ${m.membershipType === 'Full Member' ? 'badge-success' : m.membershipType === 'New Convert' ? 'badge-info' : 'badge-gray'}`}>{m.membershipType}</span></td>
                      <td>{m.maritalStatus}</td>
                      <td>{m.familyHead || '—'}</td>
                      <td>{m.isFlagged ? <span className="badge badge-danger">⚠️ Flagged</span> : <span className="badge badge-success">Active</span>}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => setViewMember(m)}>View</button>
                          <button className="btn btn-warning btn-sm" onClick={() => openEdit(m)}>Edit</button>
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

      {/* VIEW MODAL */}
      {viewMember && (
        <div className="modal-overlay" onClick={() => setViewMember(null)}>
          <div className="modal" style={{ maxWidth: 700, maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Member Profile — {viewMember.memberId}</h3>
              <button className="close-btn" onClick={() => setViewMember(null)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Header */}
              <div style={styles.profileHeader}>
                {viewMember.photo?.url ? (
                  <img src={viewMember.photo.url} alt="" style={styles.profilePhoto} />
                ) : (
                  <div style={styles.profilePhotoPlaceholder}>{viewMember.fullName?.[0]}</div>
                )}
                <div>
                  <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '1.3rem' }}>{viewMember.fullName}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{viewMember.memberId}</p>
                  <span className={`badge ${viewMember.membershipType === 'Full Member' ? 'badge-success' : viewMember.membershipType === 'New Convert' ? 'badge-info' : 'badge-gray'}`} style={{ marginTop: 6 }}>
                    {viewMember.membershipType}
                  </span>
                </div>
              </div>

              {/* PERSONAL */}
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>👤 Personal Information</h4>
                <div style={styles.fieldGrid}>
                  <F label="Full Name" value={viewMember.fullName} />
                  <F label="Birthday" value={viewMember.birthday} />
                  <F label="Age" value={viewMember.age} />
                  <F label="Gender" value={viewMember.gender} />
                  <F label="Marital Status" value={viewMember.maritalStatus} />
                  <F label="Mobile Number" value={viewMember.phoneNumber} />
                  <F label="Email" value={viewMember.email} />
                  <F label="Address" value={viewMember.address} />
                  <F label="GPS Code" value={viewMember.gpsCode} />
                  <F label="Place of Birth" value={viewMember.placeOfBirth} />
                  <F label="Town of Residence" value={viewMember.townOfResidence} />
                  <F label="Occupation" value={viewMember.occupation} />
                </div>
              </div>

              {/* FAMILY */}
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>👨‍👩‍👧‍👦 Family Information</h4>
                <div style={styles.fieldGrid}>
                  <F label="Spouse's Name" value={viewMember.spouseName} />
                  <F label="Spouse's Mobile" value={viewMember.spouseMobile} />
                  <F label="Number of Children" value={viewMember.numberOfChildren} />
                  <F label="Mother's Name" value={viewMember.motherName} />
                  <F label="Mother's Status" value={viewMember.motherStatus} />
                  <F label="Mother's Mobile" value={viewMember.motherMobile} />
                  <F label="Father's Name" value={viewMember.fatherName} />
                  <F label="Father's Status" value={viewMember.fatherStatus} />
                  <F label="Father's Mobile" value={viewMember.fatherMobile} />
                  <F label="Family Type" value={viewMember.familyType} />
                  <F label="Family Head" value={viewMember.familyHead} />
                  <F label="Family Head Contact" value={viewMember.familyHeadContact} />
                  <F label="Emergency Contact" value={viewMember.emergencyContactName} />
                  <F label="Emergency Mobile" value={viewMember.emergencyContactMobile} />
                </div>

                {/* Children */}
                {viewMember.children?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <h5 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>Children</h5>
                    <table style={{ width: '100%', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--dark-3)' }}>
                          <th style={{ padding: '6px 10px', textAlign: 'left' }}>Name</th>
                          <th style={{ padding: '6px 10px', textAlign: 'left' }}>Gender</th>
                          <th style={{ padding: '6px 10px', textAlign: 'left' }}>Birth Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewMember.children.map((c, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '6px 10px' }}>{c.name || '—'}</td>
                            <td style={{ padding: '6px 10px' }}>{c.gender || '—'}</td>
                            <td style={{ padding: '6px 10px' }}>{c.birthDate || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* CHURCH */}
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>⛪ Church Information</h4>
                <div style={styles.fieldGrid}>
                  <F label="Date of Baptism" value={viewMember.dateOfBaptism} />
                  <F label="Place of Baptism" value={viewMember.placeOfBaptism} />
                  <F label="Membership Type" value={viewMember.membershipType} />
                  <F label="Date Joined" value={viewMember.dateJoined} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewMember(null)}>Close</button>
              <button className="btn btn-warning" onClick={() => { setViewMember(null); openEdit(viewMember) }}>Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 750, maxHeight: '95vh' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editMember ? 'Edit Member' : 'New Member Registration'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {/* Section Tabs */}
            <div style={styles.formTabs}>
              {['personal', 'family', 'church'].map(tab => (
                <button key={tab} style={{ ...styles.formTab, ...(activeTab === tab ? styles.formTabActive : {}) }}
                  onClick={() => setActiveTab(tab)} type="button">
                  {tab === 'personal' ? '👤 Personal' : tab === 'family' ? '👨‍👩‍👧‍👦 Family' : '⛪ Church'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">

                {/* PERSONAL TAB */}
                {activeTab === 'personal' && (
                  <div className="form-grid">
                    <div className="form-group col-span-2">
                      <label className="form-label">Full Name *</label>
                      <input className="form-control" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Birthday</label>
                      <input className="form-control" placeholder="e.g. 05/10/1964" value={form.birthday} onChange={e => setForm({ ...form, birthday: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Age</label>
                      <input className="form-control" type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
                    </div>
                    <div className="form-group col-span-2">
                      <label className="form-label">Address</label>
                      <input className="form-control" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">GPS Code</label>
                      <input className="form-control" placeholder="e.g. GH-0012-7820" value={form.gpsCode} onChange={e => setForm({ ...form, gpsCode: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Place of Birth</label>
                      <input className="form-control" value={form.placeOfBirth} onChange={e => setForm({ ...form, placeOfBirth: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Town of Residence</label>
                      <input className="form-control" value={form.townOfResidence} onChange={e => setForm({ ...form, townOfResidence: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mobile Number</label>
                      <input className="form-control" value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sex *</label>
                      <select className="form-control" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} required>
                        <option value="">Select</option><option>Male</option><option>Female</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Marital Status *</label>
                      <select className="form-control" value={form.maritalStatus} onChange={e => setForm({ ...form, maritalStatus: e.target.value })} required>
                        <option value="">Select</option><option>Single</option><option>Married</option><option>Widow</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Occupation</label>
                      <input className="form-control" value={form.occupation} onChange={e => setForm({ ...form, occupation: e.target.value })} />
                    </div>
                  </div>
                )}

                {/* FAMILY TAB */}
                {activeTab === 'family' && (
                  <div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label">Spouse's Name</label>
                        <input className="form-control" value={form.spouseName} onChange={e => setForm({ ...form, spouseName: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Spouse's Mobile</label>
                        <input className="form-control" value={form.spouseMobile} onChange={e => setForm({ ...form, spouseMobile: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Number of Children</label>
                        <input className="form-control" type="number" min="0" value={form.numberOfChildren} onChange={e => setForm({ ...form, numberOfChildren: e.target.value })} />
                      </div>
                    </div>

                    {/* Children */}
                    <div style={styles.childrenSection}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Children's Details</span>
                        <button type="button" className="btn btn-outline btn-sm" onClick={addChild}>+ Add Child</button>
                      </div>
                      {form.children.map((child, idx) => (
                        <div key={idx} style={styles.childRow}>
                          <div className="form-group" style={{ flex: 2, margin: 0 }}>
                            <input className="form-control" placeholder="Child's name" value={child.name} onChange={e => updateChild(idx, 'name', e.target.value)} />
                          </div>
                          <div className="form-group" style={{ flex: 1, margin: 0 }}>
                            <select className="form-control" value={child.gender} onChange={e => updateChild(idx, 'gender', e.target.value)}>
                              <option value="">Gender</option><option value="Male">M</option><option value="Female">F</option>
                            </select>
                          </div>
                          <div className="form-group" style={{ flex: 1, margin: 0 }}>
                            <input className="form-control" placeholder="Birth date" value={child.birthDate} onChange={e => updateChild(idx, 'birthDate', e.target.value)} />
                          </div>
                          <button type="button" style={styles.removeBtn} onClick={() => removeChild(idx)}>✕</button>
                        </div>
                      ))}
                    </div>

                    <div className="form-grid" style={{ marginTop: 16 }}>
                      <div className="form-group">
                        <label className="form-label">Mother's Name</label>
                        <input className="form-control" value={form.motherName} onChange={e => setForm({ ...form, motherName: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Mother's Status</label>
                        <select className="form-control" value={form.motherStatus} onChange={e => setForm({ ...form, motherStatus: e.target.value })}>
                          <option value="">Select</option><option>Alive</option><option>Dead</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Mother's Mobile</label>
                        <input className="form-control" value={form.motherMobile} onChange={e => setForm({ ...form, motherMobile: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Father's Name</label>
                        <input className="form-control" value={form.fatherName} onChange={e => setForm({ ...form, fatherName: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Father's Status</label>
                        <select className="form-control" value={form.fatherStatus} onChange={e => setForm({ ...form, fatherStatus: e.target.value })}>
                          <option value="">Select</option><option>Alive</option><option>Dead</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Father's Mobile</label>
                        <input className="form-control" value={form.fatherMobile} onChange={e => setForm({ ...form, fatherMobile: e.target.value })} />
                      </div>
                      <div className="form-group col-span-2">
                        <label className="form-label">Type of Family (e.g. Asona, Biretuo)</label>
                        <input className="form-control" value={form.familyType} onChange={e => setForm({ ...form, familyType: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Name of Family Head</label>
                        <input className="form-control" value={form.familyHead} onChange={e => setForm({ ...form, familyHead: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Family Head Mobile</label>
                        <input className="form-control" value={form.familyHeadContact} onChange={e => setForm({ ...form, familyHeadContact: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Emergency Contact Name</label>
                        <input className="form-control" value={form.emergencyContactName} onChange={e => setForm({ ...form, emergencyContactName: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Emergency Contact Mobile</label>
                        <input className="form-control" value={form.emergencyContactMobile} onChange={e => setForm({ ...form, emergencyContactMobile: e.target.value })} />
                      </div>
                    </div>
                  </div>
                )}

                {/* CHURCH TAB */}
                {activeTab === 'church' && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Date of Baptism</label>
                      <input className="form-control" placeholder="e.g. 01/01/2000" value={form.dateOfBaptism} onChange={e => setForm({ ...form, dateOfBaptism: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Place of Baptism</label>
                      <input className="form-control" value={form.placeOfBaptism} onChange={e => setForm({ ...form, placeOfBaptism: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Membership Type *</label>
                      <select className="form-control" value={form.membershipType} onChange={e => setForm({ ...form, membershipType: e.target.value })} required>
                        <option value="">Select type</option>
                        <option>Full Member</option><option>New Convert</option><option>Visitor</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date Joined</label>
                      <input className="form-control" placeholder="e.g. 01/01/2020" value={form.dateJoined} onChange={e => setForm({ ...form, dateJoined: e.target.value })} />
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <div style={{ display: 'flex', gap: 8 }}>
                  {activeTab !== 'personal' && (
                    <button type="button" className="btn btn-outline"
                      onClick={() => setActiveTab(activeTab === 'church' ? 'family' : 'personal')}>
                      ← Back
                    </button>
                  )}
                  {activeTab !== 'church' ? (
                    <button type="button" className="btn btn-primary"
                      onClick={() => setActiveTab(activeTab === 'personal' ? 'family' : 'church')}>
                      Next →
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Saving...' : editMember ? 'Update Member' : 'Register Member'}
                    </button>
                  )}
                </div>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3 className="modal-title">Confirm Delete</h3><button className="close-btn" onClick={() => setDeleteConfirm(null)}>✕</button></div>
            <div className="modal-body"><p>Delete <strong>{deleteConfirm.fullName}</strong>? This cannot be undone.</p></div>
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

const styles = {
  avatar: { width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' },
  avatarPlaceholder: {
    width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '0.85rem', color: 'white', flexShrink: 0
  },
  profileHeader: {
    display: 'flex', alignItems: 'center', gap: 20, padding: '16px',
    background: 'var(--dark-3)', borderRadius: 10, marginBottom: 20
  },
  profilePhoto: { width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)' },
  profilePhotoPlaceholder: {
    width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-light)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '2rem', color: 'white', flexShrink: 0
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)',
    marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)',
    fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px'
  },
  fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  field: { padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  fieldLabel: { display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 },
  fieldValue: { fontSize: '0.875rem', color: 'var(--text)', fontWeight: 500 },
  formTabs: {
    display: 'flex', background: 'var(--dark-3)', padding: 4,
    borderBottom: '1px solid var(--border)'
  },
  formTab: {
    flex: 1, padding: '10px 16px', border: 'none', cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 500,
    background: 'transparent', color: 'var(--text-muted)', transition: 'all 0.2s'
  },
  formTabActive: { background: 'var(--primary-light)', color: 'white', borderRadius: 6 },
  childrenSection: { background: 'var(--dark-3)', borderRadius: 8, padding: 16, marginTop: 8 },
  childRow: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 },
  removeBtn: {
    background: 'var(--danger-bg)', border: '1px solid var(--danger)',
    color: 'var(--danger)', borderRadius: 6, cursor: 'pointer', padding: '8px 10px', flexShrink: 0
  }
}