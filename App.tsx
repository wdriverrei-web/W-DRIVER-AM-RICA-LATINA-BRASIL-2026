import React, { useState, useEffect } from 'react';
import {
  AppUser,
  AuditLog,
  BlockedUserPair,
  Driver,
  FixedPassenger,
  Occurrence,
  PartnerAd,
  PendingApproval,
  PlatformConfig,
  Ride,
  RideCategory,
  RideMediaRecord,
  RideReceipt,
  RouteDeviationRecord,
  SafePoint,
  StateOperation,
  SystemMilestone,
  TransportContract,
  UserRole,
  WSosAlert,
} from './types';
import {
  getStoredConfig, setStoredConfig,
  getStoredDrivers, setStoredDrivers,
  getStoredUsers, setStoredUsers,
  getStoredPendingApprovals, setStoredPendingApprovals,
  getStoredContracts, setStoredContracts,
  getStoredFixedPassengers, setStoredFixedPassengers,
  getStoredSafePoints, setStoredSafePoints,
  getStoredStates, setStoredStates,
  getStoredOccurrences, setStoredOccurrences,
  getStoredRecentRides, setStoredRecentRides,
  getStoredAuditLogs, setStoredAuditLogs,
  getStoredMediaRecords, setStoredMediaRecords,
  getStoredBlockedPairs, setStoredBlockedPairs,
  getStoredActiveRide, setStoredActiveRide,
  getStoredCurrentUser, setStoredCurrentUser,
  getStoredWSosAlerts, setStoredWSosAlerts,
  getStoredPartnerAds, setStoredPartnerAds,
  getStoredMilestones, setStoredMilestones,
  getStoredReceipts, setStoredReceipts,
  generateRideReceipt, 
} from './supabase'
  ;storage';
import {
  isSupabaseConfigured,
  syncRideToCloud,
  fetchActiveRideFromCloud,
  fetchRecentRidesFromCloud,
  subscribeToRides,
  syncUserToCloud,
  fetchUsersFromCloud,
  subscribeToUsers,
  syncPendingApprovalToCloud,
  fetchPendingApprovalsFromCloud,
  subscribeToPendingApprovals,
  syncSosAlertToCloud,
  fetchSosAlertsFromCloud,
  subscribeToSosAlerts,
  syncReceiptToCloud,
  fetchReceiptsFromCloud,
} from './supabase';
import { initialDemoUsers } from './mockData';
import { WLogo } from './components/WLogo';
import { PassengerPortal } from './components/PassengerPortal';
import { DriverPortal } from './components/DriverPortal';
import { InteractiveGpsMap } from './components/InteractiveGpsMap';
import { ContractsManagementModule } from './components/ContractsManagementModule';
import { FixedPassengersModule } from './components/FixedPassengersModule';
import { PartnersScaleModule } from './components/PartnersScaleModule';
import { GovernanceAndRatesModule } from './components/GovernanceAndRatesModule';
import { ApprovalsAndOccurrences } from './components/ApprovalsAndOccurrences';
import { AppSimulator } from './components/AppSimulator';
import { AuthGatewayModal } from './components/AuthGatewayModal';
import { PlatformSettingsModal } from './components/PlatformSettingsModal';
import { UserInAnalysisScreen } from './components/UserInAnalysisScreen';
import { WBankAndReceiptsModule } from './components/WBankAndReceiptsModule';
import { WSosModule } from './components/WSosModule';
import { MilestonesAndCelebrationsModule } from './components/MilestonesAndCelebrationsModule';
import { PartnerAdsModule } from './components/PartnerAdsModule';
import { SupabaseSyncModal } from './components/SupabaseSyncModal';
import {
  Shield,
  Car,
  User,
  LayoutDashboard,
  FileText,
  Users,
  Trophy,
  Sliders,
  CheckSquare,
  Smartphone,
  MapPin,
  TrendingUp,
  DollarSign,
  Lock,
  LogOut,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  Receipt,
  Megaphone,
  Database,
} from 'lucide-react';

