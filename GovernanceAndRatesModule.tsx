import React, { useState } from 'react';
import {
  AuditLog,
  BlockedUserPair,
  CategoryRule,
  DynamicPeakHour,
  PlatformConfig,
  RideCategory,
  RideMediaRecord,
  SafePoint,
  StateOperation,
} from '../types';
import { calculateRidePrice } from '../mockData';
import { WLogo } from './WLogo';
import {
  Shield,
  DollarSign,
  TrendingUp,
  MapPin,
  Image,
  FileCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Sliders,
  Sparkles,
  Upload,
  RefreshCw,
  Info,
  Car,
  Bike,
  Plus,
  Search,
  Building2,
  Check,
  Video,
  Mic,
  Download,
  Trash2,
  Archive,
  UserX,
  Play,
  HardDrive,
} from 'lucide-react';

export interface MunicipalityOperation {
  id: string;
  name: string;
  uf: string;
  region: string;
  status: 'liberado' | 'bloqueado';
  activeDrivers: number;
  activePassengers: number;
  isCapital?: boolean;
}

const INITIAL_PB_MUNICIPALITIES: MunicipalityOperation[] = [
  {
    id: 'mun-jp',
    name: 'João Pessoa',
    uf: 'PB',
    region: 'Litoral / Polo Operacional Central',
    status: 'liberado',
    activeDrivers: 7,
    activePassengers: 142,
    isCapital: true,
  },
  {
    id: 'mun-cg',
    name: 'Campina Grande',
    uf: 'PB',
    region: 'Agreste Paraibano',
    status: 'bloqueado',
    activeDrivers: 0,
    activePassengers: 0,
  },
  {
    id: 'mun-sr',
    name: 'Santa Rita',
    uf: 'PB',
    region: 'Região Metropolitana de João Pessoa',
    status: 'bloqueado',
    activeDrivers: 0,
    activePassengers: 0,
  },
  {
    id: 'mun-patos',
    name: 'Patos',
    uf: 'PB',
    region: 'Sertão Paraibano',
    status: 'bloqueado',
    activeDrivers: 0,
    activePassengers: 0,
  },
  {
    id: 'mun-cabedelo',
    name: 'Cabedelo',
    uf: 'PB',
    region: 'Região Metropolitana / Porto de Cabedelo',
    status: 'bloqueado',
    activeDrivers: 0,
    activePassengers: 0,
  },
];

interface GovernanceAndRatesModuleProps {
  config: PlatformConfig;
  states: StateOperation[];
  safePoints: SafePoint[];
  auditLogs: AuditLog[];
  mediaRecords?: RideMediaRecord[];
  onAddMediaRecord?: (record: RideMediaRecord) => void;
  onArchiveMediaRecord?: (id: string) => void;
  onDeleteMediaRecord?: (id: string) => void;
  blockedPairs?: BlockedUserPair[];
  onRemoveBlockedPair?: (id: string) => void;
  onUpdateConfig: (newConfig: Partial<PlatformConfig>) => void;
  onToggleStateStatus: (uf: string) => void;
  onAddSafePoint: (safePoint: SafePoint) => void;
  onAddAuditLog: (log: AuditLog) => void;
}

