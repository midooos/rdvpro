import React, { useEffect } from 'react';

const STATUS_LABELS = {
  confirmed: '✅ Confirmé',
  pending:   '⏳ En attente',
  cancelled: '❌ Annulé',
  completed: '✅ Effectué',
  prévu:     '📅 Planifié',
  annulé:    '❌ Annulé',
  effectué:  '✅ Effectué',
  no_show:   '🚫 Absent',
};

const STATUS_BADGE_CLASS = {
  confirmed: 'badge-green',
  pending:   'badge-orange',
  cancelled: 'badge-red',
  completed: 'badge-green',
  prévu:     'badge-blue',
  annulé:    'badge-red',
  effectué:  'badge-green',
};

/**
 * AppointmentDetailModal
 *
 * Props:
 *   appointment — object | null  (null = closed)
 *   onClose     — () => void
 *   onCancel    — (appointment) => void  (optional)
 */
export default function AppointmentDetailModal({ appointment, onClose, onCancel }) {
  const open = !!appointment;

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!appointment) return null;

  const {
    serviceName    = 'Consultation',
    praticien      = '—',
    date,
    time           = '—',
    lieu           = 'Cabinet Central',
    prix           = '—',
    statut         = 'prévu',
    motif          = '—',
    ref            = `RDV-${appointment.id || '000'}`,
    notes          = '',
    history        = [],
  } = appointment;

  const dateStr = date
    ? (date instanceof Date ? date : new Date(date)).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—';

  const isCancellable = ['prévu', 'pending', 'confirmed'].includes(statut);

  return (
    <div
      className={`modal-overlay ${open ? 'open' : ''}`}
      onClick={(e) => { if (e.target.classList.contains('modal-overlay')) onClose(); }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label="Détails du rendez-vous">

        {/* Header */}
        <div className="modal-header">
          <h2>Détails du rendez-vous</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Status row */}
          <div className="rdv-detail-status">
            <div>
              <div style={{ fontSize: 12, color: 'var(--gray-3)', marginBottom: 4 }}>
                Référence : <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{ref}</span>
              </div>
            </div>
            <span className={`badge ${STATUS_BADGE_CLASS[statut] || 'badge-gray'}`}>
              {STATUS_LABELS[statut] || statut}
            </span>
          </div>

          {/* Details grid */}
          <div className="rdv-detail-grid">
            <div className="rdv-detail-item">
              <div className="di-lbl">Service</div>
              <div className="di-val">🩺 {serviceName}</div>
            </div>
            <div className="rdv-detail-item">
              <div className="di-lbl">Praticien</div>
              <div className="di-val">👨‍⚕️ {praticien}</div>
            </div>
            <div className="rdv-detail-item">
              <div className="di-lbl">Date</div>
              <div className="di-val">📅 {dateStr}</div>
            </div>
            <div className="rdv-detail-item">
              <div className="di-lbl">Heure</div>
              <div className="di-val">🕙 {time}</div>
            </div>
            <div className="rdv-detail-item">
              <div className="di-lbl">Lieu</div>
              <div className="di-val">📍 {lieu}</div>
            </div>
            <div className="rdv-detail-item">
              <div className="di-lbl">Tarif</div>
              <div className="di-val">💰 {prix}</div>
            </div>
            {motif && motif !== '—' && (
              <div className="rdv-detail-item" style={{ gridColumn: 'span 2' }}>
                <div className="di-lbl">Motif</div>
                <div className="di-val">🏥 {motif}</div>
              </div>
            )}
            {notes && (
              <div className="rdv-detail-item" style={{ gridColumn: 'span 2' }}>
                <div className="di-lbl">Notes</div>
                <div className="di-val" style={{ fontWeight: 400, fontSize: 13, color: 'var(--text-2)' }}>{notes}</div>
              </div>
            )}
          </div>

          {/* History timeline */}
          {history.length > 0 && (
            <div className="rdv-history">
              <h4>Historique</h4>
              {history.map((h, i) => (
                <div className="history-item" key={i}>
                  <div className="h-dot" />
                  <div className="h-text">{h.text}</div>
                  <div className="h-time">{h.time}</div>
                </div>
              ))}
            </div>
          )}

          {/* Default history if none */}
          {history.length === 0 && (
            <div className="rdv-history">
              <h4>Historique</h4>
              <div className="history-item">
                <div className="h-dot" />
                <div className="h-text">RDV créé</div>
                <div className="h-time">Aujourd'hui</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Fermer</button>
          <button className="btn btn-outline btn-sm">📄 Télécharger</button>
          {isCancellable && onCancel && (
            <button
              className="btn btn-danger"
              onClick={() => { onCancel(appointment); onClose(); }}
            >
              Annuler ce RDV
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
