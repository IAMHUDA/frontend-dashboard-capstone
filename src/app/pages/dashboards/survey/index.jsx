import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import ReactDOM from "react-dom/client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import axios from "utils/axios";
import api from "configs/api.config";

/* =====================================================
   FORM MODAL (TAMPILAN & CLASS SAMA DENGAN USERS)
   - id submit: "submit-survey"
   - menggunakan kelas Tailwind yang konsisten
===================================================== */
const SurveyForm = ({ onSubmit, swalClose, data = {} }) => {
  const [namaSurvey, setNamaSurvey] = useState(data.namaSurvey || "");
  const [deskripsi, setDeskripsi] = useState(data.deskripsi || "");
  const [tanggalDibuat, setTanggalDibuat] = useState(
    data.tanggalDibuat?.slice(0, 10) || ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!namaSurvey.trim()) {
      Swal.showValidationMessage("Nama survey wajib diisi");
      return;
    }

    // console.log("FORM SUBMIT =>", { namaSurvey, deskripsi, tanggalDibuat });

    onSubmit({
      namaSurvey,
      deskripsi,
      tanggalDibuat,
    });

    // close will be handled by preConfirm in Swal (we call swalClose from parent)
    swalClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">

  {/* Nama Survey */}
  <div className="flex flex-col md:flex-row md:items-center gap-2">
    <label className="md:w-40 text-sm font-medium text-gray-900 dark:text-gray-200">
      Nama Survey*
    </label>

    <input
      className="flex-1 p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white placeholder-gray-400 dark:placeholder-gray-500"
      value={namaSurvey}
      onChange={(e) => setNamaSurvey(e.target.value)}
      placeholder="contoh: Survei Kepuasan Warga"
      required
    />
  </div>

  {/* Deskripsi */}
  <div className="flex flex-col md:flex-row md:items-center gap-2">
    <label className="md:w-40 text-sm font-medium text-gray-900 dark:text-gray-200">
      Deskripsi
    </label>

    <input
      className="flex-1 p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white text-gray-900"
      value={deskripsi}
      onChange={(e) => setDeskripsi(e.target.value)}
      placeholder="Deskripsi singkat survey"
    />
  </div>

  {/* Tanggal */}
  <div className="flex flex-col md:flex-row md:items-center gap-2">
    <label className="md:w-40 text-sm font-medium text-gray-900 dark:text-gray-200">
      Tanggal
    </label>

    <input
      type="date"
      className="flex-1 p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white"
      value={tanggalDibuat}
      onChange={(e) => setTanggalDibuat(e.target.value)}
      required
    />
  </div>

  {/* Button hidden (untuk SweetAlert) */}
  <button id="submit-survey" type="submit" className="hidden">
    Simpan
  </button>

</form>

  );
};

