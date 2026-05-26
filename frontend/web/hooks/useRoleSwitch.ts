import { useAuth } from "@/context/AuthContext";
import { hasRole } from "@/lib/auth";

export function useRoleSwitch() {
    const { roles, loading } = useAuth();
    
    const isPrivileged = hasRole(roles, "admin") || hasRole(roles, "moderator") || hasRole(roles, "super_admin");
    
    return { isPrivileged, loading };
}
