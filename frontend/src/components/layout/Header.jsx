import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { getInitials, avatarColor, formatRelative, truncate } from '../../utils/formatters';
import { NOTIFICATION_ICONS } from '../../utils/constants';

export default function Header({ role, onMenuClick }) {
  const { user, logout }                     = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [notifOpen, setNotifOpen]            = useState(false);
  const [userMenuOpen, setUserMenuOpen]      = useState(false);
  const notifRef = useRef(null);
  const userRef  = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const recent = notifications.slice(0, 5);

  return (
    <header style={{
      height: 'var(--header-height)',
      background: 'white',
      borderBottom: '1px solid var(--gray-1)',
      display: 'flex', alignItems: 'center',
      padding: '0 var(--space-8)',
      gap: 'var(--space-4)',
      position: 'sticky', top: 0,
      zIndex: 'var(--z-sticky)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        style={{ display: 'none', padding: 6, borderRadius: 8, background: 'var(--gray-1)' }}
        className="mobile-menu-btn"
      >☰</button>

      {/* Page title area — filled by child pages via context if needed */}
      <div style={{ flex: 1 }} />

      {/* Notification Bell */}
      <div ref={notifRef} style={{ position: 'relative' }}>
        <button
          onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false); }}
          style={{
            position: 'relative',
            width: 40, height: 40, borderRadius: 10,
            background: notifOpen ? 'var(--blue)' : 'var(--gray-1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, transition: 'all 0.15s', border: 'none', cursor: 'pointer',
          }}
          aria-label="Notifications"
        >
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--red)', border: '2px solid white',
            }} />
          )}
        </button>

        {notifOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
            width: 360, background: 'white',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--gray-1)', overflow: 'hidden',
            zIndex: 'var(--z-dropdown)',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid var(--gray-1)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                Notifications {unreadCount > 0 && (
                  <span style={{
                    marginLeft: 6, background: 'var(--red)', color: 'white',
                    borderRadius: 10, padding: '1px 7px', fontSize: 11,
                  }}>{unreadCount}</span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{ fontSize: 11, color: 'var(--blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Tout marquer lu
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {recent.length === 0 ? (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--gray-3)', fontSize: 13 }}>
                  Aucune notification
                </div>
              ) : recent.map(n => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    padding: '12px 20px',
                    background: n.isRead ? 'white' : 'rgba(30,111,217,0.04)',
                    borderBottom: '1px solid var(--gray-1)',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>
                    {NOTIFICATION_ICONS[n.type] || '🔔'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, color: 'var(--text)' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--gray-3)', marginTop: 2 }}>
                      {truncate(n.message, 70)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray-3)', marginTop: 4 }}>
                      {formatRelative(n.createdAt)}
                    </div>
                  </div>
                  {!n.isRead && (
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginTop: 4 }} />
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--gray-1)', textAlign: 'center' }}>
              <Link
                to={role === 'admin' ? '/admin/notifications' : '/notifications'}
                onClick={() => setNotifOpen(false)}
                style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}
              >
                Voir toutes les notifications →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* User menu */}
      <div ref={userRef} style={{ position: 'relative' }}>
        <button
          onClick={() => { setUserMenuOpen(o => !o); setNotifOpen(false); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 10px', borderRadius: 10,
            background: userMenuOpen ? 'var(--gray-1)' : 'transparent',
            border: 'none', cursor: 'pointer', transition: 'background 0.15s',
          }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: avatarColor(user?.firstName || ''),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'white',
          }}>
            {getInitials(`${user?.firstName} ${user?.lastName}`)}
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.2 }}>
              {user?.firstName}
            </div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--gray-3)' }}>
              {role === 'admin' ? 'Administrateur' : 'Client'}
            </div>
          </div>
          <span style={{ color: 'var(--gray-3)', fontSize: 10 }}>▾</span>
        </button>

        {userMenuOpen && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            width: 200, background: 'white',
            borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--gray-1)', overflow: 'hidden',
            zIndex: 'var(--z-dropdown)',
          }}>
            {[
              { label: '👤 Mon profil', to: role === 'admin' ? '/admin/settings' : '/profile' },
              { label: '⚙️ Paramètres', to: role === 'admin' ? '/admin/settings' : '/profile' },
            ].map(item => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setUserMenuOpen(false)}
                style={{
                  display: 'block', padding: '11px 16px',
                  fontSize: 13, color: 'var(--text)',
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--gray-1)',
                  transition: 'background 0.1s',
                }}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '11px 16px',
                fontSize: 13, color: 'var(--red)',
                background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', fontWeight: 600,
              }}
            >
              🚪 Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
