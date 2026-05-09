import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'

export default function Sidebar({ links, basePath }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.info('Logged out successfully')
  }

  const isMobile = window.innerWidth <= 768

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
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
                to={link.path}
                end={link.path === basePath}
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
      )}

      {/* Mobile Top Header */}
      {isMobile && (
        <div style={styles.mobileHeader}>
          <button style={styles.hamburger} onClick={() => setMobileOpen(!mobileOpen)}>
            ☰
          </button>
          <div style={styles.mobileLogo}>
            <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1rem' }}>THCoC</span>
          </div>
          <div style={styles.mobileAvatar}>{user?.name?.[0]?.toUpperCase()}</div>
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobile && mobileOpen && (
        <>
          <div style={styles.overlay} onClick={() => setMobileOpen(false)} />
          <div style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <div style={styles.userBadge}>
                <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
                <div>
                  <div style={styles.userName}>{user?.name}</div>
                  <div style={styles.userRole}>{user?.role === 'admin' ? '🔑 Admin' : '👤 User'}</div>
                </div>
              </div>
            </div>
            <nav style={styles.nav}>
              {links.map(link => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === basePath}
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {})
                  })}
                  onClick={() => setMobileOpen(false)}
                >
                  <span style={styles.navIcon}>{link.icon}</span>
                  <span style={styles.navText}>{link.label}</span>
                </NavLink>
              ))}
            </nav>
            <div style={styles.sidebarFooter}>
              <button style={styles.logoutBtn} onClick={handleLogout}>
                <span>⏻</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div style={styles.bottomNav}>
          {links.slice(0, 5).map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === basePath}
              style={({ isActive }) => ({
                ...styles.bottomNavItem,
                ...(isActive ? styles.bottomNavItemActive : {})
              })}
            >
              <span style={{ fontSize: '1.3rem' }}>{link.icon}</span>
              <span style={{ fontSize: '0.6rem', marginTop: 2 }}>{link.label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </div>
      )}
    </>
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
    display: 'block', fontSize: '0.68rem', color: '#64748b', fontFamily: 'Inter, sans-serif',
    textTransform: 'uppercase', letterSpacing: '1px', whiteSpace: 'nowrap'
  },
  collapseBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
    color: '#64748b', cursor: 'pointer', padding: '4px 8px', fontSize: '0.75rem', flexShrink: 0
  },
  userBadge: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)', margin: '12px 8px 8px',
    background: 'rgba(255,255,255,0.04)', borderRadius: 8
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
    background: 'rgba(37,99,168,0.25)', color: '#93c5fd', borderLeft: '3px solid #3b82f6'
  },
  navIcon: { fontSize: '1.1rem', width: 24, textAlign: 'center', flexShrink: 0 },
  navText: { whiteSpace: 'nowrap', overflow: 'hidden' },
  sidebarFooter: { padding: 12, borderTop: '1px solid rgba(255,255,255,0.06)' },
  logoutBtn: {
    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171',
    cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
    fontWeight: 500, transition: 'all 0.15s ease'
  },
  // Mobile styles
  mobileHeader: {
    position: 'fixed', top: 0, left: 0, right: 0, height: 56,
    background: 'var(--primary-dark)', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 16px', zIndex: 999
  },
  hamburger: {
    background: 'none', border: 'none', color: 'white',
    fontSize: '1.4rem', cursor: 'pointer', padding: '4px 8px'
  },
  mobileLogo: { color: 'white', fontFamily: 'Cinzel, serif' },
  mobileAvatar: {
    width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: '0.9rem', color: 'white'
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000
  },
  drawer: {
    position: 'fixed', top: 0, left: 0, width: 280, height: '100vh',
    background: 'var(--primary-dark)', zIndex: 1001, display: 'flex',
    flexDirection: 'column', overflowY: 'auto',
    boxShadow: '4px 0 20px rgba(0,0,0,0.5)'
  },
  drawerHeader: { paddingTop: 16 },
  bottomNav: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: 'var(--primary-dark)', borderTop: '1px solid var(--border)',
    display: 'flex', justifyContent: 'space-around', alignItems: 'center',
    height: 60, zIndex: 998, paddingBottom: 4
  },
  bottomNavItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', color: '#64748b', textDecoration: 'none',
    padding: '4px 12px', borderRadius: 8, minWidth: 50,
    fontFamily: 'Inter, sans-serif', transition: 'all 0.15s ease'
  },
  bottomNavItemActive: { color: '#3b82f6' }
}