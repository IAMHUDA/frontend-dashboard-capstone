import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ReactDOM from "react-dom/client";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    PencilSquareIcon,
    TrashIcon
} from "@heroicons/react/24/outline";

import axios from "utils/axios";
import api from "configs/api.config";
import { useAuthContext } from "app/contexts/auth/context";

// -----------------------------------------------------------
// FORM MODAL
// -----------------------------------------------------------
const UserFormContent = ({ swalClose, onSubmit, initialData = {}, currentUserRole }) => {
    const [name, setName] = useState(initialData.name || "");
    const [email, setEmail] = useState(initialData.email || "");
    const [role, setRole] = useState(initialData.role || "warga");
    
    // Password state
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const isEditMode = !!initialData.id;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            Swal.showValidationMessage("Nama tidak boleh kosong");
            return;
        }

        if (!email.trim()) {
            Swal.showValidationMessage("Email tidak boleh kosong");
            return;
        }

        // Validasi Password
        // Jika mode create (tidak ada id), password wajib (kecuali backend handle default)
        // Jika mode edit, password wajib hanya jika isChangingPassword true
        
        // Logic di sini: 
        // Create user: kita minta password awal (atau default "12345678" jika tidak diisi, tapi sebaiknya diisi)
        // Edit user: password optional

        if (isEditMode) {
             if (isChangingPassword) {
                if (!password || password.length < 6) {
                    Swal.showValidationMessage("Password minimal 6 karakter");
                    return;
                }
                if (password !== confirmPassword) {
                    Swal.showValidationMessage("Konfirmasi password tidak cocok");
                    return;
                }
             }
        } else {
            // Mode Create: kita bisa buat input password optional dan set default di backend/submit,
            // atau paksa input. Di kode sebelumnya default "12345678".
            // Kita kasih opsi input password saat create juga biar fleksibel.
            if (password && password.length < 6) {
                 Swal.showValidationMessage("Password minimal 6 karakter");
                 return;
            }
        }

        const payload = { name, email, role };
        
        // Include password if meaningful
        if (isEditMode) {
            if (isChangingPassword && password) {
                payload.password = password;
            }
        } else {
             // Create mode: use input password or default
             payload.password = password || "12345678";
        }

        onSubmit(payload);
        swalClose();
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 text-gray-900 dark:text-gray-100 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">Nama*</label>
                    <input
                        className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">Email*</label>
                    <input
                        className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">Peran</label>
                    <select
                        className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        {currentUserRole !== "admin" && <option value="super_admin">Super Admin</option>}
                        {currentUserRole !== "admin" && <option value="admin">Admin</option>}
                        <option value="warga">Warga</option>
                    </select>
                </div>

                {/* Password Section */}
                <div className="md:col-span-2 border-t border-gray-200 dark:border-dark-600 pt-4 mt-2">
                    {isEditMode ? (
                        !isChangingPassword ? (
                             <button 
                                type="button"
                                onClick={() => setIsChangingPassword(true)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                              >
                                Ubah Password User Ini
                              </button>
                        ) : (
                             <div className="bg-gray-50 dark:bg-dark-800 p-3 rounded-lg border border-gray-200 dark:border-dark-600">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Ubah Password Baru</span>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setIsChangingPassword(false);
                                            setPassword("");
                                            setConfirmPassword("");
                                        }}
                                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                                    >
                                        Batal
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-xs font-medium mb-1 text-gray-900 dark:text-gray-100">Password Baru</label>
                                        <input
                                            className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 text-sm"
                                            type="password"
                                            placeholder="Min 6 karakter"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1 text-gray-900 dark:text-gray-100">Konfirmasi Password</label>
                                        <input
                                            className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 text-sm"
                                            type="password"
                                            placeholder="Ulangi password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                             </div>
                        )
                    ) : (
                        // Mode Create: Simple input (Optional, defaults to 12345678)
                         <div>
                            <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-gray-100">
                                Password <span className="text-gray-400 font-normal text-xs">(Opsional, default: 12345678)</span>
                            </label>
                            <input
                                className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                                type="password"
                                placeholder="******"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <button id="submit-user-form" type="submit" className="hidden">
                    submit
                </button>
            </div>
        </form>
    );
};

