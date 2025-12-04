import { useState } from "react";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  EyeIcon,
  PencilSquareIcon,

} from "@heroicons/react/24/outline";
import axios from "utils/axios";
import api from "configs/api.config";
import { JWT_HOST_API } from "configs/auth.config";

// Definisikan Query Keys
const UMKM_QUERY_KEY = ["umkm"];

// Helper untuk mendapatkan URL lengkap gambar
const BASE_URL = JWT_HOST_API.replace("/api", "");
const getFullUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

export default function UMKM() {
  // Inisialisasi Query Client
  const queryClient = useQueryClient();

  // State Lokal
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState(null);

  // FETCH DATA (useQuery)
  const { data: umkmList = [], isLoading: umkmLoading } = useQuery({
    queryKey: UMKM_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await axios.get(api.umkm.list);
        console.log("UMKM Data Response:", res.data);
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error("Error fetching UMKM:", err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // CRUD MUTATIONS (useMutation)
  const deleteUmkmMutation = useMutation({
    mutationFn: (id) => axios.delete(api.umkm.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UMKM_QUERY_KEY });
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  // Note: Payload will be FormData
  const createUmkmMutation = useMutation({
    mutationFn: (formData) =>
      axios.post(api.umkm.create, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UMKM_QUERY_KEY });
    },
  });

  // Note: Payload will be FormData
  const updateUmkmMutation = useMutation({
    mutationFn: ({ id, formData }) =>
      axios.put(api.umkm.update(id), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: UMKM_QUERY_KEY });
    },
  });

  // HANDLERS
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Hapus UMKM?",
      text: "Data UMKM yang dihapus tidak dapat dikembalikan!",
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
          setDeletingId(id);
          await deleteUmkmMutation.mutateAsync(id);
          Swal.fire({
            icon: "success",
            title: "Terhapus!",
            text: "Data UMKM berhasil dihapus.",
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "!bg-white dark:!bg-gray-800",
              title: "text-gray-900 dark:text-gray-100",
              htmlContainer: "text-gray-600 dark:text-gray-300",
            },
          });
        } catch (error) {
          console.error("Error deleting UMKM:", error);
          Swal.fire("Gagal!", "Gagal menghapus data UMKM.", "error");
        }
      }
    });
  };

  const handleAdd = async () => {
    const { value: formData } = await Swal.fire({
      title: "Tambah UMKM Baru",
      width: 700,
      html: `
        <div class="text-left space-y-3 p-2">
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Nama Usaha</label>
            <input id="swal-nama" class="w-full p-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: Toko Maju">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Nama Pemilik</label>
              <input id="swal-pemilik" class="w-full p-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" placeholder="Nama Pemilik">
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Tahun Berdiri</label>
              <input type="number" id="swal-tahun" class="w-full p-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" placeholder="2020">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
             <div>
              <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Jumlah Karyawan</label>
              <input type="number" id="swal-karyawan" class="w-full p-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" placeholder="0">
            </div>
             <div>
              <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Jangkauan Pemasaran</label>
              <input id="swal-jangkauan" class="w-full p-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: Kota Jakarta">
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Foto Produk</label>
              <input type="file" id="swal-foto" accept="image/*" class="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-dark-700 dark:border-dark-600 dark:placeholder-gray-400">
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Format: JPG, PNG, JPEG</p>
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Dokumen Izin</label>
              <input type="file" id="swal-dokumen" accept=".pdf,.doc,.docx,.jpg,.png" class="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-dark-700 dark:border-dark-600 dark:placeholder-gray-400">
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Format: PDF, DOC, Gambar</p>
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Simpan",
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
      preConfirm: () => {
        const namaUsaha = document.getElementById("swal-nama").value;
        const namaPemilik = document.getElementById("swal-pemilik").value;
        const tahunBerdiri = document.getElementById("swal-tahun").value;
        const jumlahKaryawan = document.getElementById("swal-karyawan").value;
        const jangkauanPemasaran =
          document.getElementById("swal-jangkauan").value;
        const fotoInput = document.getElementById("swal-foto");
        const dokumenInput = document.getElementById("swal-dokumen");

        if (!namaUsaha || !namaPemilik) {
          Swal.showValidationMessage("Nama Usaha dan Pemilik harus diisi");
          return false;
        }

        const formData = new FormData();
        formData.append("namaUsaha", namaUsaha);
        formData.append("namaPemilik", namaPemilik);
        formData.append("tahunBerdiri", parseInt(tahunBerdiri) || 0);
        formData.append("jumlahKaryawan", parseInt(jumlahKaryawan) || 0);
        formData.append("jangkauanPemasaran", jangkauanPemasaran);

        if (fotoInput.files.length > 0) {
          formData.append("fotoProduk", fotoInput.files[0]);
        }
        if (dokumenInput.files.length > 0) {
          formData.append("dokumenIzin", dokumenInput.files[0]);
        }

        return formData;
      },
    });

    if (formData) {
      try {
        await createUmkmMutation.mutateAsync(formData);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "UMKM baru berhasil ditambahkan.",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: "!bg-white dark:!bg-gray-800",
            title: "text-gray-900 dark:text-gray-100",
            htmlContainer: "text-gray-600 dark:text-gray-300",
          },
        });
      } catch (error) {
        console.error("Error creating UMKM:", error);
        Swal.fire("Gagal!", "Gagal menambahkan UMKM.", "error");
      }
    }
  };

  const handleEdit = async (umkm) => {
    const { value: formData } = await Swal.fire({
      title: "Edit UMKM",
      width: 700,
      html: `
        <div class="text-left space-y-3 p-2">
          <div>
            <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Nama Usaha</label>
            <input id="swal-edit-nama" class="w-full p-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" value="${
              umkm.namaUsaha || ""
            }">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Nama Pemilik</label>
              <input id="swal-edit-pemilik" class="w-full p-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" value="${
                umkm.namaPemilik || ""
              }">
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Tahun Berdiri</label>
              <input type="number" id="swal-edit-tahun" class="w-full p-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" value="${
                umkm.tahunBerdiri || ""
              }">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
             <div>
              <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Jumlah Karyawan</label>
              <input type="number" id="swal-edit-karyawan" class="w-full p-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" value="${
                umkm.jumlahKaryawan || ""
              }">
            </div>
             <div>
              <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Jangkauan Pemasaran</label>
              <input id="swal-edit-jangkauan" class="w-full p-2.5 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500" value="${
                umkm.jangkauanPemasaran || ""
              }">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Foto Produk</label>
              ${
                umkm.fotoProduk
                  ? `<div class="mb-2"><a href="${getFullUrl(umkm.fotoProduk)}" target="_blank" class="text-blue-500 hover:underline text-xs">Lihat Foto Saat Ini</a></div>`
                  : ""
              }
              <input type="file" id="swal-edit-foto" accept="image/*" class="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-dark-700 dark:border-dark-600 dark:placeholder-gray-400">
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Upload untuk mengganti</p>
            </div>
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-200">Dokumen Izin</label>
              ${
                umkm.dokumenIzin
                  ? `<div class="mb-2"><a href="${getFullUrl(umkm.dokumenIzin)}" target="_blank" class="text-blue-500 hover:underline text-xs">Lihat Dokumen Saat Ini</a></div>`
                  : ""
              }
              <input type="file" id="swal-edit-dokumen" accept=".pdf,.doc,.docx,.jpg,.png" class="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-dark-700 dark:border-dark-600 dark:placeholder-gray-400">
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Upload untuk mengganti</p>
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
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
        const namaUsaha = document.getElementById("swal-edit-nama").value;
        const namaPemilik = document.getElementById("swal-edit-pemilik").value;
        const tahunBerdiri = document.getElementById("swal-edit-tahun").value;
        const jumlahKaryawan =
          document.getElementById("swal-edit-karyawan").value;
        const jangkauanPemasaran = document.getElementById(
          "swal-edit-jangkauan",
        ).value;
        const fotoInput = document.getElementById("swal-edit-foto");
        const dokumenInput = document.getElementById("swal-edit-dokumen");

        if (!namaUsaha || !namaPemilik) {
          Swal.showValidationMessage("Nama Usaha dan Pemilik harus diisi");
          return false;
        }

        const formData = new FormData();
        formData.append("namaUsaha", namaUsaha);
        formData.append("namaPemilik", namaPemilik);
        formData.append("tahunBerdiri", parseInt(tahunBerdiri) || 0);
        formData.append("jumlahKaryawan", parseInt(jumlahKaryawan) || 0);
        formData.append("jangkauanPemasaran", jangkauanPemasaran);

        if (fotoInput.files.length > 0) {
          formData.append("fotoProduk", fotoInput.files[0]);
        }
        if (dokumenInput.files.length > 0) {
          formData.append("dokumenIzin", dokumenInput.files[0]);
        }

        return formData;
      },
    });

    if (formData) {
      try {
        await updateUmkmMutation.mutateAsync({
          id: umkm.id,
          formData: formData,
        });
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data UMKM berhasil diperbarui.",
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: "!bg-white dark:!bg-gray-800",
            title: "text-gray-900 dark:text-gray-100",
            htmlContainer: "text-gray-600 dark:text-gray-300",
          },
        });
      } catch (error) {
        console.error("Error updating UMKM:", error);
        Swal.fire("Gagal!", "Gagal memperbarui data UMKM.", "error");
      }
    }
  };

  const handleViewDetail = async (id) => {
    try {
      // Show loading first
      Swal.fire({
        title: "Memuat Data...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        customClass: {
          popup: "!bg-white dark:!bg-gray-800",
          title: "text-gray-900 dark:text-gray-100",
          htmlContainer: "text-gray-600 dark:text-gray-300",
        },
      });

      const res = await axios.get(api.umkm.get(id));
      const data = res.data.data || res.data;

      Swal.close();

      Swal.fire({
        title: `Detail UMKM: ${data.namaUsaha || "Tanpa Nama"}`,
        width: 700,
        html: `
          <div class="text-left p-2 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div class="p-3 border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Nama Pemilik</p>
                  <div class="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-blue-500">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    ${data.namaPemilik || "-"}
                  </div>
               </div>
               <div class="p-3 border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Tahun Berdiri</p>
                  <div class="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-green-500">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0h18M5.25 12h13.5h-13.5zm0 6h13.5h-13.5z" />
                    </svg>
                    ${data.tahunBerdiri || "-"}
                  </div>
               </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div class="p-3 border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Jumlah Karyawan</p>
                  <div class="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-purple-500">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    ${data.jumlahKaryawan || "0"} Orang
                  </div>
               </div>
               <div class="p-3 border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800">
                  <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Jangkauan Pemasaran</p>
                  <div class="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-red-500">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    ${data.jangkauanPemasaran || "-"}
                  </div>
               </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                ${
                  data.fotoProduk
                    ? `
                  <div class="p-3 border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        Foto Produk
                    </p>
                    <img src="${getFullUrl(data.fotoProduk)}" alt="Foto Produk" class="w-full h-40 object-cover rounded-lg border border-gray-200 dark:border-dark-600 hover:scale-105 transition-transform cursor-pointer" onclick="window.open('${getFullUrl(data.fotoProduk)}', '_blank')">
                  </div>
                  `
                    : `<div class="p-3 border border-dashed border-gray-300 dark:border-dark-600 rounded-lg flex items-center justify-center text-gray-500 text-sm h-40">Tidak ada foto produk</div>`
                }

                ${
                  data.dokumenIzin
                    ? `
                  <div class="p-3 border border-gray-200 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800">
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        Dokumen Izin
                    </p>
                    <div class="flex flex-col items-center justify-center h-40 gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 text-blue-500">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <a href="${getFullUrl(data.dokumenIzin)}" target="_blank" class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors">
                            Lihat / Unduh Dokumen
                        </a>
                    </div>
                  </div>
                  `
                    : `<div class="p-3 border border-dashed border-gray-300 dark:border-dark-600 rounded-lg flex items-center justify-center text-gray-500 text-sm h-40">Tidak ada dokumen izin</div>`
                }
            </div>
          </div>
        `,
        showConfirmButton: true,
        confirmButtonText: "Tutup",
        customClass: {
          popup: "!bg-white dark:!bg-gray-800",
          title: "text-gray-900 dark:text-gray-100",
          htmlContainer: "text-gray-600 dark:text-gray-300",
          confirmButton:
            "bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg",
        },
      });
    } catch (error) {
      console.error("Error fetching UMKM detail:", error);
      Swal.fire("Error", "Gagal mengambil detail UMKM", "error");
    }
  };

  // PAGINATION
  const totalPages = Math.ceil(umkmList.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const umkmToDisplay = umkmList.slice(startIndex, endIndex);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  const handleNext = () => handlePageChange(currentPage + 1);
  const handlePrev = () => handlePageChange(currentPage - 1);

  return (
    <div className="dark:bg-dark-900 min-h-screen w-full bg-white p-4 text-gray-900 lg:p-6 dark:text-gray-200">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Data UMKM</h2>
        <button
          onClick={handleAdd}
          className="rounded-lg bg-yellow-500 px-5 py-2.5 font-medium text-black hover:bg-yellow-600 flex items-center gap-2"
        >
          <p className="text-black font-medium rounded-lg shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95" >+ Tambah UMKM</p>
        </button>
      </div>
      <hr className="dark:border-dark-700 my-4 border-gray-200" />

      {/* Tabel UMKM */}
      <div className="dark:bg-dark-800 dark:border-dark-700 mb-8 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="dark:bg-dark-700 bg-gray-100 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-3">Nama Usaha</th>
              <th className="px-4 py-3">Pemilik</th>
              <th className="px-4 py-3">Jangkauan</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {umkmLoading ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : umkmList.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                  Belum ada data UMKM. Silakan tambahkan data baru.
                </td>
              </tr>
            ) : (
              umkmToDisplay.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="border-b border-gray-100 last:border-none hover:bg-gray-50 dark:border-dark-700 dark:hover:bg-dark-700/50"
                >
                  <td className="px-4 py-3 font-medium">{item.namaUsaha}</td>
                  <td className="px-4 py-3">{item.namaPemilik}</td>
                  <td
                    className="px-4 py-3 truncate max-w-xs"
                    title={item.jangkauanPemasaran}
                  >
                    {item.jangkauanPemasaran}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleViewDetail(item.id)}
                        className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                        title="Lihat Detail"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="rounded-lg bg-yellow-100 p-2 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
                        title="Edit"
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className={`rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 ${
                          deletingId === item.id
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                        title="Hapus"
                      >
                        <TrashIcon className="h-5 w-5" />
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
                        Menampilkan <b>{startIndex + 1}</b> - <b>{Math.min(endIndex, umkmList.length)}</b> dari <b>{umkmList.length}</b> hasil
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