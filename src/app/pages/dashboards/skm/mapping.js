/**
 * Utility to map survey questions to dashboard elements dynamically.
 * Instead of hardcoding 9 elements, it maps all non-biodata questions to a dynamic array.
 */
export const mapQuestionsToIds = (questions, questionMap = {}) => {
    let genderQ = null;
    let eduQ = null;
    const skmElements = [];
  
    const getQId = (q) => {
      if (!q) return null;
      const rawId = q.id || q._id || q.pertanyaan_id || q.question_id || null;
      return rawId ? String(rawId) : null;
    }
  
    // 1. Identify Biodata first (usually first 5 questions or specific keywords)
    // const biodataKeywords = ["jenis kelamin", "gender", "pendidikan", "usia", "umur", "pekerjaan", "jenis layanan"];
    
    // Merge with fallback questions (discovered from answers) if any
    let combinedQuestions = [...(Array.isArray(questions) ? questions : [])];
    if (Array.isArray(questionMap)) { // In case it's passed as an array of fallbacks
        combinedQuestions = [...combinedQuestions, ...questionMap];
    }

    const seenIds = new Set();
    const seenTexts = new Set();
    const sortedQuestions = [];

    // Deduplicate and prioritize original questions
    combinedQuestions.forEach(q => {
        const id = getQId(q);
        const text = (q.teks || q.text || "").trim().toLowerCase();
        if (id && seenIds.has(id)) return;
        if (!id && seenTexts.has(text)) return;
        
        if (id) seenIds.add(id);
        if (text) seenTexts.add(text);
        sortedQuestions.push(q);
    });

    sortedQuestions.sort((a,b) => {
        const orderA = Number(a.urutan || a.order || 0);
        const orderB = Number(b.urutan || b.order || 0);
        if (orderA !== orderB) return orderA - orderB;
        return Number(a.id || a._id || 0) - Number(b.id || b._id || 0);
    });

    sortedQuestions.forEach((q, idx) => {
        const id = getQId(q);
        const rawText = q.teks || q.text || "";
        const text = rawText.trim().toLowerCase();
        
        // Determine Question Number (1-based)
        // Order/Urutan property is preferred, fallback to array index + 1
        const qNum = Number(q.urutan || q.order || (idx + 1));

        // 1. Identify Demographic (Biodata) - Usually Q1 to Q5
        // const isDemographic = qNum <= 5;
        
        // For Specific Charts
        const isGender = text.includes("jenis kelamin") || text.includes("gender") || text.includes("kelamin") || qNum === 1;
        const isEducation = text.includes("pendidikan") || text.includes("studi") || text.includes("sekolah") || qNum === 3;

        if (isGender) {
            genderQ = { id, text: rawText, qNum, ...q };
        } else if (isEducation) {
            eduQ = { id, text: rawText, qNum, ...q };
        }
        
        // 2. Identify SKM Elements (U1-U9) - Specifically Q6 to Q14
        // Logic: Questions 6 through 14 are strictly SKM Service Elements
        if (qNum >= 6 && qNum <= 14 && rawText.trim() !== "") {
            const uIndex = skmElements.length + 1;
            const qData = questionMap[id] || {};
            skmElements.push({
                id,
                qNum,
                code: `U${uIndex}`,
                name: rawText || qData.text || "Element",
                text: rawText,
                ...qData
            });
        }
    });
  
    return { genderQ, eduQ, skmElements };
  }
