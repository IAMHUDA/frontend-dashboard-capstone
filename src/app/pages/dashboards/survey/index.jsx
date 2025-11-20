import { useState } from "react";
import Swal from 'sweetalert2';
import ReactDOM from 'react-dom/client'; 
// Import ikon Chevron untuk panah
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'; 

// --- 1. KOMPONEN ISI FORM (Rendered di dalam SweetAlert) ---
const CreateSurveyFormContent = ({ swalClose }) => {
    // ... (Kode CreateSurveyFormContent sama seperti sebelumnya)
    const [surveyName, setSurveyName] = useState('');
    const [surveyDesc, setSurveyDesc] = useState('');
    const [dateCreated, setDateCreated] = useState('');
    
    const defaultSurveyName = 'Kepuasan layanan publik';
    const defaultSurveyDesc = 'Survey tahun 2025';
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (surveyName.trim() === '') {
            Swal.showValidationMessage('Nama Survey tidak boleh kosong.');
            return;
        }

        console.log('Data Survey Disimpan:', { surveyName, surveyDesc, dateCreated });
        // --- LOGIKA SIMPAN DATA DI SINI ---

        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Survey baru berhasil dibuat.',
            customClass: { popup: 'dark:bg-dark-800 dark:text-gray-200' }
        });
        swalClose(); 
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 text-black dark:text-gray-900"> 
            {/* Nama, Deskripsi, dan Tanggal Survey */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nama Survey*</label>
                    <input 
                        type="text" 
                        value={surveyName} 
                        onChange={(e) => setSurveyName(e.target.value)} 
                        required
                        placeholder={`Contoh: ${defaultSurveyName}`}
                        className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white text-gray-900" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Deskripsi Survey</label>
                    <input 
                        type="text" 
                        value={surveyDesc} 
                        onChange={(e) => setSurveyDesc(e.target.value)}
                        placeholder={`Contoh: ${defaultSurveyDesc}`}
                        className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white text-gray-900" 
                    />
                </div>
                {/* Input Tanggal Dibuat */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Tanggal Dibuat*</label>
                    <input 
                        type="date" 
                        value={dateCreated} 
                        onChange={(e) => setDateCreated(e.target.value)} 
                        required
                        className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white text-gray-900" 
                    />
                </div>
            </div>

            {/* Tombol Submit tersembunyi yang akan dipicu oleh SweetAlert */}
            <button type="submit" id="submit-survey-form" className="hidden">Simpan</button>
        </form>
    );
};


// --- 2. KOMPONEN UTAMA (SurveyList) ---
export default function SurveyList() {
    
    // DATA DUMMY LENGKAP (15 baris)
    const DUMMY_SURVEYS = Array.from({ length: 15 }).map((_, i) => ({
        name: `Survey Contoh ${i + 1}`,
        description: `Deskripsi singkat survey ke-${i + 1}`,
        date: '24 Jun 2025'
    }));

    // STATE UNTUK PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    // Menghitung indeks data yang akan ditampilkan di halaman saat ini
    const totalPages = Math.ceil(DUMMY_SURVEYS.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    // Data yang akan dirender di tabel
    const surveysToDisplay = DUMMY_SURVEYS.slice(startIndex, endIndex);

    // Fungsi untuk mengganti halaman
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Fungsi navigasi Next/Prev
    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };


    // Fungsi untuk menampilkan modal SweetAlert (sama seperti sebelumnya)
    const showCreateSurveyModal = () => {
        const formContainer = document.createElement('div');
        let root; 

        Swal.fire({
            title: 'Membuat Survey Baru',
            html: formContainer, 
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: 'Buat Survey',
            cancelButtonText: 'Batal',
            focusConfirm: false,
            width: '600px', 
            customClass: {
                popup: 'dark:bg-dark-800 dark:text-gray-200', 
                title: 'dark:text-gray-100',
            },
            
            didOpen: () => {
                root = ReactDOM.createRoot(formContainer);
                root.render(<CreateSurveyFormContent swalClose={() => Swal.close()} />);
            },
            
            preConfirm: () => {
                document.getElementById('submit-survey-form').click();
                return false; 
            },
            
            willClose: () => {
                if (root) {
                    root.unmount(); 
                }
            }
        });
    };

    return (
        <div className="transition-content w-full px-(--margin-x) pt-5 lg:pt-6 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-dark-900">
            <div className="min-w-0">

                {/* Title */}
                <h2 className="mt-2 text-2xl font-semibold tracking-wide">
                    Survey
                </h2>

                {/* Button Tambah */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={showCreateSurveyModal} // Panggil modal
                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4 py-2 rounded-lg shadow"
                    >
                        Survey Baru
                    </button>
                </div>

                {/* Table */}
                <div className="mt-6 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl overflow-hidden shadow">

                    <div className="overflow-y-auto max-h-[500px]">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300">
                                <tr>
                                    <th className="p-4 w-12">No.</th> 
                                    <th className="p-4 w-40">Nama Survey</th>
                                    <th className="p-4">Deskripsi</th>
                                    <th className="p-4 w-40">Dibuat</th>
                                    <th className="p-4 w-32">Aksi</th>
                                </tr>
                            </thead>

                            <tbody className="text-gray-800 dark:text-gray-200">
                                {surveysToDisplay.map((survey, i) => (
                                    <tr
                                        key={startIndex + i}
                                        className="border-b border-gray-200 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-750"
                                    >
                                        {/* Menghitung nomor urut berdasarkan halaman */}
                                        <td className="p-4">{startIndex + i + 1}</td> 
                                        <td className="p-4">{survey.name}</td>
                                        <td className="p-4">{survey.description}</td>
                                        <td className="p-4">{survey.date}</td>
                                        <td className="p-4 flex items-center gap-3">
                                            <button className="text-blue-600 dark:text-blue-400 hover:underline text-sm">Lihat</button>
                                            <button className="text-yellow-600 dark:text-yellow-400 hover:underline text-sm">Ubah</button>
                                            <button className="text-red-600 dark:text-red-400 hover:underline text-sm">Hapus</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 💡 KONTROL PAGINATION DENGAN ANGKA DAN PANAH (PREV/NEXT) */}
                <div className="mt-4 flex justify-between items-center text-sm">
                    {/* Informasi Halaman */}
                    <div>
                        Menampilkan {Math.min(endIndex, DUMMY_SURVEYS.length)} dari {DUMMY_SURVEYS.length} hasil.
                    </div>

                    {/* Kontrol Navigasi (Panah + Angka) */}
                    <div className="flex gap-1 items-center">
                        {/* Tombol Previous */}
                        <button
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            className="p-1 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeftIcon className="w-5 h-5"/>
                        </button>

                        {/* Box Angka Pagination */}
                        <div className="flex gap-1">
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => handlePageChange(index + 1)}
                                    className={`
                                        px-3 py-1 rounded-lg border border-gray-300 dark:border-dark-600 transition 
                                        ${currentPage === index + 1
                                            ? 'bg-yellow-500 text-black font-semibold' // Halaman Aktif
                                            : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                                        }
                                    `}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                        
                        {/* Tombol Next */}
                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="p-1 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRightIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
                {/* Akhir Kontrol Pagination */}

            </div>
        </div>
    );
}