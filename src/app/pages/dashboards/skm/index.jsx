import { useState, useMemo, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { useQuery } from "@tanstack/react-query";
import axios from "utils/axios";
import api from "configs/api.config";
import {
    UserGroupIcon,
} from "@heroicons/react/24/solid";
import { mapQuestionsToIds } from './mapping';

// --- Constants & Helpers ---
const COLORS = [
    '#FFD700', // Vibrant Yellow
    '#FF007F', // Bright Pink
    '#39FF14', // Neon Green
    '#FF8C00', // Intense Orange
    '#BF00FF', // Electric Purple
    '#00BFFF', // Sky Blue
    '#FF1A1A', // Brilliant Red
    '#00FF7F', // Spring Green
    '#E91E63', // Deep Pink
    '#FFFF00', // Yellow
    '#5A52D5', // Indigo
    '#FA8072', // Salmon
    '#20B2AA', // Light Sea Green
    '#F0E68C', // Khaki
];

const ANSWER_MAP = {
    "Tidak Sesuai": 1, "Tidak Baik": 1,
    "Kurang Sesuai": 2, "Kurang Baik": 2,
    "Sesuai": 3, "Baik": 3,
    "Sangat Sesuai": 4, "Sangat Baik": 4,
};

const getScore = (text) => {
    if (!text) return 0;

    // 1. Check if answer starts with a number (e.g., "3. Sesuai")
    const match = text.match(/^(\d+)/);
    if (match?.[1]) {
        return Number.parseInt(match[1]);
    }

    // 2. Fallback to text matching
    if (ANSWER_MAP[text]) return ANSWER_MAP[text];

    const lower = text.toLowerCase();
    if (lower.includes("sangat")) return 4;

    // Check negatives first
    if (lower.includes("tidak")) return 1;
    if (lower.includes("kurang")) return 2;

    // Positive fallbacks
    if (lower.includes("baik") || lower.includes("sesuai") || lower.includes("mudah")) return 3;

    return 0; // Unknown
}

const getGrade = (value) => {
    if (value >= 88.31) return "A";
    if (value >= 76.61) return "B";
    if (value >= 65.01) return "C";
    return "D";
};

const getShortName = (text, fallback) => {
    if (!text || text.trim() === "") return fallback;
    const lower = text.toLowerCase();
    
    // Only shorten if it looks like a long question sentence (length > 30)
    // If it's already short (like "awokaowka" or "Pendaftaran"), keep it as is.
    if (text.length > 30) {
        if (lower.includes("persyaratan")) return "Persyaratan";
        if (lower.includes("prosedur") || lower.includes("kemudahan")) return "Prosedur";
        if (lower.includes("waktu")) return "Waktu Layanan";
        if (lower.includes("biaya") || lower.includes("tarif")) return "Biaya/Tarif";
        if (lower.includes("produk") || lower.includes("spesifikasi")) return "Produk Layanan";
        if (lower.includes("kompetensi") || lower.includes("kemampuan")) return "Kompetensi";
        if (lower.includes("perilaku") || lower.includes("sikap") || lower.includes("sopan")) return "Perilaku";
        if (lower.includes("sarana") || lower.includes("prasarana")) return "Sarana";
        if (lower.includes("pengaduan") || lower.includes("saran") || lower.includes("media")) return "Pengaduan";
    }
    
    // Truncate if still too long
    return text.length > 40 ? text.substring(0, 37) + "..." : text;
}

export default function SKMDashboard() {
    const [selectedSurveyId, setSelectedSurveyId] = useState(null);

    // --- 1. Fetch Survey List (Selection Mode) ---
    const { data: surveyList = [], isLoading: isLoadingList } = useQuery({
        queryKey: ["surveys"],
        queryFn: async () => {
            const res = await axios.get(api.surveys.list);
            const data = res.data?.data || res.data;
            console.log("Dashboard Survey List:", data);
            return Array.isArray(data) ? data : [];
        },
    });

    // --- 2. Fetch Survey Results (Robust Multi-step Flow) ---
    const { data: surveyData, isLoading: isLoadingResult } = useQuery({
        queryKey: ["surveyResult", selectedSurveyId],
        queryFn: async () => {
            if (!selectedSurveyId) return null;
            
            try {
                // 1. Fetch List of Respondents
                const resList = await axios.get(api.results.getRespondenList(selectedSurveyId));
                const respondentList = Array.isArray(resList.data.data) ? resList.data.data : (Array.isArray(resList.data) ? resList.data : []);
                
                console.log(`Found ${respondentList.length} respondents for survey ${selectedSurveyId}`);
                if (respondentList.length === 0) return { jawaban: [], respondentCount: 0 };

                // 2. Fetch All Details in Parallel
                const detailsPromises = respondentList.map(resp => 
                    axios.get(api.results.getDetailJawaban(resp.submissionId))
                         .then(res => {
                             const answers = res.data.data || res.data;
                             return Array.isArray(answers) ? answers : [];
                         })
                         .catch(err => {
                             console.error(`Failed to fetch details for ${resp.submissionId}`, err);
                             return [];
                         })
                );
                
                const answersArrays = await Promise.all(detailsPromises);
                const flatAnswers = answersArrays.flat();
                
                return {
                    jawaban: flatAnswers,
                    respondentCount: respondentList.length
                };
            } catch (err) {
                console.error("Error in robust fetch:", err);
                // Fallback to simpler fetch if respondents fail
                const res = await axios.get(api.results.getBySurvey(selectedSurveyId));
                return res.data?.data || res.data;
            }
        },
        enabled: !!selectedSurveyId,
    });

    // --- 2b. Fetch Questions ---
    const { data: questions = [], isLoading: isLoadingQuestions } = useQuery({
        queryKey: ["surveyQuestions", selectedSurveyId],
        queryFn: async () => {
            if (!selectedSurveyId) return [];
            const res = await axios.get(api.questions.getBySurvey(selectedSurveyId));
            const data = res.data?.data || res.data;
            // Sort by urutan, then by ID to match database order stably
            return Array.isArray(data) 
                ? [...data].sort((a, b) => {
                    const orderA = Number(a.urutan || a.order || 0);
                    const orderB = Number(b.urutan || b.order || 0);
                    if (orderA !== orderB) return orderA - orderB;
                    return Number(a.id || a._id || 0) - Number(b.id || b._id || 0);
                }) 
                : [];
        },
        enabled: !!selectedSurveyId,
    });

    const { genderQ, eduQ, skmElements } = useMemo(() => {
        // Extract fallback questions from answers to ensure all answered questions are captured
        // This is a "database-first" discovery approach similar to HasilSurvey rekap
        const answers = Array.isArray(surveyData?.jawaban) ? surveyData.jawaban : [];
        const fallbackQs = [];
        const seenFq = new Set();
        
        answers.forEach(ans => {
            if (ans.pertanyaan) {
                const q = ans.pertanyaan;
                const id = q.id || q._id || ans.pertanyaan_id;
                const text = (q.teks || q.text || "").trim().toLowerCase();
                const key = id ? String(id) : `txt_${text}`;
                
                if (text !== "" && !seenFq.has(key)) {
                    seenFq.add(key);
                    fallbackQs.push({ ...q, id: id });
                }
            }
        });

        return mapQuestionsToIds(questions, fallbackQs);
    }, [questions, surveyData]);

    // --- Calculation Logic ---
    const stats = useMemo(() => {
        if (!surveyData) return null;

        // surveyData could be { jawaban: [], respondentCount: X } or just []
        const answers = Array.isArray(surveyData.jawaban) ? surveyData.jawaban : (Array.isArray(surveyData) ? surveyData : []);
        const totalRespondents = surveyData.respondentCount ?? (surveyData.totalRespondents ?? 0);
        
        // If totalRespondents is missing but we have answers, we can estimate from unique submission IDs
        const uniqueSubmissions = new Set(answers.map(a => a.submissionId || a.id)).size;
        const finalRespondentCount = totalRespondents || uniqueSubmissions;

        // 1. Group answers by Question ID and Text for robust matching
        const questionMapLocal = {};
        const textToIdMap = {}; // Helper to match by text if ID is missing

        answers.forEach(ans => {
            const rawId = ans.pertanyaan_id ?? ans.pertanyaan?.id;
            const qRawText = (ans.pertanyaan?.teks || ans.pertanyaan?.text || "");
            const qText = qRawText.trim().toLowerCase();
            const qId = (rawId !== undefined && rawId !== null) ? String(rawId) : `text_${qText}`;
            
            if (rawId) textToIdMap[qText] = String(rawId);
            
            const score = getScore(ans.jawaban);

            if (!questionMapLocal[qId]) {
                questionMapLocal[qId] = {
                    text: ans.pertanyaan?.teks || "",
                    answers: [],
                    availableOptions: ans.pertanyaan?.opsi || []
                };
            }
            questionMapLocal[qId].answers.push({
                val: ans.jawaban,
                score: score
            });
        });

        // Helper to get answers with ID and Text fallback
        const getAnswersForQ = (q) => {
            if (!q) return [];
            // Try ID first
            let data = questionMapLocal[String(q.id)];
            // If not found, try by text (trimmed & lowercase)
            if (!data) {
                const qText = (q.teks || q.text || q.name || "").trim().toLowerCase();
                const idFromText = textToIdMap[qText];
                data = questionMapLocal[idFromText] || questionMapLocal[`text_${qText}`];
            }
            return data?.answers || [];
        };

        // 2. Generate SKM Element results from the dynamic skmElements array
        const elementResults = skmElements.map((elem, i) => {
            const qAnswers = getAnswersForQ(elem);
            
            const sumScore = qAnswers.reduce((sum, a) => sum + a.score, 0);
            const avg = qAnswers.length > 0 ? sumScore / qAnswers.length : 0;
            const indexValue = avg * 25;

            // Use getShortName for visual cleanliness but default to actual question text
            const dynamicName = getShortName(elem.text || elem.name, elem.name);

            return { 
                ...elem,
                code: `U${i+1}`,
                name: dynamicName,
                color: COLORS[i % COLORS.length], // Cycle through colors
                value: indexValue, 
                avgScore: avg 
            };
        });

        // 3. Overall SKM Index
        const validElements = elementResults.filter(e => e.avgScore > 0);
        const ikmValue = validElements.length > 0
            ? validElements.reduce((acc, curr) => acc + curr.value, 0) / validElements.length
            : 0;

        // 4. Biodata: Gender
        const genderAnswers = getAnswersForQ(genderQ);
        const maleCount = genderAnswers.filter(a => {
            const val = String(a.val).toLowerCase();
            return val === 'l' || val.includes('laki') || val.includes('pria');
        }).length;
        const femaleCount = genderAnswers.filter(a => {
            const val = String(a.val).toLowerCase();
            return val === 'p' || val.includes('perempuan') || val.includes('wanita');
        }).length;

        // 5. Biodata: Education
        const eduAnswers = getAnswersForQ(eduQ);
        const EDU_CATEGORIES = [
            { key: "S2", display: "S2", keywords: ["s2", "magister"] },
            { key: "S1", display: "D4/S1", keywords: ["s1", "d4", "sarjana"] },
            { key: "SMA", display: "SMA", keywords: ["sma", "smk", "slta", "aliyah"] },
            { key: "SMP", display: "SMP", keywords: ["smp", "sltp", "tsanawiyah"] },
            { key: "SD", display: "SD", keywords: ["sd", "mi", "dasar"] }
        ];

        const eduStats = {
            Total: eduAnswers.length || 1,
            distributions: EDU_CATEGORIES.map(cat => ({
                label: cat.display,
                count: eduAnswers.filter(a => {
                    const v = String(a.val).toLowerCase();
                    return cat.keywords.some(k => v.includes(k));
                }).length,
                color: cat.key === "S2" ? "bg-blue-800" : 
                       cat.key === "S1" ? "bg-green-600" :
                       cat.key === "SMA" ? "bg-yellow-500" :
                       cat.key === "SMP" ? "bg-pink-600" : "bg-purple-600"
            }))
        };

        return {
            totalRespondents: Math.floor(finalRespondentCount),
            gender: { male: maleCount, female: femaleCount },
            education: eduStats,
            ikm: ikmValue,
            ikmGrade: getGrade(ikmValue),
            elements: elementResults
        };
    }, [surveyData, skmElements, genderQ, eduQ]);

    // --- UMKM Stats (Dynamic) ---
    const { data: umkmList = [] } = useQuery({
        queryKey: ["umkm"],
        queryFn: async () => {
            const res = await axios.get(api.umkm.list);
            return Array.isArray(res.data) ? res.data : [];
        }
    });

    const umkmStats = useMemo(() => {
        const total = umkmList.length;
        const jangkauanCounts = {};
        umkmList.forEach(u => {
            const range = u.jangkauanPemasaran || "Lokal";
            jangkauanCounts[range] = (jangkauanCounts[range] || 0) + 1;
        });
        return {
            total,
            chart: { series: Object.values(jangkauanCounts), labels: Object.keys(jangkauanCounts) }
        };
    }, [umkmList]);

    // --- Auto-Select ---
    useEffect(() => {
        if (surveyList.length > 0 && !selectedSurveyId) {
            setSelectedSurveyId(surveyList[0].id);
        }
    }, [surveyList, selectedSurveyId]);

    // --- Charts configs ---
    const chartOptions = useMemo(() => ({
        chart: {
            type: 'polarArea',
            toolbar: { show: false },
            background: 'transparent',
            foreColor: '#ffffff'
        },
        colors: stats?.elements?.map(e => e.color) || COLORS,
        labels: stats?.elements?.map(e => `${e.code} ${e.name}`) || [],
        fill: {
            opacity: 1.0
        },
        stroke: {
            width: 2,
            colors: ['#00809D'] // Match background for a "cutout" look or use white
        },
        plotOptions: {
            polarArea: {
                rings: {
                    strokeWidth: 1,
                    strokeColor: 'rgba(255,255,255,0.1)'
                },
                spokes: {
                    strokeWidth: 1,
                    connectorColor: 'rgba(255,255,255,0.1)'
                }
            }
        },
        yaxis: {
            show: false
        },
        legend: {
            position: 'bottom',
            labels: {
                colors: stats?.elements?.map(() => '#ffffff') || '#ffffff',
                useSeriesColors: false
            }
        },
        theme: {
            monochrome: {
                enabled: false,
            }
        },
    }), [stats]);

    const chartSeries = useMemo(() => stats?.elements?.map(e => e.value) || [], [stats]);

    const umkmChartOptions = {
        chart: { type: "pie", toolbar: { show: false }, background: 'transparent' },
        labels: umkmStats.chart.labels,
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
        legend: { position: 'bottom' },
        dataLabels: { enabled: true },
        tooltip: { theme: 'light' }
    };

    const mainLoading = isLoadingList || isLoadingResult || isLoadingQuestions;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 pb-20">
            {/* Force legend text to white for ApexCharts */}
            <style dangerouslySetInnerHTML={{ __html: `
                .apexcharts-legend-text {
                    color: #ffffff !important;
                    fill: #ffffff !important;
                }
                .apexcharts-canvas text {
                    fill: #ffffff !important;
                }
                .apexcharts-datalabel, .apexcharts-datalabel-label, .apexcharts-datalabel-value {
                    fill: #ffffff !important;
                }
                /* Custom Dropdown Styling */
                select option {
                    color: #000000 !important;
                    background-color: #ffffff !important;
                }
                select option:hover, select option:focus {
                    background-color: #10b981 !important;
                    color: #ffffff !important;
                }
            `}} />
            
            {/* Header / Filter */}
            <div className="bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-black dark:text-white uppercase">Dashboard Survey & UMKM</h1>
                        <p className="text-xs text-black dark:text-white font-medium">Kalurahan Imogiri, Kabupaten Bantul</p>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-dark-700 p-1 rounded-xl border border-gray-200 dark:border-dark-600">
                        <span className="text-[10px] font-bold text-gray-400 uppercase px-2 font-mono">Pilih Survey:</span>
                        <select 
                            className="bg-transparent border-none text-sm font-bold text-black hover:text-green-600 dark:text-gray-200 dark:hover:text-green-400 focus:ring-0 cursor-pointer min-w-[200px] transition-colors duration-200"
                            value={selectedSurveyId || ""}
                            onChange={(e) => setSelectedSurveyId(e.target.value)}
                        >
                            <option value="" className="text-black">-- Pilih Survey --</option>
                            {surveyList.map(s => (
                                <option key={s.id} value={s.id} className="text-black">{s.namaSurvey || s.judul || s.title || `Survey #${s.id}`}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {!selectedSurveyId ? (
                <div className="flex flex-col items-center justify-center h-[60vh] max-w-7xl mx-auto">
                    <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-4">
                        <UserGroupIcon className="w-10 h-10 text-teal-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Selamat Datang di SKM Dashboard</h2>
                    <p className="text-gray-500 text-sm mt-2 text-center max-w-md">Silakan pilih salah satu kuesioner survey di atas untuk melihat visualisasi data kepuasan masyarakat.</p>
                </div>
            ) : mainLoading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
            ) : !stats || stats.totalRespondents === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-dashed border-gray-300 dark:border-dark-700 max-w-7xl mx-auto mt-8 p-6">
                   <p className="text-gray-500 mb-2">Belum ada data responden untuk survey ini.</p>
                   <p className="text-xs text-gray-400">Silakan isi kuisioner terlebih dahulu atau pilih survey lain.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 max-w-7xl mx-auto relative z-10 mb-12 mt-8">
                    <div className="lg:col-span-8 relative flex flex-col items-center justify-center min-h-[500px]">
                        <div className="w-full max-w-2xl bg-[#00809D] rounded-3xl p-6 shadow-xl relative overflow-hidden">
                            <div className="absolute z-10 pointer-events-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                <div className="flex flex-col items-center justify-center rounded-full bg-teal-600 p-8 shadow-2xl w-48 h-48 border-4 border-white transform hover:scale-105 transition-transform duration-500">
                                    <h4 className="text-lg font-bold text-white uppercase text-center leading-tight">Indeks</h4>
                                    <span className="text-4xl font-extrabold text-white">{stats.ikm.toFixed(2)}</span>
                                </div>
                            </div>
                            <ReactApexChart options={chartOptions} series={chartSeries} type="polarArea" height={550} />
                        </div>

                        <div className="w-full max-w-2xl mt-6 bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-dark-700">
                            <h3 className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg text-center uppercase mb-4 text-sm shadow-md">Pendidikan Responden</h3>
                            <div className="space-y-3">
                                {stats.education.distributions.map((item, idx) => (
                                    <EduBar key={idx} label={item.label} count={item.count} total={stats.education.Total} color={item.color} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-dark-700">
                            <h3 className="bg-teal-600 text-white font-bold py-2 px-4 rounded-lg text-center uppercase mb-4 text-sm shadow-md">Mutu Pelayanan</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {stats.elements.map(el => {
                                    const grade = el.value >= 88.31 ? 'A' : el.value >= 76.61 ? 'B' : el.value >= 65.0 ? 'C' : 'D';
                                    return (
                                        <div key={el.code} className="flex items-center justify-between bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ background: el.color }}>{el.code}</div>
                                                <div className="text-xs font-semibold">{el.name}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-teal-700">{Math.round(el.value)}%</span>
                                                <span className="text-[10px] bg-white dark:bg-dark-600 px-2 py-1 rounded border border-gray-100 dark:border-dark-500 font-bold">{grade}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-teal-50 dark:bg-dark-800 rounded-2xl p-5 shadow-lg border border-teal-100 dark:border-dark-700">
                            <h3 className="font-bold text-xs uppercase mb-4 flex items-center gap-2 text-teal-700 dark:text-teal-400">
                                <UserGroupIcon className="w-4 h-4" /> Demografi Gender
                            </h3>
                            <div className="space-y-2">
                                <GenderItem label="Laki - laki" count={stats.gender.male} color="bg-blue-500" />
                                <GenderItem label="Perempuan" count={stats.gender.female} color="bg-pink-500" />
                                <div className="flex items-center justify-between pt-3 border-t border-teal-100 dark:border-dark-600 mt-2">
                                    <span className="text-[10px] font-bold uppercase text-gray-400">Total Responden</span>
                                    <span className="font-bold text-lg text-teal-600">{stats.totalRespondents}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- UMKM SECTION --- */}
            <div className="max-w-7xl mx-auto border-t border-gray-200 dark:border-gray-700 pt-10">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold uppercase text-teal-700 dark:text-teal-400">Statistik UMKM</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="bg-white dark:bg-dark-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-dark-700 flex flex-col justify-center items-center text-center h-full">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                            <span className="text-4xl text-blue-600">🏪</span>
                        </div>
                        <h3 className="text-4xl font-extrabold text-blue-900 dark:text-blue-200">{umkmStats.total}</h3>
                        <p className="text-sm font-medium text-gray-500 uppercase mt-1">UMKM Terdaftar</p>
                        <div className="w-full grid grid-cols-2 gap-3 mt-6">
                            {umkmStats.chart.labels.map((label, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-dark-700 p-2 rounded-lg">
                                    <span className="block text-lg font-bold">{umkmStats.chart.series[idx]}</span>
                                    <span className="text-[10px] text-gray-500 uppercase">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-dark-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-dark-700 h-full flex flex-col items-center">
                        <h3 className="font-bold mb-4 text-gray-700 text-sm">Jangkauan Pemasaran</h3>
                        <ReactApexChart options={umkmChartOptions} series={umkmStats.chart.series} type="pie" width={400} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-components
const EduBar = ({ label, count, total, color }) => (
    <div className="flex items-center gap-3">
        <div className={`w-14 py-1 ${color} text-white text-center text-[10px] font-bold rounded shadow-sm`}>{label}</div>
        <div className="flex-1 bg-gray-100 dark:bg-dark-700 h-6 rounded-full overflow-hidden relative shadow-inner">
            <div className={`h-full ${color} opacity-80`} style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}></div>
            <span className="absolute right-3 top-1 text-[10px] font-bold text-gray-600 dark:text-gray-300">{count}</span>
        </div>
    </div>
);

const GenderItem = ({ label, count, color }) => (
    <div className="flex items-center justify-between bg-white dark:bg-dark-700 rounded-xl p-3 shadow-sm border border-teal-50 dark:border-dark-600">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${color}`}></div>
            <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="font-bold text-sm">{count} <span className="text-[10px] font-normal opacity-50">Org</span></span>
    </div>
);
