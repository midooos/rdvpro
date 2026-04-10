import React, { useState } from 'react';

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];
const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

/**
 * CalendarView
 *
 * Props:
 *   events       — { [key: 'YYYY-M-D']: Array<{ label, type: 'green'|'blue'|'orange'|'red' }> }
 *   onDayClick   — (date: Date) => void
 *   onNewRdv     — () => void
 */
export default function CalendarView({ events = {}, onDayClick, onNewRdv }) {
  const today   = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  function changeMonth(dir) {
    setMonth(prev => {
      let m = prev + dir;
      if (m < 0)  { setYear(y => y - 1); return 11; }
      if (m > 11) { setYear(y => y + 1); return 0; }
      return m;
    });
  }

  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }

  function handleDayClick(date) {
    setSelectedDate(date.toDateString());
    onDayClick?.(date);
  }

  // Build calendar cells
  const cells = [];
  const firstDay    = new Date(year, month, 1);
  const lastDay     = new Date(year, month + 1, 0);
  const prevMonthLast = new Date(year, month, 0).getDate();

  // Monday-based offset (Sun=0 → 6, Mon=1 → 0, ...)
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;

  // Previous month filler
  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ day: prevMonthLast - i, isCurrentMonth: false, date: null });
  }

  // Current month days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date    = new Date(year, month, d);
    const key     = `${year}-${month + 1}-${d}`;
    const isToday = (year === today.getFullYear() && month === today.getMonth() && d === today.getDate());
    cells.push({
      day:            d,
      isCurrentMonth: true,
      date,
      isToday,
      isSelected:     selectedDate === date.toDateString(),
      events:         events[key] || [],
    });
  }

  // Next month filler (fill to 42 total)
  for (let d = 1; cells.length < 42; d++) {
    cells.push({ day: d, isCurrentMonth: false, date: null });
  }

  return (
    <div>
      {/* Header */}
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="cal-nav-btn" onClick={() => changeMonth(-1)}>‹</button>
          <h2>{MONTHS_FR[month]} {year}</h2>
          <button className="cal-nav-btn" onClick={() => changeMonth(1)}>›</button>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={goToday}>Aujourd'hui</button>
          {onNewRdv && (
            <button className="btn btn-primary btn-sm" onClick={onNewRdv}>
              ➕ Nouveau RDV
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="calendar-grid">
        {/* Week header */}
        <div className="cal-week-header">
          {DAYS_FR.map(d => (
            <div key={d} className="cal-week-day">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="cal-days">
          {cells.map((cell, i) => {
            const classes = [
              'cal-cell',
              !cell.isCurrentMonth ? 'other-month' : '',
              cell.isToday     ? 'today'    : '',
              cell.isSelected  ? 'selected' : '',
            ].filter(Boolean).join(' ');

            return (
              <div
                key={i}
                className={classes}
                onClick={() => cell.date && handleDayClick(cell.date)}
              >
                <div className="cal-day-num">{cell.day}</div>
                {cell.events?.map((ev, j) => (
                  <div key={j} className={`cal-event ${ev.type}`}>
                    {ev.label}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
