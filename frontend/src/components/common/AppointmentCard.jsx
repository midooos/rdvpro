import React from 'react';


const STATUS_LABELS = {
  confirmed: '✅ Confirmé',
  pending:   '⏳ En attente',
  cancelled: '❌ Annulé',
  completed: '📅 Effectué',
  prévu:     '📅 Planifié',
  annulé:    '❌ Annulé',
  effectué:  '✅ Effectué',
  no_show:   '🚫 Absent',
};

const STATUS_BADGE_CLASS = {
  confirmed: 'badge-green',
  pending:   'badge-orange',
  cancelled: 'badge-red',
  completed: 'badge-blue',
  prévu:     'badge-blue',
  annulé:    'badge-red',
  effectué:  'badge-green',
  no_show:   'badge-gray',
};

const ACCENT_COLOR = {
  confirmed: 'green',
  pending:   'orange',
  cancelled: 'red',
  completed: '',
  prévu:     '',
  annulé:    'red',
  effectué:  'green',
  no_show:   'gray',
};

const DATE_BLOCK_COLOR = {
  confirmed: { bg: '#D1FAE5', color: '#065F46' },
  pending:   { bg: '#FEF3C7', color: '#92400E' },
  cancelled: { bg: '#FEE2E2', color: '#E5474B' },
  completed: { bg: '#EBF3FF', color: '#1E6FD9' },
  prévu:     { bg: '#EBF3FF', color: '#1E6FD9' },
  annulé:    { bg: '#FEE2E2', color: '#E5474B' },
  effectué:  { bg: '#D1FAE5', color: '#065F46' },
  no_show:   { bg: '#E8ECF5', color: '#5A6880' },
};

/**
 * AppointmentCard
 *
 * Props:
 *   appointment  — { id, serviceName, praticien, date (Date|string), time, lieu, prix, statut, ref }
 *   onDetail     — (appointment) => void
 *   onCancel     — (appointment) => void
 *   onReschedule — (appointment) => void   (shown for cancelled)
 */
export default function AppointmentCard({ appointment, onDetail, onCancel, onReschedule }) {
  const {
    serviceName = 'Consultation',
    praticien   = '—',
    date,
    time        = '',
    lieu        = '',
    prix        = '—',
    statut      = 'prévu',
  } = appointment;

  const d          = date instanceof Date ? date : new Date(date);
  const day        = isNaN(d) ? '--' : String(d.getDate()).padStart(2, '0');
  const monthStr   = isNaN(d) ? '---' : d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase();
  const dateColors = DATE_BLOCK_COLOR[statut] || DATE_BLOCK_COLOR.prévu;
  const isCancelled = statut === 'cancelled' || statut === 'annulé';

  return (
    <div className="rdv-card">
      {/* Color accent strip */}
      <div className={`rdv-accent ${ACCENT_COLOR[statut] || ''}`} />

      {/* Main body */}
      <div className="rdv-card-body" style={{ opacity: isCancelled ? 0.65 : 1 }}>
        {/* Date block */}
        <div className="rdv-date-block" style={{ background: dateColors.bg }}>
          <div className="day"  style={{ color: dateColors.color }}>{day}</div>
          <div className="month" style={{ color: dateColors.color }}>{monthStr}</div>
        </div>

        {/* Info */}
        <div className="rdv-info">
          <div className="rdv-service">{serviceName}</div>
          <div className="rdv-meta">
            {time  && <span>🕙 {time}</span>}
            {praticien && <span>👨‍⚕️ {praticien}</span>}
            {lieu  && <span>📍 {lieu}</span>}
            {prix  && <span>💰 {prix}</span>}
          </div>
        </div>

        {/* Badge */}
        <span className={`badge ${STATUS_BADGE_CLASS[statut] || 'badge-gray'}`}>
          {STATUS_LABELS[statut] || statut}
        </span>
      </div>

      {/* Actions */}
      <div className="rdv-card-actions">
        {onDetail && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onDetail(appointment)}
          >
            Détails
          </button>
        )}

        {!isCancelled && onCancel && (
          <>
            <button className="btn btn-outline btn-sm">Modifier</button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => onCancel(appointment)}
            >
              Annuler
            </button>
          </>
        )}

        {isCancelled && onReschedule && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onReschedule(appointment)}
          >
            Replanifier
          </button>
        )}
      </div>
    </div>
  );
}
