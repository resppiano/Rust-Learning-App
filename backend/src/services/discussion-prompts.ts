import { chat, ChatMessage, parseJson } from './llm';
import { retrieveContext, formatContext } from './rag';

/**
 * Generates post-session reflection questions to consolidate learning. Uses
 * RAG context so questions stay grounded in the book's framing of the concept.
 */
export async function generateDiscussionPrompts(
  conceptName: string,
  count = 3
): Promise<string[]> {
  const chunks = await retrieveContext(
    `reflection questions about ${conceptName} in Rust`,
    4
  );
  const context = formatContext(chunks);

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content:
        'You write short Socratic reflection questions for a Rust learner who ' +
        'just finished studying a concept. Questions must promote transfer and ' +
        'self-explanation, never ask for a definition. Ground them in the ' +
        `following book excerpts when relevant:\n\n${context}\n\n` +
        'Respond ONLY with JSON: {"questions": string[]}.',
    },
    {
      role: 'user',
      content: `Concept: ${conceptName}. Give ${count} reflection questions.`,
    },
  ];

  try {
    const raw = await chat(messages, { json: true, temperature: 0.6 });
    const parsed = parseJson<{ questions: string[] }>(raw);
    return parsed.questions.slice(0, count);
  } catch {
    return [
      `Where else in a program might ${conceptName} change your design?`,
      `What is a mistake a beginner makes with ${conceptName}, and why?`,
      `How would you explain ${conceptName} to someone using a real-world analogy?`,
    ].slice(0, count);
  }
}
