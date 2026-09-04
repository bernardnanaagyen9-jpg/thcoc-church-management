import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function AuthPage() {
  const { login } = useAuth()
  const [activePage, setActivePage] = useState('login')
  const [activeRole, setActiveRole] = useState('user')
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', confirmPassword: '', churchCode: '' })
  const [churchForm, setChurchForm] = useState({
    churchName: '', churchCode: '', location: '', denomination: '',
    phone: '', churchEmail: '', adminName: '', adminEmail: '',
    adminPassword: '', adminConfirmPassword: ''
  })

  const handleLogin = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', {
        email: loginForm.email,
        password: loginForm.password,
        role: activeRole
      })
      login(data)
      toast.success(`Welcome back, ${data.name}!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleUserSignup = async e => {
    e.preventDefault()
    if (userForm.password !== userForm.confirmPassword) { toast.error('Passwords do not match'); return }
    if (userForm.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (!userForm.churchCode) { toast.error('Please enter your church code'); return }
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        churchCode: userForm.churchCode.toUpperCase()
      })
      login(data)
      toast.success(`Welcome, ${data.name}!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  const handleChurchRegister = async e => {
    e.preventDefault()
    if (churchForm.adminPassword !== churchForm.adminConfirmPassword) {
      toast.error('Passwords do not match'); return
    }
    if (churchForm.adminPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return
    }
    setLoading(true)
    try {
      const { data } = await api.post('/churches/register', churchForm)
      login(data.admin)
      toast.success(`🎉 ${data.church.name} registered successfully!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />

      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}>✝</div>
          <div>
            <h1 style={styles.logoTitle}>Church Manager</h1>
            <p style={styles.logoSub}>Multi-Church Management System</p>
          </div>
        </div>

        {/* Main page toggle */}
        <div style={styles.mainTabs}>
          <button
            style={{ ...styles.mainTab, ...(activePage === 'login' ? styles.mainTabActive : {}) }}
            onClick={() => setActivePage('login')}
          >
            🔐 Login
          </button>
          <button
            style={{ ...styles.mainTab, ...(activePage === 'register-church' ? styles.mainTabActive : {}) }}
            onClick={() => setActivePage('register-church')}
          >
            ⛪ Register Church
          </button>
        </div>

        <div style={styles.card}>

          {/* LOGIN PAGE */}
          {activePage === 'login' && (
            <>
              <div style={styles.tabs}>
                <button
                  style={{ ...styles.tab, ...(activeRole === 'admin' ? styles.tabActive : {}) }}
                  onClick={() => { setActiveRole('admin'); setMode('login') }}
                >Admin Portal</button>
                <button
                  style={{ ...styles.tab, ...(activeRole === 'user' ? styles.tabActive : {}) }}
                  onClick={() => { setActiveRole('user'); setMode('login') }}
                >User Portal</button>
              </div>

              <div style={styles.modeBar}>
                <span style={styles.modeText}>
                  {mode === 'login'
                    ? `${activeRole === 'admin' ? 'Admin' : 'User'} Login`
                    : 'Create User Account'}
                </span>
                {activeRole === 'user' && (
                  <button style={styles.modeToggle}
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                    {mode === 'login' ? 'Create Account' : 'Back to Login'}
                  </button>
                )}
              </div>

              {/* Login Form */}
              {mode === 'login' && (
                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-control" type="email"
                      value={loginForm.email}
                      onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                      placeholder="Enter your email" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input className="form-control" type="password"
                      value={loginForm.password}
                      onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="Enter password" required />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg"
                    style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                    {loading ? 'Please wait...' : `Login as ${activeRole === 'admin' ? 'Admin' : 'User'}`}
                  </button>
                </form>
              )}

              {/* User Signup Form */}
              {mode === 'signup' && activeRole === 'user' && (
                <form onSubmit={handleUserSignup}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-control" value={userForm.name}
                      onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                      placeholder="Your full name" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-control" type="email" value={userForm.email}
                      onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="Your email" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Church Code</label>
                    <input className="form-control"
                      value={userForm.churchCode}
                      onChange={e => setUserForm({ ...userForm, churchCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. THCOC" required />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      Get this code from your church admin
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input className="form-control" type="password" value={userForm.password}
                      onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder="At least 6 characters" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input className="form-control" type="password" value={userForm.confirmPassword}
                      onChange={e => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                      placeholder="Repeat password" required />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg"
                    style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* REGISTER CHURCH PAGE */}
          {activePage === 'register-church' && (
            <>
              <div style={styles.modeBar}>
                <span style={styles.modeText}>Register Your Church</span>
              </div>

              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                📋 Register your church to get started. You will become the admin.
              </div>

              <form onSubmit={handleChurchRegister}>
                <div style={styles.formSection}>
                  <div style={styles.formSectionTitle}>⛪ Church Details</div>
                  <div className="form-group">
                    <label className="form-label">Church Name *</label>
                    <input className="form-control" value={churchForm.churchName}
                      onChange={e => setChurchForm({ ...churchForm, churchName: e.target.value })}
                      placeholder="e.g. Twifo Hemang Church of Christ" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Church Code * (unique, no spaces)</label>
                    <input className="form-control" value={churchForm.churchCode}
                      onChange={e => setChurchForm({ ...churchForm, churchCode: e.target.value.toUpperCase().replace(/\s/g, '') })}
                      placeholder="e.g. THCOC" required />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      Share this code with your members to join
                    </small>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input className="form-control" value={churchForm.location}
                      onChange={e => setChurchForm({ ...churchForm, location: e.target.value })}
                      placeholder="e.g. Twifo Hemang, Ghana" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Denomination</label>
                    <input className="form-control" value={churchForm.denomination}
                      onChange={e => setChurchForm({ ...churchForm, denomination: e.target.value })}
                      placeholder="e.g. Church of Christ" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Church Phone</label>
                    <input className="form-control" value={churchForm.phone}
                      onChange={e => setChurchForm({ ...churchForm, phone: e.target.value })}
                      placeholder="Church phone number" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Church Email</label>
                    <input className="form-control" type="email" value={churchForm.churchEmail}
                      onChange={e => setChurchForm({ ...churchForm, churchEmail: e.target.value })}
                      placeholder="Church email address" />
                  </div>
                </div>

                <div style={styles.formSection}>
                  <div style={styles.formSectionTitle}>👤 Admin Account</div>
                  <div className="form-group">
                    <label className="form-label">Admin Full Name *</label>
                    <input className="form-control" value={churchForm.adminName}
                      onChange={e => setChurchForm({ ...churchForm, adminName: e.target.value })}
                      placeholder="Your full name" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Admin Email *</label>
                    <input className="form-control" type="email" value={churchForm.adminEmail}
                      onChange={e => setChurchForm({ ...churchForm, adminEmail: e.target.value })}
                      placeholder="Your email address" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input className="form-control" type="password" value={churchForm.adminPassword}
                      onChange={e => setChurchForm({ ...churchForm, adminPassword: e.target.value })}
                      placeholder="At least 6 characters" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password *</label>
                    <input className="form-control" type="password" value={churchForm.adminConfirmPassword}
                      onChange={e => setChurchForm({ ...churchForm, adminConfirmPassword: e.target.value })}
                      placeholder="Repeat password" required />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                  {loading ? 'Registering...' : '⛪ Register Church'}
                </button>
              </form>
            </>
          )}
        </div>

        <p style={styles.footer}>
          Church Management System — {new Date().getFullYear()}
        </p>
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
  container: { width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 },
  logo: {
    display: 'flex', alignItems: 'center', gap: 16,
    marginBottom: 24, justifyContent: 'center'
  },
  logoIcon: {
    width: 56, height: 56, borderRadius: 14,
    background: 'linear-gradient(135deg, #1a3a5c, #2563a8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.8rem', boxShadow: '0 8px 24px rgba(37,99,168,0.4)'
  },
  logoTitle: {
    fontFamily: 'Cinzel, serif', fontSize: '1.5rem',
    fontWeight: 700, color: '#e2e8f0'
  },
  logoSub: { fontSize: '0.75rem', color: '#64748b' },
  mainTabs: { display: 'flex', gap: 8, marginBottom: 16 },
  mainTab: {
    flex: 1, padding: '10px', border: '1px solid var(--border)',
    borderRadius: 8, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem', fontWeight: 500, background: 'var(--dark-2)',
    color: 'var(--text-muted)', transition: 'all 0.2s'
  },
  mainTabActive: {
    background: 'var(--primary-light)', color: 'white',
    borderColor: 'var(--primary-light)'
  },
  card: {
    background: 'var(--dark-2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '28px', boxShadow: 'var(--shadow)',
    maxHeight: '70vh', overflowY: 'auto'
  },
  tabs: {
    display: 'flex', background: 'var(--dark-3)', borderRadius: 8,
    padding: 4, marginBottom: 20, gap: 4
  },
  tab: {
    flex: 1, padding: '9px 16px', border: 'none', borderRadius: 6,
    cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
    fontWeight: 500, background: 'transparent', color: '#64748b',
    transition: 'all 0.2s ease'
  },
  tabActive: { background: 'var(--primary-light)', color: 'white' },
  modeBar: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20
  },
  modeText: { fontSize: '1rem', fontWeight: 600, color: '#e2e8f0' },
  modeToggle: {
    background: 'none', border: 'none', color: 'var(--accent)',
    cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'underline'
  },
  formSection: {
    background: 'var(--dark-3)', borderRadius: 8, padding: 16, marginBottom: 16
  },
  formSectionTitle: {
    fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)',
    marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px'
  },
  footer: {
    textAlign: 'center', marginTop: 16,
    fontSize: '0.75rem', color: '#475569'
  }
}