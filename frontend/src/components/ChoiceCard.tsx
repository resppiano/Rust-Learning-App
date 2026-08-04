import { ChoiceOption } from '../api/client';

interface Props {
  option: ChoiceOption;
  disabled?: boolean;
  revealed?: boolean; // when true, show correct/incorrect styling + rationale
  selected?: boolean;
  onSelect: (id: string) => void;
}

/** A single forced-choice option card (A/B/C/D). */
export default function ChoiceCard({
  option,
  disabled,
  revealed,
  selected,
  onSelect,
}: Props) {
  let cls = 'choice';
  if (revealed) {
    if (option.correct) cls += ' correct';
    else if (selected) cls += ' incorrect';
  }

  return (
    <button
      className={cls}
      disabled={disabled}
      onClick={() => onSelect(option.id)}
    >
      <span className="letter">{option.id}</span>
      <span>
        {option.text}
        {revealed && (
          <span className="rationale">
            {option.correct ? '✓ ' : '✗ '}
            {option.rationale}
          </span>
        )}
      </span>
    </button>
  );
}
