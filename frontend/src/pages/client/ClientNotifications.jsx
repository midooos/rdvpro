import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { formatRelative } from '../../utils/formatters';
import { NOTIFICATION_ICONS } from '../../utils/constants';

const FILTERS = [
  { key: 'all',    label: 'Toutes' },
  { key: 'unread', label: 'Non lues' },
  { key: 'read',   label: 'Lues' },
];

export default function ClientNotifications() {
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState('all');

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read')   return n.isRead;
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Espace Client</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--navy)' }}>Notifications</h1>
          <p style={{ fontSize: 14, color: 'var(--gray-3)', marginTop: 4 }}>
            Toutes vos alertes et rappels de rendez-vous.
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn btn-ghost">
            ✓ Tout marquer lu ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--gray-1)', padding: 4, borderRadius: 10, marginBottom: 20, width: 'fit-content' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '6px 16px', borderRadius: 7, fontSize: 13, fontWeight: 600,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: filter === f.key ? 'white' : 'transparent',
            color: filter === f.key ? 'var(--text)' : 'var(--gray-3)',
            boxShadow: filter === f.key ? 'var(--shadow-sm)' : 'none',
          }}>
            {f.label}
            {f.key === 'unread' && unreadCount > 0 && (
              <span style={{ marginLeft: 6, background: 'var(--red)', color: 'white', borderRadius: 10, padding: '0 6px', fontSize: 10 }}>{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-1)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 64, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'var(--gray-3)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <p>Aucune notification</p>
          </div>
        ) : filtered.map((n, i) => (
          <div key={n.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 16,
            padding: '18px 24px',
            background: n.isRead ? 'white' : 'rgba(30,111,217,0.03)',
            borderBottom: i < filtered.length - 1 ? '1px solid var(--gray-1)' : 'none',
            cursor: n.isRead ? 'default' : 'pointer',
            transition: 'background 0.15s',
          }}
          onClick={() => !n.isRead && markAsRead(n.id)}
          >
            {/* Icon bubble */}
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: n.isRead ? 'var(--gray-1)' : '#DBEAFE',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>
              {NOTIFICATION_ICONS[n.type] || '🔔'}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: n.isRead ? 500 : 700, color: 'var(--text)' }}>
                  {n.title}
                </span>
                {!n.isRead && (
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0 }} />
                )}
              </div>
              <p style={{ fontSize: 13, color: 'var(--gray-4)', lineHeight: 1.5, marginBottom: 6 }}>
                {n.message}
              </p>
              <span style={{ fontSize: 11, color: 'var(--gray-3)', fontFamily: 'var(--font-mono)' }}>
                {formatRelative(n.createdAt)}
              </span>
            </div>

            {/* Delete */}
            <button
              onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
              title="Supprimer"
              style={{ padding: '5px 8px', background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, flexShrink: 0 }}
            >✕</button>
          </div>
        ))}
      </div>
    </div>
  );
}