export default function App() {
  // 1. ESTADOS PERSISTENTES (Carregados inicialmente do LocalStorage / Cache Local)
  const [config, setConfig] = useState<PlatformConfig>(() => getStoredConfig());
  const [drivers, setDrivers] = useState<Driver[]>(() => getStoredDrivers());
  const [users, setUsers] = useState<AppUser[]>(() => getStoredUsers());
  const [contracts, setContracts] = useState<TransportContract[]>(() => getStoredContracts());
  const [fixedPassengers, setFixedPassengers] = useState<FixedPassenger[]>(() => getStoredFixedPassengers());
  const [safePoints, setSafePoints] = useState<SafePoint[]>(() => getStoredSafePoints());
  const [states, setStates] = useState<StateOperation[]>(() => getStoredStates());
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>(() => getStoredPendingApprovals());
  const [occurrences, setOccurrences] = useState<Occurrence[]>(() => getStoredOccurrences());
  const [recentRides, setRecentRides] = useState<Ride[]>(() => getStoredRecentRides());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStoredAuditLogs());
  const [mediaRecords, setMediaRecords] = useState<RideMediaRecord[]>(() => getStoredMediaRecords());
  const [blockedPairs, setBlockedPairs] = useState<BlockedUserPair[]>(() => getStoredBlockedPairs());
  const [activeRide, setActiveRide] = useState<Ride | null>(() => getStoredActiveRide());
  const [currentUser, setCurrentUser] = useState<AppUser>(() => getStoredCurrentUser());
  const [sosAlerts, setSosAlerts] = useState<WSosAlert[]>(() => getStoredWSosAlerts());
  const [partnerAds, setPartnerAds] = useState<PartnerAd[]>(() => getStoredPartnerAds());
  const [milestones, setMilestones] = useState<SystemMilestone[]>(() => getStoredMilestones());
  const [receipts, setReceipts] = useState<RideReceipt[]>(() => getStoredReceipts());

  // Modais de Controle
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);

  // Aba Ativa na Central Administrativa / CEO
  const [adminTab, setAdminTab] = useState<
    | 'painel'
    | 'contratos'
    | 'fixos'
    | 'wbank'
    | 'wsos'
    | 'marcos'
    | 'anuncios'
    | 'parceiros'
    | 'governanca'
    | 'aprovacoes'
    | 'simulador'
  >('painel');

  // Sincronização automática contínua para LocalStorage (Cache/Fallback offline)
  useEffect(() => { setStoredConfig(config); }, [config]);
  useEffect(() => { setStoredDrivers(drivers); }, [drivers]);
  useEffect(() => { setStoredUsers(users); }, [users]);
  useEffect(() => { setStoredContracts(contracts); }, [contracts]);
  useEffect(() => { setStoredFixedPassengers(fixedPassengers); }, [fixedPassengers]);
  useEffect(() => { setStoredSafePoints(safePoints); }, [safePoints]);
  useEffect(() => { setStoredStates(states); }, [states]);
  useEffect(() => { setStoredPendingApprovals(pendingApprovals); }, [pendingApprovals]);
  useEffect(() => { setStoredOccurrences(occurrences); }, [occurrences]);
  useEffect(() => { setStoredRecentRides(recentRides); }, [recentRides]);
  useEffect(() => { setStoredAuditLogs(auditLogs); }, [auditLogs]);
  useEffect(() => { setStoredMediaRecords(mediaRecords); }, [mediaRecords]);
  useEffect(() => { setStoredBlockedPairs(blockedPairs); }, [blockedPairs]);
  useEffect(() => { setStoredActiveRide(activeRide); }, [activeRide]);
  useEffect(() => { setStoredCurrentUser(currentUser); }, [currentUser]);
  useEffect(() => { setStoredWSosAlerts(sosAlerts); }, [sosAlerts]);
  useEffect(() => { setStoredPartnerAds(partnerAds); }, [partnerAds]);
  useEffect(() => { setStoredMilestones(milestones); }, [milestones]);
  useEffect(() => { setStoredReceipts(receipts); }, [receipts]);

  // =========================================================================
  // SUPABASE COMPARTILHADO EM TEMPO REAL (CARGA INICIAL E WEBSOCKET REALTIME)
  // =========================================================================
  useEffect(() => {
    if (!isSupabaseConfigured) {
      return;
    }

    // 1. Carrega registros compartilhados da nuvem no boot
    fetchActiveRideFromCloud().then((cloudActiveRide) => {
      if (cloudActiveRide) {
        setActiveRide(cloudActiveRide);
      }
    });

    fetchRecentRidesFromCloud().then((cloudRides) => {
      if (cloudRides && cloudRides.length > 0) {
        setRecentRides((prev) => {
          const map = new Map<string, Ride>();
          [...cloudRides, ...prev].forEach((r) => map.set(r.id, r));
          return Array.from(map.values());
        });
      }
    });

    fetchUsersFromCloud().then((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        setUsers((prev) => {
          const map = new Map<string, AppUser>();
          [...cloudUsers, ...prev].forEach((u) => map.set(u.id, u));
          return Array.from(map.values());
        });
      }
    });

    fetchPendingApprovalsFromCloud().then((cloudApprovals) => {
      if (cloudApprovals && cloudApprovals.length > 0) {
        setPendingApprovals((prev) => {
          const map = new Map<string, PendingApproval>();
          [...cloudApprovals, ...prev].forEach((a) => map.set(a.id, a));
          return Array.from(map.values());
        });
      }
    });

    fetchSosAlertsFromCloud().then((cloudAlerts) => {
      if (cloudAlerts && cloudAlerts.length > 0) {
        setSosAlerts((prev) => {
          const map = new Map<string, WSosAlert>();
          [...cloudAlerts, ...prev].forEach((a) => map.set(a.id, a));
          return Array.from(map.values());
        });
      }
    });

    fetchReceiptsFromCloud().then((cloudReceipts) => {
      if (cloudReceipts && cloudReceipts.length > 0) {
        setReceipts((prev) => {
          const map = new Map<string, RideReceipt>();
          [...cloudReceipts, ...prev].forEach((r) => map.set(r.id, r));
          return Array.from(map.values());
        });
      }
    });

    // 2. Inscrições em Tempo Real (Postgres Changes via Supabase WebSocket)
    const unsubRides = subscribeToRides((ride) => {
      const activeStatuses = ['solicitada', 'a_caminho', 'chegou', 'embarque_confirmado', 'em_andamento'];
      if (activeStatuses.includes(ride.status)) {
        setActiveRide(ride);
      } else {
        setActiveRide((prev) => (prev && prev.id === ride.id ? null : prev));
        setRecentRides((prev) => [ride, ...prev.filter((r) => r.id !== ride.id)]);
      }
    });

    const unsubUsers = subscribeToUsers((user) => {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
      setCurrentUser((prev) => (prev.id === user.id ? user : prev));
    });

    const unsubApprovals = subscribeToPendingApprovals((item) => {
      setPendingApprovals((prev) => [item, ...prev.filter((p) => p.id !== item.id)]);
    });

    const unsubSos = subscribeToSosAlerts((alert) => {
      setSosAlerts((prev) => [alert, ...prev.filter((a) => a.id !== alert.id)]);
    });

    return () => {
      unsubRides();
      unsubUsers();
      unsubApprovals();
      unsubSos();
    };
  }, []);

  // Auditoria
  const handleAddAuditLog = (log: AuditLog) => {
    setAuditLogs((prev) => [log, ...prev]);
  };

  // Finalização de Corrida e Geração de Recibo Oficial W-DRIVER
  const handleRideCompleted = (
    fare: number,
    category: RideCategory,
    origin: string,
    destination: string,
    receiptOverride?: Partial<RideReceipt>
  ) => {
    const commission = Math.round(fare * (config.commissionRate / 100) * 100) / 100;
    const netDriver = Math.round((fare - commission) * 100) / 100;

    const newRide: Ride = {
      id: `#W-${Math.floor(1000 + Math.random() * 9000)}`,
      passengerName: currentUser.name,
      driverName: 'Diego Wallace (W-0701)',
      driverVehicle: 'Honda CG 160 Titan',
      category,
      origin,
      destination,
      distanceKm: 4.5,
      durationMin: 12,
      price: fare,
      commissionRate: config.commissionRate / 100,
      commissionValue: commission,
      netDriverValue: netDriver,
      status: 'concluida',
      timestamp: 'Agora',
      paymentMethod: 'Pix',
      rideType: 'avulsa',
      multiplierDynamic: 1.0,
      paymentStatus: 'confirmado',
      state: 'PB',
    };

    setRecentRides((prev) => [newRide, ...prev]);

    // Gera Recibo Oficial W-DRIVER com chave Pix da Central e Repasse 90%
    const receipt = generateRideReceipt(newRide, config, 'W-0701', 'Diego Wallace', receiptOverride);
    setReceipts((prev) => [receipt, ...prev]);

    // Sincroniza corrida e recibo com a nuvem compartilhada
    syncRideToCloud(newRide);
    syncReceiptToCloud(receipt);

    // Incrementa contagem nas metas/marcos
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.title.includes('Primeiras 1.000 Corridas')) {
          const currentVal = (m.currentValue || 18) + 1;
          return {
            ...m,
            currentValue: currentVal,
            celebrated: currentVal >= m.targetValue,
          };
        }
        return m;
      })
    );

    handleAddAuditLog({
      id: `log-ride-${Date.now()}`,
      adminName: 'Sistema W-DRIVER',
      action: 'CORRIDA_FINALIZADA',
      category: 'operação',
      fieldModified: 'recibo_gerado',
      previousValue: 'em_andamento',
      newValue: `${newRide.id} • R$ ${fare.toFixed(2)} (90% Repassado)`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // Declaração de No-Show pelo Motorista (100% repasse ao motorista, 0% Central)
  const handleDeclareNoShow = (rideId: string) => {
    const noShowFee = 7.0; // R$ 7,00 taxa de deslocamento e cancelamento integral
    const ride = recentRides.find((r) => r.id === rideId) || activeRide;

    const dummyRide: Ride = ride || {
      id: rideId,
      passengerName: 'Passageiro Não Compareceu',
      driverName: currentUser.name,
      driverVehicle: currentUser.vehicle || 'Veículo Homologado',
      category: 'W-CARRO COMUM',
      origin: 'Local de Embarque Definido',
      destination: 'Cancelada por No-Show',
      distanceKm: 0,
      durationMin: 5,
      price: noShowFee,
      commissionRate: 0,
      commissionValue: 0,
      netDriverValue: noShowFee,
      status: 'cancelada',
      timestamp: 'Agora',
      paymentMethod: 'Pix',
      paymentStatus: 'confirmado',
      isNoShow: true,
      state: 'PB',
    };

    const dummyWithStatus: Ride = { ...dummyRide, status: 'cancelada', isNoShow: true };

    const receipt = generateRideReceipt(dummyWithStatus, config, currentUser.userCode, currentUser.name, {
      isNoShow: true,
      totalFare: noShowFee,
      netDriverEarnings: noShowFee, // 100% para o motorista
      centralCommission: 0, // 0% para a Central
    });

    setReceipts((prev) => [receipt, ...prev]);
    setActiveRide(null);

    // Sincroniza cancelamento e recibo na nuvem compartilhada
    syncRideToCloud(dummyWithStatus);
    syncReceiptToCloud(receipt);

    handleAddAuditLog({
      id: `log-noshow-${Date.now()}`,
      adminName: `${currentUser.name} (${currentUser.userCode})`,
      action: 'NO_SHOW_DECLARADO',
      category: 'operação',
      fieldModified: 'taxa_no_show_100_motorista',
      previousValue: 'aguardando_embarque',
      newValue: `R$ ${noShowFee.toFixed(2)} integral para o motorista`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // W-SOS: Disparo de Alerta de Emergência
  const handleTriggerSos = (alertData: Partial<WSosAlert>) => {
    const newAlert: WSosAlert = {
      id: `sos-${Date.now()}`,
      userId: alertData.userId || currentUser.id,
      userCode: alertData.userCode || currentUser.userCode,
      userName: alertData.userName || currentUser.name,
      userRole: alertData.userRole || currentUser.role,
      userPhone: alertData.userPhone || currentUser.phone || '(83) 98841-2099',
      location: alertData.location || 'João Pessoa - PB (GPS Monitorado)',
      coords: alertData.coords || { lat: -7.1153, lng: -34.8231 },
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'aberto',
      rideId: alertData.rideId || activeRide?.id,
    };

    setSosAlerts((prev) => [newAlert, ...prev]);
    syncSosAlertToCloud(newAlert);

    handleAddAuditLog({
      id: `log-sos-${Date.now()}`,
      adminName: `${newAlert.userName} (${newAlert.userCode})`,
      action: 'W_SOS_ACIONADO',
      category: 'segurança',
      fieldModified: 'emergencia_aberta',
      previousValue: 'normal',
      newValue: `GPS: ${newAlert.coords.lat.toFixed(5)}, ${newAlert.coords.lng.toFixed(5)} • ${newAlert.location}`,
      timestamp: newAlert.timestamp,
    });
  };

  // W-SOS: Atualização de Ocorrência pela Central
  const handleUpdateSosAlert = (alertId: string, status: WSosAlert['status'], note?: string) => {
    const updatedAlerts = sosAlerts.map((a) => {
      if (a.id === alertId) {
        const updated: WSosAlert = {
          ...a,
          status,
          resolvedAt: status === 'resolvido' ? new Date().toLocaleTimeString('pt-BR') : a.resolvedAt,
          operatorNotes: note || a.operatorNotes,
        };
        syncSosAlertToCloud(updated);
        return updated;
      }
      return a;
    });

    setSosAlerts(updatedAlerts);

    handleAddAuditLog({
      id: `log-sos-upd-${Date.now()}`,
      adminName: 'Operador Central W-DRIVER',
      action: 'W_SOS_TRATAMENTO',
      category: 'segurança',
      fieldModified: 'status_alerta_sos',
      previousValue: 'aberto',
      newValue: `${status} • ${note || 'Intervenção concluída'}`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // Contratos
  const handleAddContract = (newContract: TransportContract) => {
    setContracts((prev) => [newContract, ...prev]);
  };

  const handleUpdateContractStatus = (id: string, newStatus: TransportContract['status']) => {
    setContracts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  // Passageiros Fixos
  const handleAddFixedPassenger = (newPassenger: FixedPassenger) => {
    setFixedPassengers((prev) => [newPassenger, ...prev]);
  };

  const handleDeleteFixedPassenger = (id: string) => {
    setFixedPassengers((prev) => prev.filter((p) => p.id !== id));
  };

  // Ponto Seguro
  const handleAddSafePoint = (safePoint: SafePoint) => {
    setSafePoints((prev) => [safePoint, ...prev]);
  };

  // Bloqueio de Pares
  const handleAddBlockedPair = (pair: BlockedUserPair) => {
    setBlockedPairs((prev) => [pair, ...prev]);
  };

  const handleRemoveBlockedPair = (id: string) => {
    setBlockedPairs((prev) => prev.filter((p) => p.id !== id));
  };

  // Estados Federativos
  const handleToggleStateStatus = (uf: string) => {
    setStates((prev) =>
      prev.map((st) =>
        st.uf === uf
          ? { ...st, status: st.status === 'liberado' ? 'bloqueado' : 'liberado' }
          : st
      )
    );
  };

  // Aprovação pela Central: Homologa usuário para 'ativo'
  const handleApprovePending = (id: string) => {
    const item = pendingApprovals.find((p) => p.id === id);
    if (!item) return;

    const approvedItem: PendingApproval = { ...item, status: 'aprovado' };
    setPendingApprovals((prev) =>
      prev.map((p) => (p.id === id ? approvedItem : p))
    );
    syncPendingApprovalToCloud(approvedItem);

    // Se o usuário estiver na lista de usuários cadastrados, atualiza seu status para ativo
    setUsers((prev) =>
      prev.map((u) => {
        if (u.name === item.name || u.cpf === item.cpf) {
          const updatedUser: AppUser = { ...u, status: 'ativo' };
          syncUserToCloud(updatedUser);
          return updatedUser;
        }
        return u;
      })
    );

    // Se for o usuário atual em sessão, libera imediatamente o portal
    if (currentUser.name === item.name || currentUser.cpf === item.cpf) {
      const activeCurrent: AppUser = { ...currentUser, status: 'ativo' };
      setCurrentUser(activeCurrent);
      syncUserToCloud(activeCurrent);
    }

    // Se for um motorista, inclui na frota ativa
    if (item.type === 'motorista') {
      const existsInDrivers = drivers.some((d) => d.name === item.name);
      if (!existsInDrivers) {
        const newDriverEntry: Driver = {
          id: `drv-${Date.now()}`,
          name: item.name,
          userCode: `W-${(700 + drivers.length + 1).toString().padStart(4, '0')}`,
          role: 'motorista',
          vehicle: item.vehicleInfo || 'Veículo Homologado W-DRIVER',
          plate: 'QRA-2026',
          category: (item.category as RideCategory) || 'W-CARRO COMUM',
          city: 'João Pessoa',
          state: 'PB',
          lat: -7.1195,
          lng: -34.8450,
          rating: 5.0,
          completedRidesToday: 0,
          status: 'online',
          phone: item.phone,
        };
        setDrivers((prev) => [...prev, newDriverEntry]);
      }
    }

    handleAddAuditLog({
      id: `log-appr-${Date.now()}`,
      adminName: 'Diego Wallace (W-ADM-001)',
      action: 'CADASTRO_APROVADO',
      category: 'operação',
      fieldModified: 'status_cadastro',
      previousValue: 'pendente_aprovacao',
      newValue: `Homologado: ${item.name} (${item.type})`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  const handleRejectPending = (id: string, reason: string) => {
    const rejectedItem = pendingApprovals.find((p) => p.id === id);
    if (rejectedItem) {
      const updated: PendingApproval = { ...rejectedItem, status: 'recusado', reason };
      setPendingApprovals((prev) => prev.map((p) => (p.id === id ? updated : p)));
      syncPendingApprovalToCloud(updated);
    }
  };

  const handleResolveOccurrence = (id: string) => {
    setOccurrences((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'resolvida' } : o))
    );
  };

  // Desvios e Interdições
  const handlePassengerConfirmDeviation = (rideId: string) => {
    setActiveRide((prev) => {
      if (!prev || prev.id !== rideId || !prev.deviationRecord) return prev;
      const updated: Ride = {
        ...prev,
        deviationRecord: {
          ...prev.deviationRecord,
          passengerConfirmation: 'confirmado',
        },
      };
      syncRideToCloud(updated);
      return updated;
    });
  };

  const handlePayComplementaryFare = (rideId: string, paymentMethod: string) => {
    setActiveRide((prev) => {
      if (!prev || prev.id !== rideId || !prev.deviationRecord) return prev;
      const updated: Ride = {
        ...prev,
        deviationRecord: {
          ...prev.deviationRecord,
          complementaryPaid: true,
          paymentMethodChoice: 'imediato',
        },
      };
      syncRideToCloud(updated);
      return updated;
    });
  };

  const handleDeferComplementaryFare = (rideId: string) => {
    setActiveRide((prev) => {
      if (!prev || prev.id !== rideId || !prev.deviationRecord) return prev;
      const updated: Ride = {
        ...prev,
        deviationRecord: {
          ...prev.deviationRecord,
          complementaryPaid: false,
          paymentMethodChoice: 'saldo_pendente',
        },
      };
      syncRideToCloud(updated);
      return updated;
    });
  };

  const handleReportDeviation = (deviation: RouteDeviationRecord) => {
    setActiveRide((prev) => {
      if (!prev) return prev;
      const updated: Ride = {
        ...prev,
        hasDeviation: true,
        deviationRecord: deviation,
        distanceKm: deviation.newDistanceKm,
        price: (prev.originalPrice || prev.price) + deviation.complementaryFare,
      };
      syncRideToCloud(updated);
      return updated;
    });

    handleAddAuditLog({
      id: `log-dev-${Date.now()}`,
      adminName: `${deviation.driverName} (${deviation.driverCode})`,
      action: 'DESVIO_ROTA_INTERDICAO',
      category: 'segurança',
      fieldModified: 'rota_recalculada_km',
      previousValue: `${deviation.originalDistanceKm.toFixed(1)} km`,
      newValue: `${deviation.newDistanceKm.toFixed(1)} km (+${deviation.distanceDiffKm.toFixed(1)} km)`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // Cadastro de Novo Usuário (Passageiro ou Motorista)
  const handleRegisterNewUser = (newUser: AppUser, pendingDoc?: Partial<PendingApproval>) => {
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    syncUserToCloud(newUser);

    if (pendingDoc) {
      const newPending: PendingApproval = {
        id: pendingDoc.id || `appr-${Date.now()}`,
        name: newUser.name,
        cpf: newUser.cpf,
        phone: newUser.phone,
        type: newUser.role === 'motorista' ? 'motorista' : 'passageiro',
        vehicleInfo: newUser.vehicle ? `${newUser.vehicle} • Placa ${newUser.plate}` : undefined,
        category: newUser.category,
        registerDate: new Date().toLocaleDateString('pt-BR'),
        status: 'pendente',
        docsSent: pendingDoc.docsSent || 1,
        docsTotal: pendingDoc.docsTotal || (newUser.role === 'motorista' ? 3 : 1),
        documentTypes: pendingDoc.documentTypes || ['Documento Pessoal'],
      };
      setPendingApprovals((prev) => [newPending, ...prev]);
      syncPendingApprovalToCloud(newPending);
    }

    setShowAuthModal(false);
  };

  return (
    <div className="min-h-screen bg-[#07090d] text-white flex flex-col font-sans">
      {/* Barra Universal Superior */}
      <div className="bg-[#0b0e14] border-b border-[#1e242b] px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <WLogo size="sm" showSubtitle={false} />
          <span className="hidden md:inline text-[11px] text-[#94a3b8] font-bold">
            João Pessoa - PB • Repasse 90%
          </span>
        </div>

        {/* Seletor Rápido de Perfil para Testes */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-[#141820] p-1 rounded-xl border border-[#232b38]">
          <button
            onClick={() => {
              const pass = users.find((u) => u.role === 'passageiro' && u.status === 'ativo') || initialDemoUsers[3];
              setCurrentUser(pass);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentUser.role === 'passageiro' && currentUser.status === 'ativo'
                ? 'bg-[#83d600] text-black shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Passageiro</span>
          </button>
          <button
            onClick={() => {
              const w0701 = users.find((u) => u.userCode === 'W-0701') || initialDemoUsers[1];
              setCurrentUser(w0701);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentUser.role === 'motorista' && currentUser.status === 'ativo'
                ? 'bg-[#83d600] text-black shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Motorista (W-0701)</span>
          </button>
          <button
            onClick={() => {
              const adm = users.find((u) => u.role === 'admin') || initialDemoUsers[0];
              setCurrentUser(adm);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentUser.role === 'admin'
                ? 'bg-[#83d600] text-black shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Central / CEO</span>
          </button>
        </div>

        {/* Botões Utilitários e Indicador de Persistência Compartilhada */}
        <div className="flex items-center gap-2">
          {/* Indicador de Status Supabase / Persistência Compartilhada */}
          <button
            onClick={() => setShowSupabaseModal(true)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
              isSupabaseConfigured
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
            }`}
            title="Clique para ver o status da persistência compartilhada multi-aparelho"
          >
            <Database className="w-3.5 h-3.5" />
            <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="hidden sm:inline">
              {isSupabaseConfigured ? 'Nuvem Realtime' : 'Cache Local (Offline)'}
            </span>
          </button>

          {/* Badge de Status se Em Análise */}
          {currentUser.status === 'em_analise' && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
              EM ANÁLISE PELA CENTRAL
            </span>
          )}

          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-1.5 bg-[#141820] hover:bg-[#1f2633] text-[#94a3b8] hover:text-white rounded-lg border border-[#232b38] transition-colors"
            title="Parâmetros & Variáveis CSS (:root)"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-2.5 py-1 bg-[#141820] hover:bg-[#1f2633] text-white rounded-lg border border-[#232b38] font-mono text-[11px] font-bold flex items-center gap-1"
            title="Trocar Perfil ou Cadastrar Novo"
          >
            <span>{currentUser.userCode}</span>
          </button>
        </div>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL POR STATUS E PAPEL */}

      {/* CASO 1: USUÁRIO COM CADASTRO EM ANÁLISE (TERMOS E TUTORIAL / TREINAMENTO) */}
      {currentUser.status === 'em_analise' || currentUser.status === 'pendente_aprovacao' ? (
        <UserInAnalysisScreen
          user={currentUser}
          config={config}
          onUpdateUser={(updated) => {
            setCurrentUser(updated);
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            syncUserToCloud(updated);
          }}
          onLogout={() => setShowAuthModal(true)}
        />
      ) : currentUser.role === 'passageiro' ? (
        /* CASO 2: PORTAL DO PASSAGEIRO */
        <PassengerPortal
          user={currentUser}
          config={config}
          drivers={drivers}
          safePoints={safePoints}
          contracts={contracts}
          blockedPairs={blockedPairs}
          activeRide={activeRide}
          onRequestRide={(newRide) => {
            setActiveRide(newRide);
            syncRideToCloud(newRide);
          }}
          onCancelRide={() => {
            if (activeRide) {
              const cancelledRide: Ride = { ...activeRide, status: 'cancelada' };
              syncRideToCloud(cancelledRide);
            }
            setActiveRide(null);
          }}
          onLogout={() => setShowAuthModal(true)}
          onRideCompleted={(fare, category, origin, destination) => {
            handleRideCompleted(fare, category, origin, destination);
            setActiveRide(null);
          }}
          onBlockDriver={handleAddBlockedPair}
          onPassengerConfirmDeviation={handlePassengerConfirmDeviation}
          onPayComplementaryFare={handlePayComplementaryFare}
          onDeferComplementaryFare={handleDeferComplementaryFare}
          onTriggerSos={handleTriggerSos}
        />
      ) : currentUser.role === 'motorista' ? (
        /* CASO 3: PORTAL DO MOTORISTA (COCKPIT) */
        <DriverPortal
          user={currentUser}
          config={config}
          fixedPassengers={fixedPassengers}
          safePoints={safePoints}
          contracts={contracts}
          activeRideRequest={activeRide}
          onAcceptRide={(rideId) => {
            setActiveRide((prev) => {
              if (!prev || prev.id !== rideId) return prev;
              const accepted: Ride = {
                ...prev,
                status: 'a_caminho',
                driverCode: currentUser.userCode,
                driverName: currentUser.name,
                driverVehicle: currentUser.vehicle || 'Veículo Homologado',
              };
              syncRideToCloud(accepted);
              return accepted;
            });
          }}
          onDriverArrived={(rideId) => {
            setActiveRide((prev) => {
              if (!prev || prev.id !== rideId) return prev;
              const arrived: Ride = { ...prev, driverArrivedAtPickup: true, status: 'chegou' };
              syncRideToCloud(arrived);
              return arrived;
            });
          }}
          onStartRide={(rideId) => {
            setActiveRide((prev) => {
              if (!prev || prev.id !== rideId) return prev;
              const started: Ride = { ...prev, status: 'em_andamento', boardingConfirmed: true };
              syncRideToCloud(started);
              return started;
            });
          }}
          onFinishRide={(rideId, receiptData) => {
            if (activeRide && activeRide.id === rideId) {
              const completed: Ride = { ...activeRide, status: 'concluida' };
              setRecentRides((prev) => [completed, ...prev]);
              setActiveRide(completed);

              // Gera Recibo e sincroniza na nuvem
              const receipt = generateRideReceipt(completed, config, currentUser.userCode, currentUser.name, receiptData);
              setReceipts((prev) => [receipt, ...prev]);
              syncRideToCloud(completed);
              syncReceiptToCloud(receipt);
            }
          }}
          onRefuseRide={() => {
            setActiveRide(null);
          }}
          onLogout={() => setShowAuthModal(true)}
          onRideCompletedByDriver={(fare, net) => {
            // Saldo atualizado
          }}
          onAddAuditLog={handleAddAuditLog}
          onAddBlockedPair={handleAddBlockedPair}
          onReportDeviation={handleReportDeviation}
          onTriggerSos={handleTriggerSos}
          onDeclareNoShow={handleDeclareNoShow}
        />
      ) : (
        /* CASO 4: CENTRAL ADMINISTRATIVA / CEO */
        <div className="flex-1 flex flex-col">
          {/* Barra de Navegação Master da Central */}
          <div className="bg-[#0e1217] border-b border-[#1e242b] px-4 py-2.5">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto pb-1">
              <div className="flex items-center gap-1 text-xs">
                {[
                  { id: 'painel', label: 'Central & Mapa Geral', icon: LayoutDashboard },
                  { id: 'wbank', label: 'W-BANK & Recibos', icon: Receipt },
                  { id: 'wsos', label: 'W-SOS Central', icon: AlertTriangle },
                  { id: 'contratos', label: 'Contratos Pré-Pagos', icon: FileText },
                  { id: 'fixos', label: 'Passageiros Fixos', icon: Users },
                  { id: 'marcos', label: 'Metas & Conquistas', icon: Award },
                  { id: 'anuncios', label: 'Anúncios & Parceiros', icon: Megaphone },
                  { id: 'parceiros', label: 'Escala 10 Parceiros', icon: Trophy },
                  { id: 'governanca', label: 'Governança & Tarifas', icon: Shield },
                  { id: 'aprovacoes', label: 'Aprovações & Ocorrências', icon: CheckSquare },
                  { id: 'simulador', label: 'Simulador App', icon: Smartphone },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = adminTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAdminTab(item.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-[#83d600] text-black shadow-sm'
                          : 'text-[#94a3b8] hover:text-white hover:bg-[#141820]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col gap-6">
            {/* ABA: PAINEL GERAL */}
            {adminTab === 'painel' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* KPIs da Central */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#0f1115] border border-[#1e242b] rounded-xl p-4">
                    <span className="text-[10px] uppercase font-bold text-[#94a3b8] block">Motoristas Homologados</span>
                    <span className="text-2xl font-black text-white font-mono">{drivers.length}</span>
                    <span className="text-[11px] text-[#83d600] block mt-0.5">W-0701 a W-0707 ativos</span>
                  </div>
                  <div className="bg-[#0f1115] border border-[#1e242b] rounded-xl p-4">
                    <span className="text-[10px] uppercase font-bold text-[#94a3b8] block">Taxa Retida Central</span>
                    <span className="text-2xl font-black text-[#83d600] font-mono">{config.commissionRate}%</span>
                    <span className="text-[11px] text-[#94a3b8] block mt-0.5">Repasse 90% ao motorista</span>
                  </div>
                  <div className="bg-[#0f1115] border border-[#1e242b] rounded-xl p-4">
                    <span className="text-[10px] uppercase font-bold text-[#94a3b8] block">Contratos Ativos</span>
                    <span className="text-2xl font-black text-white font-mono">{contracts.length}</span>
                    <span className="text-[11px] text-[#83d600] block mt-0.5">Sem tarifa dinâmica</span>
                  </div>
                  <div className="bg-[#0f1115] border border-[#1e242b] rounded-xl p-4">
                    <span className="text-[10px] uppercase font-bold text-[#94a3b8] block">Praça Ativa</span>
                    <span className="text-2xl font-black text-white font-mono">PB</span>
                    <span className="text-[11px] text-emerald-400 block mt-0.5">João Pessoa / Paraíba</span>
                  </div>
                </div>

                {/* Mapa Interativo Geral da Frota */}
                <InteractiveGpsMap drivers={drivers} />
              </div>
            )}

            {/* ABA: W-BANK & RECIBOS OFICIAIS */}
            {adminTab === 'wbank' && (
              <WBankAndReceiptsModule
                receipts={receipts}
                config={config}
                onUpdateConfig={(newConf) => setConfig((prev) => ({ ...prev, ...newConf }))}
              />
            )}

            {/* ABA: W-SOS CENTRAL DE EMERGÊNCIA */}
            {adminTab === 'wsos' && (
              <WSosModule
                alerts={sosAlerts}
                onUpdateAlertStatus={handleUpdateSosAlert}
              />
            )}

            {/* ABA: CONTRATOS PRÉ-PAGOS */}
            {adminTab === 'contratos' && (
              <ContractsManagementModule
                contracts={contracts}
                drivers={drivers}
                safePoints={safePoints}
                config={config}
                onAddContract={handleAddContract}
                onUpdateContractStatus={handleUpdateContractStatus}
              />
            )}

            {/* ABA: PASSAGEIROS FIXOS */}
            {adminTab === 'fixos' && (
              <FixedPassengersModule
                fixedPassengers={fixedPassengers}
                onAddPassenger={handleAddFixedPassenger}
                onDeletePassenger={handleDeleteFixedPassenger}
              />
            )}

            {/* ABA: METAS & COMEMORAÇÕES */}
            {adminTab === 'marcos' && (
              <MilestonesAndCelebrationsModule
                milestones={milestones}
                onCelebrate={(id) => {
                  setMilestones((prev) =>
                    prev.map((m) => (m.id === id ? { ...m, celebrated: true } : m))
                  );
                }}
              />
            )}

            {/* ABA: ANÚNCIOS & PARCEIROS LOCAIS */}
            {adminTab === 'anuncios' && (
              <PartnerAdsModule
                ads={partnerAds}
                onAddAd={(newAd) => setPartnerAds((prev) => [newAd, ...prev])}
                onToggleAdStatus={(id) => {
                  setPartnerAds((prev) =>
                    prev.map((a) =>
                      a.id === id
                        ? { ...a, status: a.status === 'ativo' ? 'pausado' : 'ativo' }
                        : a
                    )
                  );
                }}
              />
            )}

            {/* ABA: ESCALA 10 PARCEIROS */}
            {adminTab === 'parceiros' && (
              <PartnersScaleModule commissionRate={config.commissionRate} />
            )}

            {/* ABA: GOVERNANÇA & TARIFAS */}
            {adminTab === 'governanca' && (
              <GovernanceAndRatesModule
                config={config}
                states={states}
                safePoints={safePoints}
                auditLogs={auditLogs}
                mediaRecords={mediaRecords}
                blockedPairs={blockedPairs}
                onRemoveBlockedPair={handleRemoveBlockedPair}
                onUpdateConfig={(newConf) => setConfig((prev) => ({ ...prev, ...newConf }))}
                onToggleStateStatus={handleToggleStateStatus}
                onAddSafePoint={handleAddSafePoint}
                onAddAuditLog={handleAddAuditLog}
              />
            )}

            {/* ABA: APROVAÇÕES & OCORRÊNCIAS */}
            {adminTab === 'aprovacoes' && (
              <ApprovalsAndOccurrences
                pendingList={pendingApprovals}
                occurrences={occurrences}
                onApprove={handleApprovePending}
                onReject={handleRejectPending}
                onResolveOccurrence={handleResolveOccurrence}
              />
            )}

            {/* ABA: SIMULADOR APP */}
            {adminTab === 'simulador' && (
              <AppSimulator
                config={config}
                drivers={drivers}
                onRideCompleted={handleRideCompleted}
              />
            )}
          </main>
        </div>
      )}

      {/* MODAL DE AUTENTICAÇÃO / SELEÇÃO DE PERFIL / NOVO CADASTRO */}
      <AuthGatewayModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        onSelectUser={(u) => {
          setCurrentUser(u);
          setShowAuthModal(false);
        }}
        onRegisterNewUser={handleRegisterNewUser}
        existingDrivers={drivers}
        existingUsers={users}
        pendingApprovals={pendingApprovals}
      />

      {/* MODAL DE PARÂMETROS E DESIGN TOKENS */}
      <PlatformSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        config={config}
        onUpdateConfig={(newConf) => setConfig((prev) => ({ ...prev, ...newConf }))}
      />

      {/* MODAL DE STATUS E CONFIGURAÇÃO DO SUPABASE COMPARTILHADO */}
      <SupabaseSyncModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
        activeRidesCount={activeRide ? 1 : 0}
      />
    </div>
  );
}
