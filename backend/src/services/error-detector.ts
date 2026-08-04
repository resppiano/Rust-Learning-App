/**
 * Maps common Rust compiler error codes / messages to the concept they most
 * likely test. Used to turn a failed code run into a teaching opportunity by
 * suggesting a Mentor session on the relevant concept.
 */

export interface ErrorMapping {
  /** Rust error code, e.g. "E0382", or a substring matcher. */
  code: string;
  pattern: RegExp;
  conceptName: string;
  explanation: string;
}

export const ERROR_MAPPINGS: ErrorMapping[] = [
  {
    code: 'E0382',
    pattern: /borrow of moved value|value (used|moved) here|use of moved value/i,
    conceptName: 'Ownership',
    explanation:
      'A value was moved and then used again. This is about ownership and move semantics.',
  },
  {
    code: 'E0502',
    pattern: /cannot borrow .* as (mutable|immutable) because/i,
    conceptName: 'Borrowing',
    explanation:
      'Conflicting borrows — you cannot have a mutable and immutable borrow active at once.',
  },
  {
    code: 'E0499',
    pattern: /cannot borrow .* as mutable more than once/i,
    conceptName: 'Borrowing',
    explanation: 'Two mutable borrows are active at the same time.',
  },
  {
    code: 'E0106',
    pattern: /missing lifetime specifier/i,
    conceptName: 'Lifetimes',
    explanation: 'The compiler cannot infer how long a reference should live.',
  },
  {
    code: 'E0308',
    pattern: /mismatched types/i,
    conceptName: 'Variables & Mutability',
    explanation: 'A type mismatch — the expected and found types differ.',
  },
  {
    code: 'E0384',
    pattern: /cannot assign twice to immutable variable/i,
    conceptName: 'Variables & Mutability',
    explanation: 'You reassigned an immutable binding — it needs `mut`.',
  },
  {
    code: 'E0277',
    pattern: /the trait .* is not implemented|doesn't implement/i,
    conceptName: 'Traits',
    explanation: 'A required trait bound is not satisfied for this type.',
  },
  {
    code: 'E0433',
    pattern: /failed to resolve|use of undeclared/i,
    conceptName: 'Collections',
    explanation: 'A path/module could not be resolved — check imports and names.',
  },
  {
    code: 'unwrap',
    pattern: /called `Option::unwrap\(\)`|called `Result::unwrap\(\)`|panicked at/i,
    conceptName: 'Error Handling',
    explanation:
      'A panic from unwrap — this concept is about handling Option/Result properly.',
  },
];

export interface DetectedError {
  conceptName: string;
  code: string;
  explanation: string;
}

/** Inspect compiler stderr and return the best-matching concept, if any. */
export function detectConcept(stderr: string): DetectedError | null {
  if (!stderr) return null;
  for (const m of ERROR_MAPPINGS) {
    if (stderr.includes(m.code) || m.pattern.test(stderr)) {
      return {
        conceptName: m.conceptName,
        code: m.code,
        explanation: m.explanation,
      };
    }
  }
  return null;
}
