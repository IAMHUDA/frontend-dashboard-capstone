import { useState } from "react";
import Swal from 'sweetalert2';
import ReactDOM from 'react-dom/client'; 
import { ChevronLeftIcon, ChevronRightIcon, PencilSquareIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

// --- 1. KOMPONEN ISI FORM (Rendered di dalam SweetAlert) ---
const CreateSurveyFormContent = ({ swalClose }) => {
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

        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Survey baru berhasil dibuat.',
            customClass: { 
                popup: 'bg-white dark:bg-dark-900 dark:text-gray-200',
                confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-5 py-2.5 rounded-lg'
            }
        });
        swalClose(); 
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 text-black dark:text-gray-900"> 
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

            <button type="submit" id="submit-survey-form" className="hidden">Simpan</button>
        </form>
    );
};

// --- 2. KOMPONEN UTAMA (SurveyList) ---
export default function SurveyList() {
    
    const DUMMY_SURVEYS = Array.from({ length: 15 }).map((_, i) => ({
        id: i + 1,
        name: `Survey Contoh ${i + 1}`,
        description: `Deskripsi singkat survey ke-${i + 1}`,
        date: '24 Jun 2025'
    }));

    const [currentPage, setCurrentPage] = useState(1);
    const [surveys, setSurveys] = useState(DUMMY_SURVEYS);
    const [deletingId, setDeletingId] = useState(null);
    const [slideDirection, setSlideDirection] = useState('');
    const rowsPerPage = 5;

    const totalPages = Math.ceil(surveys.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    
    const surveysToDisplay = surveys.slice(startIndex, endIndex);

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
            title: 'Hapus Survey?',
            text: 'Data yang dihapus tidak dapat dikembalikan!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3b82f6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            customClass: {
                popup: 'bg-white dark:bg-dark-900 dark:text-gray-200',
                confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2.5 rounded-lg',
                cancelButton: 'bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                setDeletingId(id);
                setTimeout(() => {
                    setSurveys(surveys.filter(s => s.id !== id));
                    setDeletingId(null);
                    Swal.fire({
                        icon: 'success',
                        title: 'Terhapus!',
                        text: 'Survey berhasil dihapus.',
                        timer: 2000,
                        showConfirmButton: false,
                        customClass: {
                            popup: 'bg-white dark:bg-dark-900 dark:text-gray-200'
                        }
                    });
                }, 400);
            }
        });
    };

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
            confirmButtonColor: '#eab308',
            cancelButtonColor: '#3b82f6',
            customClass: {
                popup: 'bg-white dark:bg-dark-900 dark:text-gray-200', 
                title: 'dark:text-gray-100',
                confirmButton: 'bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-5 py-2.5 rounded-lg',
                cancelButton: 'bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg'
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
        <div className="transition-content w-full px-4 lg:px-6 pt-5 lg:pt-6 text-gray-900 dark:text-gray-200 bg-white dark:bg-dark-900 min-h-screen">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold tracking-wide">
                        Survey
                    </h2>
                    <button
                        onClick={showCreateSurveyModal}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                        + Survey Baru
                    </button>
                </div>

                {/* Table Container */}
                <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-dark-700 dark:to-dark-750 text-gray-700 dark:text-gray-300 border-b-2 border-gray-200 dark:border-dark-600">
                                <tr>
                                    <th className="px-4 py-3.5 font-semibold w-16">No.</th> 
                                    <th className="px-4 py-3.5 font-semibold">Nama Survey</th>
                                    <th className="px-4 py-3.5 font-semibold">Deskripsi</th>
                                    <th className="px-4 py-3.5 font-semibold w-32">Dibuat</th>
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
                                {surveysToDisplay.map((survey, i) => (
                                    <tr
                                        key={survey.id}
                                        className={`
                                            transition-all duration-300 ease-in-out
                                            hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 
                                            dark:hover:from-dark-750 dark:hover:to-dark-750
                                            ${deletingId === survey.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
                                        `}
                                    >
                                        <td className="px-4 py-3.5 font-medium text-gray-600 dark:text-gray-400">
                                            {startIndex + i + 1}
                                        </td> 
                                        <td className="px-4 py-3.5 font-medium">{survey.name}</td>
                                        <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400">{survey.description}</td>
                                        <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400">{survey.date}</td>
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
                                                    title="Edit Survey"
                                                >
                                                    <PencilSquareIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(survey.id)}
                                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 group"
                                                    title="Hapus Survey"
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
                        Menampilkan <span className="font-semibold text-gray-900 dark:text-gray-200">{startIndex + 1}</span> - <span className="font-semibold text-gray-900 dark:text-gray-200">{Math.min(endIndex, surveys.length)}</span> dari <span className="font-semibold text-gray-900 dark:text-gray-200">{surveys.length}</span> hasil
                    </div>

                    <div className="flex gap-2 items-center">
                        {/* Previous Button */}
                        <button
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            className="p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            <ChevronLeftIcon className="w-5 h-5"/>
                        </button>

                        {/* Page Numbers */}
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
                        
                        {/* Next Button */}
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