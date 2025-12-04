import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import axios from "utils/axios";
import api from "configs/api.config";

export default function HasilSurvey() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Fetch list of surveys
  const { data: surveyList = [], isLoading } = useQuery({
    queryKey: ["surveys"],
    queryFn: async () => {
      try {
        const res = await axios.get(api.surveys.list);
        console.log("Survey List Response:", res.data);
        // Handle response structure: res.data.data or res.data
        const data = res.data.data || res.data;
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error("Error fetching surveys:", err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // PAGINATION
  const totalPages = Math.ceil(surveyList.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const surveysToDisplay = surveyList.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  const handleNext = () => handlePageChange(currentPage + 1);
  const handlePrev = () => handlePageChange(currentPage - 1);

  const handleViewDetail = async (survey) => {
    try {
      // Show loading
      Swal.fire({
        title: "Memuat Data...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        customClass: {
          popup: "!bg-white dark:!bg-gray-800",
          title: "text-gray-900 dark:text-gray-100",
        },
      });

      // Fetch results for this survey
      const res = await axios.get(api.results.getBySurvey(survey.id));
      console.log("Survey Results Response:", res.data);
      
      // New structure: res.data.data contains survey with jawaban array
      const surveyData = res.data.data || res.data;
      const answers = surveyData.jawaban || [];

      Swal.close();

      if (answers.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Belum Ada Jawaban",
          text: `Survey "${survey.namaSurvey}" belum memiliki jawaban.`,
          customClass: {
            popup: "!bg-white dark:!bg-gray-800",
            title: "text-gray-900 dark:text-gray-100",
            htmlContainer: "text-gray-600 dark:text-gray-300",
          },
        });
        return;
      }

      // Display results - jawaban is array of { id, jawaban, pertanyaan: { teks, ... } }
      const resultsHtml = answers.map((item, index) => {
        const questionText = item.pertanyaan?.teks || 'Pertanyaan tidak tersedia';
        const answerText = item.jawaban || '-';

        return `
          <div class="bg-white dark:bg-dark-800 p-4 rounded-lg border border-gray-200 dark:border-dark-600 mb-3">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ${index + 1}. ${questionText}
            </p>
            <div class="pl-4 border-l-2 border-blue-500">
              <p class="text-sm text-gray-600 dark:text-gray-400">
                ➜ ${answerText}
              </p>
            </div>
          </div>
        `;
      }).join('');

      Swal.fire({
        title: `Hasil Survey: ${survey.namaSurvey}`,
        width: 900,
        html: `
          <div class="text-left p-4 max-h-[600px] overflow-y-auto">
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 border border-blue-200 dark:border-blue-700">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-gray-600 dark:text-gray-400">Total Jawaban:</span>
                  <p class="font-semibold text-gray-900 dark:text-white text-lg">${answers.length} pertanyaan</p>
                </div>
                <div>
                  <span class="text-gray-600 dark:text-gray-400">Nama Survey:</span>
                  <p class="font-semibold text-gray-900 dark:text-white">${survey.namaSurvey}</p>
                </div>
              </div>
            </div>

            <h4 class="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Daftar Jawaban:</h4>
            ${resultsHtml}
          </div>
        `,
        showConfirmButton: true,
        confirmButtonText: "Tutup",
        customClass: {
          popup: "!bg-white dark:!bg-gray-800",
          title: "!text-black dark:!text-white",
          htmlContainer: "text-gray-600 dark:text-gray-300",
          confirmButton:
            "bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg",
        },
      });
    } catch (error) {
      console.error("Error fetching survey results:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.response?.data?.message || "Gagal mengambil hasil survey",
        customClass: {
          popup: "!bg-white dark:!bg-gray-800",
          title: "text-gray-900 dark:text-gray-100",
          htmlContainer: "text-gray-600 dark:text-gray-300",
        },
      });
    }
  };

  return (
    <div className="dark:bg-dark-900 min-h-screen w-full bg-white p-4 text-gray-900 lg:p-6 dark:text-gray-200">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Hasil Survey</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Lihat semua jawaban dari survey yang telah diisi
        </p>
      </div>
      <hr className="dark:border-dark-700 my-4 border-gray-200" />

      {/* Table */}
      <div className="dark:bg-dark-800 dark:border-dark-700 mb-8 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="dark:bg-dark-700 bg-gray-100 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Nama Survey</th>
              <th className="px-4 py-3">Deskripsi</th>
              <th className="px-4 py-3">Tanggal Dibuat</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : surveyList.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  Belum ada survey yang tersedia
                </td>
              </tr>
            ) : (
              surveysToDisplay.map((survey, index) => (
                <tr
                  key={survey.id || index}
                  className="border-b border-gray-100 last:border-none hover:bg-gray-50 dark:border-dark-700 dark:hover:bg-dark-700/50"
                >
                  <td className="px-4 py-3">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 font-medium">
                    {survey.namaSurvey || 'Survey'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {survey.deskripsi || '-'}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(survey.tanggalDibuat).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleViewDetail(survey)}
                      className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 inline-flex items-center gap-1"
                      title="Lihat Hasil"
                    >
                      <EyeIcon className="h-5 w-5" />
                      <span className="text-xs font-medium">Lihat Hasil</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
                <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">

                    <div className="text-gray-600 dark:text-gray-400">
                        Menampilkan <b>{startIndex + 1}</b> - <b>{Math.min(endIndex, surveyList.length)}</b> dari <b>{surveyList.length}</b> hasil
                    </div>

                    <div className="flex gap-2 items-center">

                        <button
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100"
                        >
                            <ChevronLeftIcon className="w-5"/>
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => handlePageChange(i + 1)}
                                className={`
                                    px-4 py-2 rounded-lg border transition-all
                                    ${currentPage === i + 1
                                        ? "bg-yellow-500 border-yellow-500 text-black scale-105"
                                        : "hover:bg-gray-100"}
                                `}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100"
                        >
                            <ChevronRightIcon className="w-5"/>
                        </button>

                    </div>
                </div>
    </div>
  );
}
