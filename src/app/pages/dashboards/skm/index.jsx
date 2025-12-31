import { useState, useMemo, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { useQuery } from "@tanstack/react-query";
import axios from "utils/axios";
import api from "configs/api.config";
import {
    UserGroupIcon,
} from "@heroicons/react/24/solid";
import mapQuestionsToIds from './mapping';

// --- Constants & Helpers ---
const ELEMENTS = [
    { code: "U1", name: "Persyaratan", color: "#7C2D6F" },
    { code: "U2", name: "Prosedur", color: "#8B572A" },
    { code: "U3", name: "Waktu", color: "#0f766e" },
    { code: "U4", name: "Biaya/Tarif", color: "#ea580c" },
    { code: "U5", name: "Produk", color: "#991b1b" },
    { code: "U6", name: "Kompetensi", color: "#1e40af" },
    { code: "U7", name: "Perilaku", color: "#3f6212" },
    { code: "U8", name: "Sarana", color: "#ca8a04" },
    { code: "U9", name: "Pengaduan", color: "#b91c1c" },
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

export default function SKMDashboard() {
    const [selectedSurveyId, setSelectedSurveyId] = useState(null);

    // --- 1. Fetch Survey List (Selection Mode) ---
    const { data: surveyList = [], isLoading: isLoadingList } = useQuery({
        queryKey: ["surveys"],
        queryFn: async () => {
            const res = await axios.get(api.surveys.list);
            const data = res.data?.data || res.data;
            return Array.isArray(data) ? data : [];
        },
    });

    // --- 2. Fetch Survey Details (Dashboard Mode) ---
    const { data: surveyResult, isLoading: isLoadingResult } = useQuery({
        queryKey: ["surveyResult", selectedSurveyId],
        queryFn: async () => {
            if (!selectedSurveyId) return null;
            const res = await axios.get(api.results.getBySurvey(selectedSurveyId));
            // Matches src/app/pages/dashboards/hasil-survey/index.jsx
            return res.data.data || res.data;
        },
        enabled: !!selectedSurveyId,
    });

    // --- 2b. Fetch Questions for selected survey (to map fixed positions) ---
    const { data: questions = [] } = useQuery({
        queryKey: ["surveyQuestions", selectedSurveyId],
        queryFn: async () => {
            if (!selectedSurveyId) return [];
            const res = await axios.get(api.questions.getBySurvey(selectedSurveyId));
            const data = res.data?.data || res.data;
            return Array.isArray(data) ? data : [];
        },
        enabled: !!selectedSurveyId,
        staleTime: 5 * 60 * 1000,
    });

    // --- 3. Fetch UMKM Data ---
    const { data: umkmList = [] } = useQuery({
        queryKey: ["umkm"],
        queryFn: async () => {
            const res = await axios.get(api.umkm.list);
            // Matches src/app/pages/dashboards/UMKM/index.jsx
            return Array.isArray(res.data) ? res.data : [];
        }
    });

    // --- Calculation Logic ---
    const stats = useMemo(() => {
        // console.log("Stats Recalc: surveyResult", surveyResult);
        if (!surveyResult || !surveyResult.jawaban) {
            console.log("Stats: No surveyResult or jawaban");
            return null;
        }

        const answers = surveyResult.jawaban;
        // console.log("Stats: Raw Answers", answers);

        // 1. Group answers by Question ID
        const questionMap = {};

        answers.forEach(ans => {
            // Extract question id from several possible shapes in API response
            const possibleId = ans.pertanyaan_id ?? ans.pertanyaan?.id ?? ans.pertanyaan?._id ?? ans.pertanyaan?.pertanyaan_id ?? ans.pertanyaan?.question_id ?? ans.pertanyaan?.urutan;
            const qId = possibleId !== undefined && possibleId !== null ? String(possibleId) : String(ans.pertanyaan?.teks || 'unknown');
            const score = getScore(ans.jawaban);

            if (!questionMap[qId]) {
                questionMap[qId] = {
                    text: ans.pertanyaan?.teks || "",
                    answers: []
                };
            }
            questionMap[qId].answers.push({
                val: ans.jawaban,
                score: score
            });
        });

        // console.log("Stats: Question Map", questionMap);

        // questionIds removed: not needed now that mapping uses question list or helper

        // Use deterministic mapping helper (prefers positional mapping Q1..Q14 -> biodata/U1..U9, falls back to keyword mapping)
        const { genderQId, eduQId, elementQIdMap } = mapQuestionsToIds(questions, questionMap);


        // --- Biodata Processing ---
        const genderAnswers = genderQId ? (questionMap[String(genderQId)] || { answers: [] }).answers : [];
        const maleCount = genderAnswers.filter(a => {
            const val = String(a.val).toLowerCase();
            return val === 'l' || val.includes('laki') || val.includes('pria');
        }).length;
        const femaleCount = genderAnswers.filter(a => {
            const val = String(a.val).toLowerCase();
            return val === 'p' || val.includes('perempuan') || val.includes('wanita');
        }).length;

        // Total Respondents: Max answers for any single question
        // This is robust against surveys with < 14 quesitons or if mapping fails
        const totalRespondents = Math.max(...Object.values(questionMap).map(q => q.answers.length), 0);

        // Education Stats
        const eduAnswers = eduQId ? (questionMap[String(eduQId)] || { answers: [] }).answers : [];
        const eduStats = {
            S2: eduAnswers.filter(a => String(a.val).includes('S2')).length,
            S1: eduAnswers.filter(a => String(a.val).includes('S1') || String(a.val).includes('D4')).length,
            SMA: eduAnswers.filter(a => String(a.val).includes('SMA') || String(a.val).includes('SLTA')).length,
            SMP: eduAnswers.filter(a => String(a.val).includes('SMP') || String(a.val).includes('SLTP')).length,
            SD: eduAnswers.filter(a => String(a.val).includes('SD')).length,
            Total: eduAnswers.length || 1
        };

        // --- Service Elements ---
        const elementStats = ELEMENTS.map((elem, index) => {
            const qKey = elementQIdMap[index];
            const qData = qKey ? (questionMap[String(qKey)] || { answers: [] }) : { answers: [] };
            const scores = qData.answers.map(a => a.score);

            const totalScore = scores.reduce((a, b) => a + b, 0);
            const count = scores.length || 1;
            const avg = totalScore / count;

            // Index: Avg * 25
            const indexValue = avg * 25;

            return {
                ...elem,
                value: indexValue,
                avgScore: avg
            };
        });

        const validElements = elementStats.filter(e => e.avgScore > 0);
        const ikm = validElements.length > 0
            ? validElements.reduce((acc, curr) => acc + curr.value, 0) / validElements.length
            : 0;

        return {
            totalRespondents: Math.floor(totalRespondents),
            gender: { male: maleCount, female: femaleCount },
            education: eduStats,
            ikm: ikm,
            elements: elementStats
        };

    }, [surveyResult, questions]);


    // --- UMKM Stats Logic ---
    const umkmStats = useMemo(() => {
        const total = umkmList.length;
        const jangkauanCounts = {};

        umkmList.forEach(u => {
            const range = u.jangkauanPemasaran || "Lokal";
            jangkauanCounts[range] = (jangkauanCounts[range] || 0) + 1;
        });

        const series = Object.values(jangkauanCounts);
        const labels = Object.keys(jangkauanCounts);

        return {
            total,
            chart: { series, labels }
        };
    }, [umkmList]);

    // --- Auto-Select First Survey ---
    useEffect(() => {
        if (surveyList.length > 0 && !selectedSurveyId) {
            const firstSurvey = surveyList[0];
            setSelectedSurveyId(firstSurvey.id);
        }
    }, [surveyList, selectedSurveyId]);

    // --- Chart Configs ---
    // SKM Chart
    const chartOptions = {
        chart: { type: "polarArea", toolbar: { show: false }, background: 'transparent', foreColor: '#ffffff' },
        labels: ELEMENTS.map(e => `${e.code} ${e.name}`),
        stroke: { colors: ["#fff"], width: 1 },
        fill: { opacity: 0.9 },
        colors: ELEMENTS.map(e => e.color),
        legend: { show: false },
        yaxis: { show: false },
        plotOptions: { polarArea: { rings: { strokeWidth: 0 }, spokes: { strokeWidth: 0 } } },
        tooltip: { y: { formatter: (val) => val.toFixed(2) + "%" }, theme: 'dark' }
    };
    const chartSeries = stats ? stats.elements.map(e => Number.parseFloat(e.value.toFixed(2))) : [];

    // UMKM Chart
    const umkmChartOptions = {
        chart: { type: "pie", toolbar: { show: false }, background: 'transparent' }, // Pie for composition
        labels: umkmStats.chart.labels,
        colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"], // Blue, Green, Yellow, Red, Purple
        legend: { position: 'bottom' },
        dataLabels: { enabled: true },
        tooltip: { theme: 'light' }
    };


    // --- Render Loading ---
    if (isLoadingList || (surveyList.length > 0 && !selectedSurveyId)) {
        return <div className="min-h-screen flex items-center justify-center bg-white text-teal-600 font-bold">Memuat Dashboard...</div>;
    }

    // --- Render Selection List (Fallback if no surveys) ---
    if (!selectedSurveyId && surveyList.length === 0) {
        return (
            <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center text-gray-500">Belum ada data survey untuk ditampilkan.</div>
            </div>
        )
    }

    // --- Render Dashboard ---
    if (isLoadingResult) {
        return <div className="min-h-screen flex items-center justify-center bg-teal-600 text-white">Memuat Data Visualisasi...</div>
    }

    // Debug info removed from production view

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-dark-900 p-4 font-sans text-gray-900 lg:p-8 dark:text-gray-100 transition-colors duration-300">

            {/* Header Info */}
            <div className="mb-8 text-center relative z-10 pt-4 lg:pt-0">
                <h1 className="text-3xl font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 drop-shadow-sm">
                    Kuisioner Kepuasan Masyarakat (SKM)
                </h1>
                <h2 className="text-xl font-medium mt-1 text-gray-700 dark:text-gray-300">
                    Kalurahan Imogiri, Kabupaten Bantul
                </h2>
            </div>

            {/* --- SKM SECTION --- */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 max-w-7xl mx-auto relative z-10 mb-12">

                {/* Main Chart Area */}
                <div className="lg:col-span-8 relative flex flex-col items-center justify-center min-h-[500px]">
                    {/* Central IKM Circle Overlay - Kept Green as requested */}
                    <div className="w-full max-w-2xl bg-[#00809D] rounded-3xl p-6 shadow-xl border borderbg-[#FF7601] relative">
                        {/* Central IKM Circle Overlay - centered over the chart container */}
                        <div className="absolute z-10 pointer-events-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            <div className="flex flex-col items-center justify-center rounded-full bg-teal-600 p-8 shadow-2xl w-48 h-48 border-4 border-white transform hover:scale-105 transition-transform duration-500">
                                <h4 className="text-lg font-bold text-white uppercase text-center leading-tight drop-shadow-md">
                                    Indeks <br /> Kepuasan
                                </h4>
                                <span className="text-4xl font-extrabold text-white mt-1 drop-shadow-md">
                                    {stats?.ikm?.toFixed(2) || "0.00"}
                                </span>
                            </div>
                        </div>
                        {isLoadingResult ? (
                            <div className="h-[550px] flex items-center justify-center text-white">Memuat Visualisasi...</div>
                        ) : (
                            <ReactApexChart
                                options={chartOptions}
                                series={chartSeries}
                                type="polarArea"
                                height={550}
                            />
                        )}
                    </div>

                    {/* debug mapping removed */}

                    {/* Pendidikan Responden - moved below chart for better height fit */}
                    <div className="w-full max-w-2xl mt-6 bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-dark-700">
                        <h3 className="bg-gradient-to-r from-teal-700 to-teal-600 text-white font-bold py-2 px-4 rounded-lg text-center uppercase mb-4 text-sm tracking-wide shadow-md">
                            Pendidikan Responden
                        </h3>
                        {stats ? (
                            <div className="space-y-3">
                                <EduBar label="S2" count={stats.education.S2} total={stats.education.Total} color="bg-blue-800" />
                                <EduBar label="D4/S1" count={stats.education.S1} total={stats.education.Total} color="bg-green-600" />
                                <EduBar label="SMA" count={stats.education.SMA} total={stats.education.Total} color="bg-yellow-500" />
                                <EduBar label="SMP" count={stats.education.SMP} total={stats.education.Total} color="bg-pink-600" />
                                <EduBar label="SD" count={stats.education.SD} total={stats.education.Total} color="bg-purple-600" />
                            </div>
                        ) : (
                            <div className="text-center opacity-50 py-4">Memuat data...</div>
                        )}
                    </div>
                </div>

                {/* Sidebar / Legend Area */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Mutu Pelayanan (header + per-element details) */}
                    <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-dark-700">
                        <h3 className="bg-gradient-to-r from-teal-700 to-teal-600 text-white font-bold py-2 px-4 rounded-lg text-center uppercase mb-4 text-sm tracking-wide shadow-md">
                            Mutu Pelayanan
                        </h3>

                        {/* Rincian Mutu per Unsur */}
                        {stats ? (
                            <div className="mt-2">
                                <h4 className="text-sm font-semibold mb-3">Rincian Mutu per Unsur</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {stats.elements.map(el => {
                                        const getGrade = (v) => {
                                            if (v >= 88.31) return 'A';
                                            if (v >= 76.61) return 'B';
                                            if (v >= 65.0) return 'C';
                                            return 'D';
                                        };
                                        const grade = getGrade(el.value);
                                        return (
                                            <div key={el.code} className="flex items-center justify-between bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: el.color }}>
                                                        {el.code}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium">{el.name}</div>
                                                        <div className="text-xs text-gray-500">Skor: {el.avgScore.toFixed(2)} ({el.value.toFixed(2)})</div>
                                                    </div>
                                                </div>
                                                <div className="text-lg font-bold text-teal-700">{Number(el.value).toFixed(0)}%</div>
                                                <div className="ml-4 text-sm font-semibold">{grade}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center opacity-50 py-4">Memuat data...</div>
                        )}
                    </div>

                    

                    {/* Respondent Gender Stats - Real Data */}
                    <div className="bg-teal-50 dark:bg-dark-800 rounded-2xl p-4 shadow-lg border border-teal-100 dark:border-dark-700 text-gray-800 dark:text-gray-100">
                        <h3 className="font-bold text-sm uppercase mb-3 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2 text-teal-700 dark:text-teal-400">
                            <UserGroupIcon className="w-4 h-4" /> Demografi Gender
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between bg-white dark:bg-dark-700 rounded-lg p-3 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span>Laki - laki</span>
                                </div>
                                <span className="font-bold">{stats?.gender?.male || 0} <span className="text-xs font-normal opacity-70">Org</span></span>
                            </div>
                            <div className="flex items-center justify-between bg-white dark:bg-dark-700 rounded-lg p-3 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                    <span>Perempuan</span>
                                </div>
                                <span className="font-bold">{stats?.gender?.female || 0} <span className="text-xs font-normal opacity-70">Org</span></span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                                <span className="text-xs font-bold uppercase opacity-70">Total Responden</span>
                                <span className="font-bold text-lg text-teal-600 dark:text-teal-400">{stats?.totalRespondents || 0}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- UMKM SECTION --- */}
            <div className="max-w-7xl mx-auto border-t border-gray-200 dark:border-gray-700 pt-10">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold uppercase text-teal-700 dark:text-teal-400">Statistik UMKM</h2>
                    <p className="text-gray-500">Data sebaran dan jangkauan UMKM di Kalurahan Imogiri</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* UMKM Stats Card */}
                    <div className="bg-white dark:bg-dark-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-dark-700 flex flex-col justify-center items-center text-center h-full">
                        <div className="mb-6">
                            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-4xl text-blue-600 dark:text-blue-300">🏪</span>
                            </div>
                            <h3 className="text-4xl font-extrabold text-blue-900 dark:text-blue-200">{umkmStats.total}</h3>
                            <p className="text-lg font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-2">Total UMKM Terdaftar</p>
                        </div>
                        <div className="w-full grid grid-cols-2 gap-4 mt-4">
                            {umkmStats.chart.labels.map((label, idx) => (
                                <div key={idx} className="bg-gray-50 dark:bg-dark-700 p-3 rounded-lg">
                                    <span className="block text-xl font-bold text-gray-800 dark:text-gray-100">{umkmStats.chart.series[idx]}</span>
                                    <span className="text-xs text-gray-500 uppercase">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* UMKM Chart Card */}
                    <div className="bg-white dark:bg-dark-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-dark-700 h-full">
                        <h3 className="font-bold text-center mb-6 text-gray-700 dark:text-gray-300">Jangkauan Pemasaran</h3>
                        <ReactApexChart
                            options={umkmChartOptions}
                            series={umkmStats.chart.series}
                            type="pie"
                            height={350}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}

// Sub-components

const EduBar = ({ label, count, total, color }) => (
    <div className="flex items-center gap-2 group">
        <div className={`w-14 py-1 ${color} text-white text-center text-[10px] font-bold rounded shadow-sm group-hover:scale-105 transition-transform`}>
            {label}
        </div>
        <div className="flex-1 bg-gray-100 dark:bg-dark-700 h-5 rounded overflow-hidden relative shadow-inner">
            {/* Bar */}
            <div className={`h-full ${color} opacity-80 transition-all duration-1000`} style={{ width: `${(count / total) * 100}%` }}></div>
            {/* Text Overlay */}
            <div className="absolute inset-0 flex items-center justify-between px-2">
                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 z-10">{count}</span>
            </div>
        </div>
    </div>
)
