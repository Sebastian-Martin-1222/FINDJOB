import type { AuthUser } from "@/lib/auth-storage";

const INTERNAL_ROLES = {
  CONTRACT: "CLIENTE",
  PROVIDE: "TRABAJADOR",
  ADMIN: "ADMIN",
} as const;

export interface AccessCapabilities {
  canContractServices: boolean;
  canProvideServices: boolean;
  canAdminister: boolean;
}

export function getAccessCapabilities(user: AuthUser | null | undefined): AccessCapabilities {
  const roles = new Set(user?.roles ?? []);
  return {
    canContractServices: roles.has(INTERNAL_ROLES.CONTRACT),
    canProvideServices: roles.has(INTERNAL_ROLES.PROVIDE),
    canAdminister: roles.has(INTERNAL_ROLES.ADMIN),
  };
}

export function getDefaultPrivateRoute(user: AuthUser | null | undefined): string {
  const access = getAccessCapabilities(user);
  if (access.canContractServices) return "/dashboard";
  if (access.canProvideServices) return "/trabajador/dashboard";
  if (access.canAdminister) return "/admin/usuarios";
  return "/login";
}

export function canAccessPath(user: AuthUser | null | undefined, pathname: string): boolean {
  const access = getAccessCapabilities(user);

  if (pathname.startsWith("/admin")) return access.canAdminister;
  if (pathname.startsWith("/trabajador")) return access.canProvideServices;
  if (pathname === "/dashboard" || pathname === "/solicitudes") return access.canContractServices;
  if (/^\/servicios\/[^/]+\/solicitar(?:\/|$)/.test(pathname)) return access.canContractServices;

  return Boolean(user);
}

export function getFunctionalAccessLabel(roleCode: string): string {
  switch (roleCode) {
    case INTERNAL_ROLES.CONTRACT:
      return "Contratar servicios";
    case INTERNAL_ROLES.PROVIDE:
      return "Ofrecer servicios";
    case INTERNAL_ROLES.ADMIN:
      return "Administrar plataforma";
    default:
      return "Acceso asignado";
  }
}
