// src/TopTen.js
import React, { useState, useEffect } from 'react';

const API_BASE = process.env.API_URL || '';

const DAY_NAMES = ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'];
const MONTH_SHORT = ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'];

function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return `${DAY_NAMES[d.getDay()]} ${day}. ${MONTH_SHORT[month - 1]}`;
}

const SHOW = 2;

function VotersList({ voters }) {
  const [expanded, setExpanded] = useState(false);
  const names = voters ? voters.split(', ') : [];
  if (names.length === 0) return null;

  const hidden = names.length - SHOW;
  const visible = expanded ? names : names.slice(0, SHOW);

  return (
    <div className="top-ten-voters">
      {visible.join(', ')}
      {!expanded && hidden > 0 && (
        <button className="voters-toggle" onClick={() => setExpanded(true)}>
          +{hidden}
        </button>
      )}
      {expanded && (
        <button className="voters-toggle" onClick={() => setExpanded(false)}>
          −
        </button>
      )}
    </div>
  );
}

export default function TopTen({ refreshKey = 0 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`${API_BASE}/api/top-ten`)
      .then((r) => {
        if (!r.ok) throw new Error('server');
        return r.json();
      })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [refreshKey]);

  const maxVotes = items[0]?.votes || 1;

  return (
    <div className="card top-ten">
      <div className="top-ten-title">Top 10 termínů</div>
      <div className="top-ten-subtitle">Nejoblíbenější dny</div>
      {loading && <p className="top-ten-state">Načítám…</p>}
      {error && <p className="top-ten-state error">Chyba při načítání</p>}
      {!loading && !error && items.length === 0 && (
        <p className="top-ten-state">Zatím žádná data</p>
      )}
      {!loading && !error && items.length > 0 && (
        <ol className="top-ten-list">
          {items.map(({ day, votes, voters }, i) => (
            <li key={day} className="top-ten-item">
              <span className="rank">{i + 1}</span>
              <div className="top-ten-info">
                <div className="top-ten-date">{formatDate(day)}</div>
                <div className="top-ten-bar-bg">
                  <div
                    className="top-ten-bar"
                    style={{ width: `${(votes / maxVotes) * 100}%` }}
                  />
                </div>
                {voters && <VotersList voters={voters} />}
              </div>
              <span className="top-ten-votes">{votes}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

