import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Logo from "assets/bantul3.svg";
import { Button, Card, Input, InputErrorMsg } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context";
import { schema } from "./schema";
import { Page } from "components/shared/Page";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import axios from "utils/axios";
import api from "configs/api.config";
import { randomId } from "utils/randomId";

export default function SignIn() {
  const { login, errorMessage } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();

  // Hanya tampilkan link Daftar Akun jika URL memiliki ?register=true
  const showRegisterLink = searchParams.get('register') === 'true';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data) => {
    login({
      email: data.email,
      password: data.password,
    });
  };

  const handleRegister = () => {
    Swal.fire({
      title: "Daftar Akun Baru",
      html: `
        <div class="text-left">
            <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-300">Nama Lengkap</label>
            <input id="reg-name" class="w-full p-2.5 mb-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="Nama Lengkap">
            
            <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-300">Email</label>
            <input id="reg-email" type="email" class="w-full p-2.5 mb-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="nama@email.com">
            
            <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-300">Password</label>
            <input id="reg-password" type="password" class="w-full p-2.5 mb-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="********">

            <label class="block mb-1 text-sm font-medium text-gray-900 dark:text-gray-300">Role</label>
            <select id="reg-role" class="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                <option value="warga">Warga</option>
                <option value="admin">Admin</option>
                <option value="super_admin" selected>Super Admin</option>
            </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Daftar",
      cancelButtonText: "Batal",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      customClass: {
        popup: "dark:bg-gray-800",
        title: "dark:text-white",
      },
      preConfirm: async () => {
        const name = document.getElementById("reg-name").value;
        const email = document.getElementById("reg-email").value;
        const password = document.getElementById("reg-password").value;
        const role = document.getElementById("reg-role").value.toUpperCase();

        if (!name || !email || !password) {
          Swal.showValidationMessage("Mohon lengkapi semua kolom");
          return false;
        }

        try {
          // Menggunakan endpoint register yang sama dengan user creation
          // Pastikan endpoint ini mendukung field role jika diizinkan backend
          await axios.post(api.auth.register, {
            id: randomId(),
            nama: name,
            email: email,
            password: password,
            role: role
          });
          return true;
        } catch (error) {
          console.error("Registration Error:", error);
          const msg = error.response?.data?.message || "Gagal mendaftar. Silakan coba lagi.";
          Swal.showValidationMessage(msg);
          return false;
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Akun berhasil dibuat. Silakan login.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <Page title="Login">
      <main className="min-h-100vh grid w-full grow grid-cols-1 place-items-center">
        <div className="w-full max-w-[26rem] p-4 sm:px-5">
          <div className="text-center">
            <div className="mx-auto flex h-40 w-40 items-center justify-center sm:h-[100px] sm:w-[120px]">
              <img
                src={Logo}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="mt-4">
              <h2 className="dark:text-dark-100 text-2xl font-semibold text-gray-600">
                Selamat Datang
              </h2>
            </div>
          </div>

          <Card className="mt-5 rounded-lg p-5 lg:p-7">
            <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <div className="space-y-4">
                <Input
                  label="Email"
                  placeholder="Masukkan email kamu"
                  prefix={
                    <EnvelopeIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  {...register("email")}
                  error={errors?.email?.message}
                />

                <Input
                  label="Password"
                  placeholder="Masukkan password kamu"
                  type={showPassword ? "text" : "password"}
                  prefix={
                    <LockClosedIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeSlashIcon
                          className="size-5 text-gray-500"
                          strokeWidth="1.5"
                        />
                      ) : (
                        <EyeIcon
                          className="size-5 text-gray-500"
                          strokeWidth="1.5"
                        />
                      )}
                    </button>
                  }
                  {...register("password")}
                  error={errors?.password?.message}
                />
              </div>

              <div className="mt-2">
                <InputErrorMsg
                  when={errorMessage && errorMessage?.message !== ""}
                >
                  {errorMessage?.message}
                </InputErrorMsg>
              </div>

              <Button type="submit" className="mt-5 w-full" color="primary">
                Masuk
              </Button>
            </form>

            {showRegisterLink && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Belum punya akun?{' '}
                  <button
                    type="button"
                    onClick={handleRegister}
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline dark:text-blue-400"
                  >
                    Daftar Akun
                  </button>
                </p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </Page>
  );
}
