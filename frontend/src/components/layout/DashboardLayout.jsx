import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function DashboardLayout({ links, basePath, routes }) {
  return (
    <div style={styles.layout}>
      <Sidebar links={links} basePath={basePath} />
      <main style={styles.main}>
        <Routes>
          {routes.map(r => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Routes>
      </main>
    </div>
  )
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: 'var(--dark)' },
  main: { flex: 1, overflow: 'auto', minWidth: 0 }
}