export type UserRole = 'passageiro' | 'motorista' | 'admin';

export interface AppUser {
  id: string;
  userCode: string; // Ex: W-PASS-0705, W-MOT-0701, W-ADM-001
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  cpf: string;
  avatar?: string;
  state: string; // Ex: 'PB'
  city: string; // Ex: 'João Pessoa'
  status: 'ativo' | 'em_analise' | 'pendente_aprovacao' | 'bloqueado' | 'suspenso' | 'rejeitado';
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  termsVersion?: string;
  trainingCompleted?: boolean;
  trainingScore?: number;
  trainingAnswers?: Record<string, string>;
  trainingCompletedAt?: string;
  // Driver specific
  category?: RideCategory;
  enabledCategories?: RideCategory[];
  activeCategory?: RideCategory;
  vehicle?: string;
  plate?: string;
  rating?: number;
  completedRides?: number;
  todayEarnings?: number;
  isOwnerAdmin?: boolean;
  refusalCount?: number;
  cooldownUntil?: string | null;
  // Passenger specific
  activeContractId?: string;
  savedPointsCount?: number;
}

export type RideCategory =
  | 'W-BIKE'
  | 'W-MOTO COMUM'
  | 'W-MOTO PRIME'
  | 'W-CARRO COMUM'
  | 'W-CARRO PRIME'
  | 'W-EXECUTIVO'
  | 'W-EXECUTIVO PRIME'
  | 'W-LUXO'
  | 'W-TÁXI'
  | 'W-DELIVERY'
  | 'W-MOTO' // alias retrocompat
  | 'W-CARRO' // alias retrocompat
  | 'W-EXECUTIVE'; // alias retrocompat

export interface CategoryRule {
  id: RideCategory;
  name: string;
  icon: string;
  description: string;
  fixedFareUnder4km: number; // Tarifa fixa até o limiar (ex: R$ 6.00, R$ 8.00, R$ 12.00, R$ 16.00)
  ratePerKmAbove4km: number; // Taxa por km da distância total (ex: R$ 1.00, R$ 1.30, R$ 1.75, R$ 2.00, R$ 3.00, R$ 4.00)
  contractRatePerKm: number; // Ex: R$ 1.00 ou R$ 1.75 fixo
  fixedThresholdKm?: number; // Limiar de km fixo (ex: 6.00 para Bike/Moto Comum, 4.99 para Moto Prime, 4.00 para Carros)
  active: boolean;
  isContractOnly?: boolean;
  isTaximeter?: boolean;
}

export interface ThirdPartyPassenger {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  photo?: string;
  rating?: number;
  totalRides?: number;
  addressProof?: string;
  mainAccountUserId?: string;
  addressProofAttached?: boolean;
  relationship?: string;
  registeredAt?: string;
  status?: string;
}

export interface MediaEvidenceRecord {
  id: string;
  rideId: string;
  type: string;
  filename?: string;
  durationSec: number;
  recordedAt?: string;
  capturedAt?: string;
  startedAt?: string;
  endedAt?: string;
  driverCode?: string;
  passengerCode?: string;
  status: string;
  sizeMb?: number;
  storagePath?: string;
  vaultHash?: string;
  accessedBy?: string[];
}

export interface RideMediaRecord {
  id: string;
  rideId: string;
  type: 'audio' | 'video';
  filename: string;
  durationSec: number;
  recordedAt: string;
  startedAt: string;
  endedAt: string;
  driverCode: string;
  passengerCode: string;
  status: 'gravado' | 'arquivado' | 'exportado';
  sizeMb: number;
  storagePath: string; // Ex: /wdriver-secure-vault/media/w-audio-0701.m4a
}

export interface BlockedUserPair {
  id: string;
  blockerCode?: string;
  blockerName?: string;
  blockedCode?: string;
  blockedName?: string;
  user1Code?: string;
  user1Name?: string;
  user2Code?: string;
  user2Name?: string;
  blockedBy?: string;
  reason: string;
  date?: string;
  createdAt?: string;
  active: boolean;
}

export interface DetailedAddress {
  street: string;
  number: string;
  neighborhood: string;
  cep: string;
  complement?: string;
  blockAndLot?: string;
  confirmedByPassenger: boolean;
  coords: { lat: number; lng: number };
}