/* =====================================================
   PAGE (DESIGN 100% SAMA USERS)
===================================================== */
export default function SurveyPage() {
  const [surveys, setSurveys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [slideDirection, setSlideDirection] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const rowsPerPage = 5;

  /* ---------------- FETCH ---------------- */
  const loadSurvey = async () => {
    try {
      // console.log("FETCH SURVEY ->", api.surveys.list);
      const res = await axios.get(api.surveys.list);
      // console.log("RAW RESPONSE =>", res.data);
      const mapped = res.data?.data || [];
      // console.log("MAPPED =>", mapped);
      setSurveys(mapped);
    } catch (err) {
      console.error("FETCH ERROR =>", err);
      Swal.fire("Error", "Gagal mengambil data survey", "error");
    }
  };

  useEffect(() => {
    loadSurvey();
  }, []);

  /* ---------------- CREATE / UPDATE / DELETE ---------------- */
  const createSurvey = async (payload) => {
    try {
      // console.log("CREATE PAYLOAD =>", payload);
      await axios.post(api.surveys.create, payload);
      // console.log("CREATE RESPONSE =>", res.data);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Survey berhasil dibuat.",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "!bg-white dark:!bg-gray-800",
          title: "text-gray-900 dark:text-gray-100",
          htmlContainer: "text-gray-600 dark:text-gray-300",
        },
      });
      loadSurvey();
    } catch (err) {
      console.error("CREATE ERROR =>", err);
      Swal.fire("Error", "Gagal membuat survey", "error");
    }
  };

  const updateSurvey = async (id, payload) => {
    try {
      // console.log("UPDATE ID =>", id, "PAYLOAD =>", payload);
      await axios.put(api.surveys.update(id), payload);
      // console.log("UPDATE RESPONSE =>", res.data);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Survey berhasil diperbarui.",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "!bg-white dark:!bg-gray-800",
          title: "text-gray-900 dark:text-gray-100",
          htmlContainer: "text-gray-600 dark:text-gray-300",
        },
      });
      loadSurvey();
    } catch (err) {
      console.error("UPDATE ERROR =>", err);
      Swal.fire("Error", "Gagal update survey", "error");
    }
  };

  const deleteSurvey = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Survey?",
      text: "Survey dan semua pertanyaan di dalamnya akan dihapus!",
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
    });

    if (!confirm.isConfirmed) return;

    try {
      // console.log("DELETE ID =>", id);
      setDeletingId(id);
      await axios.delete(api.surveys.delete(id));
      // console.log("DELETE RESPONSE =>", res.data);
      setTimeout(() => {
        setDeletingId(null);
      }, 300);
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
      loadSurvey();
    } catch (err) {
      console.error("DELETE ERROR =>", err);
      setDeletingId(null);
      Swal.fire("Error", "Gagal menghapus survey", "error");
    }
  };

  /* ---------------- MODAL (CREATE & EDIT) - MATCH USERS STYLING EXACTLY ----------------
     - customClass popup & confirm/cancel classes same as Users
     - width 600px
     - preConfirm triggers submit button id="submit-survey"
  */
  const showModal = (title, submitFn, initialData = null) => {
    const container = document.createElement("div");
    let root = null;

    Swal.fire({
      title,
      html: container,
      width: "600px",
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      customClass: {
        popup: "!bg-white dark:!bg-gray-800",
        title: "!text-black dark:!text-white",
        htmlContainer: "text-gray-900 dark:text-gray-200",
        confirmButton:
          "bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg",
        cancelButton:
          "bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2.5 rounded-lg",
      },

      didOpen: () => {
        root = ReactDOM.createRoot(container);
        root.render(
          <SurveyForm
            data={initialData || {}}
            swalClose={() => Swal.close()}
            onSubmit={(formPayload) => {
              // If initialData present => update, else create
              if (initialData && initialData.id) {
                submitFn(initialData.id, formPayload);
              } else {
                submitFn(formPayload);
              }
            }}
          />
        );
      },

      preConfirm: () => {
        // trigger form submit inside React component
        const btn = document.getElementById("submit-survey");
        if (btn) btn.click();
        return false; // prevent swal auto close; form will call swalClose()
      },

      willClose: () => {
        if (root) root.unmount();
      },
    });
  };

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(surveys.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, surveys.length);
  const dataToShow = Array.isArray(surveys) ? surveys.slice(startIndex, endIndex) : [];

  /* ---------------- RENDER ---------------- */
  return (
    <div className="transition-content w-full px-4 lg:px-6 pt-5 lg:pt-6 text-gray-900 dark:text-gray-200 bg-white dark:bg-dark-900 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold tracking-wide">Survey</h2>

          <button
            onClick={() => showModal("Tambah Survey", createSurvey, null)}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-5 py-2.5 rounded-lg shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95"
          >
            + Survey Baru
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-dark-700 dark:to-dark-750 text-gray-700 dark:text-gray-300 border-b-2 border-gray-200 dark:border-dark-600">
                <tr>
                  <th className="px-4 py-3.5 w-16">No</th>
                  <th className="px-4 py-3.5">Nama Survey</th>
                  <th className="px-4 py-3.5">Deskripsi</th>
                  <th className="px-4 py-3.5">Tanggal</th>
                  <th className="px-4 py-3.5 w-36 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody
                className={`
                  divide-y divide-gray-100 dark:divide-dark-700
                  transition-all duration-300 ease-out
                  ${slideDirection === "slide-left" ? "opacity-0 -translate-x-8" : ""}
                  ${slideDirection === "slide-right" ? "opacity-0 translate-x-8" : ""}
                `}
              >
                {dataToShow.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`
                      transition-all duration-300 ease-in-out
                      hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
                      dark:hover:from-dark-750 dark:hover:to-dark-750
                      ${deletingId === s.id ? "opacity-0 scale-95" : ""}
                    `}
                  >
                    <td className="px-4 py-3.5">{startIndex + i + 1}</td>
                    <td className="px-4 py-3.5 font-medium">{s.namaSurvey}</td>
                    <td className="px-4 py-3.5 ">{s.deskripsi}</td>
                    <td className="px-4 py-3.5 ">{new Date(s.tanggalDibuat).toLocaleDateString("id-ID")}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => showModal("Edit Survey", updateSurvey, s)}
                          className="rounded-lg bg-yellow-100 p-2 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
                        >
                          <PencilSquareIcon className="w-5" />
                        </button>

                        <button
                          onClick={() => deleteSurvey(s.id)}
                          className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                        >
                          <TrashIcon className="w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            Menampilkan <b>{dataToShow.length === 0 ? 0 : startIndex + 1}</b> - <b>{endIndex}</b> dari <b>{surveys.length}</b> hasil
          </div>

          <div className="flex gap-2 items-center">
            <button
              disabled={currentPage === 1}
              onClick={() => {
                const next = Math.max(1, currentPage - 1);
                setSlideDirection("slide-right");
                setTimeout(() => { setCurrentPage(next); setSlideDirection(""); }, 300);
              }}
              className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100"
            >
              <ChevronLeftIcon className="w-5" />
            </button>

            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSlideDirection(idx + 1 > currentPage ? "slide-left" : "slide-right");
                  setTimeout(() => { setCurrentPage(idx + 1); setSlideDirection(""); }, 300);
                }}
                className={`px-4 py-2 rounded-lg border transition-all ${currentPage === idx + 1 ? "bg-yellow-500 border-yellow-500 text-black scale-105" : "hover:bg-gray-100"}`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => {
                const next = Math.min(totalPages, currentPage + 1);
                setSlideDirection("slide-left");
                setTimeout(() => { setCurrentPage(next); setSlideDirection(""); }, 300);
              }}
              className="p-2 border rounded-lg disabled:opacity-40 hover:bg-gray-100"
            >
              <ChevronRightIcon className="w-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
