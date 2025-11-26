import { useState } from "react";
import Swal from "sweetalert2";
import { ChevronLeftIcon, ChevronRightIcon, PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function Pertanyaan() {
  const [questions, setQuestions] = useState(
    Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      text: `Contoh pertanyaan nomor ${i + 1}`,
      type: i % 2 === 0 ? "input" : "pilihan",
      survey: "Survey UMKM",
    }))
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [slideDirection, setSlideDirection] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const rowsPerPage = 5;

  const totalPages = Math.ceil(questions.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const questionsToDisplay = questions.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    if (pageNumber > currentPage) {
      setSlideDirection('slide-left');
    } else {
      setSlideDirection('slide-right');
    }
    setTimeout(() => {
      setCurrentPage(pageNumber);
      setSlideDirection('');
    }, 300);
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setSlideDirection('slide-left');
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setSlideDirection('');
      }, 300);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setSlideDirection('slide-right');
      setTimeout(() => {
        setCurrentPage(currentPage - 1);
        setSlideDirection('');
      }, 300);
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Hapus Pertanyaan?',
      text: 'Data yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      customClass: {
        popup: 'bg-gray-50 dark:bg-dark-900 dark:text-gray-200',
        confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2.5 rounded-lg',
        cancelButton: 'bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setDeletingId(id);
        setTimeout(() => {
          setQuestions(questions.filter(q => q.id !== id));
          setDeletingId(null);
          Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Pertanyaan berhasil dihapus.',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'bg-gray-50 dark:bg-dark-900 dark:text-gray-200'
            }
          });
        }, 400);
      }
    });
  };

  const handleAdd = () => {
    let tempQuestions = [];

    const refreshListHTML = () => {
      if (tempQuestions.length === 0) {
        return "<p class='text-gray-500 dark:text-gray-400'>Belum ada pertanyaan.</p>";
      }

      return tempQuestions
        .map((q, i) => {
          let opsiHTML = "";

          if (q.type === "pilihan") {
            opsiHTML = `
              <div class="mt-2 text-xs space-y-1">
                <div class="flex items-center gap-2">
                  <input type="radio" disabled>
                  <span class="text-gray-700 dark:text-gray-300">${q.option1}</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="radio" disabled>
                  <span class="text-gray-700 dark:text-gray-300">${q.option2}</span>
                </div>
              </div>
            `;
          }

          return `
            <div class="p-3 border border-gray-200 dark:border-dark-600 rounded-lg mb-2 bg-white dark:bg-dark-800">
              <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">#${i + 1} (${q.type === "input" ? "Isian" : "Pilihan Ganda"})</p>
              <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">${q.text}</p>
              ${opsiHTML}
            </div>
          `;
        })
        .join("");
    };

    Swal.fire({
      title: "Tambahkan Pertanyaan",
      width: 650,
      html: `
        <div class="text-left p-2">

          <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Pilih Survey:</label>
          <select id="swal-survey" class="w-full p-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
            <option value="Survey UMKM">Survey UMKM</option>
            <option value="Survey Kepuasan">Survey Kepuasan</option>
          </select>

          <label class="block text-sm font-medium mt-4 mb-2 text-gray-700 dark:text-gray-300">Tipe Pertanyaan:</label>
          <select id="swal-type" class="w-full p-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent">
            <option value="input">Isian</option>
            <option value="pilihan">Pilihan Ganda</option>
          </select>

          <div id="dynamic-field" class="mt-4"></div>

          <button id="btn-add" class="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-5 py-2.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95">
            + Tambahkan Pertanyaan
          </button>

          <h3 class="mt-6 text-sm font-semibold text-gray-900 dark:text-gray-100">Daftar Pertanyaan:</h3>
          <div id="list-preview" class="mt-2 max-h-[200px] overflow-y-auto border border-gray-200 dark:border-dark-600 p-3 rounded-lg bg-gray-50 dark:bg-dark-900">
            ${refreshListHTML()}
          </div>
        </div>
      `,

      didOpen: () => {
        const typeSelect = document.getElementById("swal-type");
        const fieldWrap = document.getElementById("dynamic-field");

        const renderField = () => {
          if (typeSelect.value === "input") {
            fieldWrap.innerHTML = `
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Isi Pertanyaan:</label>
              <input id="swal-text" class="w-full p-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent" placeholder="Masukkan pertanyaan">
            `;
          } else {
            fieldWrap.innerHTML = `
              <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Pertanyaan Pilihan Ganda:</label>
              <input id="swal-text" class="w-full p-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-transparent mb-3" placeholder="Masukkan pertanyaan">

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Pilihan 1:</label>
                  <input id="option-1" class="w-full p-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent" value="Ya">
                </div>

                <div>
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">Pilihan 2:</label>
                  <input id="option-2" class="w-full p-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-200 focus:ring-2 focus:ring-yellow-500 focus:border-transparent" value="Tidak">
                </div>
              </div>
            `;
          }
        };

        renderField();
        typeSelect.addEventListener("change", renderField);

        document.getElementById("btn-add").addEventListener("click", () => {
          const survey = document.getElementById("swal-survey").value;
          const type = document.getElementById("swal-type").value;
          const text = document.getElementById("swal-text").value;

          if (!text.trim()) {
            Swal.showValidationMessage("Pertanyaan tidak boleh kosong");
            return;
          }

          let newQ = { survey, type, text };

          if (type === "pilihan") {
            newQ.option1 = document.getElementById("option-1").value;
            newQ.option2 = document.getElementById("option-2").value;
          }

          tempQuestions.push(newQ);
          document.getElementById("list-preview").innerHTML = refreshListHTML();

          document.getElementById("swal-text").value = "";
        });
      },

      showCancelButton: true,
      confirmButtonText: "Simpan Semua",
      cancelButtonText: "Batal",
      confirmButtonColor: '#eab308',
      cancelButtonColor: '#3b82f6',
      customClass: {
        popup: 'bg-gray-50 dark:bg-dark-900 dark:text-gray-200',
        confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-5 py-2.5 rounded-lg',
        cancelButton: 'bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg'
      },

      preConfirm: () => {
        if (tempQuestions.length === 0) {
          Swal.showValidationMessage("Belum ada pertanyaan");
          return false;
        }
        return tempQuestions;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setQuestions((prev) => [
          ...prev,
          ...result.value.map((q, idx) => ({
            id: prev.length + idx + 1,
            ...q
          }))
        ]);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `${result.value.length} pertanyaan berhasil ditambahkan.`,
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'bg-gray-50 dark:bg-dark-900 dark:text-gray-200'
          }
        });
      }
    });
  };

  return (
    <div className="transition-content w-full px-4 lg:px-6 pt-5 lg:pt-6 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-dark-900 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold tracking-wide">
            Daftar Pertanyaan
          </h2>
          <button
            onClick={handleAdd}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
          >
            + Tambah Pertanyaan
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-dark-700 dark:to-dark-750 text-gray-700 dark:text-gray-300 border-b-2 border-gray-200 dark:border-dark-600">
                <tr>
                  <th className="px-4 py-3.5 font-semibold w-16">No.</th>
                  <th className="px-4 py-3.5 font-semibold">Pertanyaan</th>
                  <th className="px-4 py-3.5 font-semibold w-32">Tipe</th>
                  <th className="px-4 py-3.5 font-semibold w-40">Survey</th>
                  <th className="px-4 py-3.5 font-semibold w-36 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className={`
                text-gray-800 dark:text-gray-200 divide-y divide-gray-100 dark:divide-dark-700
                transition-all duration-300 ease-out
                ${slideDirection === 'slide-left' ? 'opacity-0 -translate-x-8' : ''}
                ${slideDirection === 'slide-right' ? 'opacity-0 translate-x-8' : ''}
                ${slideDirection === '' ? 'opacity-100 translate-x-0' : ''}
              `}>
                {questionsToDisplay.map((q, i) => (
                  <tr
                    key={q.id}
                    className={`
                      transition-all duration-300 ease-in-out
                      hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 
                      dark:hover:from-dark-750 dark:hover:to-dark-750
                      ${deletingId === q.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                    `}
                  >
                    <td className="px-4 py-3.5 font-medium text-gray-600 dark:text-gray-400">
                      {startIndex + i + 1}
                    </td>
                    <td className="px-4 py-3.5 font-medium">{q.text}</td>
                    <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        q.type === 'input' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {q.type === "input" ? "Isian" : "Pilihan Ganda"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400">{q.survey}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group"
                          title="Lihat Detail"
                        >
                          <EyeIcon className="w-5 h-5 group-hover:animate-pulse" />
                        </button>
                        <button 
                          className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group"
                          title="Edit Pertanyaan"
                        >
                          <PencilSquareIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </button>
                        <button 
                          onClick={() => handleDelete(q.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group"
                          title="Hapus Pertanyaan"
                        >
                          <TrashIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="mt-5 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            Menampilkan <span className="font-semibold text-gray-900 dark:text-gray-200">{startIndex + 1}</span> - <span className="font-semibold text-gray-900 dark:text-gray-200">{Math.min(endIndex, questions.length)}</span> dari <span className="font-semibold text-gray-900 dark:text-gray-200">{questions.length}</span> pertanyaan
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ChevronLeftIcon className="w-5 h-5"/>
            </button>

            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`
                    px-4 py-2 rounded-lg border transition-all duration-200 font-medium
                    ${currentPage === index + 1
                      ? 'bg-yellow-500 border-yellow-500 text-black shadow-md scale-105' 
                      : 'bg-white dark:bg-dark-800 border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 hover:scale-105'
                    }
                    active:scale-95
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <ChevronRightIcon className="w-5 h-5"/>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}