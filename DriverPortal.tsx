import React, { useState, useEffect } from 'react';
import {
  AppUser,
  FixedPassenger,
  PlatformConfig,
  RideCategory,
  SafePoint,
  TransportContract,
  AuditLog,
  MediaEvidenceRecord,
  BlockedUserPair,
  RouteDeviationRecord,
  WSosAlert,
  MaintenanceLog,
} from '../types';
import { jpLocations } from '../mockData';
import { getEligibleCategoriesForDriver } from '../storage';
import { WLogo } from './WLogo';
import { RoadInterdictionModal } from './RoadInterdictionModal';
import {
  Car,
  Bike,
  Navigation,
  DollarSign,
  Clock,
  CheckCircle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
  LogOut,
  Radio,
  FileText,
  Volume2,
  VolumeX,
  Phone,
  ArrowRight,
  TrendingUp,
  MapPin,
  AlertCircle,
  Sparkles,
  Award,
  Wallet,
  CreditCard,
  Check,
  Star,
  UserX,
  RefreshCw,
  Zap,
  Target,
  Wrench,
  Fuel,
  Sliders,
  AlertTriangle,
  Flame,
  Plus,
} from 'lucide-react';

export const OFFICIAL_CATEGORIES: RideCategory[] = [
  'W-BIKE',
  'W-MOTO COMUM',
  'W-MOTO PRIME',
  'W-CARRO COMUM',
  'W-CARRO PRIME',
  'W-EXECUTIVO',
  'W-EXECUTIVO PRIME',
  'W-TÁXI',
  'W-LUXO',
  'W-DELIVERY',
];

interface DriverPortalProps {
  user: AppUser;
  config: PlatformConfig;
  fixedPassengers: FixedPassenger[];
  safePoints: SafePoint[];
  contracts: TransportContract[];
  activeRideRequest?: any;
  onAcceptRide?: (rideId: string) => void;
  onDriverArrived?: (rideId: string) => void;
  onStartRide?: (rideId: string) => void;
  onFinishRide?: (rideId: string, receiptData?: any) => void;
  onRefuseRide?: (rideId: string) => void;
  onLogout: () => void;
  onRideCompletedByDriver?: (fare: number, netEarnings: number) => void;
  onAddAuditLog?: (log: AuditLog) => void;
  onAddMediaRecord?: (record: MediaEvidenceRecord) => void;
  onAddBlockedPair?: (pair: BlockedUserPair) => void;
  onReportDeviation?: (deviation: RouteDeviationRecord) => void;
  onTriggerSos?: (alert: Partial<WSosAlert>) => void;
  onDeclareNoShow?: (rideId: string) => void;
}

