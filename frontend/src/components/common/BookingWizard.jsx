import React, { useState, useCallback } from 'react';
import { useToast } from '../../context/ToastContext';
import appointmentService from '../../services/appointmentService';

/* ── Static demo data ───────────────────────────────────────────────────── */
const SERVICES = [
  { id: 1, icon: '🩺', name: 'Consultation Générale', dur: 30, prix: 25,  popular: true },
  { id: 2, icon: '💊', name: 'Suivi médical',         dur: 45, prix: 40 },
  { id: 3, icon: '📋', name: 'Bilan complet',         dur: 60, prix: 75 },
  { id: 4, icon: '🥗', name: 'Suivi nutritionnel',    dur: 40, prix: 35 },
  { id: 5, icon: '💻', name: 'Téléconsultation',      dur: 20, prix: 20 },
  { id: 6, icon: '🚨', name: 'Urgence',               dur: 30, prix: 60 },
];

const PRATICIENS = [
  { id: 1, initials: 'AB', color: 'var(--blue)',   name: 'Dr. Ahmed Ben Ali',  spec: 'Médecin Généraliste',  avail: 'Disponible aujourd\'hui',   availClass: 'avail', rating: '4.9' },
  { id: 2, initials: 'SK', color: 'var(--teal)',   name: 'Dr. Sara Khelifi',   spec: 'Médecin Généraliste',  avail: 'Disponible après-midi',      availClass: 'avail', rating: '4.7' },
  { id: 3, initials: 'KM', color: 'var(--purple)', name: 'Dr. Karim Mansouri', spec: 'Nutritionniste',       avail: 'Très demandé — 2 créneaux',  availClass: 'busy',  rating: '4.8' },
];

const DAYS = [
  { day: 'LUN', num: '16' }, { day: 'MAR', num: '17', today: true },
  { day: 'MER', num: '18' }, { day: 'JEU', num: '19' }, { day: 'VEN', num: '20' },
];

const SLOTS_DATA = [
  { time: '08h00', taken: true },  { time: '08h30', taken: true },
  { time: '09h00', aiRec: true },  { time: '09h30' },
  { time: '10h00', selected: true },{ time: '10h30', aiRec: true },
  { time: '11h00' },               { time: '11h30', taken: true },
  { time: '14h00' },               { time: '14h30', aiRec: true },
  { time: '15h00' },               { time: '15h30', taken: true },
];

const STEP_LABELS = ['Service', 'Créneau', 'Informations', 'Confirmation'];

function addMinutes(timeStr, mins) {
  const parts = timeStr.split('h');
  let hr = parseInt(parts[0]); let mn = parseInt(parts[1] || '0');
  mn += mins; hr += Math.floor(mn / 60); mn = mn % 60;
  return `${hr}h${mn < 10 ? '0' + mn : mn}`;
}

