import {
  AppUser,
  AuditLog,
  BlockedUserPair,
  Driver,
  DriverDestinationMode,
  FixedPassenger,
  MaintenanceLog,
  Occurrence,
  PartnerAd,
  PendingApproval,
  PlatformConfig,
  Ride,
  RideCategory,
  RideMediaRecord,
  RideReceipt,
  SafePoint,
  StateOperation,
  SystemMilestone,
  TransportContract,
  WSosAlert,
} from './types';
import {
  initialAuditLogs,
  initialBlockedPairs,
  initialConfig,
  initialDemoUsers,
  initialDrivers,
  initialFixedPassengers,
  initialMediaRecords,
  initialOccurrences,
  initialPendingApprovals,
  initialRecentRides,
  initialSafePoints,
  initialStates,
  initialTransportContracts,
} from './mockData';

// Chaves de armazenamento LocalStorage para W-DRIVER
const STORAGE_KEYS = {
  CONFIG: 'WDRIVER_CONFIG_V1',
  DRIVERS: 'WDRIVER_DRIVERS_V1',
  USERS: 'WDRIVER_USERS_V1',
  PENDING_APPROVALS: 'WDRIVER_PENDING_APPROVALS_V1',
  CONTRACTS: 'WDRIVER_CONTRACTS_V1',
  FIXED_PASSENGERS: 'WDRIVER_FIXED_PASSENGERS_V1',
  SAFE_POINTS: 'WDRIVER_SAFE_POINTS_V1',
  STATES: 'WDRIVER_STATES_V1',
  OCCURRENCES: 'WDRIVER_OCCURRENCES_V1',
  RECENT_RIDES: 'WDRIVER_RECENT_RIDES_V1',
  AUDIT_LOGS: 'WDRIVER_AUDIT_LOGS_V1',
  MEDIA_RECORDS: 'WDRIVER_MEDIA_RECORDS_V1',
  BLOCKED_PAIRS: 'WDRIVER_BLOCKED_PAIRS_V1',
  ACTIVE_RIDE: 'WDRIVER_ACTIVE_RIDE_V1',
  CURRENT_USER: 'WDRIVER_CURRENT_USER_V1',
  SOS_ALERTS: 'WDRIVER_SOS_ALERTS_V1',
  PARTNER_ADS: 'WDRIVER_PARTNER_ADS_V1',
  MILESTONES: 'WDRIVER_MILESTONES_V1',
  RECEIPTS: 'WDRIVER_RECEIPTS_V1',
  MAINTENANCE_LOGS: 'WDRIVER_MAINTENANCE_LOGS_V1',
  DRIVER_SETTINGS: 'WDRIVER_DRIVER_SETTINGS_V1',
} as const;

function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[W-DRIVER Storage] Erro ao ler chave ${key}:`, err);
    return fallback;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[W-DRIVER Storage] Erro ao salvar chave ${key}:`, err);
  }
}

// 1. CONFIGURAÇÃO DA PLATAFORMA
export function getStoredConfig(): PlatformConfig {
  const loaded = safeGetItem<PlatformConfig>(STORAGE_KEYS.CONFIG, initialConfig);
  // Garante campos bancários e de termos estruturados
  return {
    ...initialConfig,
    ...loaded,
    pixKey: loaded.pixKey || '83988412099',
    pixKeyType: loaded.pixKeyType || 'Telefone',
    pixBeneficiary: loaded.pixBeneficiary || 'W-DRIVER AMÉRICA LATINA BRASIL LTDA',
    pixBankName: loaded.pixBankName || 'Banco Santander (Brasil) S.A.',
    termsVersion: loaded.termsVersion || 'v1.4 - 2026',
    termsLastUpdated: loaded.termsLastUpdated || '17/09/2026',
    mediaPermissions: loaded.mediaPermissions || {
      camera: true,
      microphone: true,
      location: true,
      audioRecording: true,
      videoRecording: true,
    },
  };
}

export function setStoredConfig(config: PlatformConfig): void {
  safeSetItem(STORAGE_KEYS.CONFIG, config);
}

// 2. MOTORISTAS (Preserva W-0701 a W-0707)
export function getStoredDrivers(): Driver[] {
  const drivers = safeGetItem<Driver[]>(STORAGE_KEYS.DRIVERS, initialDrivers);
  // Assegura que motoristas fundadores existam sempre
  const existingCodes = new Set(drivers.map((d) => d.userCode));
  const missingInitial = initialDrivers.filter((d) => !existingCodes.has(d.userCode));
  return [...drivers, ...missingInitial];
}

