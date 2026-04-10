import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import AppointmentCard from '../../components/common/AppointmentCard';
import AppointmentDetailModal from '../../components/common/AppointmentDetailModal';
import CalendarView from '../../components/ui/CalendarView';
import BookingWizard from '../../components/common/BookingWizard';
import appointmentService from '../../services/appointmentService';
import { formatTime } from '../../utils/formatters';
import '../../assets/styles/rendez_vous.css';

// ─── BUG FIX: removed all DEMO_RDV / CAL_EVENTS static data.
// All data is now fetched from the real API and cancellations
// are persisted via appointmentService.cancel().

const TABS = [
  { id: 'list',     label: '📋 Liste' },
  { id: 'calendar', label: '📆 Calendrier' },
  { id: 'booking',  label: '➕ Nouveau RDV' },
];

const STATUS_FILTER_LABELS = {
  confirmed: 'Confirmé',
  pending:   'En attente',
  completed: 'Terminé',
  cancelled: 'Annulé',
  no_show:   'Absent',
};

// Build calendar events from appointments list
function buildCalEvents(appointments) {
  const events = {};
  appointments.forEach(appt => {
    if (!appt.date) return;
    const d = new Date(appt.date);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
    if (!events[key]) events[key] = [];
    const typeMap = { confirmed: 'green', pending: 'orange', cancelled: 'red', completed: 'blue', no_show: 'gray' };
    events[key].push({
      label: `${appt.serviceName || 'RDV'} — ${formatTime(appt.date)}`,
      type: typeMap[appt.status] || 'blue',
    });
  });
  return events;
}

export default function ClientAppointments() {
  const { success, error: toastError } = useToast();

  const [activeTab,    setActiveTab]    = useState('list');
  const [rdvList,      setRdvList]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [detailModal,  setDetailModal]  = useState(null);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // ── Fetch from real API ───────────────────────────────────────────
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getMyAppointments();
      setRdvList(data.appointments || []);
    } catch {
      toastError('Impossible de charger les rendez-vous');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  // ── Stats ─────────────────────────────────────────────────────────
  const total     = rdvList.length;
  const confirmed = rdvList.filter(r => r.status === 'confirmed').length;
  const pending   = rdvList.filter(r => r.status === 'pending').length;
  const cancelled = rdvList.filter(r => ['cancelled', 'no_show'].includes(r.status)).length;

  // ── Filters ───────────────────────────────────────────────────────
  const filtered = rdvList.filter(rdv => {
    const matchSearch = !searchQuery ||
      (rdv.serviceName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rdv.clientName  || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = !statusFilter || rdv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Tab badge: count pending
  const tabsWithBadge = TABS.map(t =>
    t.id === 'list' && pending > 0 ? { ...t, badge: pending } : t
  );

  // ── Cancel — persists to backend ──────────────────────────────────
  const handleCancel = async (appointment) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;
    try {
      await appointmentService.cancel(appointment.id, 'Annulation par le client');
      // Update local state optimistically
      setRdvList(prev =>
        prev.map(r => r.id === appointment.id ? { ...r, status: 'cancelled' } : r)
      );
      success('❌ RDV annulé avec succès');
    } catch {
      toastError('Erreur lors de l\'annulation');
    }
  };

  const calEvents = buildCalEvents(rdvList);

  return (
    <div>
      {/* Header + tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid var(--gray-1)', padding: '0 32px' }}>
        <div style={{ paddingTop: 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
              Espace Client
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--navy)', marginBottom: 2 }}>
              Mes rendez-vous
            </h1>
            <p style={{ fontSize: 12, color: 'var(--gray-3)', paddingBottom: 12 }}>Gérez et planifiez vos consultations</p>
          </div>
          <div style={{ paddingBottom: 14 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('booking')}>➕ Nouveau RDV</button>
          </div>
        </div>
        <div className="module-tabs" style={{ padding: 0 }}>
          {tabsWithBadge.map(tab => (
            <button
              key={tab.id}
              className={`module-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.badge && <span className="tab-badge">{tab.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* LIST */}
      {activeTab === 'list' && (
        <div className="page-body">
          <div className="filter-bar">
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Rechercher un RDV, un service..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Tous les statuts</option>
              {Object.entries(STATUS_FILTER_LABELS).map(([val, lbl]) => (
                <option key={val} value={val}>{lbl}</option>
              ))}
            </select>
            <button className="btn btn-outline btn-sm" onClick={fetchAppointments}>🔄 Actualiser</button>
          </div>

          <div className="summary-pills">
            {[
              { icon: '📅', num: total,     lbl: 'Total RDV',  color: null },
              { icon: '✅', num: confirmed, lbl: 'Confirmés',   color: 'var(--green)' },
              { icon: '⏳', num: pending,   lbl: 'En attente',  color: 'var(--amber)' },
              { icon: '❌', num: cancelled, lbl: 'Annulés',     color: 'var(--red)' },
            ].map(s => (
              <div key={s.lbl} className="summary-pill">
                <span className="pill-icon">{s.icon}</span>
                <div>
                  <div className="pill-num" style={s.color ? { color: s.color } : {}}>{s.num}</div>
                  <div className="pill-lbl">{s.lbl}</div>
                </div>
              </div>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-3)' }}>Chargement…</div>
          ) : filtered.length === 0 ? (
            <div className="card empty-state">
              <div className="empty-icon">📭</div>
              <h3>Aucun rendez-vous trouvé</h3>
              <p>Aucun RDV ne correspond à vos critères.</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setActiveTab('booking')}>
                Prendre un RDV
              </button>
            </div>
          ) : (
            <div className="rdv-list">
              {filtered.map(rdv => (
                <AppointmentCard
                  key={rdv.id}
                  appointment={rdv}
                  onDetail={setDetailModal}
                  onCancel={handleCancel}
                  onReschedule={() => setActiveTab('booking')}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="page-body">
          <CalendarView
            events={calEvents}
            onDayClick={(date) => console.log('Day:', date)}
            onNewRdv={() => setActiveTab('booking')}
          />
        </div>
      )}

      {/* BOOKING */}
      {activeTab === 'booking' && (
        <div className="page-body">
          <BookingWizard onSuccess={() => { setActiveTab('list'); fetchAppointments(); }} />
        </div>
      )}

      {/* Detail Modal */}
      <AppointmentDetailModal
        appointment={detailModal}
        onClose={() => setDetailModal(null)}
        onCancel={(appt) => { handleCancel(appt); setDetailModal(null); }}
      />
    </div>
  );
}
