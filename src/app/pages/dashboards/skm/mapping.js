// Helper to deterministically map survey questions to biodata and U1-U9 elements
export function mapQuestionsToIds(questions = [], questionMap = {}) {
  const elementQIdMap = new Array(9).fill(null);
  let genderQId = null;
  let eduQId = null;

  const getQIdByIndex = (idx) => {
    const q = questions && questions[idx];
    if (!q) return null;
    return q.id || q._id || q.pertanyaan_id || q.question_id || null;
  };

  if (questions && questions.length >= 5) {
    genderQId = getQIdByIndex(0);
    eduQId = getQIdByIndex(2);
    for (let i = 0; i < 9; i++) {
      elementQIdMap[i] = getQIdByIndex(5 + i);
    }
    return { genderQId, eduQId, elementQIdMap };
  }

  // Fallback: keyword based mapping from questionMap
  const questionIds = Object.keys(questionMap || {});
  questionIds.forEach(id => {
    const text = (questionMap[id].text || "").toLowerCase();
    if (text.includes("jenis kelamin")) genderQId = id;
    else if (text.includes("pendidikan")) eduQId = id;
    else if (text.includes("persyaratan")) elementQIdMap[0] = id;
    else if (text.includes("prosedur") || text.includes("kemudahan")) elementQIdMap[1] = id;
    else if (text.includes("waktu")) elementQIdMap[2] = id;
    else if (text.includes("biaya") || text.includes("tarif")) elementQIdMap[3] = id;
    else if (text.includes("produk") || (text.includes("spesifikasi") && !text.includes("jenis"))) elementQIdMap[4] = id;
    else if (text.includes("kompetensi") || text.includes("kemampuan")) elementQIdMap[5] = id;
    else if (text.includes("perilaku") || text.includes("sikap")) elementQIdMap[6] = id;
    else if (text.includes("pengaduan")) elementQIdMap[8] = id;
  });

  questionIds.forEach(id => {
    const text = (questionMap[id].text || "").toLowerCase();
    if (text.includes("sarana") && elementQIdMap[8] !== id) elementQIdMap[7] = id;
  });

  return { genderQId, eduQId, elementQIdMap };
}

export default mapQuestionsToIds;
