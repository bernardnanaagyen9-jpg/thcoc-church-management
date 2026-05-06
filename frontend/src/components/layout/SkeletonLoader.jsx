import React from 'react'

const shimmer = {
  background: 'linear-gradient(90deg, var(--dark-2) 25%, var(--dark-3) 50%, var(--dark-2) 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
  borderRadius: 8
}

export const SkeletonBox = ({ width = '100%', height = 20, style = {} }) => (
  <div style={{ ...shimmer, width, height, ...style }} />
)

export const SkeletonCard = () => (
  <div className="card" style={{ marginBottom: 16 }}>
    <SkeletonBox height={24} width="40%" style={{ marginBottom: 16 }} />
    <SkeletonBox height={16} style={{ marginBottom: 8 }} />
    <SkeletonBox height={16} style={{ marginBottom: 8 }} />
    <SkeletonBox height={16} width="80%" />
  </div>
)

export const SkeletonTable = () => (
  <div className="card">
    <SkeletonBox height={24} width="30%" style={{ marginBottom: 20 }} />
    {[1, 2, 3, 4, 5].map(i => (
      <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 12, alignItems: 'center' }}>
        <SkeletonBox height={16} width="20%" />
        <SkeletonBox height={16} width="25%" />
        <SkeletonBox height={16} width="15%" />
        <SkeletonBox height={16} width="20%" />
        <SkeletonBox height={16} width="10%" />
      </div>
    ))}
  </div>
)

export const SkeletonStats = () => (
  <div className="stats-grid" style={{ marginBottom: 28 }}>
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="stat-card">
        <SkeletonBox width={48} height={48} style={{ borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <SkeletonBox height={32} width="60%" style={{ marginBottom: 8 }} />
          <SkeletonBox height={14} width="80%" />
        </div>
      </div>
    ))}
  </div>
)

export default SkeletonCard