export function setStoredDrivers(drivers: Driver[]): void {
  safeSetItem(STORAGE_KEYS.DRIVERS, drivers);
}

// 3. USUÁRIOS
export function getStoredUsers(): AppUser[] {
  return safeGetItem<AppUser[]>(STORAGE_KEYS.USERS, initialDemoUsers);
}

export function setStoredUsers(users: AppUser[]): void {
  safeSetItem(STORAGE_KEYS.USERS, users);
}

// 4. APROVAÇÕES PENDENTES
export function getStoredPendingApprovals(): PendingApproval[] {
  return safeGetItem<PendingApproval[]>(STORAGE_KEYS.PENDING_APPROVALS, initialPendingApprovals);
}

export function setStoredPendingApprovals(approvals: PendingApproval[]): void {
  safeSetItem(STORAGE_KEYS.PENDING_APPROVALS, approvals);
}

// 5. CONTRATOS
export function getStoredContracts(): TransportContract[] {
  return safeGetItem<TransportContract[]>(STORAGE_KEYS.CONTRACTS, initialTransportContracts);
}

export function setStoredContracts(contracts: TransportContract[]): void {
  safeSetItem(STORAGE_KEYS.CONTRACTS, contracts);
}

// 6. PASSAGEIROS FIXOS
export function getStoredFixedPassengers(): FixedPassenger[] {
  return safeGetItem<FixedPassenger[]>(STORAGE_KEYS.FIXED_PASSENGERS, initialFixedPassengers);
}

export function setStoredFixedPassengers(passengers: FixedPassenger[]): void {
  safeSetItem(STORAGE_KEYS.FIXED_PASSENGERS, passengers);
}

// 7. PONTOS SEGUROS
export function getStoredSafePoints(): SafePoint[] {
  return safeGetItem<SafePoint[]>(STORAGE_KEYS.SAFE_POINTS, initialSafePoints);
}

export function setStoredSafePoints(safePoints: SafePoint[]): void {
  safeSetItem(STORAGE_KEYS.SAFE_POINTS, safePoints);
}

// 8. ESTADOS & TERRITÓRIOS
export function getStoredStates(): StateOperation[] {
  return safeGetItem<StateOperation[]>(STORAGE_KEYS.STATES, initialStates);
}

export function setStoredStates(states: StateOperation[]): void {
  safeSetItem(STORAGE_KEYS.STATES, states);
}

// 9. OCORRÊNCIAS
export function getStoredOccurrences(): Occurrence[] {
  return safeGetItem<Occurrence[]>(STORAGE_KEYS.OCCURRENCES, initialOccurrences);
}

export function setStoredOccurrences(occurrences: Occurrence[]): void {
  safeSetItem(STORAGE_KEYS.OCCURRENCES, occurrences);
}

// 10. CORRIDAS RECENTES
export function getStoredRecentRides(): Ride[] {
  return safeGetItem<Ride[]>(STORAGE_KEYS.RECENT_RIDES, initialRecentRides);
}

export function setStoredRecentRides(rides: Ride[]): void {
  safeSetItem(STORAGE_KEYS.RECENT_RIDES, rides);
}

// 11. LOGS DE AUDITORIA
export function getStoredAuditLogs(): AuditLog[] {
  return safeGetItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
}

export function setStoredAuditLogs(logs: AuditLog[]): void {
  safeSetItem(STORAGE_KEYS.AUDIT_LOGS, logs);
}

// 12. GRAVAÇÕES E MÍDIAS
export function getStoredMediaRecords(): RideMediaRecord[] {
  return safeGetItem<RideMediaRecord[]>(STORAGE_KEYS.MEDIA_RECORDS, initialMediaRecords);
}

export function setStoredMediaRecords(records: RideMediaRecord[]): void {
  safeSetItem(STORAGE_KEYS.MEDIA_RECORDS, records);
}

// 13. BLOQUEIOS MÚTUOS
export function getStoredBlockedPairs(): BlockedUserPair[] {
  return safeGetItem<BlockedUserPair[]>(STORAGE_KEYS.BLOCKED_PAIRS, initialBlockedPairs);
}

export function setStoredBlockedPairs(pairs: BlockedUserPair[]): void {
  safeSetItem(STORAGE_KEYS.BLOCKED_PAIRS, pairs);
}

// 14. CORRIDA ATIVA
export function getStoredActiveRide(): Ride | null {
  return safeGetItem<Ride | null>(STORAGE_KEYS.ACTIVE_RIDE, null);
}

