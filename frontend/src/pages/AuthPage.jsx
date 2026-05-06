import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function AuthPage() {
  const { login } = useAuth()
  const [activeRole, setActiveRole] = useState('user')
  const [mode, setMode] = useState('login')
  const [adminExists, setAdminExists] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  useEffect(() => {
  api.get('/auth/check-admin')
    .then(res => setAdminExists(res.data.exists))
    .catch(() => setAdminExists(false))
}, [])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'signup') {
        if (form.password !== form.confirmPassword) {
          toast.error('Passwords do not match')
          setLoading(false)
          return
        }
        if (form.password.length < 6) {
          toast.error('Password must be at least 6 characters')
          setLoading(false)
          return
        }
        const endpoint = activeRole === 'admin' ? '/auth/register-admin' : '/auth/register'
        const { data } = await api.post(endpoint, { name: form.name, email: form.email, password: form.password })
        login(data)
        toast.success(`Welcome, ${data.name}!`)
      } else {
        const { data } = await api.post('/auth/login', { email: form.email, password: form.password, role: activeRole })
        login(data)
        toast.success(`Welcome back, ${data.name}!`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const switchRole = (role) => {
    setActiveRole(role)
    setMode('login')
    setForm({ name: '', email: '', password: '', confirmPassword: '' })
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />
      <div style={styles.container}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>✝</div>
          <div>
            <h1 style={styles.logoTitle}>THCoC</h1>
            <p style={styles.logoSub}>Twifo Hemang Church of Christ</p>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(activeRole === 'admin' ? styles.tabActive : {}) }}
              onClick={() => switchRole('admin')}
            >
              Admin Portal
            </button>
            <button
              style={{ ...styles.tab, ...(activeRole === 'user' ? styles.tabActive : {}) }}
              onClick={() => switchRole('user')}
            >
              User Portal
            </button>
          </div>

          <div style={styles.modeBar}>
            <span style={styles.modeText}>
              {activeRole === 'admin'
                ? mode === 'login' ? 'Admin Login' : 'Create Admin Account'
                : mode === 'login' ? 'User Login' : 'Create User Account'}
            </span>
            {activeRole === 'user' && (
              <button style={styles.modeToggle} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'Create Account' : 'Back to Login'}
              </button>
            )}
            {activeRole === 'admin' && !adminExists && (
              <button style={styles.modeToggle} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'Setup Admin' : 'Back to Login'}
              </button>
            )}
          </div>

          {activeRole === 'admin' && adminExists && mode === 'signup' && (
            <div className="alert alert-warning">
              An admin account already exists. Please login instead.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" name="name" value={form.name}
                  onChange={handleChange} placeholder="Enter your full name" required />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="Enter your email" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" name="password" value={form.password}
                onChange={handleChange} placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter password'} required />
            </div>
            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-control" type="password" name="confirmPassword" value={form.confirmPassword}
                  onChange={handleChange} placeholder="Confirm your password" required />
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
              disabled={loading || (activeRole === 'admin' && adminExists && mode === 'signup')}
            >
              {loading ? 'Please wait...' : mode === 'login'
                ? `Login as ${activeRole === 'admin' ? 'Admin' : 'User'}`
                : 'Create Account'}
            </button>
          </form>
        </div>
        <p style={styles.footer}>Ghana Church of Christ Management System — {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', background: 'var(--dark)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', position: 'relative',
    overflow: 'hidden', padding: '20px'
  },
  bgCircle1: {
    position: 'absolute', width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(26,58,92,0.5) 0%, transparent 70%)',
    top: -200, right: -200, pointerEvents: 'none'
  },
  bgCircle2: {
    position: 'absolute', width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(37,99,168,0.2) 0%, transparent 70%)',
    bottom: -150, left: -150, pointerEvents: 'none'
  },
  container: { width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 },
  logo: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, justifyContent: 'center' },
  logoIcon: {
    width: 56, height: 56, borderRadius: 14,
    background: 'linear-gradient(135deg, #1a3a5c, #2563a8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.8rem', boxShadow: '0 8px 24px rgba(37,99,168,0.4)', flexShrink: 0
  },
  logoTitle: { fontFamily: 'Cinzel, serif', fontSize: '1.8rem', fontWeight: 700, color: '#e2e8f0', lineHeight: 1.2 },
  logoSub: { fontSize: '0.78rem', color: '#64748b', fontFamily: 'Inter, sans-serif' },
  card: { background: 'var(--dark-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '28px', boxShadow: 'var(--shadow)' },
  tabs: { display: 'flex', background: 'var(--dark-3)', borderRadius: 8, padding: 4, marginBottom: 24, gap: 4 },
  tab: {
    flex: 1, padding: '9px 16px', border: 'none', borderRadius: 6, cursor: 'pointer',
    fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', fontWeight: 500,
    background: 'transparent', color: '#64748b', transition: 'all 0.2s ease'
  },
  tabActive: { background: 'var(--primary-light)', color: 'white', boxShadow: '0 2px 8px rgba(37,99,168,0.4)' },
  modeBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modeText: { fontSize: '1rem', fontWeight: 600, color: '#e2e8f0' },
  modeToggle: { background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif', textDecoration: 'underline' },
  footer: { textAlign: 'center', marginTop: 24, fontSize: '0.78rem', color: '#475569', fontFamily: 'Inter, sans-serif' }
}