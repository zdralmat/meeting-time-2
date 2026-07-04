// src/Calendar.js
import React, { useState } from 'react';

const DAY_HEADERS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
const MONTH_NAMES = [
  'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
  'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec',
];

function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function MonthCalendar({ year, month, selectedDays, onToggleDay, disabled }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayRaw = new Date(year, month, 1).getDay(); // 0 = Sun
  const firstDay = (firstDayRaw + 6) % 7; // Mon = 0 … Sun = 6

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dow = date.getDay();
    cells.push({ day: d, isWeekend: dow === 0 || dow === 6, date });
  }

  return (
    <div className="month-calendar">
      <div className="month-title">{MONTH_NAMES[month]} {year}</div>
      <div className="calendar-grid">
        {DAY_HEADERS.map((h) => (
          <div key={h} className="day-header">{h}</div>
        ))}
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e-${i}`} className="day-cell empty" />;
          const { day, isWeekend, date } = cell;
          const dateStr = formatDate(year, month, day);
          const isPast = date < today;
          const isToday = date.getTime() === today.getTime();
          const isSelected = selectedDays.has(dateStr);

          const classes = ['day-cell'];
          if (isSelected) classes.push('selected');
          if (isPast) classes.push('past');
          if (isToday) classes.push('today');
          if (isWeekend) classes.push('weekend');
          if (disabled && !isPast) classes.push('disabled');

          return (
            <div
              key={dateStr}
              className={classes.join(' ')}
              onClick={() => !isPast && !disabled && onToggleDay(dateStr)}
              title={dateStr}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Calendar({ selectedDays, onToggleDay, disabled }) {
  const now = new Date();
  const [startYear, setStartYear] = useState(now.getFullYear());
  const [startMonth, setStartMonth] = useState(now.getMonth());

  const offset = (n) => {
    let m = startMonth + n;
    let y = startYear;
    while (m > 11) { m -= 12; y++; }
    while (m < 0) { m += 12; y--; }
    return { year: y, month: m };
  };

  const prev = () => { const o = offset(-1); setStartYear(o.year); setStartMonth(o.month); };
  const next = () => { const o = offset(1); setStartYear(o.year); setStartMonth(o.month); };

  const months = [offset(0), offset(1)];

  return (
    <div className="card calendar">
      <div className="calendar-nav">
        <button className="nav-btn" onClick={prev} aria-label="Předchozí měsíc">&#8249;</button>
        <button className="nav-btn" onClick={next} aria-label="Další měsíc">&#8250;</button>
      </div>
      <div className="months-container">
        {months.map(({ year, month }) => (
          <MonthCalendar
            key={`${year}-${month}`}
            year={year}
            month={month}
            selectedDays={selectedDays}
            onToggleDay={onToggleDay}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