export interface OfficialRoadInterdiction {
  id: string;
  roadName: string;
  neighborhood: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  reason: string;
  registeredBy: string;
  active: boolean;
  detourWaypointLat: number;
  detourWaypointLng: number;
  dateStart: string;
}

export interface RouteDeviationRecord {
  id: string;
  rideId: string;
  driverCode: string;
  driverName: string;
  date: string;
  time: string;
  timestamp: number;
  vehicleGps: { lat: number; lng: number };
  occurrenceLocation: string;
  originalRoutePolyline?: [number, number][];
  originalDistanceKm: number;
  originalPrice: number;
  alternativeRoutePolyline?: [number, number][];
  newDistanceKm: number;
  distanceDiffKm: number; // Positivo = aumento, Negativo = redução
  reason: string;
  evidenceType: 'foto' | 'video' | 'ambos' | 'nenhuma';
  evidenceUrl?: string;
  evidenceTimestamp?: string;
  evidenceGps?: { lat: number; lng: number };
  passengerConfirmation: 'confirmado' | 'ausente_emergencia' | 'recusado';
  passengerConfirmationTime?: string;
  complementaryFare: number;
  complementaryPaid: boolean;
  paymentMethodChoice?: 'imediato' | 'saldo_pendente';
  driverComplementaryReleased: boolean;
  antiFraudAuditStatus: 'analise_pendente' | 'desvio_justificado' | 'desvio_nao_comprovado' | 'desvio_fraudulento';
  antiFraudNotes?: string;
  suspensionApplied?: boolean;
}

export interface Driver {
  id: string;
  userCode: string; // Ex: W-0701
  name: string;
  role?: UserRole;
  vehicle: string;
  plate: string;
  category: RideCategory;
  enabledCategories?: RideCategory[];
  activeCategory?: RideCategory;
  vehicleByCategory?: Partial<Record<RideCategory, { vehicle: string; plate: string }>>;
  rating: number;
  status: 'online' | 'em_corrida' | 'pausa' | 'suspenso' | 'bloqueado';
  lat: number;
  lng: number;
  state: string; // Ex: 'PB'
  city: string; // Ex: 'João Pessoa'
  neighborhood?: string;
  completedRidesToday?: number;
  completedRides?: number;
  phone: string;
  avatar?: string;
  habilitado?: boolean;
  orientacaoConcluida?: boolean;
  isOwnerAdmin?: boolean;
  refusalCount?: number;
  cooldownUntil?: number | null; // timestamp in ms
  suspendedUntil?: number | null;
  suspensionReason?: string;
}

export interface Ride {
  id: string;
  rideType: 'avulsa' | 'contrato';
  passengerName: string;
  passengerCode?: string;
  driverName?: string;
  driverCode?: string;
  driverVehicle?: string;
  category: RideCategory;
  origin: string;
  destination: string;
  pickupDetailedAddress?: DetailedAddress;
  pickupConfirmed?: boolean;
  pickupCoords?: { lat: number; lng: number };
  originalGpsCoords?: { lat: number; lng: number };
  adjustedPickupCoords?: { lat: number; lng: number };
  safePointOrigin?: string;
  safePointDestination?: string;
  distanceKm: number;
  durationMin: number;
  price: number;
  originalPrice?: number;
  originalDistanceKm?: number;
  finalDistanceKm?: number;
  hasDeviation?: boolean;
  deviationRecord?: RouteDeviationRecord;
  complementaryFare?: number;
  complementaryPaymentStatus?: 'pendente' | 'pago_imediato' | 'saldo_pendente' | 'estornado';
  driverComplementaryReceived?: boolean;
  pendingBalanceDeduction?: number;
  multiplierDynamic: number; // 1.0 a 2.0x (apenas avulsa)
  commissionRate: number; // 10%
  commissionValue: number;
  netDriverValue: number;
  status: 'solicitada' | 'a_caminho' | 'chegou' | 'embarque_confirmado' | 'em_andamento' | 'concluida' | 'cancelada';
  timestamp: string;
  paymentMethod: 'Pix' | 'Cartão' | 'Dinheiro' | 'W-Bank' | 'Contrato Pré-Pago';
  paymentStatus: 'solicitado' | 'pendente' | 'aguardando_confirmacao' | 'confirmado' | 'recusado' | 'cancelado';
  state: string; // 'PB'
  // W-DRIVER Operational extensions:
  driverDistanceToPickupKm?: number;
  driverEtaToPickupMin?: number;
  isDirectCallByCode?: boolean;
  calledDriverCode?: string;
  isThirdParty?: boolean;
  thirdParty?: ThirdPartyPassenger;
  cashExchangeForPixRequested?: boolean;
  cashExchangeAcceptedByDriver?: boolean;
  driverArrivedAtPickup?: boolean;
  driverArrivedAt?: string;
  boardingConfirmed?: boolean;
  boardingConfirmedAt?: string;
  paymentConfirmedAt?: string;
  noShowReported?: boolean;
  noShowAmount?: number;
  isNoShow?: boolean;
  cancellationReason?: string;
  cancelledBy?: 'passageiro' | 'motorista' | 'central';
  eventsHistory?: { time: string; event: string; actor: string }[];
  mediaRecords?: RideMediaRecord[];
  passengerRatingForDriver?: {
    stars: number;
    comment?: string;
    anonymous: boolean;
    timestamp: string;
  };
  driverRatingForPassenger?: {
    stars: number;
    comment?: string;
    anonymous: boolean;
    timestamp: string;
  };
}

