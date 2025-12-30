import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import api from "configs/api.config";

// Definisikan Query Keys
const SURVEYS_QUERY_KEY = ["surveys"];
const QUESTIONS_QUERY_KEY = ["questions"];

export default function Pertanyaan() {
  // Inisialisasi Query Client
  const queryClient = useQueryClient(); // ===============================
  // State Lokal
  // ===============================

  const [selectedSurveyId, setSelectedSurveyId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState(null);
  const [deletingSurveyId, setDeletingSurveyId] = useState(null); // ===============================
  // FETCH DATA (useQuery) 🟢
  // ===============================
  // 1. Fetch Surveys

  const { data: surveys = [], isLoading: surveysLoading } = useQuery({
    queryKey: SURVEYS_QUERY_KEY,
    queryFn: async () => {
      const res = await axios.get(api.surveys.list);
      return Array.isArray(res.data.data) ? res.data.data : [];
    },
    staleTime: 0, // Data langsung stale, akan refetch saat halaman dibuka
    refetchOnMount: true, // Selalu refetch saat component mount
  });

  // Effect untuk set selectedSurveyId saat surveys berubah
  useEffect(() => {
    if (surveys.length > 0) {
      if (!selectedSurveyId || !surveys.some((s) => s.id === selectedSurveyId)) {
        setSelectedSurveyId(surveys[0].id);
      }
    } else {
      setSelectedSurveyId(null);
    }
  }, [surveys, selectedSurveyId]);

  // 2. Fetch Questions

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: [QUESTIONS_QUERY_KEY, selectedSurveyId], // Key bergantung pada selectedSurveyId
    queryFn: async () => {
      if (!selectedSurveyId) return [];
      const res = await axios.get(api.surveys.getById(selectedSurveyId));
      return Array.isArray(res.data.data.pertanyaan)
        ? res.data.data.pertanyaan
        : [];
    },
    enabled: !!selectedSurveyId, // Hanya aktif jika selectedSurveyId ada
  });

  // Effect untuk reset halaman saat questions berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [questions]); // ===============================
  // CRUD MUTATIONS (useMutation) 🔴
  // ===============================
  // 1. Mutasi Hapus Pertanyaan

  const deleteQuestionMutation = useMutation({
    mutationFn: (id) => axios.delete(api.questions.delete(id)),
    onSuccess: () => {
      // Refresh Questions dan Survey Count secara otomatis
      queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SURVEYS_QUERY_KEY });
    },
    onSettled: () => {
      setDeletingQuestionId(null);
    },
  }); // 2. Mutasi Hapus Survey

  const deleteSurveyMutation = useMutation({
    mutationFn: (id) => axios.delete(api.surveys.delete(id)),
    onSuccess: () => {
      // Refresh semua daftar
      queryClient.invalidateQueries({ queryKey: SURVEYS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY });
    },
    onSettled: () => {
      setDeletingSurveyId(null);
    },
  }); // 3. Mutasi Edit Pertanyaan

  const updateQuestionMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      axios.put(api.questions.update(id), payload),
    onSuccess: () => {
      // <-- TINGGALKAN KOSONG
      queryClient.invalidateQueries({
        queryKey: [QUESTIONS_QUERY_KEY, selectedSurveyId],
      });
    },
    onSettled: () => {
      setEditingQuestionId(null);
    },
  }); // 4. Mutasi Tambah Pertanyaan (Batch Create)

  const createQuestionsMutation = useMutation({
    mutationFn: (payload) => axios.post(api.questions.create, payload),
    onSuccess: (data, variables) => {
      // Invalidate questions untuk survey yang baru ditambahkan
      queryClient.invalidateQueries({
        queryKey: [QUESTIONS_QUERY_KEY, variables.idSurvey],
      }); // Invalidate surveys untuk update count pertanyaan
      queryClient.invalidateQueries({ queryKey: SURVEYS_QUERY_KEY });
    },
  }); // ===============================
  // HANDLERS
  // ===============================

  const handleDeleteQuestion = async (id) => {
    Swal.fire({
      title: "Hapus Pertanyaan?",
      text: "Data pertanyaan yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3b82f6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
      customClass: {
        popup: "!bg-white dark:!bg-gray-800",
        title: "text-gray-900 dark:text-gray-100",
        htmlContainer: "text-gray-600 dark:text-gray-300",
        confirmButton:
          "bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2.5 rounded-lg",
        cancelButton:
          "bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setDeletingQuestionId(id);
          await deleteQuestionMutation.mutateAsync(id);
          Swal.fire({
            icon: "success",
            title: "Terhapus!",
            text: "Pertanyaan berhasil dihapus.",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "!bg-white dark:!bg-gray-800",
              title: "text-gray-900 dark:text-gray-100",
              htmlContainer: "text-gray-600 dark:text-gray-300",
            },
          });
        } catch (error) {
          console.error("Error deleting question:", error);
          Swal.fire("Gagal!", "Gagal menghapus pertanyaan.", "error");
        }
      }
    });
  };

  const handleEditQuestion = async (questionId) => {
    const questionToEdit = questions.find((q) => q.id === questionId);
    if (!questionToEdit) {
      return Swal.fire("Error", "Pertanyaan tidak ditemukan", "error");
    }

    setEditingQuestionId(questionId); // Ambil data awal

    const initialTeks = questionToEdit.teks;
    const initialTipe = questionToEdit.tipe;
    // Gunakan opsi yang ada, jika tidak ada, gunakan default ['','']
    const initialOpsi = Array.isArray(questionToEdit.opsi)
      ? questionToEdit.opsi
      : ["", ""];

    try {
      await Swal.fire({
        title: `Edit Pertanyaan #${
          questionToEdit.urutan || questionId.substring(0, 4)
        }`,
        width: 650,
        html: `
            <div class="text-left p-2">
                <label class="block mb-2 text-gray-900 dark:text-gray-200">Tipe Pertanyaan:</label>
                <select id="swal-edit-type" class="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg mb-3 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200" disabled>
                      <option value="isian" ${
                        initialTipe === "isian" ? "selected" : ""
                      }>Isian</option>
                      <option value="pilihan_ganda" ${
                        initialTipe === "pilihan_ganda" ? "selected" : ""
                      }>Pilihan Ganda</option>
                </select>
                <div id="dynamic-edit-field" class="mb-3"></div>
            </div>
          `,
        didOpen: () => {
          const typeSelect = document.getElementById("swal-edit-type");
          const fieldWrap = document.getElementById("dynamic-edit-field");

          // 1. Fungsi untuk merender input opsi dinamis saat edit
          const renderOpsiInputsEdit = (options) => {
            // Pastikan minimal ada 2 input, bahkan jika data awal kurang dari 2
            const minOptions = Math.max(2, options.length);
            let html = `
                <label class="block mb-2 text-gray-900 dark:text-gray-200 flex justify-between items-center">
                    <span>Opsi Pilihan (Min. 2):</span>
                    <button id="btn-add-option-edit" type="button" class="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full">+ Opsi</button>
                </label>
                <div id="options-container-edit">
            `;
            
            for (let i = 0; i < minOptions; i++) {
                const value = options[i] || "";
                html += `
                    <div class="flex gap-2 mb-1 option-row" data-id="${i}">
                        <input id="option-edit-${i}" class="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200" value="${value}" placeholder="Opsi ${i + 1}">
                        ${
                          i > 1 // Tampilkan tombol hapus dari opsi ketiga
                            ? `<button type="button" class="btn-remove-option-edit text-red-500 hover:text-red-700 px-2 py-1" data-id="${i}">&times;</button>`
                            : `<div class="w-8"></div>`
                        }
                    </div>
                `;
            }
            html += `</div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    **Contoh Penggunaan:** A. Sangat Puas, B. Puas, C. Cukup, D. Kurang Puas.
                </p>
            `;
            return html;
          };

          // 2. Fungsi untuk melampirkan listeners untuk opsi (tambah/hapus)
          const attachOptionListenersEdit = () => {
              const btnAdd = document.getElementById("btn-add-option-edit");
              const optionsContainer = document.getElementById("options-container-edit");
              if (!btnAdd || !optionsContainer) return;

              // Listener Tambah Opsi
              btnAdd.onclick = () => {
                  const currentOptions = optionsContainer.querySelectorAll(".option-row");
                  const newId = currentOptions.length;
                  const newOptionHTML = `
                      <div class="flex gap-2 mb-1 option-row" data-id="${newId}">
                          <input id="option-edit-${newId}" class="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200" placeholder="Opsi ${newId + 1}">
                          <button type="button" class="btn-remove-option-edit text-red-500 hover:text-red-700 px-2 py-1" data-id="${newId}">&times;</button>
                      </div>
                  `;
                  optionsContainer.insertAdjacentHTML("beforeend", newOptionHTML);
                  attachRemoveListenersEdit(); // Attach listener ke tombol hapus baru
              };

              // Listener Hapus Opsi
              const attachRemoveListenersEdit = () => {
                  document.querySelectorAll(".btn-remove-option-edit").forEach((btn) => {
                      btn.onclick = (e) => {
                          const row = e.target.closest(".option-row");
                          if (row && optionsContainer.querySelectorAll(".option-row").length > 2) {
                              row.remove();
                          } else if (
                              optionsContainer.querySelectorAll(".option-row").length <= 2
                          ) {
                              Swal.showValidationMessage("Minimal harus ada 2 opsi pilihan.");
                          }
                      };
                  });
              };
              attachRemoveListenersEdit();
          };

          // 3. Fungsi utama untuk merender field berdasarkan tipe
          const renderField = () => {
            const currentTipe = typeSelect.value;
            if (currentTipe === "isian") {
              fieldWrap.innerHTML = `
                <label class="block mb-2 text-gray-900 dark:text-gray-200">Teks Pertanyaan:</label>
                <input id="swal-edit-text" class="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200" placeholder="Masukkan pertanyaan" value="${initialTeks}">
              `;
            } else {
              fieldWrap.innerHTML = `
                <label class="block mb-2 text-gray-900 dark:text-gray-200">Teks Pertanyaan:</label>
                <input id="swal-edit-text" class="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg mb-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200" placeholder="Masukkan pertanyaan" value="${initialTeks}">
                ${renderOpsiInputsEdit(initialOpsi)}
              `;
              attachOptionListenersEdit();
            }
          };

          renderField();
          // typeSelect di-disable, jadi tidak perlu listener change
        },
        showCancelButton: true,
        confirmButtonText: "Simpan Perubahan",
        cancelButtonText: "Batal",
        customClass: {
          popup: "!bg-white dark:!bg-gray-800",
          title: "!text-black dark:!text-white",
          htmlContainer: "text-gray-600 dark:text-gray-300",
          confirmButton:
            "bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2.5 rounded-lg",
          cancelButton:
            "bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2.5 rounded-lg",
        },
        preConfirm: () => {
          const tipe = initialTipe; // Tipe tetap
          const teks = document.getElementById("swal-edit-text").value.trim();

          if (!teks) {
            Swal.showValidationMessage("Pertanyaan tidak boleh kosong");
            return false;
          }

          let updatePayload = {
            teks: teks,
          };

          if (tipe === "pilihan_ganda") {
            const optionsContainer = document.getElementById("options-container-edit");
            const optionInputs = optionsContainer.querySelectorAll("input");
            const options = [];
            let emptyOptionCount = 0;

            optionInputs.forEach((input) => {
              const val = input.value.trim();
              if (val) {
                options.push(val);
              } else {
                emptyOptionCount++;
              }
            });

            // Validasi Opsi
            if (options.length < 2) {
              Swal.showValidationMessage("Minimal harus ada 2 opsi pilihan yang terisi.");
              return false;
            }
            if (emptyOptionCount > 0) {
              Swal.showValidationMessage("Semua kolom opsi harus diisi atau dihapus.");
              return false;
            }

            updatePayload.opsi = options;
          } // Kirim request PUT/PATCH melalui mutation

          return updateQuestionMutation
            .mutateAsync({ id: questionId, payload: updatePayload })
            .then((res) => {
              return res.data;
            })
            .catch((error) => {
              console.error("Error updating question:", error);
              const errorMessage =
                error.response && error.response.status === 401
                  ? "Sesi habis, mohon refresh dan login ulang."
                  : "Gagal menyimpan perubahan (Cek konsol)";
              Swal.showValidationMessage(errorMessage);
              return false;
            });
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // Data akan otomatis di-refresh oleh React Query
          Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "Pertanyaan berhasil diperbarui.",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "!bg-white dark:!bg-gray-800",
              title: "text-gray-900 dark:text-gray-100",
              htmlContainer: "text-gray-600 dark:text-gray-300",
            },
          });
        } else if (result.dismiss) {
          setEditingQuestionId(null); // Reset jika dibatalkan
        }
      });
    } catch (e) {
      console.error("Error opening edit modal/mutation:", e);
      setEditingQuestionId(null);
    }
  };

  const handleDeleteSurvey = async (id) => {
    Swal.fire({
      title: "Hapus Survey?",
      text: "Survey dan semua pertanyaan di dalamnya akan dihapus!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3b82f6",
      confirmButtonText: "Ya, Hapus Survey!",
      cancelButtonText: "Batal",
      customClass: {
        popup: "!bg-white dark:!bg-gray-800",
        title: "text-gray-900 dark:text-gray-100",
        htmlContainer: "text-gray-600 dark:text-gray-300",
        confirmButton:
          "bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2.5 rounded-lg",
        cancelButton:
          "bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setDeletingSurveyId(id);
          await deleteSurveyMutation.mutateAsync(id);
          Swal.fire({
            icon: "success",
            title: "Terhapus!",
            text: "Survey berhasil dihapus.",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "!bg-white dark:!bg-gray-800",
              title: "text-gray-900 dark:text-gray-100",
              htmlContainer: "text-gray-600 dark:text-gray-300",
            },
          });
        } catch (error) {
          console.error("Error deleting survey:", error);
          Swal.fire("Gagal!", "Gagal menghapus survey.", "error");
        }
      }
    });
  };

  const handleAdd = () => {
    let tempQuestions = [];
    const refreshListHTML = () => {
      if (tempQuestions.length === 0)
        return "<p class='text-gray-500 dark:text-gray-400'>Belum ada pertanyaan yang ditambahkan.</p>";
      return tempQuestions
        .map((q, i) => {
          const typeLabel = q.tipe === "isian" ? "Isian" : "Pilihan Ganda";
          const optionsText = q.opsi ? `Opsi: ${q.opsi.join(", ")}` : "";
          return `
            <div class="p-3 border border-gray-200 dark:border-dark-600 rounded-lg mb-2 bg-white dark:bg-dark-800">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">#${
            i + 1
          }</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">(${typeLabel})</p>
              <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">${q.teks}</p>
              ${
            optionsText
              ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${optionsText}</p>`
              : ""
          }
            </div>
          `;
        })
        .join("");
    };

    Swal.fire({
      title: "Tambahkan Pertanyaan",
      width: 700, // Lebar sedikit diperluas untuk opsi
      html: `
        <div class="text-left p-2">
          <label class="block mb-2 text-gray-900 dark:text-gray-200">Pilih Survey:</label>
          <select id="swal-survey" class="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg mb-3 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200">
            ${surveys
        .map(
          (s) =>
            `<option value="${s.id}" ${
              s.id === selectedSurveyId ? "selected" : ""
            }>${s.namaSurvey || `Survey ID: ${s.id}`}</option>`,
        )
        .join("")}
          </select>

          <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 flex items-center justify-between">
              <div>
                 <p class="text-sm text-blue-800 dark:text-blue-200 font-medium">Opsi Cepat</p>
                 <p class="text-xs text-blue-600 dark:text-blue-300">Tambahkan pertanyaan profil standar secara otomatis.</p>
              </div>
              <button id="btn-generate-profile" class="text-sm bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors shadow-sm">
                  + Generate Profil
              </button>
           </div>

          <label class="block mb-2 text-gray-900 dark:text-gray-200">Tipe Pertanyaan:</label>
          <select id="swal-type" class="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg mb-3 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200">
            <option value="isian">Isian</option> <option value="pilihan_ganda">Pilihan Ganda</option>
          </select>
          <div id="dynamic-field" class="mb-3"></div>
          <button id="btn-add" class="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium p-2 rounded-lg transition-all duration-200">+ Tambahkan Pertanyaan ke Daftar</button>
          <div id="list-preview" class="mt-3 max-h-48 overflow-y-auto border border-gray-300 dark:border-dark-600 p-2 rounded-lg bg-gray-50 dark:bg-dark-900/50">${refreshListHTML()}</div>
        </div>
      `,
      didOpen: () => {
        const typeSelect = document.getElementById("swal-type");
        const fieldWrap = document.getElementById("dynamic-field");
        const surveySelect = document.getElementById("swal-survey"); // Fungsi untuk merender input opsi dinamis

        // NEW: Listener untuk Generate Profil
        document.getElementById("btn-generate-profile").addEventListener("click", () => {
             const surveyId = surveySelect.value;
             const profileQuestions = [
                {
                    surveyId,
                    tipe: 'pilihan_ganda',
                    teks: 'Jenis Kelamin',
                    urutan: 0,
                    opsi: ['L', 'P']
                },
                {
                    surveyId,
                    tipe: 'isian',
                    teks: 'Usia (Tahun)',
                    urutan: 0,
                },
                {
                    surveyId,
                    tipe: 'pilihan_ganda',
                    teks: 'Pendidikan',
                    urutan: 0,
                    opsi: ['SD', 'SMP', 'SMA', 'S1', 'S2', 'S3']
                },
                {
                    surveyId,
                    tipe: 'pilihan_ganda',
                    teks: 'Pekerjaan',
                    urutan: 0,
                    opsi: ['PNS', 'TNI', 'POLRI', 'SWASTA', 'WIRASWASTA', 'LAINNYA']
                },
                {
                    surveyId,
                    tipe: 'isian',
                    teks: 'Jenis Layanan yang diterima (Misal :Konsultasi, permohonan data, dll',
                    urutan: 0,
                }
             ];
             
             // Tambahkan ke tempQuestions
             profileQuestions.forEach((q) => {
                 q.urutan = tempQuestions.length + 1; 
                 tempQuestions.push(q);
             });
             
             document.getElementById("list-preview").innerHTML = refreshListHTML();
             
             // Feedback visual
             const btnGen = document.getElementById("btn-generate-profile");
             const originalText = btnGen.innerText;
             btnGen.innerText = "✓ Ditambahkan!";
             btnGen.disabled = true;
             btnGen.classList.remove("bg-blue-600", "hover:bg-blue-700");
             btnGen.classList.add("bg-green-600", "cursor-not-allowed");
             
             // Kembalikan tombol setelah beberapa detik (opsional, tapi user mungkin mau add lagi kalau salah hapus? tapi disable dulu biar ga double klik gak sengaja)
             setTimeout(() => {
                 btnGen.innerText = originalText;
                 btnGen.disabled = false;
                 btnGen.classList.add("bg-blue-600", "hover:bg-blue-700");
                 btnGen.classList.remove("bg-green-600", "cursor-not-allowed");
             }, 2000);
        });

        const renderOpsiInputs = (initialCount = 2) => {
          let html = `
            <label class="block mb-2 text-gray-900 dark:text-gray-200 flex justify-between items-center">
              <span>Opsi Pilihan (Min. 2):</span>
              <button id="btn-add-option" type="button" class="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full">+ buat column baru</button>
            </label>
            <div id="options-container">
          `;
          for (let i = 1; i <= initialCount; i++) {
            html += `
              <div class="flex gap-2 mb-1 option-row" data-id="${i}">
                <input id="option-${i}" class="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200" value="${
              i === 1 ? "Ya" : i === 2 ? "Tidak" : ""
            }" placeholder="Opsi ${i}">
                ${
              i > 2
                ? `<button type="button" class="btn-remove-option text-red-500 hover:text-red-700 px-2 py-1" data-id="${i}">&times;</button>`
                : `<div class="w-8"></div>`
            }
              </div>
            `;
          }
          html += `</div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              **Contoh Penggunaan:** A. Sangat Puas, B. Puas, C. Cukup, D. Kurang Puas.
            </p>
          `;
          return html;
        };

        const renderField = () => {
          if (typeSelect.value === "isian") {
            fieldWrap.innerHTML = `
                <label class="block mb-2 text-gray-900 dark:text-gray-200">Teks Pertanyaan:</label>
                <input id="swal-text" class="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200" placeholder="Masukkan pertanyaan">
            `;
          } else {
            fieldWrap.innerHTML = `
                <label class="block mb-2 text-gray-900 dark:text-gray-200">Teks Pertanyaan:</label>
                <input id="swal-text" class="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg mb-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200" placeholder="Masukkan pertanyaan">
                ${renderOpsiInputs(2)}
            `;
            attachOptionListeners();
          }
        }; // Fungsi untuk melampirkan listeners untuk opsi (tambah/hapus)

        const attachOptionListeners = () => {
          const btnAdd = document.getElementById("btn-add-option");
          const optionsContainer = document.getElementById("options-container");
          if (!btnAdd || !optionsContainer) return; // Listener Tambah Opsi

          btnAdd.onclick = () => {
            const currentOptions =
              optionsContainer.querySelectorAll(".option-row");
            const newId = currentOptions.length + 1;
            const newOptionHTML = `
              <div class="flex gap-2 mb-1 option-row" data-id="${newId}">
                <input id="option-${newId}" class="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200" placeholder="Opsi ${newId}">
                <button type="button" class="btn-remove-option text-red-500 hover:text-red-700 px-2 py-1" data-id="${newId}">&times;</button>
              </div>
          `;
            optionsContainer.insertAdjacentHTML("beforeend", newOptionHTML);
            attachRemoveListeners(); // Attach listener ke tombol hapus baru
          }; // Listener Hapus Opsi

          const attachRemoveListeners = () => {
            document.querySelectorAll(".btn-remove-option").forEach((btn) => {
              btn.onclick = (e) => {
                const row = e.target.closest(".option-row");
                if (
                  row &&
                  optionsContainer.querySelectorAll(".option-row").length > 2
                ) {
                  row.remove();
                } else if (
                  optionsContainer.querySelectorAll(".option-row").length <= 2
                ) {
                  Swal.showValidationMessage(
                    "Minimal harus ada 2 opsi pilihan.",
                  );
                }
              };
            });
          };
          attachRemoveListeners();
        };

        renderField();
        typeSelect.addEventListener("change", renderField); // Listener untuk tombol "Tambahkan Pertanyaan ke Daftar"

        document.getElementById("btn-add").addEventListener("click", () => {
          const surveyId = surveySelect.value;
          const tipe = typeSelect.value;
          const textInput = document.getElementById("swal-text");
          const teks = textInput.value.trim(); // Validasi Teks Pertanyaan
          if (!teks) {
            return Swal.showValidationMessage(
              "Teks pertanyaan tidak boleh kosong",
            );
          }

          let newQ = {
            surveyId,
            tipe: tipe,
            teks: teks,
            urutan: tempQuestions.length + 1,
          };

          let valid = true;

          if (tipe === "pilihan_ganda") {
            const optionsContainer =
              document.getElementById("options-container");
            const optionInputs = optionsContainer.querySelectorAll("input");
            const options = [];
            let emptyOptionCount = 0;

            optionInputs.forEach((input) => {
              const val = input.value.trim();
              if (val) {
                options.push(val);
              } else {
                emptyOptionCount++;
              }
            });

            if (options.length < 2) {
              Swal.showValidationMessage(
                "Minimal harus ada 2 opsi pilihan yang terisi.",
              );
              valid = false;
            } else if (emptyOptionCount > 0) {
              Swal.showValidationMessage(
                "Semua kolom opsi harus diisi atau dihapus.",
              );
              valid = false;
            } else {
              newQ.opsi = options;
            }
          }

          if (valid) {
            tempQuestions.push(newQ);
            document.getElementById("list-preview").innerHTML =
              refreshListHTML(); // Reset form input
            textInput.value = "";
            typeSelect.value = "isian"; // Reset ke Isian sebagai default
            renderField(); // Render ulang untuk menampilkan input isian
            Swal.resetValidationMessage();
          }
        });
      },
      showCancelButton: true,
      confirmButtonText: "Simpan Semua",
      cancelButtonText: "Batal",
      customClass: {
        popup: "!bg-white dark:!bg-gray-800",
        title: "!text-black dark:!text-white",
        htmlContainer: "text-gray-600 dark:text-gray-300",
        confirmButton:
          "bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg",
        cancelButton:
          "bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2.5 rounded-lg",
      },
      preConfirm: async () => {
        if (tempQuestions.length === 0) {
          return Swal.showValidationMessage(
            "Belum ada pertanyaan yang siap disimpan",
          );
        }
        const idSurvey = tempQuestions[0].surveyId;
        const listPertanyaan = tempQuestions.map((q) => ({
          tipe: q.tipe,
          teks: q.teks,
          urutan: q.urutan,
          ...(q.tipe === "pilihan_ganda" && { opsi: q.opsi }),
        }));

        const finalPayload = {
          idSurvey: idSurvey,
          listPertanyaan: listPertanyaan,
        };

        try {
          // Gunakan mutation
          await createQuestionsMutation.mutateAsync(finalPayload);

          return {
            count: tempQuestions.length,
            targetSurveyId: idSurvey,
          };
        } catch (error) {
          console.error("Error creating questions:", error);
          const errorMessage =
            error.response && error.response.status === 401
              ? "Sesi habis, mohon refresh dan login ulang."
              : "Gagal menambahkan pertanyaan (Cek konsol)";
          Swal.showValidationMessage(errorMessage);
          return false;
        }
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { count, targetSurveyId } = result.value; // Update selected survey jika survey yang dituju berbeda
        if (targetSurveyId !== selectedSurveyId) {
          setSelectedSurveyId(targetSurveyId);
        } // React Query akan otomatis me-refresh daftar pertanyaan dan survey count

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: `${count} pertanyaan berhasil ditambahkan.`,
          timer: 2500,
          showConfirmButton: false,
          customClass: {
            popup: "!bg-white dark:!bg-gray-800",
            title: "text-gray-900 dark:text-gray-100",
            htmlContainer: "text-gray-600 dark:text-gray-300",
          },
        });
      }
    });
  };

  const handleViewSurveyDetail = async (surveyId) => {
    try {
      const res = await axios.get(api.surveys.getById(surveyId));
      const surveyDetail = res.data.data;
      const detailQuestions = Array.isArray(surveyDetail.pertanyaan)
        ? surveyDetail.pertanyaan
        : [];
      const surveyName = surveyDetail.namaSurvey || `Survey ID: ${surveyId}`;

      Swal.fire({
        title: `Detail Survey: ${surveyName}`,
        html: `<div class="text-left max-h-96 overflow-y-auto p-2">${detailQuestions
          .map((q, i) => {
            const typeLabel = q.tipe === "isian" ? "Isian" : "Pilihan Ganda";
            const optionsText =
              q.tipe === "pilihan_ganda" && q.opsi && Array.isArray(q.opsi)
                ? `Opsi: ${q.opsi.join(", ")}`
                : "";
            return `
                     <div class="p-2 border border-gray-200 dark:border-dark-600 rounded-lg mb-2 bg-white dark:bg-dark-800">
                        <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">#${
                          q.urutan || i + 1
                        } (${typeLabel})</p>
                        <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">${q.teks}</p>
                        ${
                          optionsText
                            ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${optionsText}</p>`
                            : ""
                        }
                     </div>
                  `;
          })
          .join("")}</div>`,
        width: 600,
        customClass: {
          popup: "!bg-white dark:!bg-gray-800",
          title: "!text-black dark:!text-white",
          htmlContainer: "text-gray-600 dark:text-gray-300",
          confirmButton:
            "bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg",
        },
      });
    } catch (error) {
      console.error("Error fetching survey detail:", error);
      Swal.fire("Error", "Gagal mengambil detail survey", "error");
    }
  }; // ===============================
  // PAGINATION
  // ===============================

  const totalPages = Math.ceil(questions.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const questionsToDisplay = questions.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  const handleNext = () => handlePageChange(currentPage + 1);
  const handlePrev = () => handlePageChange(currentPage - 1); // ===============================
  // Render
  // ===============================

  return (
    <div className="dark:bg-dark-900 min-h-screen w-full bg-white p-4 text-gray-900 lg:p-6 dark:text-gray-200">
      {/* Header */}{" "}
      <div className="mb-6 flex items-center justify-between">
        {" "}
        <h2 className="text-2xl font-semibold">
          Manajemen Survey & Pertanyaan{" "}
        </h2>{" "}
        <button
          onClick={handleAdd}
          className="rounded-lg bg-yellow-500 px-5 py-2.5 font-medium text-black hover:bg-yellow-600"
          disabled={surveys.length === 0} 
        >
          + Tambah Pertanyaan Baru{" "}
        </button>{" "}
      </div>
      <hr className="dark:border-dark-700 my-4 border-gray-200" />{" "}
      {/* Tabel Survey */}{" "}
      <h3 className="mb-3 text-xl font-semibold">Daftar Survey</h3>{" "}
      <div className="dark:bg-dark-800 dark:border-dark-700 mb-8 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        {" "}
        <table className="w-full text-left text-sm">
          {" "}
          <thead className="dark:bg-dark-700 bg-gray-100 text-gray-700 dark:text-gray-200">
            {" "}
            <tr>
              <th className="px-4 py-3">Nama Survey</th>{" "}
              <th className="w-32 px-4 py-3 text-center">Total Pertanyaan</th>
              <th className="w-40 px-4 py-3">Tanggal Dibuat</th>
              <th className="w-28 px-4 py-3 text-center">Aksi</th>
              <th className="w-24 px-4 py-3 text-center">Pilih</th>{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody>
            {" "}
            {surveysLoading ? (
              <tr>
                {" "}
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  Memuat daftar survey...{" "}
                </td>{" "}
              </tr>
            ) : surveys.length === 0 ? (
              <tr>
                {" "}
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  Belum ada survey yang dibuat.{" "}
                </td>{" "}
              </tr>
            ) : (
              surveys.map((s) => (
                <tr
                  key={s.id}
                  className={`dark:border-dark-600 border-b border-gray-200 ${
                    selectedSurveyId === s.id
                      ? "dark:bg-dark-700/50 bg-yellow-50"
                      : "dark:hover:bg-dark-800 hover:bg-gray-50"
                  }`}
                >
                  {" "}
                  <td className="px-4 py-3">{s.namaSurvey}</td>{" "}
                  <td className="px-4 py-3 text-center">
                    {s._count?.pertanyaan || 0}{" "}
                  </td>{" "}
                  <td className="px-4 py-3">
                    {" "}
                    {new Date(s.tanggalDibuat).toLocaleDateString("id-ID")}{" "}
                  </td>{" "}
                  <td className="flex justify-center gap-2 px-4 py-3 text-center">
                    {" "}
                    <button
                      onClick={() => handleViewSurveyDetail(s.id)}
                      className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                      title="Lihat Detail Survey"
                    >
                      <EyeIcon className="h-5 w-5" />{" "}
                    </button>{" "}
                    <button
                      onClick={() => handleDeleteSurvey(s.id)}
                      className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                      disabled={deletingSurveyId === s.id}
                      title="Hapus Survey"
                    >
                      {" "}
                      {deletingSurveyId === s.id ? (
                        "..."
                      ) : (
                        <TrashIcon className="h-5 w-5" />
                      )}{" "}
                    </button>{" "}
                  </td>{" "}
                  <td className="px-4 py-3 text-center">
                    {" "}
                    <input
                      type="radio"
                      name="survey-selector"
                      checked={selectedSurveyId === s.id}
                      onChange={() => {
                        // Toggle: jika survey yang sama diklik lagi, unselect
                        if (selectedSurveyId === s.id) {
                          setSelectedSurveyId(null);
                        } else {
                          setSelectedSurveyId(s.id);
                        }
                      }}
                      className="form-radio h-4 w-4 text-blue-500 cursor-pointer"
                    />{" "}
                  </td>{" "}
                </tr>
              ))
            )}{" "}
          </tbody>{" "}
        </table>{" "}
      </div>
      {/* Tabel Pertanyaan */}{" "}
      <h3 className="mb-3 text-xl font-semibold">
        Pertanyaan Survey:{" "}
        <span className="text-yellow-500">
          {" "}
          {surveys.find((s) => s.id === selectedSurveyId)?.namaSurvey ||
            "Pilih Survey"}{" "}
        </span>{" "}
      </h3>{" "}
      <div className="dark:bg-dark-800 dark:border-dark-700 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        {" "}
        <table className="w-full text-left text-sm">
          {" "}
          <thead className="dark:bg-dark-700 bg-gray-100 text-gray-700 dark:text-gray-200">
            {" "}
            <tr>
              <th className="w-16 px-4 py-3">No.</th>{" "}
              <th className="px-4 py-3">Teks Pertanyaan</th>{" "}
              <th className="w-32 px-4 py-3">Tipe</th>{" "}
              <th className="w-36 px-4 py-3 text-center">Aksi</th>{" "}
            </tr>{" "}
          </thead>{" "}
          <tbody>
            {" "}
            {questionsLoading ? (
              <tr>
                {" "}
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  Memuat pertanyaan...{" "}
                </td>{" "}
              </tr>
            ) : !selectedSurveyId || questionsToDisplay.length === 0 ? (
              <tr>
                {" "}
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  {" "}
                  {selectedSurveyId
                    ? "Belum ada pertanyaan untuk survey ini"
                    : "Silahkan pilih survey di atas."}{" "}
                </td>{" "}
              </tr>
            ) : (
              questionsToDisplay.map((q, idx) => (
                <tr
                  key={q.id}
                  className="dark:border-dark-600 dark:hover:bg-dark-800 border-b border-gray-200 hover:bg-gray-50"
                >
                  {" "}
                  <td className="px-4 py-3">{startIndex + idx + 1}</td>
                  <td className="px-4 py-3">{q.teks}</td>{" "}
                  <td className="px-4 py-3">
                    {" "}
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        q.tipe === "isian"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                          : "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                      }`}
                    >
                      <TagIcon className="mr-1 h-3 w-3" />{" "}
                      {q.tipe === "isian" ? "Isian" : "Pilihan Ganda"}{" "}
                    </span>{" "}
                  </td>{" "}
                  <td className="flex justify-center gap-2 px-4 py-3 text-center">
                    {" "}
                    <button
                      onClick={() => handleEditQuestion(q.id)}
                      className="text-yellow-500 hover:text-yellow-600 disabled:opacity-50"
                      disabled={editingQuestionId === q.id}
                      title="Edit Pertanyaan"
                    >
                      {" "}
                      {editingQuestionId === q.id ? (
                        "..."
                      ) : (
                        <PencilSquareIcon className="h-5 w-5" />
                      )}{" "}
                    </button>{" "}
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-red-500 hover:text-red-600 disabled:opacity-50"
                      disabled={deletingQuestionId === q.id}
                      title="Hapus Pertanyaan"
                    >
                      {" "}
                      {deletingQuestionId === q.id ? (
                        "..."
                      ) : (
                        <TrashIcon className="h-5 w-5" />
                      )}{" "}
                    </button>{" "}
                  </td>{" "}
                </tr>
              ))
            )}{" "}
          </tbody>{" "}
        </table>{" "}
      </div>
      {/* Pagination */}{" "}
      {questions.length > rowsPerPage && (
        <div className="mt-3 flex items-center justify-between">
          {" "}
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="dark:bg-dark-700 rounded bg-gray-200 px-3 py-1 text-gray-700 disabled:opacity-50 dark:text-gray-200"
          >
            <ChevronLeftIcon className="inline h-4 w-4" /> Prev{" "}
          </button>{" "}
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}{" "}
          </span>{" "}
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="dark:bg-dark-700 rounded bg-gray-200 px-3 py-1 text-gray-700 disabled:opacity-50 dark:text-gray-200"
          >
            Next <ChevronRightIcon className="inline h-4 w-4" />{" "}
          </button>{" "}
        </div>
      )}{" "}
    </div>
  );
}
