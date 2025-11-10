// Import Dependencies

import clsx from "clsx";

// Local Imports

import { SidebarToggleBtn } from "components/shared/SidebarToggleBtn";
import {Footer}  from "../../../pages/settings/Sidebar/SidebarPanel/Footer";
import { useThemeContext } from "app/contexts/theme/context";

// ----------------------------------------------------------------------



export function Header() {
  const { cardSkin } = useThemeContext();

  return (
    <header
      className={clsx(
        "app-header transition-content sticky top-0 z-20 flex h-[65px] shrink-0 items-center justify-between border-b border-gray-200 bg-white/80 px-2 backdrop-blur-sm backdrop-saturate-150 dark:border-dark-600",
        cardSkin === "shadow" ? "dark:bg-dark-750/80" : "dark:bg-dark-900/80",
      )}
    >
      <SidebarToggleBtn />
      <Footer/>
    </header>
  );
}