/* ── Step Bar ────────────────────────────────────────────────────────────── */
function StepBar({ current }) {
  return (
    <div className="step-bar">
      {STEP_LABELS.map((label, i) => {
        const num   = i + 1;
        const done  = num < current;
        const active = num === current;
        return (
          <div key={label} className={`step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
            <div className="step-circle">{done ? '✓' : num}</div>
            <div className="step-label">{label}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Summary Sidebar ─────────────────────────────────────────────────────── */
function BookingSummary({ state, onNext, onBack, nextLabel = 'Continuer →', showBack = true }) {
  const endTime = state.heure ? addMinutes(state.heure, state.duration) : '—';
  return (
    <div className="booking-summary">
      <div className="booking-summary-header"><h3>Récapitulatif</h3></div>
      <div className="booking-summary-body">
        {[
          { lbl: 'Service',  val: state.service  || '—' },
          { lbl: 'Praticien',val: state.praticien || '—' },
          { lbl: 'Date',     val: state.date      || 'Non sélectionnée', empty: !state.date },
          { lbl: 'Heure',    val: state.heure ? `${state.heure} – ${endTime}` : 'Non sélectionnée', empty: !state.heure },
          { lbl: 'Lieu',     val: 'Salle A, Cabinet Central' },
        ].map(row => (
          <div key={row.lbl} className="summary-row">
            <span className="s-lbl">{row.lbl}</span>
            <span className={`s-val ${row.empty ? 'placeholder' : ''}`}>{row.val}</span>
          </div>
        ))}
        <div className="summary-divider" />
        <div className="summary-total">
          <span className="st-lbl">Total</span>
          <span className="st-val">{state.prix} DT</span>
        </div>
        {onNext && (
          <button className="btn btn-primary" style={{ width: '100%', marginBottom: 10 }} onClick={onNext}>
            {nextLabel}
          </button>
        )}
        {showBack && onBack && (
          <button className="btn btn-ghost" style={{ width: '100%' }} onClick={onBack}>
            ← Retour
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Main BookingWizard ──────────────────────────────────────────────────── */
export default function BookingWizard({ onSuccess }) {
  const { success, error: toastError } = useToast();
  const [step,       setStep]       = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [state, setState] = useState({
    serviceId:  1,
    service:    'Consultation Générale',
    prix:       25,
    duration:   30,
    praticienId: 1,
    praticien:  'Dr. Ahmed Ben Ali',
    date:       'Mar 17 mars 2026',
    heure:      '10h00',
    slots:      SLOTS_DATA.map(s => ({ ...s })),
    activeDay:  '17',
    smsRappel:  true,
    motif:      'Douleurs dorsales',
    description: '',
    assurance:  'CNAM — Couverture standard',
  });

  const update = useCallback((patch) => setState(prev => ({ ...prev, ...patch })), []);

  /* ── Step 1: Service + Praticien ── */
  const Step1 = () => (
    <div className="booking-layout">
      <div>
        {/* IA Banner */}
        <div className="ia-banner" style={{ marginBottom: 20 }}>
          <span className="ia-icon">🤖</span>
          <div className="ia-text">
            <div className="title">Recommandation IA personnalisée</div>
            <div className="sub">Basée sur votre historique et vos préférences</div>
          </div>
          <div className="ia-score">
            <div className="num">92%</div>
            <div className="lbl">Score match</div>
          </div>
        </div>

        {/* Services */}
        <div className="booking-panel" style={{ marginBottom: 20 }}>
          <div className="booking-panel-header"><h3>Choisir un service</h3></div>
          <div className="booking-panel-body">
            <div className="services-grid">
              {SERVICES.map(s => (
                <div
                  key={s.id}
                  className={`service-card ${state.serviceId === s.id ? 'selected' : ''}`}
                  onClick={() => update({ serviceId: s.id, service: s.name, prix: s.prix, duration: s.dur })}
                >
                  {s.popular && <span className="popular-tag">⭐ Populaire</span>}
                  <div className="svc-icon">{s.icon}</div>
                  <div className="svc-name">{s.name}</div>
                  <div className="svc-dur">⏱ {s.dur} min</div>
                  <div className="svc-price">{s.prix} DT</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Praticiens */}
        <div className="booking-panel">
          <div className="booking-panel-header"><h3>Choisir un praticien</h3></div>
          <div className="booking-panel-body">
            <div className="praticien-list">
              {PRATICIENS.map(p => (
                <div
                  key={p.id}
                  className={`praticien-card ${state.praticienId === p.id ? 'selected' : ''}`}
                  onClick={() => update({ praticienId: p.id, praticien: p.name })}
                >
                  <div className="praticien-avatar" style={{ background: p.color }}>{p.initials}</div>
                  <div className="praticien-info" style={{ flex: 1 }}>
                    <div className="p-name">{p.name}</div>
                    <div className="p-spec">{p.spec}</div>
                    <div className={`p-avail ${p.availClass}`}>● {p.avail}</div>
                  </div>
                  <div className="praticien-rating">⭐ {p.rating}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BookingSummary
        state={state}
        onNext={() => setStep(2)}
        onBack={null}
        showBack={false}
      />
    </div>
  );

  /* ── Step 2: Créneau ── */
  const Step2 = () => {
    const selectSlot = (time) => {
      const newSlots = state.slots.map(s => ({ ...s, selected: s.time === time }));
      update({ slots: newSlots, heure: time });
    };

    return (
      <div className="booking-layout">
        <div>
          <div className="booking-panel">
            <div className="booking-panel-header">
              <h3>📅 Choisir un créneau</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>← Service</button>
            </div>
            <div className="booking-panel-body">
              {/* Day tabs */}
              <div className="day-tabs">
                {DAYS.map(d => (
                  <div
                    key={d.num}
                    className={`day-tab ${state.activeDay === d.num ? 'active' : ''} ${d.today ? 'today' : ''}`}
                    onClick={() => update({ activeDay: d.num, date: `${d.day} ${d.num} mars 2026` })}
                  >
                    <div className="dt-day">{d.day}</div>
                    <div className="dt-num">{d.num}</div>
                  </div>
                ))}
              </div>

              {/* Slots */}
              <div className="slots-grid">
                {state.slots.map(s => {
                  const classes = [
                    'slot',
                    s.taken    ? 'taken'    : '',
                    s.selected ? 'selected' : '',
                    s.aiRec    ? 'ai-rec'   : '',
                  ].filter(Boolean).join(' ');
                  return (
                    <div
                      key={s.time}
                      className={classes}
                      onClick={() => !s.taken && selectSlot(s.time)}
                    >
                      {s.time}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="slot-legend">
                <div className="slot-legend-item">
                  <span className="slot-legend-dot" style={{ background: 'var(--teal)' }} /> IA recommandé
                </div>
                <div className="slot-legend-item">
                  <span className="slot-legend-dot" style={{ background: 'var(--gray-1)' }} /> Indisponible
                </div>
                <div className="slot-legend-item">
                  <span className="slot-legend-dot" style={{ background: 'var(--blue)' }} /> Sélectionné
                </div>
              </div>
            </div>
          </div>
        </div>

        <BookingSummary
          state={state}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      </div>
    );
  };

  /* ── Step 3: Informations ── */
  const Step3 = () => (
    <div className="booking-layout">
      <div>
        <div className="booking-panel">
          <div className="booking-panel-header">
            <h3>📝 Vos informations</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)}>← Créneau</button>
          </div>
          <div className="booking-panel-body">
            <div className="form-row-2">
              <div className="form-group">
                <label>Prénom</label>
                <input className="form-input" type="text" placeholder="Votre prénom" />
              </div>
              <div className="form-group">
                <label>Nom</label>
                <input className="form-input" type="text" placeholder="Votre nom" />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Téléphone</label>
                <input className="form-input" type="tel" placeholder="+216 XX XXX XXX" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-input" type="email" placeholder="votre@email.com" />
              </div>
            </div>
            <div className="form-group">
              <label>Motif de la consultation</label>
              <select
                className="form-input form-select"
                value={state.motif}
                onChange={e => update({ motif: e.target.value })}
              >
                <option>Douleurs dorsales</option>
                <option>Suivi de traitement</option>
                <option>Renouvellement d'ordonnance</option>
                <option>Check-up général</option>
                <option>Autre motif</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description (optionnel)</label>
              <textarea
                className="form-input"
                placeholder="Décrivez brièvement vos symptômes ou questions..."
                value={state.description}
                onChange={e => update({ description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Assurance maladie</label>
              <select
                className="form-input form-select"
                value={state.assurance}
                onChange={e => update({ assurance: e.target.value })}
              >
                <option>CNAM — Couverture standard</option>
                <option>Assurance privée</option>
                <option>Aucune assurance</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14, background: '#EBF3FF', borderRadius: 10, marginTop: 6 }}>
              <input
                type="checkbox"
                id="smsRappel"
                checked={state.smsRappel}
                onChange={e => update({ smsRappel: e.target.checked })}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              <label htmlFor="smsRappel" style={{ fontSize: 13, color: 'var(--text-2)', cursor: 'pointer' }}>
                Recevoir un rappel SMS 24h avant mon RDV
              </label>
            </div>
          </div>
        </div>
      </div>

      <BookingSummary
        state={state}
        onNext={() => setStep(4)}
        onBack={() => setStep(2)}
        nextLabel="Confirmer le RDV →"
      />
    </div>
  );

  /* ── Step 4: Confirmation ── */
  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await appointmentService.create({
        serviceId: state.serviceId,
        date:      state.date,
        time:      state.heure,
        note:      state.description,
      });
      success('✅ Rendez-vous confirmé avec succès !');
      onSuccess?.();
    } catch {
      toastError('Erreur lors de la confirmation. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const Step4 = () => {
    const endTime = addMinutes(state.heure, state.duration);
    return (
      <div className="booking-panel">
        <div className="confirmation-box">
          <div className="conf-icon">✅</div>
          <h2>Récapitulatif final</h2>
          <p>Vérifiez les informations avant de confirmer votre rendez-vous.</p>

          <div className="confirmation-details">
            {[
              { icon: '🩺', lbl: 'Service',   val: state.service },
              { icon: '👨‍⚕️', lbl: 'Praticien', val: state.praticien },
              { icon: '📅', lbl: 'Date',      val: state.date },
              { icon: '🕙', lbl: 'Heure',     val: `${state.heure} – ${endTime}` },
              { icon: '📍', lbl: 'Lieu',      val: 'Salle A, Cabinet Central' },
              { icon: '💰', lbl: 'Tarif',     val: `${state.prix} DT` },
            ].map(row => (
              <div key={row.lbl} className="conf-detail-row">
                <span className="cd-icon">{row.icon}</span>
                <div>
                  <div className="cd-lbl">{row.lbl}</div>
                  <div className="cd-val">{row.val}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost btn-lg" onClick={() => setStep(3)}>
              ← Modifier
            </button>
            <button
              className="btn btn-teal btn-lg"
              onClick={handleConfirm}
              disabled={submitting}
              style={{ opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Confirmation…' : '✅ Confirmer le rendez-vous'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <StepBar current={step} />
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
    </div>
  );
}
