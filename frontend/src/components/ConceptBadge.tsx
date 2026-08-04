interface Props {
  status: 'mastered' | 'learning' | 'not_started' | string;
  label?: string;
}

const ICON: Record<string, string> = {
  mastered: '✅',
  learning: '📖',
  not_started: '◻️',
};

const TEXT: Record<string, string> = {
  mastered: 'Mastered',
  learning: 'Learning',
  not_started: 'Not started',
};

/** Concept mastery badge. */
export default function ConceptBadge({ status, label }: Props) {
  return (
    <span className={`badge ${status}`}>
      {ICON[status] ?? '•'} {label ?? TEXT[status] ?? status}
    </span>
  );
}