export const GovernanceAndRatesModule: React.FC<GovernanceAndRatesModuleProps> = ({
  config,
  states,
  safePoints,
  auditLogs,
  mediaRecords = [],
  onAddMediaRecord,
  onArchiveMediaRecord,
  onDeleteMediaRecord,
  blockedPairs = [],
  onRemoveBlockedPair,
  onUpdateConfig,
  onToggleStateStatus,
  onAddSafePoint,
  onAddAuditLog,
}) => {
  const [activeTab, setActiveTab] = useState<'tarifas' | 'dinamica' | 'estados' | 'pontos_seguros' | 'midia_vault' | 'bloqueios_regras' | 'identidade' | 'auditoria'>('tarifas');
  const [selectedTerritoryUf, setSelectedTerritoryUf] = useState<string>('PB');
  const [municipalitySearch, setMunicipalitySearch] = useState<string>('');
  const [pbMunicipalities, setPbMunicipalities] = useState<MunicipalityOperation[]>(INITIAL_PB_MUNICIPALITIES);

  const [calcCategory, setCalcCategory] = useState<RideCategory>('W-CARRO COMUM');
  const [calcDistanceKm, setCalcDistanceKm] = useState(5.0);
  const [calcIsContract, setCalcIsContract] = useState(false);

  const [newSafePointNeighborhood, setNewSafePointNeighborhood] = useState('');
  const [newSafePointAddress, setNewSafePointAddress] = useState('');
  const [newSafePointName, setNewSafePointName] = useState('');
  const [newSafePointJustification, setNewSafePointJustification] = useState('');

  const calculationResult = calculateRidePrice(calcCategory, calcDistanceKm, config, calcIsContract);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#14171c] border border-[#1e242b] rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#83d600]/10 text-[#83d600] border border-[#83d600]/30">
                <Shield className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Governança, Tarifas & Dinâmica W-DRIVER
              </h2>
            </div>
            <p className="text-sm text-[#94a3b8] max-w-2xl">
              Configurações oficiais de tarifas transparentes, regras dos 4 km, horários de pico, liberação de estados (PB ativo), pontos seguros e histórico de auditoria.
            </p>
          </div>
          <div className="bg-[#0a0b0d] border border-[#1e242b] px-4 py-2.5 rounded-xl flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-[#83d600] animate-ping" />
            <div>
              <span className="text-[10px] text-[#94a3b8] block uppercase font-bold">Estado Principal Ativo</span>
              <span className="text-sm font-black text-white font-mono">PARAÍBA (PB) – LIBERADO</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[#1e242b] overflow-x-auto pb-1">
          {[
            { id: 'tarifas', label: 'Tabela de Tarifas', icon: DollarSign },
            { id: 'dinamica', label: 'Dinâmica & Picos', icon: TrendingUp },
            { id: 'estados', label: 'Regra de Estados (PB)', icon: MapPin },
            { id: 'pontos_seguros', label: 'Pontos Seguros', icon: Shield },
            { id: 'auditoria', label: 'Logs de Auditoria', icon: FileCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#83d600] text-black shadow-[0_0_15px_rgba(131,214,0,0.3)]'
                    : 'bg-[#0a0b0d] text-[#94a3b8] hover:text-white border border-[#1e242b]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'tarifas' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="bg-[#14171c] border border-[#1e242b] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-[#83d600]" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Regra Oficial de Cobrança W-DRIVER (Viagens Avulsas vs Contratos)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#cbd5e1]">
              <div className="bg-[#0a0b0d] p-3.5 rounded-xl border border-[#1e242b] flex flex-col gap-1.5">
                <span className="font-bold text-[#83d600] text-sm">Viagens Avulsas – Regra dos 4 km:</span>
                <p><strong>Até 4 km:</strong> aplica-se o valor fixo/mínimo da categoria.</p>
                <p><strong>Acima de 4 km:</strong> quilometragem TOTAL multiplicada pelo valor do km da categoria.</p>
                <p>Divisão: 10% Central / 90% Motorista.</p>
              </div>
              <div className="bg-[#0a0b0d] p-3.5 rounded-xl border border-[#1e242b] flex flex-col gap-1.5">
                <span className="font-bold text-[#83d600] text-sm">Viagens Contratuais – 100% Blindadas:</span>
                <p><strong>Preço Fixo:</strong> R$ 1,00/km para W-MOTO COMUM e R$ 1,75/km para W-CARRO COMUM.</p>
                <p><strong>Sem Dinâmica:</strong> O valor não se altera por chuva, trânsito ou horário.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#14171c] border-2 border-[#83d600]/30 rounded-2xl p-5 sm:p-6 shadow-xl">
            <h3 className="text-base font-black text-white flex items-center gap-2 mb-4">
              <Sliders className="w-5 h-5 text-[#83d600]" />
              <span>Simulador Interativo de Cobrança</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-[#94a3b8] block mb-1">Categoria Selecionada</label>
                <select
                  value={calcCategory}
                  onChange={(e) => setCalcCategory(e.target.value as any)}
                  className="w-full bg-[#0a0b0d] border border-[#1e242b] rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none"
                >
                  <option value="W-MOTO COMUM">W-MOTO COMUM</option>
                  <option value="W-CARRO COMUM">W-CARRO COMUM</option>
                  <option value="W-CARRO PRIME">W-CARRO PRIME</option>
                  <option value="W-EXECUTIVO">W-EXECUTIVO</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-[#94a3b8] block mb-1">
                  Distância Total: <span className="text-[#83d600] font-mono">{calcDistanceKm} km</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={calcDistanceKm}
                  onChange={(e) => setCalcDistanceKm(parseFloat(e.target.value))}
                  className="w-full accent-[#83d600] h-2 bg-[#0a0b0d] rounded-lg mt-2 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#94a3b8] block mb-1">Tipo de Corrida</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcIsContract(false)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      !calcIsContract ? 'bg-[#83d600] text-black' : 'bg-[#0a0b0d] text-[#94a3b8] border border-[#1e242b]'
                    }`}
                  >
                    Viagem Avulsa
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcIsContract(true)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      calcIsContract ? 'bg-[#83d600] text-black' : 'bg-[#0a0b0d] text-[#94a3b8] border border-[#1e242b]'
                    }`}
                  >
                    Contrato Pré-Pago
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-5 p-4 rounded-xl bg-[#0a0b0d] border border-[#1e242b] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#94a3b8] block uppercase font-bold">Fórmula Aplicada</span>
                <span className="text-sm font-mono font-bold text-white block mt-0.5">
                  {calculationResult.ruleExplanation}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#83d600] block uppercase font-bold">Preço Final</span>
                <span className="text-xl font-mono font-black text-[#83d600]">
                  R$ {calculationResult.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'estados' && (
        <div className="bg-[#14171c] border border-[#1e242b] rounded-2xl p-5 sm:p-6">
          <h3 className="text-base font-black text-white mb-2">Regra de Estados – Operação Habilitada para a Paraíba</h3>
          <p className="text-xs text-[#94a3b8] mb-4">Apenas estados liberados aceitam corridas.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {states.map((st) => (
              <div key={st.uf} className="p-4 rounded-xl border bg-[#0a0b0d] border-[#1e242b] flex items-center justify-between">
                <div>
                  <strong className="text-white block">{st.name} ({st.uf})</strong>
                  <span className="text-xs text-[#83d600]">{st.status === 'liberado' ? '🟢 Liberado' : '🔴 Bloqueado'}</span>
                </div>
                <button
                  onClick={() => onToggleStateStatus(st.uf)}
                  className="px-3 py-1 bg-[#1e242b] hover:bg-[#252c38] text-xs font-bold rounded"
                >
                  {st.status === 'liberado' ? 'Bloquear' : 'Liberar'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
