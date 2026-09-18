import React, { useState } from 'react';
import { SystemMilestone } from '../types';
import {
  Trophy,
  Award,
  Sparkles,
  PartyPopper,
  Calendar,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  UserPlus,
  Car,
  Clock,
  ChevronRight,
} from 'lucide-react';

interface MilestonesAndCelebrationsModuleProps {
  milestones: SystemMilestone[];
  totalGrossRevenue?: number;
  totalCompletedRides?: number;
  totalDriversCount?: number;
}

export const MilestonesAndCelebrationsModule: React.FC<MilestonesAndCelebrationsModuleProps> = ({
  milestones = [],
  totalGrossRevenue = 0,
  totalCompletedRides = 0,
  totalDriversCount = 7,
}) => {
  const [filterType, setFilterType] = useState<string>('todos');

  const filtered = milestones.filter((m) => {
    if (filterType === 'todos') return true;
    return m.type === filterType;
  });

  const getMilestoneIcon = (type: SystemMilestone['type']) => {
    switch (type) {
      case 'cadastro':
        return <UserPlus className="w-5 h-5 text-blue-400" />;
      case 'corrida_iniciada':
      case 'corrida_concluida':
        return <Car className="w-5 h-5 text-[#83d600]" />;
      case 'pagamento':
      case 'faturamento':
        return <DollarSign className="w-5 h-5 text-yellow-400" />;
      default:
        return <Award className="w-5 h-5 text-purple-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header Conquistas */}
      <div className="bg-[#14171c] border border-[#232b38] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                <Trophy className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Metas, Conquistas & Comemorações W-DRIVER
              </h2>
            </div>
            <p className="text-sm text-[#94a3b8] max-w-2xl">
              Registro histórico autêntico de marcos operacionais alcançados pela frota oficial em João Pessoa.
              Celebração da escala sustentável com taxa fixa de 10%.
            </p>
          </div>

          <div className="bg-[#0a0b0d] border border-[#1e242b] px-4 py-2.5 rounded-xl flex items-center gap-3">
            <PartyPopper className="w-5 h-5 text-yellow-400" />
            <div>
              <span className="text-[10px] text-[#94a3b8] block uppercase font-bold">Marcos Registrados</span>
              <span className="text-sm font-black text-white font-mono">{milestones.length} Conquistas</span>
            </div>
          </div>
        </div>

        {/* Resumo de Metas Atuais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-[#1e242b]">
          <div className="bg-[#0a0b0d] border border-[#1e242b] p-4 rounded-xl">
            <span className="text-[10px] text-[#94a3b8] uppercase font-bold block mb-1">
              Motoristas Fundadores & Ativos
            </span>
            <div className="text-2xl font-black text-white font-mono">{totalDriversCount} / 10</div>
            <div className="w-full bg-[#1e242b] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#83d600] h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (totalDriversCount / 10) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-[#83d600] mt-1.5 block">Meta inicial da frota piloto</span>
          </div>

          <div className="bg-[#0a0b0d] border border-[#1e242b] p-4 rounded-xl">
            <span className="text-[10px] text-[#94a3b8] uppercase font-bold block mb-1">
              Corridas Concluídas Registradas
            </span>
            <div className="text-2xl font-black text-white font-mono">{totalCompletedRides}</div>
            <span className="text-[10px] text-[#94a3b8] mt-1.5 block">Todas com recibo e divisão 10/90</span>
          </div>

          <div className="bg-[#0a0b0d] border border-[#1e242b] p-4 rounded-xl">
            <span className="text-[10px] text-[#94a3b8] uppercase font-bold block mb-1">
              Faturamento Acumulado Auditado
            </span>
            <div className="text-2xl font-black text-yellow-400 font-mono">
              R$ {totalGrossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-yellow-400/80 mt-1.5 block">Volume real registrado no W-BANK</span>
          </div>
        </div>
      </div>

      {/* Linha do Tempo dos Marcos */}
      <div className="bg-[#14171c] border border-[#232b38] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <span>Linha do Tempo dos Marcos Reais ({filtered.length})</span>
          </h3>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="py-1.5 px-3 bg-[#0a0b0d] border border-[#232b38] rounded-xl text-xs text-white focus:outline-none focus:border-[#83d600]"
          >
            <option value="todos">Todos os Marcos</option>
            <option value="cadastro">Cadastros</option>
            <option value="corrida_concluida">Corridas</option>
            <option value="faturamento">Faturamento</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#94a3b8] bg-[#0a0b0d] rounded-xl border border-[#1e242b]">
            Nenhum marco registrado com este filtro.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((m, idx) => (
              <div
                key={m.id || idx}
                className="p-4 bg-[#0a0b0d] border border-[#1e242b] hover:border-[#83d600]/40 rounded-2xl transition-all flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-[#14171c] border border-[#232b38] flex items-center justify-center shrink-0">
                  {getMilestoneIcon(m.type)}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-black text-white">{m.title}</h4>
                    <span className="text-[11px] font-mono text-[#94a3b8] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {m.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-[#cbd5e1] mt-1">{m.description}</p>
                  {m.value && (
                    <div className="mt-2 inline-block px-2.5 py-1 rounded bg-[#83d600]/10 border border-[#83d600]/30 text-xs font-mono font-bold text-[#83d600]">
                      Valor: R$ {m.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
