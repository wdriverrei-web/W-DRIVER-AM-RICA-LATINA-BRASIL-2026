import { AppUser, UserRole } from '../types';

export const ROLE_PERMISSIONS = {
  passageiro: {
    canAccessCentral: false,
    canAccessDriverPortal: false,
    canAccessPassengerPortal: true,
    canRequestRides: true,
    canManagePrepaidContracts: true,
    canViewSafePoints: true,
    canTriggerSos: true,
    canManageSystemTariffs: false,
    canApproveDocuments: false,
    canManageStates: false,
  },
  motorista: {
    canAccessCentral: false,
    canAccessDriverPortal: true,
    canAccessPassengerPortal: false,
    canAcceptRides: true,
    canViewShiftGoal: true,
    canViewDriverEarnings: true,
    canViewAssignedPassengers: true,
    canTriggerSos: true,
    canManageSystemTariffs: false,
    canApproveDocuments: false,
    canManageStates: false,
  },
  admin: {
    canAccessCentral: true,
    canAccessDriverPortal: false, // Access is via Central supervision/simulator only
    canAccessPassengerPortal: false, // Access is via Central supervision/simulator only
    canManageAllDrivers: true,
    canManageAllPassengers: true,
    canManagePrepaidContracts: true,
    canManageSystemTariffs: true,
    canManageDynamicPeakHours: true,
    canApproveDocuments: true,
    canManageSafePoints: true,
    canManageStates: true,
    canManagePartners: true,
    canManageAds: true,
    canViewAuditLogs: true,
    canConfigurePlatform: true,
  },
} as const;

export function canAccessCentral(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'admin' && user.status === 'ativo';
}

export function canAccessDriverPortal(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'motorista' && user.status === 'ativo';
}

export function canAccessPassengerPortal(user: AppUser | null): boolean {
  if (!user) return false;
  return user.role === 'passageiro' && user.status === 'ativo';
}

export function validateAccess(user: AppUser | null, targetArea: 'central' | 'motorista' | 'passageiro'): {
  allowed: boolean;
  reason?: string;
  redirectTo: 'central' | 'motorista' | 'passageiro' | 'login';
} {
  if (!user) {
    return {
      allowed: false,
      reason: 'Usuário não autenticado no sistema W-DRIVER.',
      redirectTo: 'login',
    };
  }

  if (user.status === 'bloqueado') {
    return {
      allowed: false,
      reason: 'Conta temporariamente bloqueada pela Central de Segurança W-DRIVER.',
      redirectTo: 'login',
    };
  }

  if (targetArea === 'central') {
    if (user.role !== 'admin') {
      return {
        allowed: false,
        reason: `Acesso negado à Central Administrativa. Seu perfil é ${user.role.toUpperCase()}.`,
        redirectTo: user.role === 'motorista' ? 'motorista' : 'passageiro',
      };
    }
    return { allowed: true, redirectTo: 'central' };
  }

  if (targetArea === 'motorista') {
    if (user.role !== 'motorista') {
      return {
        allowed: false,
        reason: `Acesso negado ao Portal do Motorista. Seu perfil é ${user.role.toUpperCase()}.`,
        redirectTo: user.role === 'admin' ? 'central' : 'passageiro',
      };
    }
    return { allowed: true, redirectTo: 'motorista' };
  }

  if (targetArea === 'passageiro') {
    if (user.role !== 'passageiro') {
      return {
        allowed: false,
        reason: `Acesso negado ao Portal do Passageiro. Seu perfil é ${user.role.toUpperCase()}.`,
        redirectTo: user.role === 'admin' ? 'central' : 'motorista',
      };
    }
    return { allowed: true, redirectTo: 'passageiro' };
  }

  return { allowed: false, redirectTo: 'login' };
}