export default function UsersPage() {
    const { user: currentUser } = useAuthContext();
    const currentUserRole = currentUser?.role?.toLowerCase();

    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [slideDirection, setSlideDirection] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const rowsPerPage = 5;

    // -----------------------------------------------------------
    // LOAD USERS
    // -----------------------------------------------------------
    const loadUsers = async () => {
        try {
            const res = await axios.get(api.users.list);

            let mapped = res.data.map((u) => ({
                id: u.id,
                name: u.nama,
                email: u.email,
                role: u.role.toLowerCase()
            }));

            // Filter out super_admin if current user is admin
            if (currentUserRole === "admin") {
                mapped = mapped.filter(u => u.role !== "super_admin");
            }

            setUsers(mapped);
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Gagal mengambil data user", "error");
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // -----------------------------------------------------------
    // CRUD
    // -----------------------------------------------------------
    const createUser = async (data) => {
        try {
            await axios.post(api.users.create, {
                nama: data.name,
                email: data.email,
                password: data.password, // Now coming from form
                role: data.role.toUpperCase()
            });

            Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "User berhasil ditambahkan.",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "!bg-white dark:!bg-gray-800",
          title: "text-gray-900 dark:text-gray-100",
          htmlContainer: "text-gray-600 dark:text-gray-300",
        },
      });
            loadUsers();
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Gagal menambah user", "error");
        }
    };

    const updateUser = async (id, data) => {
        try {
            // Prepare payload
            const payload = {
                nama: data.name,
                email: data.email,
                role: data.role.toUpperCase()
            };
            
            // Only add password if it exists (handled in form logic)
            if (data.password) {
                payload.password = data.password;
            }

            await axios.put(api.users.update(id), payload);

            Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "User berhasil diperbarui.",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "!bg-white dark:!bg-gray-800",
          title: "text-gray-900 dark:text-gray-100",
          htmlContainer: "text-gray-600 dark:text-gray-300",
        },
      });
            loadUsers();
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Gagal update user", "error");
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Hapus User?",
            text: "Data user yang dihapus tidak dapat dikembalikan!",
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
            setDeletingId(id);
            await axios.delete(api.users.delete(id));
            setDeletingId(null);

            Swal.fire({
        icon: "success",
        title: "Terhapus!",
        text: "User berhasil dihapus.",
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "!bg-white dark:!bg-gray-800",
          title: "text-gray-900 dark:text-gray-100",
          htmlContainer: "text-gray-600 dark:text-gray-300",
        },
      });
            loadUsers();
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Gagal menghapus user", "error");
        }
    };

    // -----------------------------------------------------------
    // PAGINATION
    // -----------------------------------------------------------
    const totalPages = Math.ceil(users.length / rowsPerPage);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    const usersToDisplay = users.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setSlideDirection(page > currentPage ? "slide-left" : "slide-right");

        setTimeout(() => {
            setCurrentPage(page);
            setSlideDirection("");
        }, 300);
    };

    const handlePrev = () => {
        if (currentPage > 1) handlePageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) handlePageChange(currentPage + 1);
    };

    // -----------------------------------------------------------
    // MODAL
    // -----------------------------------------------------------
    const showCreateUserModal = () => {
        const node = document.createElement("div");
        let root;

        Swal.fire({
            title: "Tambah User",
            html: node,
            showCancelButton: true,
            confirmButtonText: "Simpan",
            cancelButtonText: "Batal",
            width: "600px",
            customClass: {
                popup: "!bg-white dark:!bg-gray-800",
                title: "!text-black dark:!text-white",
                htmlContainer: "text-gray-600 dark:text-gray-300",
                confirmButton:
                    "bg-blue-500 hover:bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg",
                cancelButton:
                    "bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2.5 rounded-lg",
            },

            didOpen: () => {
                root = ReactDOM.createRoot(node);
                root.render(
                    <UserFormContent
                        swalClose={() => Swal.close()}
                        onSubmit={createUser}
                        currentUserRole={currentUserRole}
                    />
                );
            },

            preConfirm: () => {
                document.getElementById("submit-user-form").click();
                return false;
            },

            willClose: () => root?.unmount()
        });
    };

    const showEditUserModal = (user) => {
        const node = document.createElement("div");
        let root;

        Swal.fire({
            title: "Edit User",
            html: node,
            showCancelButton: true,
            confirmButtonText: "Simpan",
            cancelButtonText: "Batal",
            width: "600px",
            customClass: {
                popup: "!bg-white dark:!bg-gray-800",
                title: "!text-black dark:!text-white",
                htmlContainer: "text-gray-600 dark:text-gray-300",
                confirmButton:
                    "bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2.5 rounded-lg",
                cancelButton:
                    "bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2.5 rounded-lg",
            },

            didOpen: () => {
                root = ReactDOM.createRoot(node);
                root.render(
                    <UserFormContent
                        swalClose={() => Swal.close()}
                        initialData={user}
                        onSubmit={(data) => updateUser(user.id, data)}
                        currentUserRole={currentUserRole}
                    />
                );
            },

            preConfirm: () => {
                document.getElementById("submit-user-form").click();
                return false;
            },

            willClose: () => root?.unmount()
        });
    };

    // -----------------------------------------------------------
    // RENDER
    // -----------------------------------------------------------
    return (
        <div className="transition-content w-full px-4 lg:px-6 pt-5 lg:pt-6 text-gray-900 dark:text-gray-200 bg-white dark:bg-dark-900 min-h-screen">

            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold tracking-wide">Users</h2>

                    <button
                        onClick={showCreateUserModal}
                        className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                        + User Baru
                    </button>
                </div>

                {/* TABLE */}
                <div className="bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">

                            <thead className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-dark-700 dark:to-dark-750 text-gray-700 dark:text-gray-300 border-b-2 border-gray-200 dark:border-dark-600">
                                <tr>
                                    <th className="px-4 py-3.5 w-16">No</th>
                                    <th className="px-4 py-3.5">Nama</th>
                                    <th className="px-4 py-3.5">Email</th>
                                    <th className="px-4 py-3.5">Role</th>
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
                                {usersToDisplay.map((user, i) => (
                                    <tr
                                        key={user.id}
                                        className={`
                                            transition-all duration-300 ease-in-out
                                            hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
                                            dark:hover:from-dark-750 dark:hover:to-dark-750
                                            ${deletingId === user.id ? "opacity-0 scale-95" : ""}
                                        `}
                                    >
                                        <td className="px-4 py-3.5">
                                            {startIndex + i + 1}
                                        </td>

                                        <td className="px-4 py-3.5">{user.name}</td>
                                        <td className="px-4 py-3.5">{user.email}</td>
                                        <td className="px-4 py-3.5 capitalize">{user.role}</td>

                                        <td className="px-4 py-3.5">
                                            <div className="flex justify-center gap-2">
                                                {/* Hide edit/delete if current user is admin and target is also admin */}
                                                {!(currentUserRole === "admin" && user.role === "admin") && (
                                                    <>
                                                        <button
                                                            onClick={() => showEditUserModal(user)}
                                                            className="rounded-lg bg-yellow-100 p-2 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
                                                        >
                                                            <PencilSquareIcon className="w-5"/>
                                                        </button>

                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                                                        >
                                                            <TrashIcon className="w-5"/>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                        </table>
                    </div>
                </div>

                {/* PAGINATION */}
                <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">

                    <div className="text-gray-600 dark:text-gray-400">
                        Menampilkan <b>{startIndex + 1}</b> - <b>{Math.min(endIndex, users.length)}</b> dari <b>{users.length}</b> hasil
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
        </div>
    );
}