export function setStoredActiveRide(ride: Ride | null): void {
  safeSetItem(STORAGE_KEYS.ACTIVE_RIDE, ride);
}

// 15. USUÁRIO ATUAL LOGADO
export function getStoredCurrentUser(fallback: AppUser = initialDemoUsers[3]): AppUser {
  return safeGetItem<AppUser>(STORAGE_KEYS.CURRENT_USER, fallback);
}

export function setStoredCurrentUser(user: AppUser): void {
  safeSetItem(STORAGE_KEYS.CURRENT_USER, user);
}

// 16. W-SOS ALERTAS
export function getStoredWSosAlerts(): WSosAlert[] {
  return safeGetItem<WSosAlert[]>(STORAGE_KEYS.SOS_ALERTS, []);
}

export function setStoredWSosAlerts(alerts: WSosAlert[]): void {
  safeSetItem(STORAGE_KEYS.SOS_ALERTS, alerts);
}

// 17. ANÚNCIOS / PARCEIROS
const initialPartnerAds: PartnerAd[] = [
  {
    id: 'ad-1',
    partnerName: 'Auto Peças & Pneus Litoral PB',
    plan: 'Plano Ouro Semestral',
    period: '01/01/2026 a 01/07/2026',
    imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&auto=format&fit=crop&q=80',
    active: true,
    linkUrl: 'https://wa.me/5583988412099',
    createdAt: '01/01/2026',
  },
  {
    id: 'ad-2',
    partnerName: 'Posto Rota do Sol (Combustível com Desconto)',
    plan: 'Plano Diamante Anual',
    period: '01/01/2026 a 31/12/2026',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    active: true,
    linkUrl: 'https://wa.me/5583988412099',
    createdAt: '01/01/2026',
  },
];

export function getStoredPartnerAds(): PartnerAd[] {
  return safeGetItem<PartnerAd[]>(STORAGE_KEYS.PARTNER_ADS, initialPartnerAds);
}

export function setStoredPartnerAds(ads: PartnerAd[]): void {
  safeSetItem(STORAGE_KEYS.PARTNER_ADS, ads);
}

// 18. MARCOS & CONQUISTAS DO SISTEMA
const initialMilestones: SystemMilestone[] = [
  {
    id: 'ms-1',
    type: 'cadastro',
    title: 'Fundação da Frota W-DRIVER',
    description: 'Cadastro dos primeiros motoristas oficiais W-0701 a W-0707 concluído.',
    timestamp: '10/01/2026',
  },
  {
    id: 'ms-2',
    type: 'faturamento',
    title: 'Marco Inicial de Faturamento',
    description: 'Volume operacional de viagens avulsas e contratos fixos ativado em João Pessoa.',
    value: 15000.0,
    timestamp: '01/02/2026',
  },
];

export function getStoredMilestones(): SystemMilestone[] {
  return safeGetItem<SystemMilestone[]>(STORAGE_KEYS.MILESTONES, initialMilestones);
}

export function setStoredMilestones(milestones: SystemMilestone[]): void {
  safeSetItem(STORAGE_KEYS.MILESTONES, milestones);
}

// 19. RECIBOS DE CORRIDAS
export function getStoredReceipts(): RideReceipt[] {
  const existing = safeGetItem<RideReceipt[]>(STORAGE_KEYS.RECEIPTS, []);
  if (existing.length > 0) return existing;

  // Se vazio, gera recibos a partir das corridas concluídas de initialRecentRides
  const generated: RideReceipt[] = initialRecentRides
    .filter((r) => r.status === 'concluida')
    .map((r) => ({
      id: `rec-${r.id.replace('#', '')}`,
      rideId: r.id,
      passengerName: r.passengerName,
      passengerCode: r.passengerCode || 'W-PASS-0701',
      driverName: r.driverName || 'Diego Wallace',
      driverCode: r.driverCode || 'W-0701',
      driverVehicle: r.driverVehicle || 'Veículo Oficial',
      category: r.category,
      origin: r.origin,
      destination: r.destination,
      distanceKm: r.distanceKm,
      durationMin: r.durationMin,
      totalPrice: r.price,
      centralCommissionRate: 10,
      centralShare: r.commissionValue,
      driverShare: r.netDriverValue,
      paymentMethod: r.paymentMethod,
      paymentStatus: r.paymentStatus,
      timestamp: r.timestamp,
    }));
  safeSetItem(STORAGE_KEYS.RECEIPTS, generated);
  return generated;
}

