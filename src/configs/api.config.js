const API_BASE_URL = import.meta.env.VITE_API_URL || "https://77041c2b-0fb5-419c-b8b3-98dbf2736d71-00-2piotboaj43n9.picard.replit.dev/api";


const api = {
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    login: `${API_BASE_URL}/auth/login`,
    profile: `${API_BASE_URL}/auth/profile`,
    adminArea: `${API_BASE_URL}/auth/admin-area`,
  },
  users: {
    list: `${API_BASE_URL}/users`,
    create: `${API_BASE_URL}/auth/register`,
    update: (id) => `${API_BASE_URL}/users/${id}`,
    delete: (id) => `${API_BASE_URL}/users/${id}`,
  },

  surveys: {
    list: `${API_BASE_URL}/surveys`,
    create: `${API_BASE_URL}/surveys`,
    update: (id) => `${API_BASE_URL}/surveys/${id}`,
    delete: (id) => `${API_BASE_URL}/surveys/${id}`,
    getById: (id) => `${API_BASE_URL}/surveys/${id}`,
    getAnswers: (id) => `${API_BASE_URL}/surveys/${id}`, // endpoint ambil survey + jawaban
  },

  results: {
    getBySurvey: (id) => `${API_BASE_URL}/results/survey/${id}`,
    // New Routes for Grouped Respondents
    getRespondenList: (surveyId) => `${API_BASE_URL}/results/responden/${surveyId}`,
    getDetailJawaban: (submissionId) => `${API_BASE_URL}/results/submission/${submissionId}`,
    deleteSubmission: (submissionId) => `${API_BASE_URL}/results/submission/${submissionId}`,
    deleteAllBySurvey: (surveyId) => `${API_BASE_URL}/results/survey/${surveyId}`,
    submit: `${API_BASE_URL}/results`,
  },

  questions: {
    getBySurvey: (surveyId) => `${API_BASE_URL}/questions/survey/${surveyId}`,
    get: (id) => `${API_BASE_URL}/questions/${id}`,
    create: `${API_BASE_URL}/questions`,
    update: (id) => `${API_BASE_URL}/questions/${id}`,
    delete: (id) => `${API_BASE_URL}/questions/${id}`,
  },

  umkm: {
    list: `${API_BASE_URL}/umkm`,
    get: (id) => `${API_BASE_URL}/umkm/${id}`,
    create: `${API_BASE_URL}/umkm`,
    update: (id) => `${API_BASE_URL}/umkm/${id}`,
    delete: (id) => `${API_BASE_URL}/umkm/${id}`,
    uploadFiles: `${API_BASE_URL}/umkm`, // POST/PUT multipart/form-data
  },


};

export default api;
