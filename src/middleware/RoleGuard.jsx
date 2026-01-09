// Import Dependencies
import { Navigate, Outlet } from "react-router";
import PropTypes from "prop-types";

// Local Imports
import { useAuthContext } from "app/contexts/auth/context";

// ----------------------------------------------------------------------

/**
 * RoleGuard - Protects routes based on user role
 * @param {Array} allowedRoles - Array of roles that can access this route
 */
export function RoleGuard({ allowedRoles }) {
  const { user } = useAuthContext();
  const userRole = user?.role?.toLowerCase();

  // console.log("🔒 RoleGuard Check:", { userRole, allowedRoles, user });

  // If no role restrictions, allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    return <Outlet />;
  }

  // Check if user's role is in allowed roles
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    // console.log("❌ Access Denied - Redirecting to /dashboards/home");
    // Redirect to survey if user doesn't have access
    return <Navigate to="/dashboards/survey" replace />;
  }

  // console.log("✅ Access Granted");
  return <Outlet />;
}

RoleGuard.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
};

// createRoleGuard moved to RoleGuardUtils.jsx to satisfy Fast Refresh rules