export function setStoredReceipts(receipts: RideReceipt[]): void {
  safeSetItem(STORAGE_KEYS.RECEIPTS, receipts);
}

// 20. REGISTROS DE MANUTENÇÃO E COMBUSTÍVEL
export function getStoredMaintenanceLogs(): MaintenanceLog[] {
  return safeGetItem<MaintenanceLog[]>(STORAGE_KEYS.MAINTENANCE_LOGS, [
    {
      id: 'maint-1',
      driverCode: 'W-0701',
      date: '15/09/2026',
      odometerKm: 34200,
      serviceType: 'troca_oleo',
      cost: 45.0,
      notes: 'Óleo 10W30 Yamalube + filtro de óleo.',
    },
    {
      id: 'maint-2',
      driverCode: 'W-0701',
      date: '16/09/2026',
      odometerKm: 34350,
      serviceType: 'combustivel',
      liters: 12.5,
      cost: 72.5,
      notes: 'Gasolina aditivada Posto Rota do Sol.',
    },
  ]);
}

export function setStoredMaintenanceLogs(logs: MaintenanceLog[]): void {
  safeSetItem(STORAGE_KEYS.MAINTENANCE_LOGS, logs);
}

// 21. CONFIGURAÇÃO DE MODO DESTINO DO MOTORISTA
export function getStoredDriverDestinationMode(driverCode: string): DriverDestinationMode {
  const all = safeGetItem<Record<string, DriverDestinationMode>>(
    `${STORAGE_KEYS.DRIVER_SETTINGS}_DEST`,
    {}
  );
  return (
    all[driverCode] || {
      active: false,
      destinationAddress: '',
      coords: null,
      radiusKm: 3.0,
    }
  );
}

export function setStoredDriverDestinationMode(
  driverCode: string,
  mode: DriverDestinationMode
): void {
  const all = safeGetItem<Record<string, DriverDestinationMode>>(
    `${STORAGE_KEYS.DRIVER_SETTINGS}_DEST`,
    {}
  );
  all[driverCode] = mode;
  safeSetItem(`${STORAGE_KEYS.DRIVER_SETTINGS}_DEST`, all);
}

// 22. CATEGORIAS ATIVAS DO MOTORISTA (Minhas Categorias ON/OFF)
export function getStoredDriverActiveCategories(
  driverCode: string,
  defaultCategories: RideCategory[]
): RideCategory[] {
  const all = safeGetItem<Record<string, RideCategory[]>>(
    `${STORAGE_KEYS.DRIVER_SETTINGS}_CATS`,
    {}
  );
  return all[driverCode] || defaultCategories;
}

export function setStoredDriverActiveCategories(
  driverCode: string,
  categories: RideCategory[]
): void {
  const all = safeGetItem<Record<string, RideCategory[]>>(
    `${STORAGE_KEYS.DRIVER_SETTINGS}_CATS`,
    {}
  );
  all[driverCode] = categories;
  safeSetItem(`${STORAGE_KEYS.DRIVER_SETTINGS}_CATS`, all);
}

// =========================================================================
// SEQUENCIADORES REAIS DE CÓDIGOS
// =========================================================================

/**
 * Gera o próximo código de motorista sequencial.
 * Preserva W-0701 a W-0707 e começa a partir de W-0708.
 * NUNCA gera W-MOT-XXXX.
 */
export function getNextDriverUserCode(
  existingDrivers: Driver[],
  pendingApprovals: PendingApproval[]
): string {
  let highestNum = 707; // Base mínima preservada

  // Varre motoristas existentes
  existingDrivers.forEach((d) => {
    const match = d.userCode.match(/^W-(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > highestNum) {
        highestNum = num;
      }
    }
  });

  // Varre pendentes
  pendingApprovals.forEach((p) => {
    if (p.type === 'motorista') {
      const match = p.userCode.match(/^W-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > highestNum) {
          highestNum = num;
        }
      }
    }
  });

  const nextNum = highestNum + 1;
  const padded = String(nextNum).padStart(4, '0');
  return `W-${padded}`;
}

/**
 * Gera código sequencial para novos passageiros.
 */
export function getNextPassengerUserCode(
  existingUsers: AppUser[],
  pendingApprovals: PendingApproval[]
): string {
  let highestNum = 700;

  existingUsers.forEach((u) => {
    if (u.role === 'passageiro') {
      const match = u.userCode.match(/^W-(?:PASS-)?(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > highestNum) {
          highestNum = num;
        }
      }
    }
  });

  pendingApprovals.forEach((p) => {
    if (p.type === 'passageiro') {
      const match = p.userCode.match(/^W-(?:PASS-)?(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > highestNum) {
          highestNum = num;
        }
      }
    }
  });

  const nextNum = highestNum + 1;
  const padded = String(nextNum).padStart(4, '0');
  return `W-PASS-${padded}`;
}

