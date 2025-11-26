import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useState } from "react";
import Logo from "assets/bantul3.svg";
import { Button, Card, Input, InputErrorMsg } from "components/ui";
import { useAuthContext } from "app/contexts/auth/context"; // hook
import { schema } from "./schema";
import { Page } from "components/shared/Page";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function SignIn() {
  const { login, errorMessage } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);

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
                  type={showPassword ? "text" : "password"} // toggle type input
                  prefix={
                    <LockClosedIcon
                      className="size-5 transition-colors duration-200"
                      strokeWidth="1"
                    />
                  }
                  suffix={
                    // tambahkan icon mata di sebelah kanan input
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
          </Card>
        </div>
      </main>
    </Page>
  );
}
