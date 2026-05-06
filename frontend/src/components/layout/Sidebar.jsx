import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'

export default function Sidebar({ links, basePath }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.info('Logged out successfully')
  }

  return (
    <div style={{ ...styles.sidebar, ...(collapsed ? styles.sidebarCollapsed : {}) }}>
      <div style={styles.sidebarHeader}>
        <div style={styles.logoMark}>✝</div>
        {!collapsed && (
          <div style={styles.sidebarTitle}>
            <span style={styles.titleMain}>THCoC</span>
            <span style={styles.titleSub}>Management</span>
          </div>
        )}
        <button style={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {!collapsed && (
        <div style={styles.userBadge}>
          <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>{user?.role === 'admin' ? '🔑 Admin' : '👤 User'}</div>
          </div>
        </div>
      )}

      <nav style={styles.nav}>
        {links.map(link => (
          <NavLink
            key={link.path}
            to={`${basePath}${link.path}`}
            end={link.path === ''}
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {})
            })}
          >
            <span style={styles.navIcon}>{link.icon}</span>
            {!collapsed && <span style={styles.navText}>{link.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div style={styles.sidebarFooter}>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <span>⏻</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

const styles = {
  sidebar: {
    width: '260px', minHeight: '100vh', background: 'var(--primary-dark)',
    borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
    transition: 'width 0.3s ease', position: 'sticky', top: 0, flexShrink: 0
  },
  sidebarCollapsed: { width: '72px' },
  sidebarHeader: {
    padding: '20px 16px', display: 'flex', alignItems: 'center',
    gap: 12, borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: 72
  },
  logoMark: {
    width: 36, height: 36, background: 'var(--primary-light)', borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0
  },
  sidebarTitle: { flex: 1, overflow: 'hidden' },
  titleMain: {
    display: 'block', fontFamily: 'Cinzel, serif', fontSize: '1rem',
    fontWeight: 700, color: '#e2e8f0', lineHeight: 1.2, whiteSpace: 'nowrap'
  },
  titleSub: {
    display: 'block', fontSize: '0.68rem', color: '#64748b',
    fontFamily: 'Inter, sans-serif', textTransform: 'uppercase',
    letterSpacing: '1px', whiteSpace: 'nowrap'
  },
  collapseBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6, color: '#64748b', cursor: 'pointer',
    padding: '4px 8px', fontSize: '0.75rem', flexShrink: 0
  },
  userBadge: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
    margin: '12px 8px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: 8
  },
  avatar: {
    width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '1rem', color: 'white', flexShrink: 0
  },
  userName: {
    fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140
  },
  userRole: { fontSize: '0.72rem', color: '#64748b', marginTop: 2 },
  nav: { flex: 1, padding: '8px', overflowY: 'auto' },
  navLink: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
    borderRadius: 8, color: '#94a3b8', textDecoration: 'none', marginBottom: 2,
    transition: 'all 0.15s ease', fontSize: '0.875rem', fontWeight: 500,
    fontFamily: 'Inter, sans-serif'
  },
  navLinkActive: {
    background: 'rgba(37,99,168,0.25)', color: '#93c5fd',
    borderLeft: '3px solid #3b82f6'
  },
  navIcon: { fontSize: '1.1rem', width: 24, textAlign: 'center', flexShrink: 0 },
  navText: { whiteSpace: 'nowrap', overflow: 'hidden' },
  sidebarFooter: { padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)' },
  logoutBtn: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
    color: '#f87171', cursor: 'pointer', fontSize: '0.875rem',
    fontFamily: 'Inter, sans-serif', fontWeight: 500, transition: 'all 0.15s ease'
  }
}