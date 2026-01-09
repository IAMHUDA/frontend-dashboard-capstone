import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import {
  ArrowLeftStartOnRectangleIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarDot, Button } from "components/ui";
import { useContext, useState } from "react";
import AuthContext from "app/contexts/auth/authContext";
import Swal from "sweetalert2";
import ReactDOM from "react-dom/client";
import axios from "utils/axios";
import api from "configs/api.config";

// Fungsi untuk ambil inisial
const getInitials = (nama) => {
  return nama
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";
};

// --- Form Content untuk SweetAlert ---
const ProfileEditForm = ({ swalClose, onSubmit, initialEmail }) => {
  const [email, setEmail] = useState(initialEmail || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) {
      Swal.showValidationMessage("Email tidak boleh kosong");
      return;
    }

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

    // Kirim data
    const payload = { email };
    let changes = [];
    if (initialEmail !== email) changes.push("email");
    
    if (isChangingPassword && password) {
      payload.password = password;
      changes.push("password");
    }

    console.log("Payload to be sent:", payload); // LOGGING REQUEST
    
    onSubmit(payload, changes);
    swalClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-2 text-left text-gray-900 dark:text-gray-100">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 focus:ring-2 focus:ring-primary-500 outline-none transition"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-4">
        {!isChangingPassword ? (
           <Button 
            className="w-full underline text-blue-700 hover:text-blue-800" 
            variant="flat" 
            onClick={() => setIsChangingPassword(true)}
            type="button"
          >
            Ubah Password
          </Button>
        ) : (
          <div className="p-3 border border-gray-200 dark:border-dark-600 rounded-lg bg-gray-50 dark:bg-dark-800">
             <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold ">Ubah Password</span>
                <button 
                  type="button" 
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Batal
                </button>
             </div>

            <div className="mb-3">
              <label className="block text-xs font-medium mb-1">Password Baru</label>
              <input
                type="password"
                className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 focus:ring-2 focus:ring-primary-500 outline-none transition text-sm"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Konfirmasi Password</label>
              <input
                type="password"
                className="w-full p-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 focus:ring-2 focus:ring-primary-500 outline-none transition text-sm"
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <button id="submit-profile-form" type="submit" className="hidden">
        Save
      </button>
    </form>
  );
};

export function Profile() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleEditProfile = () => {
    const node = document.createElement("div");
    let root;

    Swal.fire({
      title: "Edit Profile",
      html: node,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      width: "500px",
      customClass: {
        popup: "!bg-white dark:!bg-gray-800",
        title: "!text-black dark:!text-white",
        htmlContainer: "text-gray-600 dark:text-gray-300",
        confirmButton:
          "bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg mr-2",
        cancelButton:
          "bg-gray-500 hover:bg-gray-600 text-white font-medium px-5 py-2.5 rounded-lg",
      },
      didOpen: () => {
        root = ReactDOM.createRoot(node);
        root.render(
          <ProfileEditForm
            swalClose={() => Swal.close()}
            initialEmail={user?.email}
            onSubmit={async (data, changes) => {
              try {
                console.log("Submitting data:", data); // LOGGING SUBMISSION

                // Gunakan api.users.update
                await axios.put(api.users.update(user.id), {
                  nama: user.nama, // Keep existing name
                  ...data
                });

                let successText = "Profile berhasil diperbarui.";
                if (changes.length > 0) {
                   const changedItems = changes.map(c => c === 'email' ? 'Email' : 'Password').join(' dan ');
                   successText = `${changedItems} berhasil diperbarui.`;
                }

                Swal.fire({
                  icon: "success",
                  title: "Berhasil!",
                  text: successText,
                  timer: 2000,
                  showConfirmButton: false,
                  customClass: {
                    popup: "!bg-white dark:!bg-gray-800",
                    title: "text-gray-900 dark:text-gray-100",
                    htmlContainer: "text-gray-600 dark:text-gray-300",
                  },
                });
                
                window.location.reload(); 

              } catch (err) {
                console.error("API Error:", err); // LOGGING ERROR
                Swal.fire({
                  icon: "error",
                  title: "Gagal",
                  text: err?.response?.data?.message || "Gagal memperbarui profile",
                  customClass: {
                   popup: "!bg-white dark:!bg-gray-800",
                   title: "text-gray-900 dark:text-gray-100",
                   htmlContainer: "text-gray-600 dark:text-gray-300",
                  }
                });
              }
            }}
          />
        );
      },
      preConfirm: () => {
        document.getElementById("submit-profile-form")?.click();
        return false;
      },
      willClose: () => root?.unmount(),
    });
  };

  return (
    <Popover className="relative">
      <PopoverButton
        as={Avatar}
        size={12}
        role="button"
        classNames={{ root: "cursor-pointer" }}
        indicator={<AvatarDot color="success" className="ltr:right-0 rtl:left-0" />}
      >
        {getInitials(user?.nama)}
      </PopoverButton>
      <Transition
        enter="duration-200 ease-out"
        enterFrom="translate-x-2 opacity-0"
        enterTo="translate-x-0 opacity-100"
        leave="duration-200 ease-out"
        leaveFrom="translate-x-0 opacity-100"
        leaveTo="translate-x-2 opacity-0"
      >
        <PopoverPanel
          anchor={{ to: "right end", gap: 12 }}
          className="border-gray-150 shadow-soft dark:border-dark-600 dark:bg-dark-700 z-70 flex w-64 flex-col rounded-lg border bg-white transition dark:shadow-none"
        >
          {({ close }) => (
            <>
              <div className="dark:bg-dark-800 flex items-center gap-4 rounded-t-lg bg-gray-100 px-4 py-5">
                <Avatar size={14}>
                  {getInitials(user?.nama)}
                </Avatar>
                <div>
                  <h6
                    className="text-base font-medium text-gray-700 dark:text-dark-100"
                  >
                    {user?.nama || "Your Name"}
                  </h6>
                  <p className="dark:text-dark-300 mt-0.5 text-xs text-gray-400 break-all">
                    {user?.email || "your@email.com"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col pt-2 pb-5">
                <div className="px-4 pt-2">
                   <Button 
                    className="w-full gap-2 justify-start mb-2" 
                    variant="flat"
                    onClick={() => {
                      close();
                      handleEditProfile();
                    }}
                  >
                    <PencilSquareIcon className="size-4.5" />
                    <span>Edit Profile</span>
                  </Button>

                  <Button className="w-full gap-2 justify-start" onClick={handleLogout} variant="flat" color="error">
                    <ArrowLeftStartOnRectangleIcon className="size-4.5" />
                    <span>Keluar</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </PopoverPanel>
      </Transition>
    </Popover>
  );
}