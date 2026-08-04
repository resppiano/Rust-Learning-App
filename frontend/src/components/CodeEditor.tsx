import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { rust } from '@codemirror/lang-rust';
import { githubDark } from '@uiw/codemirror-theme-github';
import { apiClient, ExecuteResult } from '../api/client';

const DEFAULT_CODE = `fn main() {
    println!("Hello, Rust learner!");
}
`;

interface Props {
  initialCode?: string;
}

/** CodeMirror 6 editor with Rust syntax + a Run button wired to /api/execute. */
export default function CodeEditor({ initialCode = DEFAULT_CODE }: Props) {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<ExecuteResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiClient.execute(code);
      setResult(res);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div className="editor-wrap">
        <CodeMirror
          value={code}
          height="240px"
          theme={githubDark}
          extensions={[rust()]}
          onChange={(v) => setCode(v)}
        />
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn-primary" onClick={run} disabled={running}>
          {running ? 'Running…' : '▶ Run Code'}
        </button>
        <span className="muted">Runs on the official Rust Playground</span>
      </div>

      {error && <div className="output error">Error: {error}</div>}

      {result && (
        <div className={`output ${result.compiled ? 'success' : 'error'}`}>
          {result.compiled ? '✅ Compiled successfully\n\n' : '❌ Compilation failed\n\n'}
          {result.stdout && `--- stdout ---\n${result.stdout}\n`}
          {result.stderr && `--- stderr ---\n${result.stderr}\n`}
          {result.conceptHint && (
            <div style={{ marginTop: 10, color: 'var(--warning)' }}>
              💡 This looks related to <strong>{result.conceptHint.conceptName}</strong>:{' '}
              {result.conceptHint.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
