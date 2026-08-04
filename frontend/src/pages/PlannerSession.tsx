import { useEffect, useState } from 'react';
import { apiClient, Exercise } from '../api/client';
import { usePlannerStore } from '../store/plannerStore';
import StepProgress from '../components/StepProgress';
import ChoiceCard from '../components/ChoiceCard';
import CodeEditor from '../components/CodeEditor';

export default function PlannerSession() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const {
    sessionId,
    exercise,
    currentStep,
    plan,
    totalSteps,
    complete,
    feedback,
    discussionPrompts,
    loading,
    error,
    start,
    respond,
    reset,
  } = usePlannerStore();

  useEffect(() => {
    apiClient.listExercises().then(setExercises).catch(() => setExercises([]));
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setPicked(null);
  }, [currentStep?.state]);

  const choose = async (id: string) => {
    if (picked) return;
    setPicked(id);
    // brief reveal delay so the user sees rationale before advancing
    setTimeout(() => respond(id), 1200);
  };

  if (!sessionId) {
    return (
      <div className="container">
        <h2>Planner Mode — pick an exercise</h2>
        <p className="muted">
          You will decompose the problem in 11 deterministic steps before coding.
        </p>
        <div className="grid">
          {exercises.map((ex) => (
            <div className="card" key={ex.id}>
              <h3>{ex.title}</h3>
              <p className="muted">{ex.description}</p>
              <span className="badge">{ex.difficulty_level}</span>{' '}
              {ex.concept_name && <span className="badge">{ex.concept_name}</span>}
              <div style={{ marginTop: 12 }}>
                <button className="btn-primary" onClick={() => start(ex.id)}>
                  Plan this →
                </button>
              </div>
            </div>
          ))}
          {exercises.length === 0 && (
            <p className="spinner">Loading exercises… (is the backend running?)</p>
          )}
        </div>
        {error && <div className="output error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <h2 style={{ margin: 0 }}>{exercise?.title}</h2>
        <div className="spacer" />
        <button onClick={() => reset()}>← Choose another</button>
      </div>
      <p className="muted">{exercise?.problem_statement}</p>

      <StepProgress
        current={currentStep?.stepNumber ?? totalSteps}
        total={totalSteps}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div>
          {!complete && currentStep && (
            <div className="card">
              <h3>{currentStep.question}</h3>
              {currentStep.options.map((o) => (
                <ChoiceCard
                  key={o.id}
                  option={o}
                  disabled={Boolean(picked) || loading}
                  revealed={Boolean(picked)}
                  selected={picked === o.id}
                  onSelect={choose}
                />
              ))}
              {loading && <p className="spinner">Loading next step…</p>}
            </div>
          )}

          {complete && (
            <div className="card" style={{ borderColor: 'var(--success)' }}>
              <h3>✅ Plan complete!</h3>
              <p className="muted">{feedback}</p>
              {discussionPrompts.length > 0 && (
                <>
                  <h4>Reflection questions</h4>
                  <ul>
                    {discussionPrompts.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                </>
              )}
              <button
                className="btn-primary"
                onClick={() => setShowEditor((v) => !v)}
              >
                {showEditor ? 'Hide editor' : '▶ Now write the Rust code'}
              </button>
              {showEditor && (
                <div style={{ marginTop: 16 }}>
                  <CodeEditor />
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="card">
            <h3>Your plan</h3>
            {plan.length === 0 && <p className="muted">Choices appear here…</p>}
            <ol style={{ paddingLeft: 18, margin: 0 }}>
              {plan.map((p, i) => (
                <li key={i} style={{ marginBottom: 8, fontSize: 14 }}>
                  {p}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      {error && <div className="output error">{error}</div>}
    </div>
  );
}
