import { useState, useMemo, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { useQuery } from "@tanstack/react-query";
import axios from "utils/axios";
import api from "configs/api.config";
import {
    UserGroupIcon,
} from "@heroicons/react/24/solid";

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
    // Try exact match
    if (ANSWER_MAP[text]) return ANSWER_MAP[text];
    // Try partial match
    const lower = text.toLowerCase();
    if (lower.includes("sangat")) return 4;
    if (lower.includes("kurang")) return 2;
    if (lower.includes("tidak")) return 1;
    return 3; // Default to 'Baik'/'Sesuai' if mostly positive or unspecified standard
}

export default function SKMDashboard() {
    const [selectedSurveyId, setSelectedSurveyId] = useState(null);
    const [selectedSurveyData, setSelectedSurveyData] = useState(null);

    // --- 1. Fetch Survey List (Selection Mode) ---
    const { data: surveyList = [], isLoading: isLoadingList } = useQuery({
        queryKey: ["surveys"],
        queryFn: async () => {
            const res = await axios.get(api.surveys.list);
            return Array.isArray(res.data.data) ? res.data.data : [];
        },
    });

    // --- 2. Fetch Survey Details (Dashboard Mode) ---
    const { data: surveyResult, isLoading: isLoadingResult } = useQuery({
        queryKey: ["surveyResult", selectedSurveyId],
        queryFn: async () => {
            if (!selectedSurveyId) return null;
            const res = await axios.get(api.results.getBySurvey(selectedSurveyId));
            return res.data.data || res.data;
        },
        enabled: !!selectedSurveyId,
    });

    // --- Calculation Logic ---
    const stats = useMemo(() => {
        if (!surveyResult || !surveyResult.jawaban) return null;

        const answers = surveyResult.jawaban;

        // Group by Question Index (assuming first 9 questions are U1-U9)
        // We map answers to questions first
        const questionMap = {}; // { questionId: { text, scores: [] } }

        answers.forEach(ans => {
            const qId = ans.pertanyaan_id;
            const score = getScore(ans.jawaban);

            if (!questionMap[qId]) {
                questionMap[qId] = {
                    text: ans.pertanyaan?.teks || "",
                    scores: []
                };
            }
            questionMap[qId].scores.push(score);
        });

        const questionKeys = Object.keys(questionMap);

        const elementStats = ELEMENTS.map((elem, index) => {
            const qKey = questionKeys[index];
            const qData = qKey ? questionMap[qKey] : { scores: [] };

            const totalScore = qData.scores.reduce((a, b) => a + b, 0);
            const count = qData.scores.length || 1;
            const avg = totalScore / count;

            // Index per element (0-100 scale based on 1-4)
            // Formula: (Avg / 4) * 100
            const indexValue = (avg / 4) * 100;

            return {
                ...elem,
                value: indexValue,
                avgScore: avg
            };
        });

        // Calculate IKM
        const validElements = elementStats.filter(e => e.avgScore > 0);
        const ikm = validElements.length > 0
            ? validElements.reduce((acc, curr) => acc + curr.value, 0) / validElements.length
            : 0;

        return {
            totalRespondents: answers.length > 0 ? answers.length / 9 : 0, // Rough estimate if we have 9 questions per person
            ikm: ikm,
            elements: elementStats
        };

    }, [surveyResult]);

    // --- Auto-Select First Survey ---
    useEffect(() => {
        if (surveyList.length > 0 && !selectedSurveyId) {
            const firstSurvey = surveyList[0];
            setSelectedSurveyId(firstSurvey.id);
            setSelectedSurveyData(firstSurvey);
        }
    }, [surveyList, selectedSurveyId]);

    // --- Loading States ---
    if (isLoadingList || (surveyList.length > 0 && !selectedSurveyId)) {
        return <div className="min-h-screen flex items-center justify-center bg-teal-600 text-white">Memuat Dashboard...</div>;
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

    // Chart Configuration
    const chartOptions = {
        chart: { type: "polarArea", toolbar: { show: false }, background: 'transparent', foreColor: '#ffffff' },
        labels: ELEMENTS.map(e => `${e.code} ${e.name}`),
        stroke: { colors: ["#fff"], width: 1 },
        fill: { opacity: 0.9 },
        colors: ELEMENTS.map(e => e.color),
        legend: { show: false },
        yaxis: { show: false },
        plotOptions: {
            polarArea: {
                rings: { strokeWidth: 0 },
                spokes: { strokeWidth: 0 },
            }
        },
        tooltip: {
            y: { formatter: (val) => val.toFixed(2) + "%" },
            theme: 'dark'
        }
    };

    const chartSeries = stats ? stats.elements.map(e => parseFloat(e.value.toFixed(2))) : [];

    return (
        <div className="min-h-screen w-full bg-gray-50 dark:bg-dark-900 p-4 font-sans text-gray-900 lg:p-8 dark:text-gray-100 transition-colors duration-300">

            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-teal-500 rounded-full blur-[100px]"></div>
                <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] bg-teal-500 rounded-full blur-[120px]"></div>
            </div>

            {/* Header Info (No Back Button) */}

            {/* Header Info */}
            <div className="mb-8 text-center relative z-10 pt-4 lg:pt-0">
                <h1 className="text-3xl font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 drop-shadow-sm">
                    Survey Kepuasan Masyarakat
                </h1>
                <h2 className="text-xl font-medium mt-1 text-gray-700 dark:text-gray-300">
                    {selectedSurveyData?.namaSurvey || "Detail Survey"}
                </h2>
                <h3 className="text-lg mt-1 text-gray-600 dark:text-gray-400">Kalurahan Imogiri, Kabupaten Bantul</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-500 uppercase tracking-widest">
                    {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 max-w-7xl mx-auto relative z-10">

                {/* Main Chart Area */}
                <div className="lg:col-span-8 relative flex flex-col items-center justify-center min-h-[500px]">
                    {/* Central IKM Circle Overlay - Kept Green as requested */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10" style={{ top: '-20px' }}>
                        <div className="flex flex-col items-center justify-center rounded-full bg-teal-600 p-8 shadow-2xl w-48 h-48 border-4 border-white transform hover:scale-105 transition-transform duration-500">
                            <h4 className="text-lg font-bold text-white uppercase text-center leading-tight drop-shadow-md">
                                Indeks <br /> Kepuasan
                            </h4>
                            <span className="text-4xl font-extrabold text-white mt-1 drop-shadow-md">
                                {stats?.ikm?.toFixed(2) || "0.00"}
                            </span>
                        </div>
                    </div>

                    <div className="w-full max-w-2xl bg-teal-700 rounded-3xl p-6 shadow-xl border border-teal-600">
                        <ReactApexChart
                            options={chartOptions}
                            series={chartSeries}
                            type="polarArea"
                            height={550}
                        />
                    </div>
                </div>

                {/* Sidebar / Legend Area */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Quality Legend */}
                    <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-dark-700">
                        <h3 className="bg-gradient-to-r from-teal-700 to-teal-600 text-white font-bold py-2 px-4 rounded-lg text-center uppercase mb-4 text-sm tracking-wide shadow-md">
                            Mutu Pelayanan
                        </h3>
                        <div className="space-y-3">
                            <LegendItem grade="A" label="Sangat Baik" range="88.31 - 100" color="bg-blue-600" />
                            <LegendItem grade="B" label="Baik" range="76.61 - 88.30" color="bg-teal-500" />
                            <LegendItem grade="C" label="Kurang Baik" range="65.00 - 76.60" color="bg-pink-600" />
                            <LegendItem grade="D" label="Tidak Baik" range="25.00 - 64.99" color="bg-orange-500" />
                        </div>
                    </div>

                    {/* Education Stats */}
                    <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-dark-700">
                        <h3 className="bg-gradient-to-r from-teal-700 to-teal-600 text-white font-bold py-2 px-4 rounded-lg text-center uppercase mb-4 text-sm tracking-wide shadow-md">
                            Pendidikan Responden
                        </h3>
                        <div className="space-y-3">
                            <EduBar label="S2" count={3} total={42} color="bg-blue-800" />
                            <EduBar label="D4/S1" count={11} total={42} color="bg-green-600" />
                            <EduBar label="SMA" count={23} total={42} color="bg-yellow-500" />
                            <EduBar label="SMP" count={3} total={42} color="bg-pink-600" />
                            <EduBar label="SD" count={0} total={42} color="bg-purple-600" />
                        </div>
                        <p className="text-xs text-center text-gray-400 mt-4 italic">* Data simulasi (pendidikan)</p>
                    </div>

                    {/* Respondent Gender Stats */}
                    <div className="bg-teal-50 dark:bg-dark-800 rounded-2xl p-4 shadow-lg border border-teal-100 dark:border-dark-700 text-gray-800 dark:text-gray-100">
                        <h3 className="font-bold text-sm uppercase mb-3 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2 text-teal-700 dark:text-teal-400">
                            <UserGroupIcon className="w-4 h-4" /> Jumlah Responden
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between bg-white dark:bg-dark-700 rounded-lg p-3 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span>Laki - laki</span>
                                </div>
                                <span className="font-bold">{Math.floor(stats?.totalRespondents || 42)} <span className="text-xs font-normal opacity-70">Org</span></span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center text-gray-500 dark:text-gray-400 text-sm max-w-4xl mx-auto space-y-1 pb-8">
                <p className="uppercase font-semibold tracking-wide">Terima Kasih Atas Penilaian Anda</p>
                <p className="opacity-80">Masukan anda sangat bermanfaat untuk kemajuan pelayanan kami.</p>
            </div>

        </div>
    );
}

// Sub-components
const LegendItem = ({ grade, label, range, color }) => (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700/50 transition border border-transparent hover:border-gray-200 dark:hover:border-dark-600">
        <div className={`w-10 h-10 ${color} rounded-lg shadow-md flex items-center justify-center text-white font-bold text-lg ring-2 ring-white/50 dark:ring-white/20`}>
            {grade}
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-center">
                <p className="font-bold text-gray-800 dark:text-gray-200 text-sm">{label}</p>
                <span className="text-[10px] bg-gray-100 dark:bg-dark-700 px-2 py-0.5 rounded-full text-gray-500 dark:text-gray-400 font-mono">{range}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-600 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className={`h-full ${color} opacity-80`} style={{ width: '60%' }}></div>
            </div>
        </div>
    </div>
);

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
