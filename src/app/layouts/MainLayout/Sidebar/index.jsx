// Import Dependencies
import { useMemo, useState } from "react";
import { useLocation } from "react-router";

// Local Imports
import { useBreakpointsContext } from "app/contexts/breakpoint/context";
import { useSidebarContext } from "app/contexts/sidebar/context";
import { useAuthContext } from "app/contexts/auth/context";
import { navigation } from "app/navigation";
import { useDidUpdate } from "hooks";
import { isRouteActive } from "utils/isRouteActive";
import { PrimePanel } from "./PrimePanel";

// ----------------------------------------------------------------------

// Helper function to filter navigation based on user role
const filterNavigationByRole = (navItems, userRole) => {
  if (!userRole) return navItems;
  
  return navItems.map(item => {
    // If item has childs, filter them
    if (item.childs) {
      const filteredChilds = item.childs.filter(child => {
        // If allowedRoles is not defined, allow all roles
        if (!child.allowedRoles) return true;
        // Check if user's role is in allowedRoles
        return child.allowedRoles.includes(userRole);
      });
      
      return {
        ...item,
        childs: filteredChilds
      };
    }
    
    return item;
  }).filter(item => {
    // Remove items that have no childs after filtering
    if (item.childs) {
      return item.childs.length > 0;
    }
    return true;
  });
};

export function Sidebar() {
  const { pathname } = useLocation();
  const { name, lgAndDown } = useBreakpointsContext();
  const { isExpanded, close } = useSidebarContext();
  const { user } = useAuthContext();
  
  const userRole = user?.role?.toLowerCase();

  // Filter navigation based on user role
  const filteredNavigation = useMemo(
    () => filterNavigationByRole(navigation, userRole),
    [userRole]
  );

  const initialSegment = useMemo(
    () => filteredNavigation.find((item) => isRouteActive(item.path, pathname)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [activeSegmentPath, setActiveSegmentPath] = useState(
    initialSegment?.path,
  );

  const currentSegment = useMemo(() => {
    return filteredNavigation.find((item) => item.path === activeSegmentPath);
  }, [activeSegmentPath, filteredNavigation]);

  useDidUpdate(() => {
    const activePath = filteredNavigation.find((item) =>
      isRouteActive(item.path, pathname),
    )?.path;

    if (!isRouteActive(activeSegmentPath, pathname)) {
      setActiveSegmentPath(activePath);
    }
  }, [pathname]);

  useDidUpdate(() => {
    if (lgAndDown && isExpanded) close();
  }, [name]);

  return (
    <>
      <PrimePanel
        close={close}
        currentSegment={currentSegment}
        pathname={pathname}
      />
    </>
  );
}
