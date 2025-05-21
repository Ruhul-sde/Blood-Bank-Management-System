import { apiRequest } from "@/lib/queryClient";
import { LoginCredentials } from "@shared/schema";

export async function loginUser(credentials: LoginCredentials) {
  try {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export function isRoleAuthorized(userRole: string | undefined, allowedRoles: string[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}
