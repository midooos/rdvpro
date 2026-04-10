import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDateTime, formatRelative } from '../../utils/formatters';
import { APPOINTMENT_STATUS_BADGE, NOTIFICATION_ICONS } from '../../utils/constants';
import appointmentService from '../../services/appointmentService';

const STATUS_LABELS = {
  confirmed: 'Confirmé',
  pending:   'En attente',
  cancelled: 'Annulé',
  completed: 'Terminé',
  no_show:   'Absent',
};

export default function ClientDashboard() {
  const { user } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const recentNotifs = notifications.slice(0, 3);

  // ── Real API state ──────────────────────────────────────────────────
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await appointmentService.getMyAppointments();
        setAppointments(data.appointments || []);
      } catch {
        // API offline during dev — silently ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const now       = new Date();
  const upcoming  = appointments.filter(a => new Date(a.date) > now && a.status !== 'cancelled');
  const completed = appointments.filter(a => a.status === 'completed').length;

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
          Espace Client
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--navy)', marginBottom: 4 }}>
          Bonjour, {user?.firstName} 👋
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-3)' }}>
          Gérez vos rendez-vous et suivez vos activités depuis votre espace personnel.
        </p>
      </div>

      {/* Quick CTA */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy-3) 0%, var(--navy-2) 100%)',
        borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'white', marginBottom: 6 }}>
            Prendre un rendez-vous
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            Choisissez un service et un créneau disponible en quelques clics.
          </p>
        </div>
        <Link to="/booking" className="btn btn-teal btn-lg">
          📅 Réserver maintenant
        </Link>
      </div>

      {/* Stats — real data */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 28 }}>
        {[
          { icon: '📅', value: loading ? '…' : upcoming.length,  label: 'RDV à venir',   color: 'var(--blue)'  },
          { icon: '✅', value: loading ? '…' : completed,        label: 'RDV effectués', color: 'var(--green)' },
          { icon: '🔔', value: unreadCount,                      label: 'Notifications', color: 'var(--amber)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 24, border: '1px solid var(--gray-1)', boxShadow: 'var(--shadow-sm)', borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 13, color: 'var(--gray-3)', marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Upcoming appointments — real data */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-1)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--gray-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--navy)' }}>Prochains rendez-vous</span>
            <Link to="/appointments" style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>Voir tout →</Link>
          </div>

          <div style={{ padding: 16 }}>
            {loading ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--gray-3)', fontSize: 13 }}>Chargement…</div>
            ) : upcoming.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--gray-3)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                <p style={{ fontSize: 13 }}>Aucun rendez-vous à venir</p>
                <Link to="/booking" className="btn btn-primary btn-sm" style={{ marginTop: 12, display: 'inline-flex' }}>
                  Réserver
                </Link>
              </div>
            ) : upcoming.slice(0, 3).map(appt => (
              <div key={appt.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px', borderRadius: 12,
                background: 'var(--off)', marginBottom: 10,
                border: '1px solid var(--gray-1)',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📅</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{appt.serviceName || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-3)', marginTop: 2 }}>
                    {formatDateTime(appt.date)}
                  </div>
                </div>
                <span className={`badge ${APPOINTMENT_STATUS_BADGE[appt.status] || 'badge-gray'}`}>
                  {STATUS_LABELS[appt.status] || appt.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent notifications */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-1)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--gray-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--navy)' }}>Notifications récentes</span>
            <Link to="/notifications" style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>Voir tout →</Link>
          </div>

          <div style={{ padding: 16 }}>
            {recentNotifs.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--gray-3)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                <p style={{ fontSize: 13 }}>Aucune notification</p>
              </div>
            ) : recentNotifs.map(n => (
              <div key={n.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '12px', borderRadius: 12,
                background: n.isRead ? 'white' : 'rgba(30,111,217,0.04)',
                marginBottom: 8,
                border: `1px solid ${n.isRead ? 'var(--gray-1)' : 'rgba(30,111,217,0.15)'}`,
              }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{NOTIFICATION_ICONS[n.type] || '🔔'}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, color: 'var(--text)' }}>{n.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-3)', marginTop: 4 }}>{formatRelative(n.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