export interface TransportContract {
  id: string;
  contractNumber: string; // Ex: W-CTR-2026-001
  clientName: string;
  clientCode: string; // Ex: W-0705
  clientType: 'trabalhador_clt' | 'empresa' | 'estudante' | 'individual';
  period: 'semanal' | 'quinzenal' | 'mensal';
  category: 'W-MOTO COMUM' | 'W-CARRO COMUM' | 'W-CARRO PRIME' | 'W-EXECUTIVO' | 'W-LUXO';
  fixedRatePerKm: number; // R$ 1,00/km moto, R$ 1,75/km carro (FIXO SEM DINÂMICA)
  dailyDistanceKm: number;
  dailyValue: number;
  totalPeriodValue: number;
  hasSafePoint: boolean;
  safePointDetails?: string;
  originAddress: string;
  destinationAddress: string;
  pickupTime: string;
  returnTime?: string;
  status: 'ativo' | 'em_analise' | 'suspenso' | 'renovado' | 'concluido';
  prepaidStatus: 'pago' | 'pendente_pix' | 'faturado_pj';
  assignedDriverId?: string;
  assignedDriverName?: string;
  startDate: string;
  endDate: string;
  observations: string;
}

export interface SafePoint {
  id: string;
  neighborhood: string;
  referenceAddress: string;
  safePointName: string;
  justification: string;
  active: boolean;
  lat?: number;
  lng?: number;
}

export interface StateOperation {
  uf: string;
  name: string;
  capital: string;
  status: 'liberado' | 'bloqueado';
  activeDrivers: number;
  activePassengers: number;
  totalRides: number;
  lastUpdated: string;
}

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  category: 'tarifas' | 'estados' | 'contratos' | 'segurança' | 'categorias' | 'parceiros' | 'documentos' | 'corridas' | 'pagamentos' | 'midia' | 'bloqueios' | 'avaliacoes' | 'operação';
  fieldModified: string;
  previousValue: string;
  newValue: string;
  timestamp: string;
}

export interface FixedPassenger {
  id: string;
  userCode: string;
  name: string;
  phone: string;
  pickupTime: string;
  shift: 'manha' | 'almoco' | 'tarde';
  origin: string;
  destination: string;
  safePoint?: string;
  dailyValue: number;
  monthlyValue: number;
  status: 'ativo' | 'pausado';
  frequency: string;
  contractNumber?: string;
  notes?: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  status: 'aprovado' | 'pendente' | 'recusado';
  dateUploaded: string;
}

export interface PendingApproval {
  id: string;
  userCode?: string; // Ex: W-0708
  name: string;
  type: 'motorista' | 'passageiro';
  state?: string; // 'PB' ou outro
  city?: string;
  registerDate: string;
  docsSent: number;
  docsTotal: number;
  status: 'pendente' | 'aprovado' | 'recusado';
  vehicleInfo?: string;
  category?: RideCategory;
  documents?: DocumentItem[];
  documentTypes?: string[];
  phone: string;
  cpf: string;
  reason?: string;
}

