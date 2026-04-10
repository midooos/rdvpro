import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials, avatarColor } from '../../utils/formatters';

const CLIENT_NAV = [
  { to: '/dashboard',      icon: '📊', label: 'Tableau de bord' },
  { to: '/booking',        icon: '📅', label: 'Prendre un RDV'  },
  { to: '/appointments',   icon: '📋', label: 'Mes rendez-vous' },
  { to: '/notifications',  icon: '🔔', label: 'Notifications'   },
  { to: '/profile',        icon: '👤', label: 'Mon profil'      },
];

const ADMIN_NAV = [
  { to: '/admin',                   icon: '📊', label: 'Tableau de bord' },
  { to: '/admin/appointments',      icon: '📅', label: 'Rendez-vous'     },
  { to: '/admin/clients',           icon: '👥', label: 'Clients'         },
  { to: '/admin/slots',             icon: '🕐', label: 'Créneaux'        },
  { to: '/admin/notifications',     icon: '🔔', label: 'Notifications'   },
  { to: '/admin/users',             icon: '🔑', label: 'Utilisateurs'    },
  { to: '/admin/reports',           icon: '📈', label: 'Rapports'        },
  { to: '/admin/settings',          icon: '⚙️', label: 'Paramètres'     },
];

export default function Sidebar({ role, open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = role === 'admin' ? ADMIN_NAV : CLIENT_NAV;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarStyle = {
    position: 'fixed',
    top: 0, left: 0, bottom: 0,
    width: 'var(--sidebar-width)',
    background: 'var(--navy)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 'var(--z-nav)',
    transition: 'transform 0.25s ease',
  };

  return (
    <aside style={sidebarStyle} data-sidebar className={open ? 'open' : ''}>
      {/* Logo */}
      <div style={{
        padding: '28px 24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'var(--blue)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>📆</div>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18, fontWeight: 700, color: 'white',
          }}>RDVPro</div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9, color: 'var(--teal)',
            fontWeight: 600, letterSpacing: '0.08em',
          }}>
            {role === 'admin' ? 'ADMINISTRATION' : 'ESPACE CLIENT'}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
          color: 'var(--gray-4)', letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '8px 12px 6px',
        }}>Navigation</div>

        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin' || item.to === '/dashboard'}
            onClick={onClose}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 'var(--radius)',
              marginBottom: 2,
              fontSize: 14, fontWeight: 500,
              color: isActive ? 'white' : 'var(--gray-3)',
              background: isActive ? 'var(--blue)' : 'transparent',
              transition: 'all 0.15s',
              textDecoration: 'none',
            })}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', borderRadius: 'var(--radius)',
          marginBottom: 8, cursor: 'pointer',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: avatarColor(user?.firstName || ''),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {getInitials(`${user?.firstName} ${user?.lastName}`)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: 'white', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ color: 'var(--gray-3)', fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 12px', borderRadius: 'var(--radius)',
            background: 'rgba(229,71,75,0.1)', color: 'var(--red)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            border: 'none', transition: 'background 0.15s',
          }}
        >
          <span>🚪</span> Déconnexion
        </button>
      </div>
    </aside>
  );
}
