import { useState } from 'react';
import { ChatEntry } from '../store/mentorStore';
import ChoiceCard from './ChoiceCard';

interface Props {
  chat: ChatEntry[];
  loading: boolean;
  mastered: boolean;
  onRespond: (payload: { selected?: string; response?: string }) => void;
}

/** Socratic chat UI with message bubbles + inline forced-choice options. */
export default function MentorChat({ chat, loading, mastered, onRespond }: Props) {
  const [text, setText] = useState('');
  const lastEntry = chat[chat.length - 1];
  const options =
    lastEntry?.role === 'assistant' ? lastEntry.options : undefined;

  const submitText = () => {
    if (!text.trim()) return;
    onRespond({ response: text.trim() });
    setText('');
  };

  return (
    <div>
      <div className="chat">
        {chat.map((entry, i) => (
          <div key={i} className={`bubble ${entry.role}`}>
            {entry.text}
          </div>
        ))}
        {loading && <div className="bubble assistant spinner">Mentor is thinking…</div>}
      </div>

      {!mastered && !loading && options && options.length > 0 && (
        <div className="card">
          {options.map((o) => (
            <ChoiceCard
              key={o.id}
              option={o}
              onSelect={(id) => onRespond({ selected: id })}
            />
          ))}
        </div>
      )}

      {!mastered && !loading && (!options || options.length === 0) && (
        <div className="row">
          <input
            style={{
              flex: 1,
              padding: '10px 14px',
              background: 'var(--bg-inset)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              color: 'var(--text)',
              font: 'inherit',
            }}
            placeholder="Type your answer…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitText()}
          />
          <button className="btn-primary" onClick={submitText}>
            Send
          </button>
        </div>
      )}

      {mastered && (
        <div className="card" style={{ borderColor: 'var(--success)' }}>
          🎉 Concept mastered! You demonstrated transfer to a new scenario.
        </div>
      )}
    </div>
  );
}
