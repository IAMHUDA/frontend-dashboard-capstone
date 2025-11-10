import React, { useContext, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import SimpleBar from "simplebar-react";
import { Accordion } from "components/ui";
import { Group } from "./Group";
import { navigation as rawNavigation } from "app/navigation";
import { isRouteActive } from "utils/isRouteActive";
import { useDidUpdate, useIsomorphicEffect } from "hooks";
import AuthContext from "app/contexts/auth/authContext";

export function Menu() {
  console.log("🔥 Menu component render!");
  console.log("➡️ isInitialized:", isInitialized);
  console.log("➡️ user:", user);
  const { pathname } = useLocation();
  const ref = useRef();

  const { user, isInitialized } = useContext(AuthContext);

  console.log("Menu render: user=", user, "isInitialized=", isInitialized);

  const navigation = useMemo(() => {
  console.log("🧩 useMemo triggered!");
  console.log("🔍 user:", user);
  console.log("🔍 user?.is_admin:", user?.is_admin);
  console.log("🔍 rawNavigation:", rawNavigation);
  if (!isInitialized || !user) return [];
  console.log("➡️ user.is_admin di useMemo:", user.is_admin);
  return rawNavigation.map((nav) => {
    if (nav.id === "dashboards" && Array.isArray(nav.childs)) {
      return {
        ...nav,
        childs: nav.childs.filter((item) => {
          console.log("📌 Checking user.is_admin inside filter:", user.is_admin);
          return !!user.is_admin;
        }),
      };
    }
    return nav;
  });
}, [isInitialized, user]);


  const activeGroup = navigation.find((item) =>
    item.path && isRouteActive(item.path, pathname)
  );
  const activeCollapsible = activeGroup?.childs?.find((item) =>
    item.path && isRouteActive(item.path, pathname)
  );

  const [expanded, setExpanded] = useState(activeCollapsible?.path || null);

  useDidUpdate(() => {
    if (activeCollapsible?.path !== expanded) {
      setExpanded(activeCollapsible?.path);
    }
  }, [activeCollapsible?.path]);

  useIsomorphicEffect(() => {
    const activeItem = ref?.current?.querySelector("[data-menu-active=true]");
    activeItem?.scrollIntoView({ block: "center" });
  }, []);

  console.log("Filtered navigation:", navigation);

  if (!isInitialized) {
    console.log("Menu: waiting for initialization...");
    return null; // atau bisa return loader
  }

  return (
    <SimpleBar scrollableNodeProps={{ ref }} className="h-full overflow-x-hidden pb-6">
      <Accordion value={expanded} onChange={setExpanded} className="space-y-1">
        {navigation.map((nav) => (
          <Group key={nav.id} data={nav} />
        ))}
      </Accordion>
    </SimpleBar>
  );
}
