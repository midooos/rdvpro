import React, { useState, useEffect } from 'react';
import appointmentService from '../../services/appointmentService';
import userService from '../../services/userService';

// ── Report Card ──────────────────────────────────────────────────────
function ReportCard({ icon, title, value, change, subtitle, color }) {
  const changeUp = change > 0;
  return (
    <div style={{
      background: 'white',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      border: '1px solid var(--gray-1)',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 28 }}>{icon}</div>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: changeUp ? 'var(--green)' : 'var(--red)',
          background: changeUp ? '#D1FAE5' : '#FEE2E2',
          padding: '4px 8px',
          borderRadius: 12,
        }}>
          {changeUp ? '↑' : '↓'} {Math.abs(change)}%
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'var(--font-display)' }}>
        {value}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginTop: 4 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 12, color: 'var(--gray-3)', marginTop: 4 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

// ── Small Bar Chart ──────────────────────────────────────────────────
function MiniBarChart({ data, label }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>
        {label}
      </h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gray-4)', fontWeight: 600 }}>
              {d.value}
            </span>
            <div
              style={{
                width: '100%',
                borderRadius: '4px 4px 0 0',
                height: Math.max(6, (d.value / max) * 100),
                background: d.color || 'var(--blue)',
                opacity: 0.8,
                transition: 'height 0.3s ease',
              }}
            />
            <span style={{ fontSize: 11, color: 'var(--gray-3)', textAlign: 'center' }}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Status Distribution ──────────────────────────────────────────────
function StatusDistribution({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>
        Distribution par statut
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.map(d => (
          <div key={d.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>
                {d.label}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>
                {d.value} ({Math.round((d.value / total) * 100)}%)
              </span>
            </div>
            <div style={{
              width: '100%',
              height: 8,
              background: 'var(--gray-1)',
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <div
                style={{
                  height: '100%',
                  width: `${(d.value / total) * 100}%`,
                  background: d.color,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Top Clients ──────────────────────────────────────────────────────
function TopClients({ data }) {
  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>
        Clients les plus actifs
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((client, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--off)',
              borderRadius: 8,
              border: '1px solid var(--gray-1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: ['#DBEAFE', '#D1FAE5', '#FEF3C7', '#EDE9FE', '#FEE2E2'][i % 5],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#1F2937',
                }}
              >
                {i + 1}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  {client.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--gray-3)' }}>
                  {client.email}
                </div>
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--blue)' }}>
              {client.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminReports() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    noShowAppointments: 0,
    totalClients: 0,
    activeClients: 0,
  });

  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);

        // Fetch appointments data
        const appointmentsRes = await appointmentService.getAll({ limit: 500 });
        const appointments = appointmentsRes.appointments || [];

        // Calculate stats
        const completed = appointments.filter(a => a.status === 'completed').length;
        const cancelled = appointments.filter(a => a.status === 'cancelled').length;
        const noShow = appointments.filter(a => a.status === 'no_show').length;

        setStats({
          totalAppointments: appointmentsRes.total || appointments.length,
          completedAppointments: completed,
          cancelledAppointments: cancelled,
          noShowAppointments: noShow,
          totalClients: 150,
          activeClients: 87,
        });

        // Weekly data (last 7 days)
        const weeklyMap = {};
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          weeklyMap[dateStr] = 0;
        }
        appointments.forEach(a => {
          const dateStr = a.date.split('T')[0];
          if (weeklyMap.hasOwnProperty(dateStr)) weeklyMap[dateStr]++;
        });

        const weeklyArray = Object.entries(weeklyMap).map(([date, count]) => ({
          date,
          label: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
          value: count,
        }));
        setWeeklyData(weeklyArray);

        // Monthly data
        const monthlyMap = {};
        for (let i = 11; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const key = d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
          monthlyMap[key] = 0;
        }
        appointments.forEach(a => {
          const d = new Date(a.date);
          const key = d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
          if (monthlyMap.hasOwnProperty(key)) monthlyMap[key]++;
        });

        const monthlyArray = Object.entries(monthlyMap).map(([label, count]) => ({
          label,
          value: count,
          color: 'var(--teal)',
        }));
        setMonthlyData(monthlyArray);

        // Status distribution
        const pending = appointments.filter(a => a.status === 'pending').length;
        setStatusData([
          { label: 'Confirmé', value: completed, color: 'var(--green)' },
          { label: 'En attente', value: pending, color: 'var(--blue)' },
          { label: 'Annulé', value: cancelled, color: 'var(--red)' },
          { label: 'Absent', value: noShow, color: 'var(--gray-2)' },
        ]);

        // Top clients (mock data)
        setTopClients([
          { name: 'Ahmed Khadr', email: 'ahmed@example.com', count: 12 },
          { name: 'Fatima Belhaj', email: 'fatima@example.com', count: 10 },
          { name: 'Mohamed Ali', email: 'mohamedali@example.com', count: 9 },
          { name: 'Leila Mansour', email: 'leila@example.com', count: 8 },
          { name: 'Omar Hassan', email: 'omar@example.com', count: 7 },
        ]);

        setLoading(false);
      } catch (err) {
        console.error('Error loading reports:', err);
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: 18, color: 'var(--gray-3)' }}>Chargement des rapports…</div>
      </div>
    );
  }

  const completionRate = stats.totalAppointments > 0
    ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100)
    : 0;

  const cancellationRate = stats.totalAppointments > 0
    ? Math.round((stats.cancelledAppointments / stats.totalAppointments) * 100)
    : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--gray-3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}>
          Administration
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--navy)', marginBottom: 8 }}>
          Rapports & Analytiques
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-3)' }}>
          Vue d'ensemble des performances et des tendances de rendez-vous.
        </p>
      </div>

      {/* KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        <ReportCard
          icon="📅"
          title="Total rendez-vous"
          value={stats.totalAppointments}
          change={12}
          color="var(--blue)"
        />
        <ReportCard
          icon="✅"
          title="Taux de complétude"
          value={`${completionRate}%`}
          change={5}
          subtitle={`${stats.completedAppointments} terminés`}
          color="var(--green)"
        />
        <ReportCard
          icon="❌"
          title="Taux d'annulation"
          value={`${cancellationRate}%`}
          change={-2}
          subtitle={`${stats.cancelledAppointments} annulés`}
          color="var(--red)"
        />
        <ReportCard
          icon="👥"
          title="Clients actifs"
          value={stats.activeClients}
          change={8}
          subtitle={`sur ${stats.totalClients} total`}
          color="var(--teal)"
        />
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
        marginBottom: 32,
      }}>
        {/* Weekly */}
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          border: '1px solid var(--gray-1)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <MiniBarChart
            data={weeklyData}
            label="Rendez-vous cette semaine"
          />
        </div>

        {/* Status */}
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          border: '1px solid var(--gray-1)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <StatusDistribution data={statusData} />
        </div>
      </div>

      {/* Bottom row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
      }}>
        {/* Monthly */}
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          border: '1px solid var(--gray-1)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <MiniBarChart
            data={monthlyData}
            label="Tendance mensuelle (12 derniers mois)"
          />
        </div>

        {/* Top Clients */}
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          border: '1px solid var(--gray-1)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <TopClients data={topClients} />
        </div>
      </div>
    </div>
  );
}
