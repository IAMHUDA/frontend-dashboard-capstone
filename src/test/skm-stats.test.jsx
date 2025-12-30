import { describe, it, expect } from 'vitest';
import mapQuestionsToIds from '../../app/pages/dashboards/skm/mapping';

function getScore(text) {
  if (!text) return 0;
  const match = text.match(/^(\d+)/);
  if (match?.[1]) return Number.parseInt(match[1]);
  const lower = String(text).toLowerCase();
  if (lower.includes('sangat')) return 4;
  if (lower.includes('tidak')) return 1;
  if (lower.includes('kurang')) return 2;
  if (lower.includes('baik') || lower.includes('sesuai') || lower.includes('mudah')) return 3;
  return 0;
}

describe('SKM stats calculation', () => {
  it('computes non-zero element scores and biodata counts from sample answers', () => {
    // Prepare questions q1..q14
    const questions = Array.from({ length: 14 }).map((_, i) => ({ id: `q${i+1}` }));

    // Create answers: q1 gender (L), q3 pendidikan S1, q6..q14 have numeric answers
    const answers = [];
    answers.push({ pertanyaan_id: 'q1', jawaban: 'L', pertanyaan: { teks: 'Jenis Kelamin' } });
    answers.push({ pertanyaan_id: 'q3', jawaban: 'S1', pertanyaan: { teks: 'Pendidikan' } });

    // U1..U9 -> q6..q14 : use '3. Sesuai' (score 3)
    for (let i = 6; i <= 14; i++) {
      answers.push({ pertanyaan_id: `q${i}`, jawaban: '3. Sesuai', pertanyaan: { teks: `Q${i}` } });
    }

    // Build questionMap like in the component
    const questionMap = {};
    for (const a of answers) {
      const qId = a.pertanyaan_id;
      const score = getScore(a.jawaban);
      if (!questionMap[qId]) questionMap[qId] = { text: a.pertanyaan?.teks || '', answers: [] };
      questionMap[qId].answers.push({ val: a.jawaban, score });
    }

    const { genderQId, eduQId, elementQIdMap } = mapQuestionsToIds(questions, questionMap);

    // Validate gender and education
    expect(genderQId).toBe('q1');
    expect(eduQId).toBe('q3');

    const genderAnswers = genderQId ? (questionMap[String(genderQId)] || { answers: [] }).answers : [];
    expect(genderAnswers.length).toBe(1);

    // Compute element stats
    const elements = new Array(9).fill(null).map((_, index) => {
      const qKey = elementQIdMap[index];
      const qData = qKey ? (questionMap[String(qKey)] || { answers: [] }) : { answers: [] };
      const scores = qData.answers.map(a => a.score);
      const totalScore = scores.reduce((a,b)=>a+b,0);
      const count = scores.length || 1;
      const avg = totalScore / count;
      const indexValue = avg * 25;
      return { avgScore: avg, value: indexValue };
    });

    // All U1..U9 should have avgScore > 0 and value > 0
    for (const el of elements) {
      expect(el.avgScore).toBeGreaterThan(0);
      expect(el.value).toBeGreaterThan(0);
    }
  });

  it('handles payload where answers contain nested pertanyaan.id instead of pertanyaan_id', () => {
    const questions = Array.from({ length: 14 }).map((_, i) => ({ id: i + 49 })); // ids 49..62 match real payload

    const answers = [];
    answers.push({ id: 31, jawaban: 'L', pertanyaan: { id: 49, teks: 'Jenis Kelamin' } });
    answers.push({ id: 36, jawaban: '3. Sesuai', pertanyaan: { id: 54, teks: 'Persyaratan' } });
    answers.push({ id: 37, jawaban: '3. Mudah', pertanyaan: { id: 55, teks: 'Prosedur' } });
    // Build questionMap
    const questionMap = {};
    for (const a of answers) {
      const possibleId = a.pertanyaan_id ?? a.pertanyaan?.id ?? a.pertanyaan?._id ?? a.pertanyaan?.pertanyaan_id ?? a.pertanyaan?.question_id ?? a.pertanyaan?.urutan;
      const qId = possibleId !== undefined && possibleId !== null ? String(possibleId) : String(a.pertanyaan?.teks || 'unknown');
      const score = (() => {
        const match = String(a.jawaban).match(/^(\d+)/);
        if (match?.[1]) return Number.parseInt(match[1]);
        return 0;
      })();
      if (!questionMap[qId]) questionMap[qId] = { text: a.pertanyaan?.teks || '', answers: [] };
      questionMap[qId].answers.push({ val: a.jawaban, score });
    }

    const { genderQId, eduQId, elementQIdMap } = mapQuestionsToIds(questions, questionMap);
    expect(genderQId).toBe(String(49));
    expect(elementQIdMap[0]).toBe(String(54));
    expect(elementQIdMap[1]).toBe(String(55));
  });
});
