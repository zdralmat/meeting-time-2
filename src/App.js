// src/App.js
import React, { useState } from 'react';
import Calendar from './Calendar.js';
import TopTen from './TopTen.js';
import './App.css';

function pluralDen(n) {
  if (n === 1) return 'den';
  if (n <= 4) return 'dny';
  return 'dní';
}

const API_BASE = process.env.API_URL || '';

export default function App() {
  const [nameInput, setNameInput] = useState('');
  const [activeName, setActiveName] = useState('');
  const [selectedDays, setSelectedDays] = useState(new Set());
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [topTenKey, setTopTenKey] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (trimmed) setActiveName(trimmed);
  };

  const toggleDay = (dateStr) => {
    if (!activeName) return;
    setSubmitStatus(null);
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  };

  const handleSend = async () => {
    if (!activeName || selectedDays.size === 0) return;
    setSubmitStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activeName,
          days: Array.from(selectedDays).sort(),
        }),
      });
      if (!res.ok) throw new Error('server');
      setSubmitStatus('success');
      setTopTenKey((k) => k + 1); // obnov Top 10
    } catch {
      setSubmitStatus('error');
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Meeting Time</h1>
        <p className="subtitle">Najdi nejlepší termín pro všechny</p>
      </header>

      <form className="name-form" onSubmit={handleSubmit}>
        <input
          className="name-input"
          type="text"
          placeholder="Tvoje jméno"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
        <button className="btn-primary" type="submit">
          {activeName ? 'Změnit' : 'Potvrdit'}
        </button>
      </form>

      <p className={`status-msg ${activeName ? 'active' : 'hint'}`}>
        {activeName
          ? `Ahoj ${activeName}! Klikni na dny, kdy ti to vyhovuje.`
          : 'Zadej své jméno a pak klikej na dny.'}
      </p>

      <div className="main-layout">
        <div className="calendar-section">
          <Calendar
            selectedDays={selectedDays}
            onToggleDay={toggleDay}
            disabled={!activeName}
          />
          {activeName && (
            <div className="submit-area">
              <span className="selected-count">
                {selectedDays.size > 0
                  ? `${selectedDays.size} ${pluralDen(selectedDays.size)} vybráno`
                  : 'Vyber dny v kalendáři'}
              </span>
              <button
                className="btn-send"
                onClick={handleSend}
                disabled={submitStatus === 'loading' || selectedDays.size === 0}
              >
                {submitStatus === 'loading' ? 'Odesílám…' : 'Odeslat dostupnost →'}
              </button>
              {submitStatus === 'success' && (
                <p className="send-feedback success">✓ Dostupnost odeslána!</p>
              )}
              {submitStatus === 'error' && (
                <p className="send-feedback error">✗ Chyba – API není dostupné.</p>
              )}
            </div>
          )}
        </div>
        <div className="top-ten-section">
          <TopTen refreshKey={topTenKey} />
        </div>
      </div>
    </div>
  );
}
