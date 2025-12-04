// Import Dependencies
import { Navigate } from "react-router";

// Local Imports
import { AppLayout } from "app/layouts/AppLayout";
import { DynamicLayout } from "app/layouts/DynamicLayout";
import AuthGuard from "middleware/AuthGuard";
import { createRoleGuard } from "middleware/RoleGuard";

// ----------------------------------------------------------------------

// Create role guards for different access levels
const AdminOnlyGuard = createRoleGuard(['super_admin', 'admin']);

const protectedRoutes = {
  id: "protected",
  Component: AuthGuard,
  children: [
    // The dynamic layout supports both the main layout and the sideblock.
    {
      Component: DynamicLayout,
      children: [
        {
          index: true,
          element: <Navigate to="/dashboards" />,
        },
        {
          path: "dashboards",
          children: [
            {
              index: true,
              element: <Navigate to="/dashboards/home" />,
            },
            {
              path: "home",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/home")).default,
              }),
            },
            // Survey - Only super_admin and admin
            {
              Component: AdminOnlyGuard,
              children: [
                {
                  path: "survey",
                  lazy: async () => ({
                    Component: (await import("app/pages/dashboards/survey")).default,
                  }),
                },
              ],
            },
            // UMKM - All roles
            {
              path: "UMKM",
              lazy: async () => ({
                Component: (await import("app/pages/dashboards/UMKM")).default,
              }),
            },
            // Pertanyaan - Only super_admin and admin
            {
              Component: AdminOnlyGuard,
              children: [
                {
                  path: "pertanyaan",
                  lazy: async () => ({
                    Component: (await import("app/pages/dashboards/pertanyaan")).default,
                  }),
                },
              ],
            },
            // Users - Only super_admin and admin
            {
              Component: AdminOnlyGuard,
              children: [
                {
                  path: "users",
                  lazy: async () => ({
                    Component: (await import("app/pages/dashboards/users")).default,
                  }),
                },
              ],
            },
            // Hasil Survey - Only super_admin and admin
            {
              Component: AdminOnlyGuard,
              children: [
                {
                  path: "hasil-survey",
                  lazy: async () => ({
                    Component: (await import("app/pages/dashboards/hasil-survey")).default,
                  }),
                },
              ],
            },
          ],
        },
      ],
    },
    // The app layout supports only the main layout. Avoid using it for other layouts.
    {
      Component: AppLayout,
      children: [
        {
          path: "settings",
          lazy: async () => ({
            Component: (await import("app/pages/settings/Layout")).default,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="/settings/general" />,
            },
            {
              path: "general",
              lazy: async () => ({
                Component: (await import("app/pages/settings/sections/General"))
                  .default,
              }),
            },
            {
              path: "appearance",
              lazy: async () => ({
                Component: (
                  await import("app/pages/settings/sections/Appearance")
                ).default,
              }),
            },
          ],
        },
      ],
    },
  ],
};

export { protectedRoutes };