export const DriverPortal: React.FC<DriverPortalProps> = ({
  user,
  config,
  fixedPassengers,
  safePoints,
  contracts,
  activeRideRequest,
  onAcceptRide,
  onDriverArrived,
  onStartRide,
  onFinishRide,
  onRefuseRide,
  onLogout,
  onRideCompletedByDriver,
  onAddAuditLog,
  onAddMediaRecord,
  onAddBlockedPair,
  onReportDeviation,
  onTriggerSos,
  onDeclareNoShow,
}) => {
  const [activeTab, setActiveTab] = useState<
    'cockpit' | 'categorias' | 'destino' | 'metas' | 'manutencao' | 'rotina_fixos' | 'extrato' | 'suporte'
  >('cockpit');
  const [driverStatus, setDriverStatus] = useState<'online' | 'em_corrida' | 'pausa' | 'offline'>('online');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Categorias ativas do motorista (padrão: elegíveis pelo veículo)
  const eligibleCategories = getEligibleCategoriesForDriver(user);
  const [activeCategories, setActiveCategories] = useState<RideCategory[]>(() => {
    return eligibleCategories.length > 0
      ? eligibleCategories
      : [(user.category as RideCategory) || 'W-CARRO COMUM'];
  });

  // Modo Destino (Ponto 21)
  const [destinationModeActive, setDestinationModeActive] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState('Manaíra Shopping, João Pessoa');
  const [destinationRadiusKm, setDestinationRadiusKm] = useState(3.0);

  // Metas do Motorista (Ponto 22)
  const [dailyGoal, setDailyGoal] = useState(200.0);
  const [morningShiftEarnings, setMorningShiftEarnings] = useState(85.5);
  const [afternoonShiftEarnings, setAfternoonShiftEarnings] = useState(130.0);

  // Manutenção e Combustível (Ponto 23)
  const [odometerKm, setOdometerKm] = useState(48250);
  const [fuelLogs, setFuelLogs] = useState<Array<{ date: string; liters: number; cost: number; station: string }>>([
    { date: '16/09/2026', liters: 15, cost: 89.55, station: 'Posto Petrobras Epitácio' },
    { date: '12/09/2026', liters: 20, cost: 119.4, station: 'Posto Shell Ruy Carneiro' },
  ]);
  const [newFuelLiters, setNewFuelLiters] = useState('');
  const [newFuelCost, setNewFuelCost] = useState('');
  const [newFuelStation, setNewFuelStation] = useState('');

  // Modal e Estado de Interdição de Vias / Desvio de Rota
  const [showInterdictionModal, setShowInterdictionModal] = useState(false);
  const [currentDeviation, setCurrentDeviation] = useState<RouteDeviationRecord | null>(null);

  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);

  // Estado da corrida ativa no cockpit
  const [incomingRide, setIncomingRide] = useState<{
    id: string;
    passengerName: string;
    passengerRating: number;
    category: RideCategory;
    origin: string;
    destination: string;
    distanceKm: number;
    totalFare: number;
    driverEarnings: number;
    paymentMethod: string;
    paymentStatus?: string;
    isDirectCall?: boolean;
    inPriorityRange?: boolean;
  } | null>(null);

  const [rideStep, setRideStep] = useState<
    'idle' | 'radar' | 'accepted' | 'heading_to_pickup' | 'chegou' | 'embarque_confirmado' | 'in_trip' | 'finished'
  >('radar');
  const [tripProgress, setTripProgress] = useState(0);
  const [driverArrivedState, setDriverArrivedState] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [boardingConfirmed, setBoardingConfirmed] = useState(false);

  // Sincroniza com a corrida solicitada pelo passageiro em tempo real
  useEffect(() => {
    if (!activeRideRequest) {
      if (rideStep === 'radar') {
        setIncomingRide(null);
      }
      return;
    }

    const isDirect = !!activeRideRequest.calledDriverCode;
    const isForMe = activeRideRequest.calledDriverCode === user.userCode;

    // Se foi chamada direta para outro motorista específico, não mostrar para este motorista
    if (isDirect && !isForMe) {
      setIncomingRide(null);
      return;
    }

    // Filtrar por categorias ativas habilitadas pelo motorista (Ponto 9)
    if (!activeCategories.includes(activeRideRequest.category)) {
      setIncomingRide(null);
      return;
    }

    if (activeRideRequest.status === 'solicitada') {
      setIncomingRide({
        id: activeRideRequest.id,
        passengerName: activeRideRequest.passengerName,
        passengerRating: 4.97,
        category: activeRideRequest.category,
        origin: activeRideRequest.origin,
        destination: activeRideRequest.destination,
        distanceKm: activeRideRequest.distanceKm,
        totalFare: activeRideRequest.price,
        driverEarnings: activeRideRequest.netDriverValue,
        paymentMethod: activeRideRequest.paymentMethod,
        paymentStatus: activeRideRequest.paymentStatus,
        isDirectCall: isDirect,
        inPriorityRange: true,
      });
      setRideStep('radar');
      setDriverStatus('online');
      setPaymentConfirmed(activeRideRequest.paymentStatus === 'confirmado');
      setBoardingConfirmed(false);
    } else if (activeRideRequest.status === 'a_caminho') {
      setRideStep('heading_to_pickup');
      setDriverStatus('em_corrida');
    } else if (activeRideRequest.status === 'em_andamento') {
      setRideStep('in_trip');
      setDriverStatus('em_corrida');
    } else if (activeRideRequest.status === 'concluida') {
      setRideStep('finished');
      setDriverStatus('online');
    }

    if (activeRideRequest.deviationRecord) {
      setCurrentDeviation(activeRideRequest.deviationRecord);
    } else if (activeRideRequest.status === 'solicitada') {
      setCurrentDeviation(null);
    }
  }, [activeRideRequest, user.userCode, activeCategories]);

  const [todayEarnings, setTodayEarnings] = useState(user.todayEarnings || 215.5);
  const [completedRidesToday, setCompletedRidesToday] = useState(user.completedRides || 18);

  // SOS Trigger
  const handleTriggerDriverSos = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada no navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (onTriggerSos) {
          onTriggerSos({
            userId: user.id,
            userCode: user.userCode,
            userName: user.name,
            userRole: 'motorista',
            userPhone: user.phone,
            location: `Localização GPS Motorista (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`,
            coords,
            rideId: incomingRide?.id || activeRideRequest?.id,
          });
        }
        alert('🚨 ALERTA W-SOS TRANSMITIDO PARA A CENTRAL JOÃO PESSOA! Mantenha a calma, sua localização GPS está sendo monitorada.');
      },
      () => {
        const fallbackCoords = { lat: -7.1153, lng: -34.8231 };
        if (onTriggerSos) {
          onTriggerSos({
            userId: user.id,
            userCode: user.userCode,
            userName: user.name,
            userRole: 'motorista',
            userPhone: user.phone,
            location: 'João Pessoa - PB (Aproximação)',
            coords: fallbackCoords,
            rideId: incomingRide?.id || activeRideRequest?.id,
          });
        }
        alert('🚨 ALERTA W-SOS TRANSMITIDO PARA A CENTRAL COM COORDENADAS APROXIMADAS!');
      }
    );
  };

  const handleToggleCategory = (cat: RideCategory) => {
    const isEligible = eligibleCategories.includes(cat);
    if (!isEligible) {
      alert(`A categoria ${cat} exige homologação documental específica do veículo pela Central.`);
      return;
    }

    if (activeCategories.includes(cat)) {
      if (activeCategories.length === 1) {
        alert('Você deve manter ao menos uma categoria habilitada para receber chamadas.');
        return;
      }
      setActiveCategories((prev) => prev.filter((c) => c !== cat));
    } else {
      setActiveCategories((prev) => [...prev, cat]);
    }
  };

  const handleAcceptRide = () => {
    setDriverStatus('em_corrida');
    setRideStep('heading_to_pickup');
    setDriverArrivedState(false);
    setBoardingConfirmed(false);
    setPaymentConfirmed(incomingRide?.paymentStatus === 'confirmado');
    if (incomingRide && onAcceptRide) {
      onAcceptRide(incomingRide.id);
    }
  };

  const handleRefuseRide = () => {
    const cooldownMs = 10000;
    setCooldownUntil(Date.now() + cooldownMs);
    setTripProgress(0);
    setRideStep('radar');
    if (incomingRide && onRefuseRide) {
      onRefuseRide(incomingRide.id);
    }
    setIncomingRide(null);

    setTimeout(() => {
      setCooldownUntil(null);
    }, cooldownMs);
  };

  const handleArrivedAtPickup = () => {
    setDriverArrivedState(true);
    setRideStep('chegou');
    if (incomingRide && onDriverArrived) {
      onDriverArrived(incomingRide.id);
    }
  };

  const handleConfirmPaymentReceived = () => {
    setPaymentConfirmed(true);
    if (incomingRide) {
      setIncomingRide((prev) => (prev ? { ...prev, paymentStatus: 'confirmado' } : null));
    }
  };

  const handleConfirmBoarding = () => {
    if (!paymentConfirmed) {
      alert('Antes de confirmar o embarque, verifique a confirmação do pagamento.');
      return;
    }
    setBoardingConfirmed(true);
    setRideStep('embarque_confirmado');
  };

  const handleDeclareNoShowAction = () => {
    if (!driverArrivedState) {
      alert('Você deve primeiro confirmar a chegada ao local de embarque.');
      return;
    }
    const confirmed = confirm(
      'Declarar Não Comparecimento do Passageiro (No-Show)?\n\nConforme o regulamento W-DRIVER, 100% da taxa de cancelamento (R$ 7,00) será creditada integralmente ao seu saldo para cobrir o deslocamento e tempo de espera. 0% para a Central.'
    );
    if (!confirmed) return;

    if (incomingRide && onDeclareNoShow) {
      onDeclareNoShow(incomingRide.id);
    }
    setTodayEarnings((prev) => prev + 7.0);
    setRideStep('radar');
    setIncomingRide(null);
    setDriverArrivedState(false);
    setBoardingConfirmed(false);
    alert('No-Show registrado com sucesso! R$ 7,00 creditado ao seu saldo de motorista (100% seu).');
  };

  const handleStartTrip = () => {
    if (!boardingConfirmed) {
      alert('Por favor, confirme o embarque do passageiro antes de iniciar o trajeto.');
      return;
    }
    setRideStep('in_trip');
    if (incomingRide && onStartRide) {
      onStartRide(incomingRide.id);
    }
    let p = 0;
    const interval = setInterval(() => {
      p += 0.25;
      setTripProgress(Math.min(1, p));
      if (p >= 1) {
        clearInterval(interval);
        handleFinishTrip();
      }
    }, 1200);
  };

  const handleFinishTrip = () => {
    setRideStep('finished');
    setDriverStatus('online');
    if (incomingRide) {
      const newTotal = todayEarnings + incomingRide.driverEarnings;
      setTodayEarnings(Math.round(newTotal * 100) / 100);
      setCompletedRidesToday((prev) => prev + 1);
      if (onFinishRide) {
        onFinishRide(incomingRide.id, {
          rideId: incomingRide.id,
          totalPrice: incomingRide.totalFare,
          driverShare: incomingRide.driverEarnings,
          centralShare: Math.round((incomingRide.totalFare - incomingRide.driverEarnings) * 100) / 100,
          origin: incomingRide.origin,
          destination: incomingRide.destination,
          category: incomingRide.category,
        });
      }
      if (onRideCompletedByDriver) {
        onRideCompletedByDriver(incomingRide.totalFare, incomingRide.driverEarnings);
      }
    }
  };

  const handleResetRadar = () => {
    setTripProgress(0);
    setRideStep('radar');
    setIncomingRide(null);
    setDriverArrivedState(false);
    setPaymentConfirmed(false);
    setBoardingConfirmed(false);
  };

  const handleAddFuel = (e: React.FormEvent) => {
    e.preventDefault();
    const lit = parseFloat(newFuelLiters);
    const cst = parseFloat(newFuelCost);
    if (!lit || !cst) return;

    setFuelLogs((prev) => [
      {
        date: new Date().toLocaleDateString('pt-BR'),
        liters: lit,
        cost: cst,
        station: newFuelStation || 'Posto Local',
      },
      ...prev,
    ]);
    setNewFuelLiters('');
    setNewFuelCost('');
    setNewFuelStation('');
  };

  return (
    <div className="min-h-screen bg-[#07090d] text-white flex flex-col font-sans">
      {/* Header do Motorista com W-SOS */}
      <header className="bg-[#0e1217] border-b border-[#1e242b] sticky top-0 z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <WLogo size="sm" showSubtitle={false} />
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">COCKPIT DO MOTORISTA</span>
                <span className="text-[10px] bg-[#83d600] text-black font-mono font-black px-2 py-0.5 rounded">
                  {user.userCode}
                </span>
                <span className="text-[10px] bg-[#83d600]/20 text-[#83d600] font-black px-2 py-0.5 rounded-full border border-[#83d600]/30">
                  90% LÍQUIDO MOTORISTA
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8]">{user.name} • Praça João Pessoa - PB</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botão W-SOS de Emergência */}
            <button
              onClick={handleTriggerDriverSos}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all active:scale-95"
              title="Acionar Botão de Emergência W-SOS"
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
              <span>W-SOS</span>
            </button>

            {/* Status Online/Pausa/Offline */}
            <div className="flex items-center bg-[#141820] border border-[#232b38] rounded-xl p-1 text-xs">
              <button
                onClick={() => setDriverStatus('online')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  driverStatus === 'online' || driverStatus === 'em_corrida'
                    ? 'bg-[#83d600] text-black shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
                <span>ONLINE</span>
              </button>
              <button
                onClick={() => setDriverStatus('pausa')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  driverStatus === 'pausa' ? 'bg-amber-500 text-black shadow-sm' : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Pausa
              </button>
              <button
                onClick={() => setDriverStatus('offline')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  driverStatus === 'offline' ? 'bg-zinc-700 text-white shadow-sm' : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Offline
              </button>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-lg bg-[#141820] border border-[#232b38] text-[#94a3b8] hover:text-white transition-colors"
              title="Trocar Perfil / Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Barra de Abas do Motorista */}
        <div className="max-w-6xl mx-auto mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'cockpit', label: 'Cockpit & Radar', icon: Radio },
            { id: 'categorias', label: 'Minhas Categorias', icon: Sliders },
            { id: 'destino', label: 'Modo Destino', icon: Target },
            { id: 'metas', label: 'Metas do Motorista', icon: TrendingUp },
            { id: 'manutencao', label: 'Manutenção & Combustível', icon: Wrench },
            { id: 'rotina_fixos', label: 'Rotinas & Contratos', icon: Users },
            { id: 'extrato', label: 'Extrato W-Bank', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#83d600] text-black shadow-sm'
                    : 'text-[#94a3b8] hover:text-white hover:bg-[#141820]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-4 sm:p-6 flex-1">
        {/* ABA 1: COCKPIT & RADAR */}
        {activeTab === 'cockpit' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
            <div className="lg:col-span-5 space-y-4">
              {/* Card de Faturamento Diário */}
              <div className="bg-[#10141a] border border-[#1e242b] rounded-2xl p-5 shadow-xl space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-[#94a3b8]">
                  Ganhos de Hoje (90% Líquido)
                </span>
                <div>
                  <span className="text-3xl font-black font-mono text-[#83d600]">
                    R$ {todayEarnings.toFixed(2)}
                  </span>
                  <span className="text-xs text-[#94a3b8] ml-2">/ Meta R$ {dailyGoal.toFixed(2)}</span>
                </div>
                <div className="w-full bg-[#1e242b] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#83d600] h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (todayEarnings / dailyGoal) * 100)}%` }}
                  />
                </div>
                <div className="p-3 bg-[#090b0e] rounded-xl border border-[#232b38] space-y-1 text-xs">
                  <div className="flex justify-between text-[#cbd5e1]">
                    <span>Corridas Realizadas Hoje:</span>
                    <strong className="text-white font-mono">{completedRidesToday}</strong>
                  </div>
                  <div className="flex justify-between text-[#cbd5e1]">
                    <span>Categorias Ativas no Radar:</span>
                    <strong className="text-[#83d600] font-mono">{activeCategories.length}</strong>
                  </div>
                </div>
              </div>

              {/* Card Modo Destino Ativo Informação */}
              {destinationModeActive && (
                <div className="p-4 bg-[#83d600]/10 border border-[#83d600]/40 rounded-2xl space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-[#83d600] font-black">
                    <Target className="w-4 h-4" />
                    <span>Modo Destino Ativo</span>
                  </div>
                  <p className="text-white">{destinationAddress}</p>
                  <span className="text-[10px] text-[#94a3b8]">
                    Priorizando chamadas no raio de {destinationRadiusKm} km em direção ao destino.
                  </span>
                </div>
              )}
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="bg-[#10141a] border border-[#1e242b] rounded-2xl p-5 shadow-xl min-h-[420px] flex flex-col justify-between">
                {/* RADAR: CORRIDA RECEBIDA */}
                {rideStep === 'radar' && incomingRide ? (
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    <div className="p-4 bg-[#090b0e] rounded-xl border-2 border-[#83d600]/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-[#83d600] text-black">
                              {incomingRide.id}
                            </span>
                            {incomingRide.isDirectCall && (
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                CHAMADA DIRETA EXCLUSIVA
                              </span>
                            )}
                          </div>
                          <h4 className="font-black text-base text-white">{incomingRide.passengerName}</h4>
                          <span className="text-xs text-[#ffc107]">★ {incomingRide.passengerRating} • Categoria {incomingRide.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-black text-xl text-[#83d600]">
                            R$ {incomingRide.driverEarnings.toFixed(2)}
                          </span>
                          <span className="text-[10px] text-[#94a3b8] block">
                            Repasse 90% (Total: R$ {incomingRide.totalFare.toFixed(2)})
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1.5 text-xs text-[#cbd5e1] border-t border-[#1e242b] pt-2">
                        <div>Partida (GPS): <strong className="text-white">{incomingRide.origin}</strong></div>
                        <div>Destino: <strong className="text-white">{incomingRide.destination}</strong></div>
                        <div className="text-[11px] text-[#94a3b8] flex gap-3">
                          <span>Distância: {incomingRide.distanceKm} km</span>
                          <span>Pagamento: {incomingRide.paymentMethod}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleRefuseRide}
                        className="flex-1 py-3 bg-[#151a22] hover:bg-zinc-800 text-[#94a3b8] font-bold text-xs rounded-xl transition-all"
                      >
                        Recusar
                      </button>
                      <button
                        onClick={handleAcceptRide}
                        className="flex-2 py-3 bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(131,214,0,0.3)]"
                      >
                        ACEITAR CORRIDA
                      </button>
                    </div>
                  </div>
                ) : rideStep === 'radar' && !incomingRide ? (
                  <div className="text-center p-6 space-y-4 flex-1 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#83d600]/10 border border-[#83d600]/40 flex items-center justify-center text-[#83d600]">
                      <Radio className="w-8 h-8 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-white">Radar W-DRIVER Ativo</h3>
                      <p className="text-xs text-[#94a3b8] max-w-sm mx-auto mt-1">
                        {driverStatus === 'online'
                          ? `Aguardando chamadas compatíveis com suas categorias ativas em João Pessoa...`
                          : 'Você está Offline ou em Pausa. Mude seu status para ONLINE para receber chamadas.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#83d600] bg-[#141820] px-3 py-1.5 rounded-lg border border-[#232b38]">
                      <span className="w-2 h-2 rounded-full bg-[#83d600] animate-ping"></span>
                      <span>{activeCategories.length} categorias escaneadas • Repasse 90%</span>
                    </div>
                  </div>
                ) : rideStep === 'heading_to_pickup' || rideStep === 'chegou' || rideStep === 'embarque_confirmado' ? (
                  /* ETAPAS DE EMBARQUE E CHEGADA COM CONFIRMAÇÃO DE PAGAMENTO */
                  <div className="space-y-4">
                    <div className="p-3 bg-[#83d600]/20 border border-[#83d600] rounded-xl text-center">
                      <span className="text-xs font-bold text-white">
                        {driverArrivedState
                          ? 'Chegada ao local de embarque confirmada'
                          : 'A caminho do ponto de embarque do passageiro'}
                      </span>
                    </div>

                    {/* Endereço de Embarque */}
                    <div className="p-3.5 bg-[#090b0e] border border-[#232b38] rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-[#1e242b] pb-2">
                        <span className="text-[11px] font-black text-[#83d600] flex items-center gap-1.5 uppercase">
                          <MapPin className="w-3.5 h-3.5 text-[#83d600]" />
                          Ponto de Embarque
                        </span>
                        <span className="text-[10px] bg-[#83d600]/20 text-[#83d600] font-bold px-2 py-0.5 rounded font-mono">
                          {incomingRide?.id || activeRideRequest?.id}
                        </span>
                      </div>
                      <p className="text-white font-bold">{incomingRide?.origin || activeRideRequest?.origin}</p>
                    </div>

                    {/* Bloco de Confirmação de Pagamento */}
                    <div className="p-3.5 bg-[#090b0e] border border-[#232b38] rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#94a3b8]">Forma de Pagamento:</span>
                        <strong className="text-white">{incomingRide?.paymentMethod || 'Pix'}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#94a3b8]">Status do Pagamento:</span>
                        {paymentConfirmed ? (
                          <span className="text-[#83d600] font-black flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> CONFIRMADO
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold">Pendente de Confirmação</span>
                        )}
                      </div>

                      {!paymentConfirmed && (
                        <button
                          onClick={handleConfirmPaymentReceived}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg text-xs transition-all mt-1"
                        >
                          Confirmar Recebimento do Pagamento ({incomingRide?.paymentMethod})
                        </button>
                      )}
                    </div>

                    {/* Botões de Ação na Chegada */}
                    {!driverArrivedState ? (
                      <button
                        onClick={handleArrivedAtPickup}
                        className="w-full py-3.5 bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs rounded-xl shadow-md transition-all"
                      >
                        CHEGUEI NO LOCAL DE EMBARQUE
                      </button>
                    ) : !boardingConfirmed ? (
                      <div className="space-y-2">
                        <button
                          onClick={handleConfirmBoarding}
                          className={`w-full py-3.5 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${
                            paymentConfirmed
                              ? 'bg-[#83d600] hover:bg-[#83d600]/90 text-black'
                              : 'bg-zinc-800 text-[#94a3b8] cursor-not-allowed'
                          }`}
                        >
                          <Users className="w-4 h-4" />
                          CONFIRMAR EMBARQUE DO PASSAGEIRO
                        </button>

                        <button
                          onClick={handleDeclareNoShowAction}
                          className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 font-bold text-xs rounded-xl transition-all"
                        >
                          Passageiro Não Compareceu (Declarar No-Show — 100% Motorista)
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleStartTrip}
                        className="w-full py-3.5 bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        INICIAR CORRIDA PARA O DESTINO
                      </button>
                    )}
                  </div>
                ) : rideStep === 'in_trip' ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-500/20 border border-blue-500 rounded-xl text-center">
                      <span className="text-xs font-bold text-white flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                        Viagem em Andamento para o Destino
                      </span>
                    </div>

                    <div className="p-3 bg-[#090b0e] border border-[#232b38] rounded-xl text-xs space-y-1.5">
                      <div className="flex justify-between text-[#94a3b8]">
                        <span>Passageiro:</span>
                        <strong className="text-white">{incomingRide?.passengerName}</strong>
                      </div>
                      <div className="flex justify-between text-[#94a3b8]">
                        <span>Destino:</span>
                        <strong className="text-white truncate max-w-[200px]">{incomingRide?.destination}</strong>
                      </div>
                      <div className="flex justify-between text-[#94a3b8]">
                        <span>Distância:</span>
                        <span className="font-mono text-white">{(incomingRide?.distanceKm || 0).toFixed(1)} km</span>
                      </div>
                    </div>

                    {/* Botão de Via Interditada */}
                    <button
                      type="button"
                      onClick={() => setShowInterdictionModal(true)}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 border border-amber-400/40"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      VIA INTERDITADA / REGISTRAR DESVIO DE ROTA
                    </button>

                    <button
                      type="button"
                      onClick={handleFinishTrip}
                      className="w-full py-3.5 bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      FINALIZAR CORRIDA & GERAR RECIBO
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-6 space-y-4">
                    <CheckCircle className="w-12 h-12 text-[#83d600] mx-auto" />
                    <h3 className="font-black text-lg text-white">Corrida Finalizada com Sucesso!</h3>
                    <p className="text-xs text-[#94a3b8]">
                      O recibo oficial foi gerado e registrado no W-BANK com a divisão de 90% para seu saldo.
                    </p>
                    <button
                      onClick={handleResetRadar}
                      className="w-full py-3 bg-[#83d600] text-black font-black text-xs rounded-xl"
                    >
                      Aguardar Próxima Corrida
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: MINHAS CATEGORIAS (Ponto 9) */}
        {activeTab === 'categorias' && (
          <div className="bg-[#10141a] border border-[#1e242b] rounded-2xl p-5 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#83d600]" />
                Minhas Categorias — Habilitação de Chamadas
              </h3>
              <p className="text-xs text-[#94a3b8] mt-1">
                Ative ou desative as categorias que você deseja atender no radar. As categorias ligadas acendem no verde
                oficial da W-DRIVER (#83d600). Apenas categorias compatíveis com seu veículo e documentos podem ser ativadas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {OFFICIAL_CATEGORIES.map((cat, index) => {
                const isEligible = eligibleCategories.includes(cat);
                const isActive = activeCategories.includes(cat);

                return (
                  <div
                    key={cat}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-[#141820] border-[#83d600] shadow-md shadow-[#83d600]/10'
                        : 'bg-[#090b0e] border-[#1e242b] opacity-75'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{index + 1}. {cat}</span>
                        {isEligible ? (
                          <span className="text-[9px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.5 rounded">
                            Homologado
                          </span>
                        ) : (
                          <span className="text-[9px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded">
                            Pendente Central
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#94a3b8] block mt-0.5">
                        {isEligible ? 'Compatível com seu veículo' : 'Requer documentação/vistoria'}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!isEligible}
                      onClick={() => handleToggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                        !isEligible
                          ? 'bg-[#1e242b] text-[#64748b] cursor-not-allowed'
                          : isActive
                          ? 'bg-[#83d600] text-black shadow-md'
                          : 'bg-[#1a202c] text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      {isActive ? 'ATIVADO' : 'DESATIVADO'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ABA 3: MODO DESTINO (Ponto 21) */}
        {activeTab === 'destino' && (
          <div className="bg-[#10141a] border border-[#1e242b] rounded-2xl p-5 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#83d600]" />
                  Modo Destino W-DRIVER
                </h3>
                <p className="text-xs text-[#94a3b8] mt-1">
                  Defina um endereço em João Pessoa para priorizar corridas que estejam no seu caminho de volta ou trajeto.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDestinationModeActive((prev) => !prev)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  destinationModeActive
                    ? 'bg-[#83d600] text-black shadow-md shadow-[#83d600]/30'
                    : 'bg-[#1e242b] text-[#94a3b8]'
                }`}
              >
                {destinationModeActive ? 'MODO DESTINO LIGADO' : 'MODO DESTINO DESLIGADO'}
              </button>
            </div>

            <div className="space-y-4 max-w-lg">
              <div>
                <label className="text-[#94a3b8] block mb-1 text-xs font-bold">Endereço de Destino Desejado:</label>
                <input
                  type="text"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  placeholder="Ex: Manaíra Shopping, Tambaú, Bessa, Centro..."
                  className="w-full px-3 py-2 bg-[#090b0e] border border-[#232b38] rounded-xl text-xs text-white focus:outline-none focus:border-[#83d600]"
                />
              </div>

              <div>
                <label className="text-[#94a3b8] block mb-1 text-xs font-bold">
                  Raio Máximo de Desvio: {destinationRadiusKm} km
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={destinationRadiusKm}
                  onChange={(e) => setDestinationRadiusKm(parseFloat(e.target.value))}
                  className="w-full accent-[#83d600]"
                />
              </div>

              <div className="p-3 bg-[#090b0e] rounded-xl border border-[#232b38] text-xs text-[#cbd5e1]">
                {destinationModeActive ? (
                  <span className="text-[#83d600] font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    O radar filtrará prioritariamente passageiros cujo trajeto termine próximo a {destinationAddress}.
                  </span>
                ) : (
                  <span>O radar aceita corridas em todas as direções da cidade de João Pessoa.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: METAS DO MOTORISTA (Ponto 22) */}
        {activeTab === 'metas' && (
          <div className="bg-[#10141a] border border-[#1e242b] rounded-2xl p-5 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#83d600]" />
                Metas do Motorista Parceiro
              </h3>
              <p className="text-xs text-[#94a3b8] mt-1">
                Configure suas metas diárias particulares de faturamento líquido. Acompanhe seu desempenho por turno.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[#090b0e] border border-[#1e242b] rounded-xl">
                <span className="text-[10px] text-[#94a3b8] uppercase font-bold block mb-1">Meta Diária Fixada</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-white font-mono">R$</span>
                  <input
                    type="number"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 bg-[#141820] border border-[#232b38] rounded-lg font-mono font-bold text-white text-lg focus:outline-none focus:border-[#83d600]"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#090b0e] border border-[#1e242b] rounded-xl">
                <span className="text-[10px] text-[#94a3b8] uppercase font-bold block mb-1">Turno da Manhã</span>
                <span className="text-xl font-black text-white font-mono">
                  R$ {morningShiftEarnings.toFixed(2)}
                </span>
                <span className="text-[10px] text-[#94a3b8] block mt-0.5">Faixa 09:00 – 10:30</span>
              </div>

              <div className="p-4 bg-[#090b0e] border border-[#1e242b] rounded-xl">
                <span className="text-[10px] text-[#83d600] uppercase font-bold block mb-1">Turno da Tarde</span>
                <span className="text-xl font-black text-[#83d600] font-mono">
                  R$ {afternoonShiftEarnings.toFixed(2)}
                </span>
                <span className="text-[10px] text-[#94a3b8] block mt-0.5">Faixa 12:00 – 18:30</span>
              </div>
            </div>

            <div className="p-4 bg-[#090b0e] border border-[#1e242b] rounded-xl space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Progresso para a Meta:</span>
                <span className="text-[#83d600] font-mono">
                  {Math.round((todayEarnings / dailyGoal) * 100)}% atingido
                </span>
              </div>
              <div className="w-full bg-[#141820] h-3 rounded-full overflow-hidden">
                <div
                  className="bg-[#83d600] h-full"
                  style={{ width: `${Math.min(100, (todayEarnings / dailyGoal) * 100)}%` }}
                />
              </div>
              <span className="text-[11px] text-[#94a3b8] block">
                Faltam R$ {Math.max(0, dailyGoal - todayEarnings).toFixed(2)} para completar sua meta de hoje.
              </span>
            </div>
          </div>
        )}

        {/* ABA 5: MANUTENÇÃO & COMBUSTÍVEL (Ponto 23) */}
        {activeTab === 'manutencao' && (
          <div className="bg-[#10141a] border border-[#1e242b] rounded-2xl p-5 shadow-xl space-y-5 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#83d600]" />
                Controle de Manutenção e Combustível
              </h3>
              <p className="text-xs text-[#94a3b8] mt-1">
                Acompanhe o hodômetro, abastecimentos realizados e revisões periódicas do seu veículo parceiro.
              </p>
            </div>

            {/* Hodômetro */}
            <div className="p-4 bg-[#090b0e] border border-[#1e242b] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">Hodômetro Atual</span>
                <span className="text-2xl font-black text-white font-mono">{odometerKm.toLocaleString()} KM</span>
              </div>
              <button
                onClick={() => {
                  const val = prompt('Atualizar KM do Hodômetro:', String(odometerKm));
                  if (val) setOdometerKm(parseInt(val) || odometerKm);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#141820] text-xs font-bold text-[#83d600] border border-[#232b38]"
              >
                Atualizar KM
              </button>
            </div>

            {/* Formulário de Abastecimento */}
            <form onSubmit={handleAddFuel} className="p-4 bg-[#090b0e] border border-[#1e242b] rounded-xl space-y-3">
              <span className="text-xs font-black text-white block uppercase tracking-wider">
                Registrar Novo Abastecimento
              </span>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[#94a3b8] block mb-1">Litros <span className="text-[#83d600] text-[10px]">(Obrigatório)</span></label>
                  <input
                    type="number"
                    step="0.1"
                    value={newFuelLiters}
                    onChange={(e) => setNewFuelLiters(e.target.value)}
                    placeholder="Ex: 15.5"
                    className="w-full px-3 py-1.5 bg-[#141820] border border-[#232b38] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1">Valor Pago (R$) <span className="text-[#83d600] text-[10px]">(Obrigatório)</span></label>
                  <input
                    type="number"
                    step="0.01"
                    value={newFuelCost}
                    onChange={(e) => setNewFuelCost(e.target.value)}
                    placeholder="Ex: 92.50"
                    className="w-full px-3 py-1.5 bg-[#141820] border border-[#232b38] rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1">Posto / Local</label>
                  <input
                    type="text"
                    value={newFuelStation}
                    onChange={(e) => setNewFuelStation(e.target.value)}
                    placeholder="Ex: Posto BR Epitácio"
                    className="w-full px-3 py-1.5 bg-[#141820] border border-[#232b38] rounded-lg text-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Salvar Abastecimento</span>
              </button>
            </form>

            {/* Histórico de Abastecimentos */}
            <div className="space-y-2 text-xs">
              <span className="text-[#94a3b8] font-bold uppercase tracking-wider block">
                Histórico Recente de Abastecimentos
              </span>
              {fuelLogs.map((log, idx) => (
                <div key={idx} className="p-3 bg-[#090b0e] border border-[#1e242b] rounded-xl flex justify-between">
                  <div>
                    <span className="font-bold text-white block">{log.station}</span>
                    <span className="text-[11px] text-[#94a3b8]">{log.date} • {log.liters} litros</span>
                  </div>
                  <span className="font-mono font-bold text-[#83d600] text-sm">
                    R$ {log.cost.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 6: ROTINAS & CONTRATOS FIXOS */}
        {activeTab === 'rotina_fixos' && (
          <div className="bg-[#10141a] border border-[#1e242b] rounded-2xl p-5 shadow-xl space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#83d600]" />
                Passageiros Fixos & Contratos Pré-Pagos
              </h3>
              <p className="text-xs text-[#94a3b8] mt-1">
                Rotinas diárias consolidadas em João Pessoa. Em contratos pré-pagos, não há desconto de dinâmica.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {contracts.map((c) => (
                <div key={c.id} className="p-4 bg-[#090b0e] border border-[#1e242b] rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{c.passengerName}</span>
                    <span className="text-[10px] bg-[#83d600]/20 text-[#83d600] px-2 py-0.5 rounded font-mono font-bold">
                      {c.shift}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#94a3b8]">
                    {c.origin} → {c.destination}
                  </div>
                  <div className="flex justify-between text-[#83d600] font-mono font-bold pt-1 border-t border-[#1e242b]">
                    <span>Mensalidade: R$ {c.monthlyPrice.toFixed(2)}</span>
                    <span>Repasse 90%: R$ {c.netDriverEarnings.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ABA 7: EXTRATO W-BANK */}
        {activeTab === 'extrato' && (
          <div className="bg-[#10141a] border border-[#1e242b] rounded-2xl p-5 shadow-xl space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#83d600]" />
                Extrato Financeiro W-Bank
              </h3>
              <p className="text-xs text-[#94a3b8] mt-1">
                Demonstrativo de repasses garantidos de 90% para o motorista parceiro.
              </p>
            </div>

            <div className="p-4 bg-[#090b0e] border border-[#1e242b] rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-[#94a3b8] block">Saldo Disponível para Saque</span>
                <span className="text-3xl font-black font-mono text-[#83d600]">
                  R$ {todayEarnings.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => alert(`Chave Pix cadastrada: ${user.phone}\nRepasse programado pela Central W-DRIVER.`)}
                className="px-4 py-2 bg-[#83d600] text-black font-black text-xs rounded-xl shadow-md"
              >
                Solicitar Saque Pix
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Via Interditada */}
      <RoadInterdictionModal
        isOpen={showInterdictionModal}
        onClose={() => setShowInterdictionModal(false)}
        onConfirmDeviation={(dev) => {
          setCurrentDeviation(dev);
          setShowInterdictionModal(false);
        }}
        activeRide={{
          id: incomingRide?.id || activeRideRequest?.id || '#W-0000',
          origin: incomingRide?.origin || activeRideRequest?.origin || 'Origem',
          destination: incomingRide?.destination || activeRideRequest?.destination || 'Destino',
          distanceKm: activeRideRequest?.originalDistanceKm || incomingRide?.distanceKm || 5.0,
          price: activeRideRequest?.originalPrice || incomingRide?.totalFare || 20.0,
          category: incomingRide?.category || activeRideRequest?.category || 'W-CARRO COMUM',
          passengerName: incomingRide?.passengerName || activeRideRequest?.passengerName || 'Passageiro',
        }}
        driverCode={user.userCode}
        driverName={user.name}
        driverCoords={activeRideRequest?.pickupCoords || { lat: -7.1195, lng: -34.8450 }}
      />
    </div>
  );
};
