import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useToast } from '../../context/ToastContext';
import { formatRelative } from '../../utils/formatters';
import { NOTIFICATION_ICONS, NOTIFICATION_TYPES } from '../../utils/constants';
import notificationService from '../../services/notificationService';

const FILTERS = [
  { key: 'all',    label: 'Toutes' },
  { key: 'unread', label: 'Non lues' },
  { key: 'read',   label: 'Lues' },
];

export default function AdminNotifications() {
  const { notifications, loading, markAsRead, markAllAsRead, deleteNotification, fetchNotifications } = useNotifications();
  const { success, error: toastError } = useToast();
  const [filter, setFilter]   = useState('all');
  const [sending, setSending] = useState(false);
  const [form, setForm]       = useState({ title: '', message: '', type: NOTIFICATION_TYPES.SYSTEM });

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read')   return n.isRead;
    return true;
  });

  const handleSendReminders = async () => {
    setSending(true);
    try {
      const res = await notificationService.sendReminders(48);
      success(`${res.sent || 0} rappels envoyés avec succès !`);
      fetchNotifications();
    } catch {
      toastError('Erreur lors de l\'envoi des rappels');
    } finally {
      setSending(false);
    }
  };

  const handleSendCustom = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) { toastError('Titre et message obligatoires'); return; }
    setSending(true);
    try {
      await notificationService.send({ ...form });
      success('Notification envoyée !');
      setForm({ title: '', message: '', type: NOTIFICATION_TYPES.SYSTEM });
    } catch {
      toastError('Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Administration</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--navy)', marginBottom: 4 }}>Notifications</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-3)' }}>
          Gérez et envoyez des notifications à vos clients.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'start' }}>
        {/* Left — Notification list */}
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--gray-1)', padding: 4, borderRadius: 10 }}>
              {FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    padding: '6px 14px', borderRadius: 7, fontSize: 13, fontWeight: 600,
                    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                    background: filter === f.key ? 'white' : 'transparent',
                    color: filter === f.key ? 'var(--text)' : 'var(--gray-3)',
                    boxShadow: filter === f.key ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  {f.label}
                  {f.key === 'unread' && unreadCount > 0 && (
                    <span style={{ marginLeft: 6, background: 'var(--red)', color: 'white', borderRadius: 10, padding: '0 6px', fontSize: 10 }}>
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="btn btn-ghost btn-sm">
                  ✓ Tout marquer lu
                </button>
              )}
              <button onClick={handleSendReminders} disabled={sending} className="btn btn-sm" style={{ background: 'var(--amber)', color: 'white' }}>
                {sending ? 'Envoi…' : '📢 Envoyer rappels 48h'}
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-1)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 48, textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto' }} />
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--gray-3)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔔</div>
                <p>Aucune notification</p>
              </div>
            ) : filtered.map((n, i) => (
              <div
                key={n.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '16px 20px',
                  background: n.isRead ? 'white' : 'rgba(30,111,217,0.03)',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--gray-1)' : 'none',
                  transition: 'background 0.15s',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: n.isRead ? 'var(--gray-1)' : '#DBEAFE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                }}>
                  {NOTIFICATION_ICONS[n.type] || '🔔'}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: n.isRead ? 500 : 700, color: 'var(--text)' }}>{n.title}</span>
                    {!n.isRead && (
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0 }} />
                    )}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--gray-4)', lineHeight: 1.5, marginBottom: 6 }}>{n.message}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, color: 'var(--gray-3)', fontFamily: 'var(--font-mono)' }}>
                      {formatRelative(n.createdAt)}
                    </span>
                    {n.recipientName && (
                      <span style={{ fontSize: 11, color: 'var(--blue)', fontWeight: 600 }}>
                        → {n.recipientName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {!n.isRead && (
                    <button onClick={() => markAsRead(n.id)} title="Marquer comme lu" style={{ padding: '5px 8px', background: '#DBEAFE', color: '#1E40AF', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                      ✓
                    </button>
                  )}
                  <button onClick={() => deleteNotification(n.id)} title="Supprimer" style={{ padding: '5px 8px', background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Send panel */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-1)', boxShadow: 'var(--shadow-sm)', padding: 24, position: 'sticky', top: 'calc(var(--header-height) + 16px)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
            Envoyer une notification
          </h3>
          <p style={{ fontSize: 12, color: 'var(--gray-3)', marginBottom: 20 }}>
            Diffusez un message personnalisé à vos clients.
          </p>

          <form onSubmit={handleSendCustom} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Type */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--gray-4)', letterSpacing: '0.1em' }}>TYPE</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                style={{ padding: '10px 14px', border: '1.5px solid var(--gray-1)', borderRadius: 10, fontSize: 13, color: 'var(--text)', background: 'var(--off)', outline: 'none' }}
              >
                {Object.entries(NOTIFICATION_TYPES).map(([k, v]) => (
                  <option key={k} value={v}>{NOTIFICATION_ICONS[v]} {k.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--gray-4)', letterSpacing: '0.1em' }}>TITRE</label>
              <input
                type="text" placeholder="Titre de la notification"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                style={{ padding: '10px 14px', border: '1.5px solid var(--gray-1)', borderRadius: 10, fontSize: 13, color: 'var(--text)', background: 'var(--off)', outline: 'none' }}
              />
            </div>

            {/* Message */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--gray-4)', letterSpacing: '0.1em' }}>MESSAGE</label>
              <textarea
                placeholder="Contenu du message…"
                rows={4}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                style={{ padding: '10px 14px', border: '1.5px solid var(--gray-1)', borderRadius: 10, fontSize: 13, color: 'var(--text)', background: 'var(--off)', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)' }}
              />
            </div>

            <button type="submit" disabled={sending} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              {sending ? 'Envoi…' : '📤 Envoyer à tous les clients'}
            </button>
          </form>

          {/* Reminder card */}
          <div style={{ marginTop: 20, padding: 16, background: '#FEF3C7', borderRadius: 10, border: '1px solid #FCD34D' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 6 }}>📢 Rappels automatiques</div>
            <p style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5, marginBottom: 12 }}>
              Envoyez des rappels à tous les clients ayant un RDV dans les 48 prochaines heures.
            </p>
            <button
              onClick={handleSendReminders}
              disabled={sending}
              style={{ width: '100%', padding: '9px 16px', background: 'var(--amber)', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              {sending ? 'Envoi…' : 'Envoyer les rappels'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
