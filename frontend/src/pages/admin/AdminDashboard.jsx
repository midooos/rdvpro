import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { APPOINTMENT_STATUS_BADGE } from '../../utils/constants';
import appointmentService from '../../services/appointmentService';
import { getInitials, avatarColor, formatTime } from '../../utils/formatters';

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, trend, trendUp, color }) {
  return (
    <div style={{
      background: 'white', borderRadius: 'var(--radius-lg)',
      padding: '24px', border: '1px solid var(--gray-1)',
      boxShadow: 'var(--shadow-sm)',
      borderLeft: `4px solid ${color}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: color + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>{icon}</div>
        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, color: trendUp ? 'var(--green)' : 'var(--red)', background: trendUp ? '#D1FAE5' : '#FEE2E2', padding: '3px 8px', borderRadius: 20 }}>
          {trend}
        </span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--gray-3)', marginTop: 6 }}>{label}</div>
    </div>
  );
}

// ── Bar Chart ─────────────────────────────────────────────────────────────
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gray-4)', fontWeight: 600 }}>{d.value}</span>
          <div style={{
            width: '100%', borderRadius: '6px 6px 0 0',
            height: Math.max(8, (d.value / max) * 120),
            background: d.highlight ? 'var(--teal)' : 'var(--blue)',
            opacity: d.weekend ? 0.4 : 0.85,
            transition: 'height 0.3s ease',
          }} />
          <span style={{ fontSize: 11, color: 'var(--gray-3)' }}>{d.day}</span>
        </div>
      ))}
    </div>
  );
}

const STATUS_LABELS = { confirmed: 'Confirmé', pending: 'En attente', cancelled: 'Annulé', completed: 'Terminé', no_show: 'Absent' };

const QUICK_ACTIONS = [
  { icon: '📅', label: 'Ajouter créneau',  sub: 'Créer une disponibilité', bg: '#DBEAFE', to: '/admin/slots' },
  { icon: '👤', label: 'Nouveau client',   sub: 'Enregistrer un compte',   bg: '#D1FAE5', to: '/admin/clients' },
  { icon: '📢', label: 'Envoyer rappels',  sub: '48h avant les RDV',       bg: '#FEF3C7', to: '/admin/notifications' },
  { icon: '📊', label: 'Rapport',          sub: 'Analyse des tendances',   bg: '#EDE9FE', to: '/admin/reports' },
  { icon: '🚨', label: 'Annulations',      sub: 'Voir les créneaux libres', bg: '#FEE2E2', to: '/admin/appointments' },
  { icon: '⚙️', label: 'Paramètres',      sub: 'Config. système',         bg: '#E0F2F1', to: '/admin/settings' },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  const [stats, setStats]       = useState({ total: '—', clients: '—', pending: '—', cancelled: '—' });
  const [todayRdv, setTodayRdv] = useState([]);
  const [barData, setBarData]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Fetch all appointments (paginated — first page, large limit for stats)
        const data = await appointmentService.getAll({ limit: 200 });
        const all  = data.appointments || [];

        // Today's appointments
        const todayStr = new Date().toISOString().split('T')[0];
        const todayList = all.filter(a => a.date.startsWith(todayStr));
        setTodayRdv(todayList.slice(0, 6));

        // Stats
        const cancelled = all.filter(a => a.status === 'cancelled').length;
        const pending   = all.filter(a => a.status === 'pending').length;
        setStats({
          total:     data.total ?? all.length,
          pending,
          cancelled,
        });

        // Bar chart: last 7 days by count
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - 6 + i);
          return d;
        });
        const DAYS_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const bar = days.map((d, i) => {
          const str   = d.toISOString().split('T')[0];
          const count = all.filter(a => a.date.startsWith(str)).length;
          return {
            day:       DAYS_LABELS[d.getDay()],
            value:     count,
            highlight: i === 6,
            weekend:   d.getDay() === 0 || d.getDay() === 6,
          };
        });
        setBarData(bar);
      } catch {
        // Keep defaults — API may be offline in dev
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
          Administration
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--navy)', marginBottom: 4 }}>
          Tableau de bord
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-3)' }}>
          Bonjour, {user?.firstName} — voici l'état de votre agenda aujourd'hui.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        <StatCard icon="📅" value={loading ? '…' : String(todayRdv.length)}   label="RDV aujourd'hui"  trend="Aujourd'hui"  trendUp color="var(--blue)" />
        <StatCard icon="📋" value={loading ? '…' : String(stats.total)}        label="RDV total"        trend="Tous statuts" trendUp color="var(--teal)" />
        <StatCard icon="⏳" value={loading ? '…' : String(stats.pending)}      label="En attente"       trend="À confirmer"  trendUp color="var(--amber)" />
        <StatCard icon="🚨" value={loading ? '…' : String(stats.cancelled)}    label="Annulations"      trend="À traiter"    trendUp={false} color="var(--red)" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Bar chart */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 24, border: '1px solid var(--gray-1)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            RDV par jour — 7 derniers jours
          </div>
          {barData.length > 0
            ? <BarChart data={barData} />
            : <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-3)', fontSize: 13 }}>{loading ? 'Chargement…' : 'Aucune donnée'}</div>
          }
        </div>

        {/* Donut chart */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: 24, border: '1px solid var(--gray-1)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>
            Répartition par service
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="52" fill="none" stroke="#E8ECF5" strokeWidth="20"/>
              <circle cx="65" cy="65" r="52" fill="none" stroke="#1E6FD9" strokeWidth="20" strokeDasharray="130 196" strokeDashoffset="0" transform="rotate(-90 65 65)"/>
              <circle cx="65" cy="65" r="52" fill="none" stroke="#0DBAAB" strokeWidth="20" strokeDasharray="72 254" strokeDashoffset="-130" transform="rotate(-90 65 65)"/>
              <circle cx="65" cy="65" r="52" fill="none" stroke="#7C5CBF" strokeWidth="20" strokeDasharray="45 281" strokeDashoffset="-202" transform="rotate(-90 65 65)"/>
              <circle cx="65" cy="65" r="52" fill="none" stroke="#F5A623" strokeWidth="20" strokeDasharray="79 247" strokeDashoffset="-247" transform="rotate(-90 65 65)"/>
              <text x="65" y="61" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1A2540" fontFamily="DM Sans">{loading ? '…' : stats.total}</text>
              <text x="65" y="75" textAnchor="middle" fontSize="9" fill="#8896AD" fontFamily="DM Sans">Total RDV</text>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { color: 'var(--blue)',   label: 'Confirmés' },
                { color: 'var(--amber)',  label: 'En attente' },
                { color: 'var(--green)',  label: 'Terminés' },
                { color: 'var(--red)',    label: 'Annulés' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Today's RDV */}
        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-1)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--gray-1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Rendez-vous du jour</span>
            <Link to="/admin/appointments" style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>Voir tout →</Link>
          </div>
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-3)', fontSize: 13 }}>Chargement…</div>
          ) : todayRdv.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-3)', fontSize: 13 }}>Aucun rendez-vous aujourd'hui</div>
          ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--off)' }}>
                {['Client', 'Service', 'Heure', 'Statut', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gray-3)', textAlign: 'left', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid var(--gray-1)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {todayRdv.map((row) => {
                const name     = row.clientName || '—';
                const initials = getInitials(name);
                const color    = avatarColor(name);
                const time     = row.date ? formatTime(row.date) : '—';
                return (
                  <tr key={row.id} style={{ borderBottom: '1px solid var(--gray-1)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', flexShrink: 0 }}>{initials}</div>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-2)' }}>{row.serviceName || '—'}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--navy)' }}>{time}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${APPOINTMENT_STATUS_BADGE[row.status] || 'badge-gray'}`}>
                        {STATUS_LABELS[row.status] || row.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <Link to="/admin/appointments" className="btn btn-ghost btn-sm">Voir</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          )}
        </div>

        {/* Quick actions */}
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
            Actions rapides
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {QUICK_ACTIONS.map(a => (
              <Link key={a.label} to={a.to} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'white', borderRadius: 'var(--radius)',
                  padding: '14px 16px', border: '1px solid var(--gray-1)',
                  boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
                  transition: 'box-shadow 0.2s, transform 0.15s',
                }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{a.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{a.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-3)' }}>{a.sub}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
