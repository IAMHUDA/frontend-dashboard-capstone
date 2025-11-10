import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router";
import { Avatar, AvatarDot, Button } from "components/ui";

// ----------------------------------------------------------------------

export function Profile() {
  // Dummy data pengguna
  const dummyUser = {
    name: "John Doe",
    email: "johndoe@example.com",
    avatarUrl: "", // bisa tambahkan URL gambar jika ingin menampilkan avatar sungguhan
  };

  return (
    <Popover className="relative">
      <PopoverButton
        as={Avatar}
        size={12}
        role="button"
        classNames={{ root: "cursor-pointer" }}
        indicator={
          <AvatarDot color="success" className="ltr:right-0 rtl:left-0" />
        }
      >
        {dummyUser.name[0]}
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
          {() => (
            <>
              {/* Header Profil */}
              <div className="dark:bg-dark-800 flex items-center gap-4 rounded-t-lg bg-gray-100 px-4 py-5">
                <Avatar size={14}>
                  {dummyUser.name[0]}
                </Avatar>
                <div>
                  <Link
                    className="hover:text-primary-600 focus:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 dark:focus:text-primary-400 text-base font-medium text-gray-700"
                    to="/settings/general"
                  >
                    {dummyUser.name}
                  </Link>
                  <p className="dark:text-dark-300 mt-0.5 text-xs text-gray-400">
                    {dummyUser.email}
                  </p>
                </div>
              </div>

              {/* Tombol Logout */}
              <div className="flex flex-col pt-2 pb-5">
                <div className="px-4 pt-4">
                  <Button className="w-full gap-2">
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
