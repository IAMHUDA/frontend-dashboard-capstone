import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  DocumentArrowDownIcon
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import axios from "utils/axios";
import api from "configs/api.config";
import * as XLSX from "xlsx";

export default function HasilSurvey() {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Fetch list of surveys
  const { data: surveyList = [], isLoading } = useQuery({
    queryKey: ["surveys"],
    queryFn: async () => {
      try {
        const res = await axios.get(api.surveys.list);
        // console.log("Survey List Response:", res.data);
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
    // Show Loading Initial
    Swal.fire({
      title: "Memuat Data...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      customClass: {
        popup: "!bg-white dark:!bg-gray-800",
        title: "text-gray-900 dark:text-gray-100",
      },
    });

    try {
      // 1. Fetch Daftar Responden
      const res = await axios.get(api.results.getRespondenList(survey.id));
      const textResponse = res.data.data || res.data; 
      // Handle response structure depending on backend standard (sometimes it's directly array, sometimes inside data)
      const respondenList = Array.isArray(textResponse) ? textResponse : (textResponse.data || []);

      Swal.close();

      if (respondenList.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Belum Ada Jawaban",
          text: `Survey "${survey.namaSurvey}" belum memiliki jawaban.`,
          customClass: {
            popup: "!bg-white dark:!bg-gray-800",
            title: "text-gray-900 dark:text-gray-100",
            htmlContainer: "text-gray-600 dark:text-gray-300",
            confirmButton: "bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg",
          },
        });
        return;
      }

      // 2. Generate HTML Skeleton (List of Respondents)
      // We use data-submission-id to identify which to fetch
      const accordionHtml = respondenList.map((resp, index) => {
          // Format Date
          const dateObj = new Date(resp.tanggal);
          const readableDate = !isNaN(dateObj.getTime()) 
              ? dateObj.toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':')
              : '-';

          return `
            <div class="mb-2 border border-blue-100 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 overflow-hidden relative group-item">
                <div class="respondent-header flex justify-between items-center p-3 cursor-pointer bg-blue-50/50 dark:bg-dark-750 hover:bg-blue-50 dark:hover:bg-dark-700 transition pr-20"
                     data-submission-id="${resp.submissionId}"
                     data-expanded="false"
                     id="header-${resp.submissionId}"
                >
                    <div class="flex items-center gap-2 pointer-events-none">
                        <span class="text-blue-600 dark:text-blue-400">
                             <svg id="icon-${resp.submissionId}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4 transition-transform">
                              <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        </span>
                        <div class="flex flex-col text-left">
                             <span class="font-bold text-gray-800 dark:text-gray-100 text-sm">
                                ${resp.label || `Responden ${index + 1}`}
                             </span>
                             <span class="text-xs text-gray-500 dark:text-gray-400">
                                ${readableDate}
                             </span>
                        </div>
                    </div>
                </div>
                
                <!-- Action Buttons (Absolute Positioned) -->
                <div class="absolute right-2 top-3 flex gap-2 z-10">
                     <button class="btn-delete-single text-xs px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 transition" 
                             data-submission-id="${resp.submissionId}"
                             title="Hapus Data ini">
                        Hapus
                     </button>
                     <button class="btn-detail text-xs px-2 py-1 rounded bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 transition pointer-events-none">
                        Lihat
                     </button>
                </div>

                <div id="content-${resp.submissionId}" class="hidden border-t border-blue-100 dark:border-dark-600 bg-white dark:bg-dark-800 p-4 transition-all">
                     <div class="flex justify-center py-2 text-gray-500 dark:text-gray-400 text-sm">
                        <span class="animate-pulse">Memuat jawaban...</span>
                     </div>
                </div>
            </div>
          `;
      }).join('');

      await Swal.fire({
        title: `Hasil Survey: ${survey.namaSurvey}`,
        width: 800,
        html: `
          <div class="text-left p-2 max-h-[600px] overflow-y-auto custom-scrollbar">
            <div class="flex justify-between items-end mb-6 px-1 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div>
                   <span class="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Responden</span>
                   <span class="text-3xl font-bold text-gray-800 dark:text-gray-100">${respondenList.length}</span>
                </div>
                <div>
                   <button id="btn-delete-all" class="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium transition">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        Hapus Semua
                   </button>
                </div>
            </div>
            
            <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm">Riwayat Pengisian (Terbaru)</h3>
            
            <div id="accordion-container" class="space-y-1">
                ${accordionHtml}
            </div>
          </div>
        `,
        showConfirmButton: true,
        confirmButtonText: "Tutup",
        customClass: {
          popup: "!bg-white dark:!bg-gray-800",
          title: "!text-black dark:!text-white text-lg",
          htmlContainer: "text-gray-600 dark:text-gray-300",
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg",
        },
        didOpen: () => {
             const container = Swal.getHtmlContainer();
             
             // --- DELETE ALL HANDLER ---
             const btnDeleteAll = container.querySelector('#btn-delete-all');
             if (btnDeleteAll) {
                 btnDeleteAll.addEventListener('click', async () => {
                     // 1. Confirm First
                     const { isConfirmed } = await Swal.fire({
                         title: 'Yakin Hapus Semua?',
                         text: 'Tindakan ini akan menghapus SELURUH data responden untuk survey ini secara permanen. Apakah data sudah di-rekap (export)?',
                         icon: 'warning',
                         showCancelButton: true,
                         confirmButtonText: 'Ya, Hapus Semua',
                         cancelButtonText: 'Batal',
                         confirmButtonColor: '#d33',
                         cancelButtonColor: '#6b7280',
                         reverseButtons: true
                     });

                     if (isConfirmed) {
                         try {
                              Swal.showLoading();
                              await axios.delete(api.results.deleteAllBySurvey(survey.id));
                              Swal.fire('Terhapus', 'Semua data berhasil dihapus.', 'success').then(() => {
                                  // Refresh the main modal view
                                  handleViewDetail(survey);
                              });
                         } catch (err) {
                              console.error(err);
                              Swal.fire('Gagal', 'Gagal menghapus data.', 'error');
                         }
                     }
                 });
             }

             // --- SINGLE DELETE HANDLER ---
             const deleteButtons = container.querySelectorAll('.btn-delete-single');
             deleteButtons.forEach(btn => {
                 btn.addEventListener('click', async (e) => {
                     e.stopPropagation(); // Prevent accordion toggle
                     const submissionId = btn.getAttribute('data-submission-id');

                     const { isConfirmed } = await Swal.fire({
                         title: 'Hapus Data?',
                         text: 'Data responden ini akan dihapus.',
                         icon: 'warning',
                         showCancelButton: true,
                         confirmButtonText: 'Ya, Hapus',
                         cancelButtonText: 'Batal',
                         confirmButtonColor: '#d33'
                     });

                     if (isConfirmed) {
                         try {
                              await axios.delete(api.results.deleteSubmission(submissionId));
                              // Remove row from DOM or refresh
                              const row = btn.closest('.group-item');
                              if(row) row.remove();
                              
                              // Check if empty, maybe refresh whole view to update count
                              // handleViewDetail(survey); // reliable but heavy. removing DOM is faster.
                              // Let's just toast success
                              const Toast = Swal.mixin({
                                  toast: true, position: 'top-end', showConfirmButton: false, timer: 2000
                              });
                              Toast.fire({ icon: 'success', title: 'Data dihapus' });

                              // Update count text manually for UX
                              // ... (Skipping complex DOM count update, user can refresh)
                         } catch(err) {
                              console.error(err);
                              Swal.fire('Gagal', 'Gagal menghapus data.', 'error');
                         }
                     }
                 });
             });

             // --- ACCORDION HANDLER ---
             const headers = container.querySelectorAll('.respondent-header');
             headers.forEach(header => {
                 header.addEventListener('click', async () => {
                     const submissionId = header.getAttribute('data-submission-id');
                     const contentDiv = container.querySelector(`#content-${submissionId}`);
                     const icon = container.querySelector(`#icon-${submissionId}`);
                     const isExpanded = header.getAttribute('data-expanded') === 'true';

                     // Toggle State
                     if (isExpanded) {
                         // Collapse
                         contentDiv.classList.add('hidden');
                         icon.classList.remove('rotate-90');
                         header.setAttribute('data-expanded', 'false');
                     } else {
                         // Expand
                         contentDiv.classList.remove('hidden');
                         icon.classList.add('rotate-90');
                         header.setAttribute('data-expanded', 'true');

                         // Fetch Data if empty or loading placeholder
                         if (!contentDiv.getAttribute('data-loaded')) {
                             try {
                                 const resDetail = await axios.get(api.results.getDetailJawaban(submissionId));
                                 const detailData = resDetail.data.data || resDetail.data; // Array of { jawaban, pertanyaan }
                                 
                                 // Build Answer List HTML
                                 const answerHtml = detailData.map((item, idx) => `
                                    <div class="mb-3 pl-4 border-l-2 border-gray-200 dark:border-gray-600">
                                        <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">
                                            ${idx + 1}. ${item.pertanyaan?.teks || 'Pertanyaan tidak tersedia'}
                                        </p>
                                        <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            ${item.jawaban || '-'}
                                        </p>
                                    </div>
                                 `).join('');

                                 contentDiv.innerHTML = answerHtml;
                                 contentDiv.setAttribute('data-loaded', 'true');

                             } catch (err) {
                                 console.error(err);
                                 contentDiv.innerHTML = `<p class="text-center text-red-500 text-sm">Gagal memuat jawaban.</p>`;
                             }
                         }
                     }
                 });
             });
        }
      });

    } catch (error) {
      console.error("Error fetching survey results:", error);
      const outputError = error.response?.data?.message || error.response?.data?.error || error.message || "Gagal mengambil daftar responden";
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: `Error: ${typeof outputError === 'object' ? JSON.stringify(outputError) : outputError}`,
        customClass: {
          popup: "!bg-white dark:!bg-gray-800",
          title: "text-gray-900 dark:text-gray-100",
          htmlContainer: "text-gray-600 dark:text-gray-300",
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg",
        },
      });
    }
  };

  const handleExport = async (survey) => {
    // 1. Select Date Range Type
    const { value: rangeType } = await Swal.fire({
      title: 'Pilih Rentang Waktu',
      input: 'select',
      inputOptions: {
        '1bulan': '1 Bulan Terakhir',
        '3bulan': '3 Bulan Terakhir',
        '6bulan': '6 Bulan Terakhir',
        'custom': 'Custom Tanggal'
      },
      inputPlaceholder: 'Pilih rentang...',
      showCancelButton: true,
      confirmButtonText: 'Lanjut',
      cancelButtonText: 'Batal',
      customClass: {
          popup: "!bg-white dark:!bg-gray-800",
          title: "text-gray-900 dark:text-gray-100",
          input: "text-gray-900 dark:text-gray-100 dark:bg-dark-700",
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg",
          cancelButton: "bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2.5 rounded-lg",
      }
    });

    if (!rangeType) return;

    // Show Loading while fetching initial data (needed for 'custom' auto-start date)
    Swal.fire({
        title: 'Memproses Data...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        customClass: {
            popup: "!bg-white dark:!bg-gray-800",
            title: "text-gray-900 dark:text-gray-100",
        }
    });

    try {
        // 1. Fetch List of Respondents
        const resList = await axios.get(api.results.getRespondenList(survey.id));
        const respondentList = Array.isArray(resList.data.data) ? resList.data.data : (Array.isArray(resList.data) ? resList.data : []);

        if (respondentList.length === 0) {
            Swal.fire({
                title: 'Data Kosong',
                text: 'Survey ini belum memiliki jawaban.',
                icon: 'info',
                customClass: {
                   popup: "!bg-white dark:!bg-gray-800",
                   title: "text-gray-900 dark:text-gray-100",
                   htmlContainer: "text-gray-600 dark:text-gray-300",
                   confirmButton: "bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg",
                }
            });
            return;
        }

        // Process Dates for Filtering
        const processedRespondents = respondentList.map(r => {
             let d;
             if (!r.tanggal) {
                 d = new Date();
             } else {
                 d = new Date(r.tanggal);
                 if (isNaN(d.getTime())) d = new Date();
             }
             return { ...r, dateObj: d };
        });

        // Determine Search Dates
        let startDate = new Date();
        let endDate = new Date();

        if (rangeType === '1bulan') {
           startDate.setMonth(startDate.getMonth() - 1);
        } else if (rangeType === '3bulan') {
           startDate.setMonth(startDate.getMonth() - 3);
        } else if (rangeType === '6bulan') {
           startDate.setMonth(startDate.getMonth() - 6);
        } else if (rangeType === 'custom') {
           // Find earliest date
           const sortedDates = processedRespondents
              .map(a => a.dateObj)
              .sort((a, b) => a - b);
           
           const earliestDate = sortedDates[0];
           const defaultStartWrapper = earliestDate ? earliestDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
           const defaultEndWrapper = new Date().toISOString().split('T')[0];

           Swal.close(); 

           // Ask for custom dates
           const { value: dates } = await Swal.fire({
              title: 'Masukkan Rentang Tanggal',
              html: `
                <div class="flex flex-col gap-3 text-left">
                    <div>
                        <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tanggal Awal (Sesuai Data Pertama)</label>
                        <input id="swal-start" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-700 text-gray-900 dark:text-white" type="date" value="${defaultStartWrapper}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tanggal Akhir</label>
                        <input id="swal-end" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-700 text-gray-900 dark:text-white" type="date" value="${defaultEndWrapper}">
                    </div>
                </div>
              `,
              focusConfirm: false,
              showCancelButton: true,
              confirmButtonText: 'Unduh Excel',
              cancelButtonText: 'Batal',
              preConfirm: () => {
                 return [
                   document.getElementById('swal-start').value,
                   document.getElementById('swal-end').value
                 ]
              },
              customClass: {
                popup: "!bg-white dark:!bg-gray-800",
                title: "text-gray-900 dark:text-gray-100",
                confirmButton: "bg-green-600 hover:bg-green-700 text-white font-medium px-5 py-2.5 rounded-lg",
                cancelButton: "bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2.5 rounded-lg",
              }
           });

           if (!dates || !dates[0] || !dates[1]) return;
           startDate = new Date(dates[0]);
           endDate = new Date(dates[1]);
           endDate.setHours(23, 59, 59, 999);
           
           Swal.fire({
                title: 'Mengunduh Data...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
                customClass: {
                    popup: "!bg-white dark:!bg-gray-800",
                    title: "text-gray-900 dark:text-gray-100",
                }
            });
        }

        // Filter Respondents
        const filteredRespondents = processedRespondents.filter(r => {
            const d = r.dateObj;
            const s = new Date(startDate); s.setHours(0,0,0,0);
            return d >= s && d <= endDate;
        });

        if (filteredRespondents.length === 0) {
            Swal.fire({
                title:'Data Kosong', 
                text: 'Tidak ada data jawaban pada rentang tanggal tersebut', 
                icon: 'info',
                customClass: {
                   popup: "!bg-white dark:!bg-gray-800",
                   title: "text-gray-900 dark:text-gray-100",
                   htmlContainer: "text-gray-600 dark:text-gray-300",
                   confirmButton: "bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg",
                }
            });
            return;
        }

        // Fetch Details for Filtered
        const detailsPromises = filteredRespondents.map(r => 
             axios.get(api.results.getDetailJawaban(r.submissionId))
                  .then(res => ({ 
                      ...r, 
                      details: Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []) 
                  }))
                  .catch(() => ({ ...r, details: [] }))
        );

        const fullData = await Promise.all(detailsPromises);

        // Group by Session (Timestamp Minute Precision) or Just Use SubmissionID
        // Since we are now strictly respondent-based, we can map directly.
        // But for compatibility with the matrix logic below, let's construct the `grouped` object
        
        const grouped = {};
        const allQuestionMap = new Map(); // Store distinct question texts/IDs

        fullData.forEach(session => {
             // Create unique key per session
             const sortKey = session.submissionId;
             grouped[sortKey] = {
                 date: session.dateObj.toLocaleDateString('id-ID'),
                 time: session.dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                 answers: {}
             };
             
             session.details.forEach(ans => {
                 // Identify Question
                 const qKey = ans.pertanyaan?.teks || `Q-${ans.pertanyaan_id}`;
                 allQuestionMap.set(qKey, qKey);
                 
                 // Store Answer
                 grouped[sortKey].answers[qKey] = ans.jawaban;
             });
        });

        // Build Excel Rows
        const questionHeaders = Array.from(allQuestionMap.keys()).sort();
        const headerRow = ["No", "Tanggal", "Jam", ...questionHeaders];
        
        const dataRows = Object.values(grouped).map((session, idx) => {
             const row = [
                 idx + 1,
                 session.date,
                 session.time
             ];
             // Add answers for each column header
             questionHeaders.forEach(qKey => {
                 row.push(session.answers[qKey] || "-"); 
             });
             return row;
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);

        // Auto-width columns (simple)
        const wscols = headerRow.map(h => ({ wch: h.length + 5 }));
        worksheet['!cols'] = wscols;

        XLSX.utils.book_append_sheet(workbook, worksheet, "Hasil Survey");
        
        const safeName = `${survey.namaSurvey}_Rekap_${rangeType}`.replace(/[^a-z0-9]/gi, '_');
        const filename = `${safeName}.xlsx`;
        XLSX.writeFile(workbook, filename);

        Swal.close();

    } catch (err) {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: `Terjadi kesalahan: ${err.message}`,
          customClass: {
            popup: "!bg-white dark:!bg-gray-800",
            title: "text-gray-900 dark:text-gray-100",
            htmlContainer: "text-gray-600 dark:text-gray-300",
            confirmButton: "bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg",
          }
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
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleViewDetail(survey)}
                        className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 inline-flex items-center gap-1"
                        title="Lihat Hasil"
                      >
                        <EyeIcon className="h-5 w-5" />
                        <span className="text-xs font-medium">Lihat</span>
                      </button>

                      <button
                        onClick={() => handleExport(survey)}
                        className="rounded-lg bg-green-100 p-2 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 inline-flex items-center gap-1"
                        title="Rekap Excel"
                      >
                        <DocumentArrowDownIcon className="h-5 w-5" />
                        <span className="text-xs font-medium">Rekap</span>
                      </button>
                    </div>
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
