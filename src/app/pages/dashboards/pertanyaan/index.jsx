import { Page } from "components/shared/Page";
import Swal from "sweetalert2";
import { useState } from "react";

export default function Pertanyaan() {
  const [questions, setQuestions] = useState(
    Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      text: `Contoh pertanyaan nomor ${i + 1}`,
      type: i % 2 === 0 ? "input" : "pilihan",
      survey: "Survey UMKM",
    }))
  );

  // ----------------------------
  // PAGINATION (SAMA PERSIS SURVEYLIST)
  // ----------------------------
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const totalPages = Math.ceil(questions.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const questionsToDisplay = questions.slice(startIndex, endIndex);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleNext = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  // ----------------------------
  // FUNGSI TAMBAH PERTANYAAN (TIDAK DIUBAH)
  // ----------------------------
  const handleAdd = () => {
    let tempQuestions = [];

    const refreshListHTML = () => {
      if (tempQuestions.length === 0) {
        return "<p class='text-gray-500'>Belum ada pertanyaan.</p>";
      }

      return tempQuestions
        .map((q, i) => {
          let opsiHTML = "";

          if (q.type === "pilihan") {
            opsiHTML = `
              <div class="mt-2 text-xs space-y-1">
                <div class="flex items-center gap-2">
                  <input type="radio" disabled>
                  <span>${q.option1}</span>
                </div>
                <div class="flex items-center gap-2">
                  <input type="radio" disabled>
                  <span>${q.option2}</span>
                </div>
              </div>
            `;
          }

          return `
            <div class="p-2 border rounded mb-2 bg-gray-900 text-white">
              <p class="text-sm font-medium">#${i + 1} (${q.type === "input" ? "Isian" : "Pilihan Ganda"})</p>
              <p class="text-sm">${q.text}</p>
              ${opsiHTML}
            </div>
          `;
        })
        .join("");
    };

    Swal.fire({
      title: "Tambahkan Pertanyaan",
      width: 600,
      html: `
        <div class="text-left">

          <label class="block text-sm font-medium mb-1">Pilih Survey:</label>
          <select id="swal-survey" class="swal2-input">
            <option value="Survey UMKM">Survey UMKM</option>
            <option value="Survey Kepuasan">Survey Kepuasan</option>
          </select>

          <label class="block text-sm font-medium mt-3 mb-1">Tipe Pertanyaan:</label>
          <select id="swal-type" class="swal2-input">
            <option value="input">Isian</option>
            <option value="pilihan">Pilihan Ganda</option>
          </select>

          <div id="dynamic-field" class="mt-4"></div>

          <button id="btn-add" class="swal2-confirm mt-3"
            style="width:100%; background:#facc15; color:black;">
            Tambahkan Pertanyaan
          </button>

          <h3 class="mt-4 text-sm font-semibold">Daftar Pertanyaan:</h3>
          <div id="list-preview" class="mt-2"
            style="max-height:150px; overflow-y:auto; border:1px solid #444; padding:8px; border-radius:6px;">
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
              <label class="block text-sm font-medium mb-1">Isi Pertanyaan:</label>
              <input id="swal-text" class="swal2-input" placeholder="Masukkan pertanyaan">
            `;
          } else {
            fieldWrap.innerHTML = `
              <label class="block text-sm font-medium mb-1">Pertanyaan Pilihan Ganda:</label>
              <input id="swal-text" class="swal2-input" placeholder="Masukkan pertanyaan">

              <div class="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <label class="text-sm font-medium">Pilihan 1:</label>
                  <input id="option-1" class="swal2-input" value="Ya" style="width:100%;">
                </div>

                <div>
                  <label class="text-sm font-medium">Pilihan 2:</label>
                  <input id="option-2" class="swal2-input" value="Tidak" style="width:100%;">
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
      }
    });
  };

  return (
    <Page title="Pertanyaan">
      <div className="transition-content w-full px-(--margin-x) pt-5 min-h-screen
        text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-dark-900">

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Daftar Pertanyaan</h2>

          <button
            onClick={handleAdd}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded-lg shadow"
          >
            + Tambah Pertanyaan
          </button>
        </div>

        <div className="mt-6 bg-white dark:bg-dark-800 rounded-xl border 
          border-gray-200 dark:border-dark-700 shadow-lg overflow-hidden">

          <div className="overflow-y-auto max-h-[500px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="p-4 w-12">No.</th>
                  <th className="p-4">Pertanyaan</th>
                  <th className="p-4 w-32">Tipe</th>
                  <th className="p-4 w-40">Survey</th>
                </tr>
              </thead>

              <tbody>
                {questionsToDisplay.map((q, i) => (
                  <tr
                    key={q.id}
                    className="border-b border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-750"
                  >
                    <td className="p-4">{startIndex + i + 1}</td>
                    <td className="p-4">{q.text}</td>
                    <td className="p-4 capitalize">
                      {q.type === "input" ? "Isian" : "Pilihan Ganda"}
                    </td>
                    <td className="p-4">{q.survey}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION (COPY PERSIS DARI SURVEYLIST) */}
        <div className="mt-4 flex justify-between items-center text-sm">
          <div>
            Menampilkan {Math.min(endIndex, questions.length)} dari {questions.length} pertanyaan.
          </div>

          <div className="flex gap-1 items-center">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="p-1 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 
              text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              <span>&lt;</span>
            </button>

            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`
                    px-3 py-1 rounded-lg border border-gray-300 dark:border-dark-600 transition 
                    ${currentPage === index + 1
                      ? 'bg-yellow-500 text-black font-semibold'
                      : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'}
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-1 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 
              text-gray-700 dark:text-gray-300 disabled:opacity-50"
            >
              <span>&gt;</span>
            </button>
          </div>
        </div>

      </div>
    </Page>
  );
}
