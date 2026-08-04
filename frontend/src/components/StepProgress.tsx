interface Props {
  current: number; // 1-based
  total: number;
}

/** 11-step planner progress bar. */
export default function StepProgress({ current, total }: Props) {
  return (
    <div>
      <div className="step-progress">
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const cls =
            n < current ? 'done' : n === current ? 'current' : '';
          return <div key={n} className={`step-dot ${cls}`} title={`Step ${n}`} />;
        })}
      </div>
      <p className="muted" style={{ marginTop: -8 }}>
        Step {Math.min(current, total)} of {total}
      </p>
    </div>
  );
}