// =========================================================================
// REGRAS DE ELEGIBILIDADE DE CATEGORIAS
// =========================================================================

export function getEligibleCategoriesForDriver(
  vehicleType: string,
  categoryBase: RideCategory = 'W-CARRO COMUM'
): RideCategory[] {
  const norm = (vehicleType || '').toLowerCase();

  if (norm.includes('bike') || norm.includes('bicicleta')) {
    return ['W-BIKE', 'W-DELIVERY'];
  }

  if (norm.includes('moto') || norm.includes('titan') || norm.includes('fazer') || norm.includes('factor') || norm.includes('pcx') || norm.includes('nmax')) {
    return ['W-MOTO COMUM', 'W-MOTO PRIME', 'W-DELIVERY'];
  }

  if (norm.includes('táxi') || norm.includes('taxi')) {
    return ['W-TÁXI', 'W-CARRO COMUM', 'W-CARRO PRIME'];
  }

  if (norm.includes('bmw') || norm.includes('mercedes') || norm.includes('audi') || norm.includes('blindado')) {
    return ['W-CARRO COMUM', 'W-CARRO PRIME', 'W-EXECUTIVO', 'W-EXECUTIVO PRIME', 'W-LUXO'];
  }

  if (norm.includes('corolla') || norm.includes('civic') || norm.includes('compass') || norm.includes('taos') || norm.includes('cruze')) {
    return ['W-CARRO COMUM', 'W-CARRO PRIME', 'W-EXECUTIVO', 'W-EXECUTIVO PRIME'];
  }

  // Carro padrão (Onix, Gol, Ka, HB20, Mobi, Kwid, Argo)
  return ['W-CARRO COMUM', 'W-CARRO PRIME', 'W-DELIVERY'];
}

// =========================================================================
// AUDITORIA E RECIBOS
// =========================================================================

export function createAuditLogEntry(
  action: string,
  category: AuditLog['category'],
  fieldModified: string,
  previousValue: string,
  newValue: string,
  adminName = 'Central W-DRIVER (CEO)'
): AuditLog {
  const now = new Date();
  const timeFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(
    now.getMonth() + 1
  ).padStart(2, '0')}/${now.getFullYear()} às ${String(now.getHours()).padStart(
    2,
    '0'
  )}:${String(now.getMinutes()).padStart(2, '0')}`;

  return {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    adminName,
    action,
    category,
    fieldModified,
    previousValue,
    newValue,
    timestamp: timeFormatted,
  };
}

export function generateRideReceipt(
  ride: Ride,
  config: PlatformConfig,
  driverCodeOverride?: string,
  driverNameOverride?: string,
  overrides?: any
): RideReceipt {
  const centralRate = overrides?.isNoShow ? 0 : config.commissionRate;
  const centralShare = overrides?.isNoShow ? 0 : Math.round(ride.price * (centralRate / 100) * 100) / 100;
  const driverShare = overrides?.isNoShow ? ride.price : Math.round((ride.price - centralShare) * 100) / 100;

  return {
    id: `rec-${ride.id.replace('#', '')}-${Date.now().toString().slice(-4)}`,
    rideId: ride.id,
    passengerName: ride.passengerName,
    passengerCode: ride.passengerCode || 'W-PASS-0701',
    driverName: driverNameOverride || ride.driverName || 'Diego Wallace',
    driverCode: driverCodeOverride || ride.driverCode || 'W-0701',
    driverVehicle: ride.driverVehicle,
    category: ride.category,
    origin: ride.origin,
    destination: ride.destination,
    distanceKm: ride.distanceKm,
    durationMin: ride.durationMin,
    totalPrice: overrides?.totalFare || ride.price,
    centralCommissionRate: centralRate,
    centralShare: overrides?.centralCommission !== undefined ? overrides.centralCommission : centralShare,
    driverShare: overrides?.netDriverEarnings !== undefined ? overrides.netDriverEarnings : driverShare,
    paymentMethod: ride.paymentMethod,
    paymentStatus: ride.paymentStatus,
    timestamp: ride.timestamp || new Date().toLocaleTimeString('pt-BR'),
    isNoShow: overrides?.isNoShow || false,
    ...overrides,
  };
}
