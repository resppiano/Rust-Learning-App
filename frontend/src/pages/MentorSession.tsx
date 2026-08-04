import { useEffect, useState } from 'react';
import { apiClient, Concept } from '../api/client';
import { useMentorStore } from '../store/mentorStore';
import MentorChat from '../components/MentorChat';
import ConceptBadge from '../components/ConceptBadge';
import CodeEditor from '../components/CodeEditor';

const STAGE_LABEL: Record<string, string> = {
  OPEN_QUESTION: 'Open Question',
  NARROWING: 'Narrowing',
  FORCED_CHOICE: 'Forced Choice',
  CONCRETE_ANCHOR: 'Concrete Anchor',
  TRANSFER_CHECK: 'Transfer Check',
  MASTERED: 'Mastered',
};

export default function MentorSession() {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const {
    sessionId,
    concept,
    stage,
    chat,
    mastered,
    loading,
    error,
    start,
    respond,
    reset,
  } = useMentorStore();

  useEffect(() => {
    apiClient.listConcepts().then(setConcepts).catch(() => setConcepts([]));
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!sessionId) {
    return (
      <div className="container">
        <h2>Mentor Mode — pick a concept</h2>
        <p className="muted">
          The Mentor teaches through Socratic dialogue grounded in the Rust book.
        </p>
        <div className="grid">
          {concepts.map((c) => (
            <div className="card" key={c.id}>
              <h3>{c.name}</h3>
              <p className="muted">{c.description}</p>
              <span className="badge">{c.difficulty_level}</span>{' '}
              <span className="badge">{c.chapter_references}</span>
              <div style={{ marginTop: 12 }}>
                <button className="btn-primary" onClick={() => start(c.id)}>
                  Learn this →
                </button>
              </div>
            </div>
          ))}
          {concepts.length === 0 && (
            <p className="spinner">Loading concepts… (is the backend running?)</p>
          )}
        </div>
        {error && <div className="output error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <h2 style={{ margin: 0 }}>{concept?.name}</h2>
        <ConceptBadge status={mastered ? 'mastered' : 'learning'} />
        <span className="badge stage">Stage: {STAGE_LABEL[stage] ?? stage}</span>
        <div className="spacer" />
        <button onClick={() => reset()}>← Choose another</button>
      </div>
      <p className="muted">{concept?.description}</p>

      <MentorChat
        chat={chat}
        loading={loading}
        mastered={mastered}
        onRespond={respond}
      />

      <div style={{ marginTop: 16 }}>
        <button onClick={() => setShowEditor((v) => !v)}>
          {showEditor ? 'Hide code scratchpad' : '⌨ Open code scratchpad'}
        </button>
        {showEditor && (
          <div style={{ marginTop: 12 }}>
            <CodeEditor />
          </div>
        )}
      </div>

      {error && <div className="output error">{error}</div>}
    </div>
  );
}