export interface Occurrence {
  id: string;
  type: 'Objeto esquecido' | 'Dano ao veículo' | 'Higienização' | 'Comportamento' | 'Cancelamento indevido' | 'Segurança / Ponto Seguro' | 'Interdição / Desvio de Rota';
  description: string;
  date: string;
  status: 'aberta' | 'em_analise' | 'resolvida';
  driver: string;
  passenger: string;
  rideId: string;
  priority: 'baixa' | 'media' | 'alta';
  deviationRecord?: RouteDeviationRecord;
}

export interface DynamicPeakHour {
  period: string; // '04:00 – 09:00', '11:30 – 15:00', '16:30 – 20:00', '22:00 – 04:00'
  label: string;
  baseMultiplier: number;
  active: boolean;
}

export interface PlatformConfig {
  name: string;
  slogan: string;
  customLogoUrl?: string;
  commissionRate: number; // 10%
  driverRate: number; // 90%
  primaryColor: string;
  dailyGoal: number; // 47
  shift1Start: string;
  shift1End: string;
  shift2Start: string;
  shift2End: string;
  dynamicEnabled: boolean;
  maxDynamicMultiplier: number; // Ex: 2.0
  currentDynamicMultiplier: number; // Ex: 1.0 a 1.4
  peakHours: DynamicPeakHour[];
  categoriesRules: Record<RideCategory, CategoryRule>;
  baseFare: Record<RideCategory, { base: number; perKm: number; perMin: number }>;
  // Central Bank & Pix Config
  pixKey?: string;
  pixKeyType?: 'CNPJ' | 'Email' | 'Telefone' | 'Aleatória';
  pixBeneficiary?: string;
  pixBankName?: string;
  // Terms & Documentation
  termsVersion?: string;
  termsLastUpdated?: string;
  termsContent?: string;
  passengerTutorialContent?: string;
  driverTutorialContent?: string;
  safetyRecommendations?: string;
  // Audio / Video Permissions
  mediaPermissions?: {
    camera: boolean;
    microphone: boolean;
    location: boolean;
    audioRecording: boolean;
    videoRecording: boolean;
  };
}

export interface RideReceipt {
  id: string;
  rideId: string;
  passengerName: string;
  passengerCode: string;
  driverName: string;
  driverCode: string;
  driverVehicle?: string;
  category: RideCategory;
  origin: string;
  destination: string;
  distanceKm: number;
  durationMin: number;
  totalPrice: number;
  centralCommissionRate: number; // e.g. 10
  centralShare: number; // 10%
  driverShare: number; // 90%
  paymentMethod: string;
  paymentStatus: string;
  timestamp: string;
  isNoShow?: boolean;
}

export interface WSosAlert {
  id: string;
  userId?: string;
  userCode: string;
  userName: string;
  userPhone: string;
  userRole: UserRole;
  location: string;
  coords: { lat: number; lng: number };
  rideId?: string;
  timestamp: string;
  status: 'aberto' | 'em_atendimento' | 'resolvido';
  operatorNotes?: string;
  resolvedAt?: string;
  history?: {
    timestamp: string;
    note: string;
    operator: string;
  }[];
}

export interface PartnerAd {
  id: string;
  partnerName: string;
  plan: string;
  period: string;
  imageUrl: string; // Direct upload (data:image/... or local asset)
  active: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface SystemMilestone {
  id: string;
  type: 'cadastro' | 'corrida_iniciada' | 'corrida_concluida' | 'pagamento' | 'faturamento';
  title: string;
  description: string;
  value?: number;
  timestamp: string;
  icon?: string;
}

export interface DriverDestinationMode {
  active: boolean;
  destinationAddress: string;
  coords: { lat: number; lng: number } | null;
  radiusKm: number;
  activatedAt?: string;
}

export interface MaintenanceLog {
  id: string;
  driverCode: string;
  date: string;
  odometerKm: number;
  serviceType: 'combustivel' | 'troca_oleo' | 'pneus' | 'revisao_geral' | 'outros';
  liters?: number;
  cost: number;
  notes?: string;
}

export interface DriverTrainingResult {
  driverCode: string;
  completed: boolean;
  score: number;
  totalQuestions: number;
  completedAt: string;
  answers: Record<string, string>;
}

