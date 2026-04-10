// AdminAppointments.jsx
// BUG FIX: after confirm/cancel the list now refreshes automatically.
// Previously the UI kept showing stale data after an action.

import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import appointmentService from '../../services/appointmentService';
import { formatDateTime } from '../../utils/formatters';
import { APPOINTMENT_STATUS_BADGE } from '../../utils/constants';

const STATUS_LABELS = {
  confirmed: 'Confirmé',
  pending:   'En attente',
  cancelled: 'Annulé',
  completed: 'Terminé',
  no_show:   'Absent',
};
const FILTERS = ['all', 'pending', 'confirmed', 'cancelled', 'completed', 'no_show'];

export default function AdminAppointments() {
  const { success, error: toastError } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await appointmentService.getAll({
        status: filter !== 'all' ? filter : undefined,
        limit: 100,
      });
      setAppointments(data.appointments || []);
    } catch {
      toastError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [filter, toastError]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleConfirm = async (id) => {
    try {
      await appointmentService.confirm(id);
      success('✅ RDV confirmé');
      fetchAppointments(); // ← FIX: refresh list
    } catch {
      toastError('Erreur lors de la confirmation');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Annuler ce RDV ?')) return;
    try {
      await appointmentService.cancel(id, 'Annulation admin');
      success('❌ RDV annulé');
      fetchAppointments(); // ← FIX: refresh list
    } catch {
      toastError('Erreur lors de l\'annulation');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Administration</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--navy)' }}>Rendez-vous</h1>
        <p style={{ fontSize: 14, color: 'var(--gray-3)', marginTop: 4 }}>Vue complète de tous les rendez-vous.</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--gray-1)', padding: 4, borderRadius: 10, marginBottom: 20, width: 'fit-content' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 7, fontSize: 13, fontWeight: 600,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: filter === f ? 'white' : 'transparent',
            color: filter === f ? 'var(--text)' : 'var(--gray-3)',
            boxShadow: filter === f ? 'var(--shadow-sm)' : 'none',
          }}>
            {STATUS_LABELS[f] || 'Tous'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-1)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-3)' }}>Chargement…</div>
        ) : appointments.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-3)' }}>Aucun rendez-vous trouvé.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--off)' }}>
                {['ID', 'Client', 'Service', 'Date', 'Statut', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--gray-3)', textAlign: 'left', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid var(--gray-1)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {appointments.map(appt => (
                <tr key={appt.id} style={{ borderBottom: '1px solid var(--gray-1)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--gray-3)' }}>#{appt.id}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500 }}>{appt.clientName || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-2)' }}>{appt.serviceName || '—'}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{formatDateTime(appt.date)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${APPOINTMENT_STATUS_BADGE[appt.status] || 'badge-gray'}`}>
                      {STATUS_LABELS[appt.status] || appt.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {appt.status === 'pending' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleConfirm(appt.id)}>
                          ✅ Confirmer
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(appt.status) && (
                        <button className="btn btn-outline btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => handleCancel(appt.id)}>
                          ❌ Annuler
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
