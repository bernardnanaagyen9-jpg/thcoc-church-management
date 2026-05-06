import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'

export default function SettingsPage() {
  const { user } = useAuth()
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) { toast.error('New passwords do not match'); return }
    if (form.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await api.put('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword })
      toast.success('Password changed successfully')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally { setLoading(false) }
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div><h1 className="page-title">Settings</h1><p className="page-subtitle">Manage your account</p></div>
      </div>
      <div style={{ maxWidth: 500 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header"><span className="card-title">Account Information</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1rem' }}>{user?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{user?.email}</div>
              <span className="badge badge-info" style={{ marginTop: 6 }}>
                {user?.role === 'admin' ? '🔑 Administrator' : '👤 User'}
              </span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Change Password</span></div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-control" type="password" name="currentPassword"
                value={form.currentPassword} onChange={handleChange} placeholder="Enter current password" required />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-control" type="password" name="newPassword"
                value={form.newPassword} onChange={handleChange} placeholder="At least 6 characters" required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-control" type="password" name="confirmPassword"
                value={form.confirmPassword} onChange={handleChange} placeholder="Repeat new password" required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : '🔒 Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const styles = {
  avatar: { width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, color: 'white', flexShrink: 0 }
}