import React, { useState } from 'react';
import { TransportContract, Driver, PlatformConfig } from '../types';
import {
  FileText,
  Plus,
  Shield,
  Clock,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Car,
  Bike,
  User,
  MapPin,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface ContractsManagementModuleProps {
  contracts: TransportContract[];
  drivers?: Driver[];
  safePoints?: any[];
  config?: PlatformConfig;
  onAddContract: (contract: TransportContract) => void;
  onUpdateContractStatus: (id: string, newStatus: TransportContract['status']) => void;
}

export const ContractsManagementModule: React.FC<ContractsManagementModuleProps> = ({
  contracts,
  drivers = [],
  safePoints = [],
  config,
  onAddContract,
  onUpdateContractStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState<'todos' | 'semanal' | 'quinzenal' | 'mensal'>('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'em_analise' | 'suspenso'>('todos');
  const [isCreating, setIsCreating] = useState(false);

  const [clientName, setClientName] = useState('');
  const [clientCode, setClientCode] = useState(`W-${Math.floor(711 + Math.random() * 80)}`);
  const [clientType, setClientType] = useState<TransportContract['clientType']>('trabalhador_clt');
  const [period, setPeriod] = useState<TransportContract['period']>('mensal');
  const [category, setCategory] = useState<TransportContract['category']>('W-CARRO COMUM');
  const [dailyDistanceKm, setDailyDistanceKm] = useState(12);
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [pickupTime, setPickupTime] = useState('08:00');
  const [returnTime, setReturnTime] = useState('18:00');
  const [hasSafePoint, setHasSafePoint] = useState(false);
  const [safePointDetails, setSafePointDetails] = useState('');
  const [assignedDriverId, setAssignedDriverId] = useState('drv-2');
  const [observations, setObservations] = useState('');

  const getContractRate = (cat: TransportContract['category']) => {
    switch (cat) {
      case 'W-MOTO COMUM':
        return 1.0;
      case 'W-CARRO COMUM':
        return 1.75;
      case 'W-CARRO PRIME':
        return 2.0;
      case 'W-EXECUTIVO':
        return 3.0;
      case 'W-LUXO':
        return 4.5;
      default:
        return 1.75;
    }
  };

  const currentRate = getContractRate(category);
  const calculatedDailyValue = Math.round(dailyDistanceKm * currentRate * 100) / 100;
  const daysInPeriod = period === 'semanal' ? 5 : period === 'quinzenal' ? 11 : 22;
  const calculatedTotalValue = Math.round(calculatedDailyValue * daysInPeriod * 100) / 100;
  const driverShare = Math.round(calculatedTotalValue * 0.9 * 100) / 100;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !originAddress.trim() || !destinationAddress.trim()) {
      alert('Preencha os campos obrigatórios do contrato.');
      return;
    }
    const assignedDriver = drivers.find((d) => d.id === assignedDriverId);
    const newContract: TransportContract = {
      id: `ctr-${Date.now()}`,
      contractNumber: `W-CTR-2026-00${contracts.length + 1}`,
      clientName,
      clientCode,
      clientType,
      period,
      category,
      fixedRatePerKm: currentRate,
      dailyDistanceKm,
      dailyValue: calculatedDailyValue,
      totalPeriodValue: calculatedTotalValue,
      hasSafePoint,
      safePointDetails: hasSafePoint ? safePointDetails : undefined,
      originAddress,
      destinationAddress,
      pickupTime,
      returnTime,
      status: 'ativo',
      prepaidStatus: 'pago',
      assignedDriverId,
      assignedDriverName: assignedDriver ? `${assignedDriver.name} (${assignedDriver.userCode})` : 'A definir',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + daysInPeriod * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      observations: observations || 'Tarifa contratual 100% blindada contra dinâmica e intempéries.',
    };
    onAddContract(newContract);
    setIsCreating(false);
    setClientName('');
    setOriginAddress('');
    setDestinationAddress('');
    setSafePointDetails('');
    setHasSafePoint(false);
  };

  const filteredContracts = contracts.filter((c) => {
    const search = (searchTerm || '').toLowerCase();
    const matchesSearch =
      (c.clientName?.toLowerCase() || '').includes(search) ||
      (c.contractNumber?.toLowerCase() || '').includes(search) ||
      (c.clientCode?.toLowerCase() || '').includes(search) ||
      (c.originAddress?.toLowerCase() || '').includes(search) ||
      (c.destinationAddress?.toLowerCase() || '').includes(search);
    const matchesPeriod = periodFilter === 'todos' || c.period === periodFilter;
    const matchesStatus = statusFilter === 'todos' || c.status === statusFilter;
    return matchesSearch && matchesPeriod && matchesStatus;
  });

  const totalActive = contracts.filter((c) => c.status === 'ativo').length;
  const totalMonthlyBilling = contracts
    .filter((c) => c.status === 'ativo')
    .reduce((acc, c) => acc + c.totalPeriodValue, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#14171c] border border-[#1e242b] rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#83d600]/10 text-[#83d600] border border-[#83d600]/30">
                <FileText className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Gestão de Contratos de Transporte – W-DRIVER
              </h2>
            </div>
            <p className="text-sm text-[#94a3b8] max-w-2xl">
              Viagens contratuais pré-pagas (semanais, quinzenais e mensais).{' '}
              <strong className="text-white">Regra Absoluta:</strong> Preço fixo por km durante todo o período, sem
              dinâmica, chuva ou trânsito.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="px-4 py-2.5 bg-[#83d600] hover:bg-[#9de61a] text-black font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(131,214,0,0.3)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Contrato Pré-Pago</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#1e242b]">
          <div className="bg-[#0a0b0d] p-3 rounded-xl border border-[#1e242b]">
            <span className="text-[10px] uppercase font-bold text-[#94a3b8] block">Contratos Ativos</span>
            <span className="text-xl font-mono font-black text-white">{totalActive}</span>
            <span className="text-[10px] text-[#83d600] block mt-0.5">100% Blindados s/ dinâmica</span>
          </div>
          <div className="bg-[#0a0b0d] p-3 rounded-xl border border-[#1e242b]">
            <span className="text-[10px] uppercase font-bold text-[#94a3b8] block">Faturamento Mensal</span>
            <span className="text-xl font-mono font-black text-[#83d600]">
              R$ {totalMonthlyBilling.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-[#94a3b8] block mt-0.5">Pagamento 100% Antecipado</span>
          </div>
          <div className="bg-[#0a0b0d] p-3 rounded-xl border border-[#1e242b]">
            <span className="text-[10px] uppercase font-bold text-[#94a3b8] block">Repasse Motoristas (90%)</span>
            <span className="text-xl font-mono font-black text-white">
              R$ {(totalMonthlyBilling * 0.9).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-[#83d600] block mt-0.5">Fidelidade garantida</span>
          </div>
          <div className="bg-[#0a0b0d] p-3 rounded-xl border border-[#1e242b]">
            <span className="text-[10px] uppercase font-bold text-[#94a3b8] block">Receita Central (10%)</span>
            <span className="text-xl font-mono font-black text-emerald-400">
              R$ {(totalMonthlyBilling * 0.1).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-[#94a3b8] block mt-0.5">Sem inadimplência</span>
          </div>
        </div>
      </div>

      {isCreating && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-[#14171c] border-2 border-[#83d600]/40 rounded-2xl p-5 sm:p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#1e242b] mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#83d600] animate-ping" />
              <h3 className="text-base sm:text-lg font-black text-white">
                Elaboração de Novo Contrato Oficial W-DRIVER
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-[#94a3b8] hover:text-white px-2 py-1 bg-[#1e242b] rounded-lg"
            >
              Cancelar
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[#94a3b8] block mb-1">Nome do Passageiro / Empresa <span className="text-[#83d600] font-normal text-[11px]">(Obrigatório)</span></label>
              <input
                type="text"
                placeholder="Ex: Dra. Patrícia Meireles"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-[#0a0b0d] border border-[#1e242b] rounded-xl px-3 py-2 text-white text-sm focus:border-[#83d600] focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#94a3b8] block mb-1">Código do Usuário (W-XXXX) <span className="text-[#83d600] font-normal text-[11px]">(Obrigatório)</span></label>
              <input
                type="text"
                value={clientCode}
                onChange={(e) => setClientCode(e.target.value)}
                className="w-full bg-[#0a0b0d] border border-[#1e242b] rounded-xl px-3 py-2 text-[#83d600] font-mono text-sm font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#94a3b8] block mb-1">Período de Contrato</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="w-full bg-[#0a0b0d] border border-[#1e242b] rounded-xl px-3 py-2 text-white text-sm focus:outline-none font-medium"
              >
                <option value="mensal">Mensal (22 dias úteis)</option>
                <option value="quinzenal">Quinzenal (11 dias úteis)</option>
                <option value="semanal">Semanal (5 dias úteis)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#94a3b8] block mb-1">Categoria Contratual</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#0a0b0d] border border-[#1e242b] rounded-xl px-3 py-2 text-white text-sm focus:outline-none font-medium"
              >
                <option value="W-MOTO COMUM">W-MOTO COMUM (R$ 1,00/km fixo)</option>
                <option value="W-CARRO COMUM">W-CARRO COMUM (R$ 1,75/km fixo)</option>
                <option value="W-CARRO PRIME">W-CARRO PRIME (R$ 2,00/km fixo)</option>
                <option value="W-EXECUTIVO">W-EXECUTIVO (R$ 3,00/km fixo)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#94a3b8] block mb-1">
                Quilometragem Diária: <span className="text-[#83d600] font-mono">{dailyDistanceKm} km</span>
              </label>
              <input
                type="number"
                min="2"
                max="100"
                step="0.5"
                value={dailyDistanceKm}
                onChange={(e) => setDailyDistanceKm(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0a0b0d] border border-[#1e242b] rounded-xl px-3 py-2 text-white text-sm focus:border-[#83d600] focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#94a3b8] block mb-1">Endereço de Origem <span className="text-[#83d600] font-normal text-[11px]">(Obrigatório)</span></label>
              <input
                type="text"
                placeholder="Ex: Bessa, Edifício Costa do Sol"
                value={originAddress}
                onChange={(e) => setOriginAddress(e.target.value)}
                className="w-full bg-[#0a0b0d] border border-[#1e242b] rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#94a3b8] block mb-1">Endereço de Destino <span className="text-[#83d600] font-normal text-[11px]">(Obrigatório)</span></label>
              <input
                type="text"
                placeholder="Ex: Av. Epitácio Pessoa (Clínicas)"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                className="w-full bg-[#0a0b0d] border border-[#1e242b] rounded-xl px-3 py-2 text-white text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-[#0a0b0d] via-[#10141b] to-[#0a0b0d] border border-[#83d600]/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <span className="text-[10px] text-[#94a3b8] block uppercase">Tarifa Contratual</span>
                <span className="text-sm font-mono font-bold text-white">
                  R$ {currentRate.toFixed(2)} / km <span className="text-[#83d600] text-xs">(Fixo Sem Dinâmica)</span>
                </span>
              </div>
              <div className="border-l border-[#1e242b] pl-4">
                <span className="text-[10px] text-[#94a3b8] block uppercase">Total do Período ({daysInPeriod} dias)</span>
                <span className="text-base font-mono font-black text-[#83d600]">
                  R$ {calculatedTotalValue.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#83d600] hover:bg-[#9de61a] text-black font-black text-sm rounded-xl transition-all shadow-[0_0_15px_rgba(131,214,0,0.3)] flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Homologar Contrato</span>
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredContracts.map((contract) => (
          <div
            key={contract.id}
            className="bg-[#14171c] border border-[#1e242b] hover:border-[#2a3442] rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0a0b0d] border border-[#1e242b] flex items-center justify-center text-[#83d600] font-black text-sm">
                    {contract.clientCode}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">{contract.clientName}</h4>
                    <span className="text-xs text-[#94a3b8]">
                      {contract.period} • <strong className="text-white">{contract.category}</strong>
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono font-black text-[#83d600]">
                  R$ {contract.totalPeriodValue.toFixed(2)}
                </span>
              </div>
              <div className="mt-4 p-3 bg-[#0a0b0d] rounded-xl border border-[#1e242b] flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#83d600] shrink-0" />
                  <span className="text-white truncate font-medium">{contract.originAddress}</span>
                </div>
                <div className="flex items-center gap-2 border-t border-[#1a202a] pt-2">
                  <div className="w-2 h-2 rounded-full bg-[#ef4444] shrink-0" />
                  <span className="text-white truncate font-medium">{contract.destinationAddress}</span>
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-[#1e242b] flex items-center justify-between gap-3 text-xs">
              <span className="text-[#94a3b8]">Motorista: <strong className="text-white">{contract.assignedDriverName}</strong></span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                Ativo – Blindado
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
