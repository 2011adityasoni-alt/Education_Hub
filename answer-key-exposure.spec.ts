/**
 * Guard rail: answer-key data (QuestionKey, correctOptionIds, numericAnswer, explanation) may only be
 * referenced from src/grading/ (Phase 8) and src/authoring/. Any other file touching it fails the build,
 * so a student-facing endpoint can't leak keys by accident.
 */
import { readdirSync, readFileSync, statSync } from 'fs';
import { join, relative, sep } from 'path';

const SRC = join(__dirname, '..');
const ALLOWED = [`grading${sep}`, `authoring${sep}`];
// `include: { key ... }` is how a Question's QuestionKey would be joined. (`select: { key }` on Role is legitimate, so it is not flagged.)
const FORBIDDEN = [/questionKey/i, /correctOptionIds/, /numericAnswer/, /numericTolerance/, /include:\s*\{[^}]*\bkey\b/];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.ts') && !p.endsWith('.spec.ts') ? [p] : [];
  });
}

describe('answer-key exposure guard', () => {
  const files = walk(SRC).filter((f) => !ALLOWED.some((a) => relative(SRC, f).startsWith(a)));
  it('scans at least one file', () => expect(files.length).toBeGreaterThan(5));
  it.each(files.map((f) => [relative(SRC, f), f]))('%s does not reference answer-key data', (_name, file) => {
    const text = readFileSync(file, 'utf8');
    for (const re of FORBIDDEN) expect(text).not.toMatch(re);
  });
});
