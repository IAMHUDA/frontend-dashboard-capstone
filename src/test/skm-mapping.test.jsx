import { describe, it, expect } from 'vitest';
import { mapQuestionsToIds } from '../../app/pages/dashboards/skm/mapping';

describe('SKM mapping helper', () => {
  it('maps positions to biodata and U1-U9 when questions present', () => {
    const questions = Array.from({ length: 14 }).map((_, i) => ({ id: `q${i+1}` }));
    const { genderQId, eduQId, elementQIdMap } = mapQuestionsToIds(questions, {});

    expect(genderQId).toBe('q1');
    expect(eduQId).toBe('q3');
    expect(elementQIdMap[0]).toBe('q6');
    expect(elementQIdMap[8]).toBe('q14');
  });

  it('falls back to keyword mapping when questions list not available', () => {
    const questionMap = {
      a: { text: 'Jenis Kelamin' },
      b: { text: 'Usia' },
      c: { text: 'Pendidikan' },
      d: { text: 'Persyaratan layanan' },
      e: { text: 'Pengaduan / saran' },
    };
    const { genderQId, eduQId, elementQIdMap } = mapQuestionsToIds([], questionMap);

    expect(genderQId).toBe('a');
    expect(eduQId).toBe('c');
    expect(elementQIdMap[0]).toBe('d');
    expect(elementQIdMap[8]).toBe('e');
  });
});
