import { RoleGuard } from "./RoleGuard";

/**
 * Factory function to create RoleGuard with specific allowed roles
 */
export const createRoleGuard = (allowedRoles) => {
  return function RoleGuardWrapper() {
    return <RoleGuard allowedRoles={allowedRoles} />;
  };
};
