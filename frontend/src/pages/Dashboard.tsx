import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import ConceptBadge from '../components/ConceptBadge';

interface ConceptProgress {
  concept_id: number;
  name: string;
  difficulty_level: string;
  status: string;
  transfer_check_passed: boolean;
  attempts: number;
}

interface Summary {
  total: number;
  mastered: number;
  learning: number;
  notStarted: number;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [concepts, setConcepts] = useState<ConceptProgress[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .getProgress()
      .then((d) => {
        setSummary(d.summary);
        setConcepts(d.concepts);
        setSessions(d.recentSessions);
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  return (
    <div className="container">
      <h2>Your Progress</h2>

      {summary && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="card">
            <h3 style={{ color: 'var(--success)' }}>{summary.mastered}</h3>
            <p className="muted">Mastered</p>
          </div>
          <div className="card">
            <h3 style={{ color: 'var(--warning)' }}>{summary.learning}</h3>
            <p className="muted">Learning</p>
          </div>
          <div className="card">
            <h3 className="muted">{summary.notStarted}</h3>
            <p className="muted">Not started</p>
          </div>
          <div className="card">
            <h3 style={{ color: 'var(--accent)' }}>{summary.total}</h3>
            <p className="muted">Total concepts</p>
          </div>
        </div>
      )}

      <div className="card">
        <h3>Concepts</h3>
        {concepts.map((c) => (
          <div
            className="row"
            key={c.concept_id}
            style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}
          >
            <span style={{ minWidth: 220 }}>{c.name}</span>
            <span className="badge">{c.difficulty_level}</span>
            <div className="spacer" />
            <span className="muted" style={{ fontSize: 13 }}>
              {c.attempts} attempt{c.attempts === 1 ? '' : 's'}
            </span>
            <ConceptBadge status={c.status} />
          </div>
        ))}
        {concepts.length === 0 && !error && (
          <p className="spinner">Loading… (is the backend running?)</p>
        )}
      </div>

      <div className="card">
        <h3>Recent sessions</h3>
        {sessions.length === 0 && <p className="muted">No sessions yet.</p>}
        {sessions.map((s) => (
          <div
            className="row"
            key={s.id}
            style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}
          >
            <span className="badge">{s.mode}</span>
            <span className="muted">#{s.id}</span>
            <div className="spacer" />
            <span
              className="badge"
              style={{
                color:
                  s.status === 'completed' ? 'var(--success)' : 'var(--warning)',
              }}
            >
              {s.status}
            </span>
          </div>
        ))}
      </div>

      {error && <div className="output error">{error}</div>}
    </div>
  );
}
