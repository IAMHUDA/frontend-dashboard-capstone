import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react";
import {
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarDot, Button } from "components/ui";
import { useContext } from "react";
import AuthContext from "app/contexts/auth/authContext";

// Fungsi untuk ambil inisial
const getInitials = (nama) => {
  return nama
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";
};

export function Profile() {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
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
          {() => (
            <>
              <div className="dark:bg-dark-800 flex items-center gap-4 rounded-t-lg bg-gray-100 px-4 py-5">
                <Avatar size={14}>
                  {getInitials(user?.nama)}
                </Avatar>
                <div>
                  <Link
                    className="hover:text-primary-600 focus:text-primary-600 dark:text-dark-100 dark:hover:text-primary-400 dark:focus:text-primary-400 text-base font-medium text-gray-700"
                    to="/settings/general"
                  >
                    {user?.nama || "Your Name"}
                  </Link>
                  <p className="dark:text-dark-300 mt-0.5 text-xs text-gray-400">
                    {user?.email || "your@email.com"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col pt-2 pb-5">
                <div className="px-4 pt-4">
                  <Button className="w-full gap-2" onClick={handleLogout}>
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