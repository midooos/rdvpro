import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import appointmentService from '../../services/appointmentService';
import { SERVICES as FALLBACK_SERVICES } from '../../utils/constants';
import { formatDateFull } from '../../utils/formatters';

const STEPS = ['Service', 'Date & Créneau', 'Confirmation'];

const DAYS_FR = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

// Generate next 14 days
function generateDays() {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });
}

export default function BookingPage() {
  const { success, error: toastError } = useToast();
  const navigate  = useNavigate();
  const [step, setStep]               = useState(0);
  const [service, setService]         = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [note, setNote]               = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [services] = useState(FALLBACK_SERVICES);
  const [slots, setSlots]             = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const days = generateDays();

  // Fetch available slots whenever service + day change
  useEffect(() => {
    if (!service || !selectedDay) { setSlots([]); return; }
    const dateStr = selectedDay.toISOString().split('T')[0];
    setLoadingSlots(true);
    appointmentService.getAvailableSlots(service.id, dateStr)
      .then(apiSlots => {
        // Map API slots {id, startTime, isTaken} → local format {time, taken}
        setSlots(apiSlots.map(s => ({ time: s.startTime, taken: s.isTaken, id: s.id })));
      })
      .catch(() => {
        // Fallback: show empty — don't crash
        setSlots([]);
      })
      .finally(() => setLoadingSlots(false));
  }, [service, selectedDay]);

  const canNext = () => {
    if (step === 0) return !!service;
    if (step === 1) return !!selectedDay && !!selectedSlot;
    return true;
  };

  const handleBook = async () => {
    setSubmitting(true);
    try {
      await appointmentService.create({
        serviceId:    service.id,
        date:         selectedDay.toISOString().split('T')[0],
        time:         selectedSlot,
        note,
      });
      success('Rendez-vous réservé avec succès !');
      navigate('/appointments');
    } catch {
      toastError('Erreur lors de la réservation. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
          Espace Client
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--navy)', marginBottom: 4 }}>
          Prendre un rendez-vous
        </h1>
        <p style={{ fontSize: 14, color: 'var(--gray-3)' }}>
          Suivez les étapes pour réserver votre créneau.
        </p>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36 }}>
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                background: i < step ? 'var(--green)' : i === step ? 'var(--blue)' : 'var(--gray-1)',
                color: i <= step ? 'white' : 'var(--gray-3)',
                transition: 'all 0.2s',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: i === step ? 700 : 400, color: i <= step ? 'var(--text)' : 'var(--gray-3)' }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < step ? 'var(--green)' : 'var(--gray-1)', margin: '0 12px', transition: 'background 0.3s' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-1)', boxShadow: 'var(--shadow-sm)', padding: 32, marginBottom: 24 }}>

        {/* ── STEP 0: Service selection ── */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>
              Choisissez un service
            </h2>
            <p style={{ fontSize: 13, color: 'var(--gray-3)', marginBottom: 24 }}>
              Sélectionnez le type de consultation qui vous convient.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {services.map(s => (
                <div
                  key={s.id}
                  onClick={() => setService(s)}
                  style={{
                    padding: 20, borderRadius: 'var(--radius)',
                    border: `2px solid ${service?.id === s.id ? s.color : 'var(--gray-1)'}`,
                    background: service?.id === s.id ? s.color + '10' : 'var(--off)',
                    cursor: 'pointer', transition: 'all 0.15s',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-3)' }}>⏱ {s.duration} min</div>
                  {service?.id === s.id && (
                    <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: s.color }}>✓ Sélectionné</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 1: Date & Slot ── */}
        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            {/* Calendar strip */}
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>
                Choisissez une date
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {days.map((d, i) => {
                  const isSelected = selectedDay?.toDateString() === d.toDateString();
                  const isWeekend  = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <div
                      key={i}
                      onClick={() => { if (!isWeekend) { setSelectedDay(d); setSelectedSlot(null); } }}
                      style={{
                        width: 58, padding: '10px 6px', borderRadius: 10, textAlign: 'center',
                        border: `2px solid ${isSelected ? 'var(--blue)' : 'var(--gray-1)'}`,
                        background: isSelected ? 'var(--blue)' : isWeekend ? 'var(--gray-1)' : 'var(--off)',
                        cursor: isWeekend ? 'not-allowed' : 'pointer',
                        opacity: isWeekend ? 0.4 : 1,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 600, color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--gray-3)', textTransform: 'uppercase' }}>
                        {DAYS_FR[d.getDay()]}
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: isSelected ? 'white' : 'var(--text)', lineHeight: 1.2, marginTop: 2 }}>
                        {d.getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
              {selectedDay && (
                <p style={{ marginTop: 12, fontSize: 12, color: 'var(--teal)', fontWeight: 600 }}>
                  📅 {formatDateFull(selectedDay)}
                </p>
              )}
            </div>

            {/* Time slots */}
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 16 }}>
                Choisissez un créneau
              </h3>
              {!selectedDay ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-3)', background: 'var(--off)', borderRadius: 'var(--radius)', fontSize: 13 }}>
                  Sélectionnez d'abord une date
                </div>
              ) : loadingSlots ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-3)', fontSize: 13 }}>
                  Chargement des créneaux…
                </div>
              ) : slots.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--gray-3)', background: 'var(--off)', borderRadius: 'var(--radius)', fontSize: 13 }}>
                  Aucun créneau disponible pour cette date
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {slots.map(s => (
                    <div
                      key={s.time}
                      onClick={() => { if (!s.taken) setSelectedSlot(s.time); }}
                      style={{
                        padding: '10px 6px', borderRadius: 8, textAlign: 'center',
                        border: `2px solid ${selectedSlot === s.time ? 'var(--teal)' : s.taken ? 'var(--gray-1)' : 'var(--gray-1)'}`,
                        background: selectedSlot === s.time ? 'var(--teal)' : s.taken ? 'var(--gray-1)' : 'var(--off)',
                        cursor: s.taken ? 'not-allowed' : 'pointer',
                        opacity: s.taken ? 0.4 : 1,
                        transition: 'all 0.15s',
                        fontSize: 13,
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 600,
                        color: selectedSlot === s.time ? 'white' : s.taken ? 'var(--gray-3)' : 'var(--text)',
                      }}
                    >
                      {s.time}
                    </div>
                  ))}
                </div>
              )}

              {/* Legend */}
              <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                {[
                  { color: 'var(--teal)', label: 'Sélectionné' },
                  { color: 'var(--off)', label: 'Disponible', border: 'var(--gray-2)' },
                  { color: 'var(--gray-1)', label: 'Réservé' },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: l.color, border: l.border ? `1px solid ${l.border}` : 'none' }} />
                    <span style={{ fontSize: 11, color: 'var(--gray-3)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Confirmation ── */}
        {step === 2 && (
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy)', marginBottom: 6 }}>
              Confirmer la réservation
            </h2>
            <p style={{ fontSize: 13, color: 'var(--gray-3)', marginBottom: 24 }}>
              Vérifiez les détails avant de confirmer.
            </p>

            {/* Summary card */}
            <div style={{ background: 'var(--off)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 24, border: '1px solid var(--gray-1)' }}>
              {[
                { label: 'Service',  value: service?.name },
                { label: 'Durée',    value: `${service?.duration} minutes` },
                { label: 'Date',     value: selectedDay ? formatDateFull(selectedDay) : '' },
                { label: 'Heure',    value: selectedSlot },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-1)' }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-3)' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Optional note */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'var(--gray-4)', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
                NOTE (OPTIONNEL)
              </label>
              <textarea
                rows={3}
                placeholder="Précisions pour le professionnel…"
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--gray-1)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--font-body)', outline: 'none', resize: 'vertical', background: 'white' }}
              />
            </div>

            {/* Info box */}
            <div style={{ background: '#DBEAFE', border: '1px solid #93C5FD', borderRadius: 10, padding: 14, fontSize: 12, color: '#1E40AF', lineHeight: 1.6 }}>
              ℹ️ Vous recevrez une confirmation par e-mail et une notification 48h avant votre rendez-vous.
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="btn btn-ghost"
          style={{ opacity: step === 0 ? 0 : 1 }}
        >
          ← Retour
        </button>

        <div style={{ fontSize: 13, color: 'var(--gray-3)', fontFamily: 'var(--font-mono)' }}>
          Étape {step + 1} / {STEPS.length}
        </div>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="btn btn-primary"
            style={{ opacity: canNext() ? 1 : 0.5 }}
          >
            Suivant →
          </button>
        ) : (
          <button
            onClick={handleBook}
            disabled={submitting}
            className="btn btn-teal"
          >
            {submitting ? 'Réservation…' : '✓ Confirmer le rendez-vous'}
          </button>
        )}
      </div>
    </div>
  );
}
