import React, { useState, useEffect } from 'react';
import { PlatformConfig } from '../types';
import { Clock, Target, Award, TrendingUp, Zap, CheckCircle2, Play, Pause, Edit3, Save, Sparkles, Flag, PartyPopper } from 'lucide-react';

interface ShiftGoalPanelProps {
  config: PlatformConfig;
  corridasHoje: number;
  onIncrementCorrida: () => void;
  onUpdateConfig: (newConfig: Partial<PlatformConfig>) => void;
}

export const ShiftGoalPanel: React.FC<ShiftGoalPanelProps> = ({
  config,
  corridasHoje,
  onIncrementCorrida,
  onUpdateConfig,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [customGoal, setCustomGoal] = useState(config.dailyGoal);
  const [shift1Start, setShift1Start] = useState(config.shift1Start);
  const [shift1End, setShift1End] = useState(config.shift1End);
  const [shift2Start, setShift2Start] = useState(config.shift2Start);
  const [shift2End, setShift2End] = useState(config.shift2End);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getShiftStatus = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const timeMinutes = hours * 60 + minutes;
    const parseMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const s1Start = parseMinutes(config.shift1Start);
    const s1End = parseMinutes(config.shift1End);
    const s2Start = parseMinutes(config.shift2Start);
    const s2End = parseMinutes(config.shift2End);

    if (timeMinutes >= s1Start && timeMinutes <= s1End) {
      return {
        label: 'TURNO 1 ATIVO (Manhã)',
        active: true,
        shift: 1,
        color: 'text-[#83d600]',
        bg: 'bg-[#83d600]/15',
        border: 'border-[#83d600]',
        desc: 'Foco em clínicas, escritórios e comércio na Torre/Centro.',
      };
    } else if (timeMinutes > s1End && timeMinutes < s2Start) {
      return {
        label: 'INTERVALO DE ALMOÇO & RECARGA',
        active: false,
        shift: 0,
        color: 'text-[#ffc107]',
        bg: 'bg-[#ffc107]/15',
        border: 'border-[#ffc107]',
        desc: 'Intervalo programado para almoço, descanso e recarga.',
      };
    } else if (timeMinutes >= s2Start && timeMinutes <= s2End) {
      return {
        label: 'TURNO 2 ATIVO (Tarde / Pico Noturno)',
        active: true,
        shift: 2,
        color: 'text-[#83d600]',
        bg: 'bg-[#83d600]/15',
        border: 'border-[#83d600]',
        desc: 'Pico de saídas de colégios, shoppings, orla e fim de expediente.',
      };
    } else {
      return {
        label: 'FORA DO EXPEDIENTE (Repouso)',
        active: false,
        shift: 3,
        color: 'text-[#94a3b8]',
        bg: 'bg-[#1e242b]',
        border: 'border-[#2a3442]',
        desc: 'Horário fora da rotina estipulada de 8h diárias.',
      };
    }
  };

  const shiftStatus = getShiftStatus();
  const targetGoal = config.dailyGoal > 0 ? config.dailyGoal : 1;
  const progressRatio = Math.min(1, Math.max(0, corridasHoje / targetGoal));
  const rawPercentage = Math.round((corridasHoje / targetGoal) * 100);
  const goalPercentage = Math.min(100, rawPercentage);

  const r1 = Math.round(100 + (131 - 100) * progressRatio);
  const g1 = Math.round(116 + (214 - 116) * progressRatio);
  const b1 = Math.round(139 + (0 - 139) * progressRatio);
  const r2 = Math.round(125 + (163 - 125) * progressRatio);
  const g2 = Math.round(140 + (243 - 140) * progressRatio);
  const b2 = Math.round(160 + (31 - 160) * progressRatio);
  const dynamicBarColor = `rgb(${r1}, ${g1}, ${b1})`;
  const dynamicBarGradient = `linear-gradient(90deg, rgb(${r1}, ${g1}, ${b1}) 0%, rgb(${r2}, ${g2}, ${b2}) 100%)`;
  const dynamicGlow = progressRatio > 0.25
    ? `0 0 ${Math.round(progressRatio * 18)}px rgba(131, 214, 0, ${(progressRatio * 0.6).toFixed(2)})`
    : 'none';

  const getGoalStatus = () => {
    if (rawPercentage >= 100) {
      return {
        label: 'Meta Diária Batida!',
        statusText: 'Excelente rendimento! Turno de alta produtividade alcançado.',
        badgeClass: 'bg-[#83d600]/20 text-[#83d600] border-[#83d600]',
        icon: '🏆',
      };
    }
    if (rawPercentage >= 75) {
      return {
        label: 'Reta Final da Meta (75%+)',
        statusText: 'Próximo do verde-pera pleno! Restam poucas corridas para fechar.',
        badgeClass: 'bg-[#83d600]/15 text-[#83d600] border-[#83d600]/50',
        icon: '⚡',
      };
    }
    if (rawPercentage >= 50) {
      return {
        label: 'Metade Concluída (50%+)',
        statusText: 'Transição cromática acelerando em direção ao verde-pera.',
        badgeClass: 'bg-[#ffc107]/15 text-[#ffc107] border-[#ffc107]/40',
        icon: '🔥',
      };
    }
    return {
      label: 'Início da Jornada (Cinza)',
      statusText: 'Iniciando o turno de corridas do dia.',
      badgeClass: 'bg-[#1e242b] text-[#94a3b8] border-[#2a3442]',
      icon: '🚗',
    };
  };

  const goalStatus = getGoalStatus();
  const estimatedTicketAverage = 18.5;
  const projectedEarningsToday = corridasHoje * estimatedTicketAverage * (1 - config.commissionRate / 100);
  const projectedCommissionToday = corridasHoje * estimatedTicketAverage * (config.commissionRate / 100);

  const handleSaveConfig = () => {
    onUpdateConfig({
      dailyGoal: Number(customGoal),
      shift1Start,
      shift1End,
      shift2Start,
      shift2End,
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-[#14171c] border border-[#1e242b] rounded-xl p-4 sm:p-5 shadow-lg flex flex-col gap-5">
      <div className="shift-goal-header flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-3.5 border-b border-[#1e242b]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#83d600]/10 border border-[#83d600]/30 text-[#83d600] shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                Painel de Horários & Metas – Rotina Solo de 8h
              </h2>
              <span className="text-[10px] bg-[#1e242b] text-[#94a3b8] px-2 py-0.5 rounded font-mono font-bold">
                W-SOLO
              </span>
            </div>
            <p className="text-xs text-[#94a3b8]">Gestão profissional de disciplina, turnos e produtividade diária</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 bg-[#0a0b0d] border border-[#1e242b] px-3 py-2 rounded-xl">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wide">Meta:</span>
            <span className="text-xs font-mono font-black text-white">
              {corridasHoje} <span className="text-[#94a3b8] font-normal">/ {config.dailyGoal}</span>
            </span>
            <span
              className="text-[11px] font-mono font-bold px-1.5 py-0.2 rounded border transition-colors"
              style={{
                color: dynamicBarColor,
                borderColor: `rgba(${r1}, ${g1}, ${b1}, 0.35)`,
                backgroundColor: `rgba(${r1}, ${g1}, ${b1}, 0.1)`,
              }}
            >
              {rawPercentage}%
            </span>
          </div>
          <div className="w-full sm:w-36 lg:w-44 h-2.5 bg-[#10141a] rounded-full overflow-hidden p-0.5 border border-[#272f3a] relative">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
              style={{
                width: `${goalPercentage}%`,
                background: dynamicBarGradient,
                boxShadow: dynamicGlow,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 shrink-0 ${goalStatus.badgeClass}`}>
            <span>{goalStatus.icon}</span>
            <span className="hidden sm:inline">{goalStatus.label}</span>
          </span>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          {rawPercentage >= 100 && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#83d600]/25 via-[#83d600]/15 to-[#83d600]/25 border border-[#83d600] px-2.5 py-1 rounded-lg shadow-[0_0_15px_rgba(131,214,0,0.3)] animate-pulse">
              <PartyPopper className="w-3.5 h-3.5 text-[#83d600]" />
              <span className="text-[11px] font-black text-white tracking-wide">
                🎉 Batida!
              </span>
            </div>
          )}
          <div className="bg-[#0a0b0d] border border-[#1e242b] px-3 py-1.5 rounded-lg flex items-center gap-2 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-[#83d600] animate-pulse" />
            <span className="text-white font-bold">{formatTime(currentTime)}</span>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 bg-[#1a1f27] hover:bg-[#252c38] text-[#94a3b8] hover:text-white rounded-lg border border-[#2a3442] transition-all text-xs flex items-center gap-1"
          >
            {isEditing ? <Save className="w-3.5 h-3.5 text-[#83d600]" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isEditing ? 'Fechar' : 'Ajustar'}</span>
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="bg-[#0f1115] border border-[#2a3442] p-3 rounded-lg flex flex-col gap-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span>⚙️ Personalizar Parâmetros de Trabalho</span>
            <button
              onClick={handleSaveConfig}
              className="bg-[#83d600] text-black px-3 py-1 rounded font-bold hover:opacity-90"
            >
              Salvar Metas
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-[#94a3b8] block">Meta Diária (Corridas)</label>
              <input
                type="number"
                value={customGoal}
                onChange={(e) => setCustomGoal(Number(e.target.value))}
                className="w-full bg-[#181d24] border border-[#2a3442] rounded px-2 py-1 text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#94a3b8] block">Início Turno 1</label>
              <input
                type="text"
                value={shift1Start}
                onChange={(e) => setShift1Start(e.target.value)}
                className="w-full bg-[#181d24] border border-[#2a3442] rounded px-2 py-1 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#94a3b8] block">Fim Turno 1</label>
              <input
                type="text"
                value={shift1End}
                onChange={(e) => setShift1End(e.target.value)}
                className="w-full bg-[#181d24] border border-[#2a3442] rounded px-2 py-1 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#94a3b8] block">Início Turno 2</label>
              <input
                type="text"
                value={shift2Start}
                onChange={(e) => setShift2Start(e.target.value)}
                className="w-full bg-[#181d24] border border-[#2a3442] rounded px-2 py-1 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#94a3b8] block">Fim Turno 2</label>
              <input
                type="text"
                value={shift2End}
                onChange={(e) => setShift2End(e.target.value)}
                className="w-full bg-[#181d24] border border-[#2a3442] rounded px-2 py-1 text-white font-mono"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            shiftStatus.shift === 1
              ? 'bg-[#83d600]/10 border-[#83d600] ring-1 ring-[#83d600]/40'
              : 'bg-[#0f1115] border-[#1e242b]'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              🌅 1º Turno (Manhã)
            </span>
            <span className="text-[#83d600] font-mono font-bold">{config.shift1Start} - {config.shift1End}</span>
          </div>
          <div className="text-[11px] text-[#94a3b8] mb-2">1h 30min • Abertura Comercial / Saúde</div>
          <div className="w-full bg-[#1a1f26] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#83d600] h-full" style={{ width: shiftStatus.shift === 1 ? '70%' : '100%' }}></div>
          </div>
        </div>
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            shiftStatus.shift === 0
              ? 'bg-[#ffc107]/10 border-[#ffc107] ring-1 ring-[#ffc107]/40'
              : 'bg-[#0f1115] border-[#1e242b]'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              ☕ Almoço & Descanso
            </span>
            <span className="text-[#ffc107] font-mono font-bold">{config.shift1End} - {config.shift2Start}</span>
          </div>
          <div className="text-[11px] text-[#94a3b8] mb-2">1h 30min • Pausa de Digestão e Recarga</div>
          <div className="w-full bg-[#1a1f26] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#ffc107] h-full" style={{ width: shiftStatus.shift === 0 ? '50%' : '0%' }}></div>
          </div>
        </div>
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            shiftStatus.shift === 2
              ? 'bg-[#83d600]/10 border-[#83d600] ring-1 ring-[#83d600]/40'
              : 'bg-[#0f1115] border-[#1e242b]'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              🌇 2º Turno (Tarde / Noite)
            </span>
            <span className="text-[#83d600] font-mono font-bold">{config.shift2Start} - {config.shift2End}</span>
          </div>
          <div className="text-[11px] text-[#94a3b8] mb-2">6h 30min • Pico de Fim de Tarde e Saída</div>
          <div className="w-full bg-[#1a1f26] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#83d600] h-full" style={{ width: shiftStatus.shift === 2 ? '45%' : '0%' }}></div>
          </div>
        </div>
      </div>

      <div className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs ${shiftStatus.bg} ${shiftStatus.border}`}>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            {shiftStatus.active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#83d600] opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${shiftStatus.active ? 'bg-[#83d600]' : 'bg-[#ffc107]'}`}></span>
          </span>
          <span className={`font-extrabold tracking-wide ${shiftStatus.color}`}>{shiftStatus.label}</span>
          <span className="text-[#94a3b8] hidden sm:inline"> • {shiftStatus.desc}</span>
        </div>
        <span className="text-[11px] font-mono text-[#94a3b8] shrink-0">Total: 8h líquidas / dia</span>
      </div>

      <div className="bg-[#0a0b0d] p-4 sm:p-5 rounded-xl border border-[#1e242b] flex flex-col gap-4 shadow-inner">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-wider block">Progresso da Meta Diária</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold flex items-center gap-1 ${goalStatus.badgeClass}`}>
                <span>{goalStatus.icon}</span>
                <span>{goalStatus.label}</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-white">{corridasHoje}</span>
              <span className="text-sm font-bold text-[#94a3b8]">/ {config.dailyGoal} corridas</span>
              <span
                className="text-xs font-extrabold ml-1.5 transition-colors duration-500 font-mono"
                style={{ color: dynamicBarColor }}
              >
                ({rawPercentage}% concluído)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onIncrementCorrida}
              className="bg-[#83d600] hover:bg-[#83d600]/90 text-black font-extrabold text-xs px-3.5 py-2.5 rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-[#83d600]/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 fill-black" />
              +1 Corrida Concluída
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-[#94a3b8]">
            <span className="text-[11px]">{goalStatus.statusText}</span>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-[10px] uppercase font-bold text-[#64748b]">Nível de Meta:</span>
              <span
                className="font-extrabold px-2 py-0.5 rounded border transition-all duration-500"
                style={{
                  color: dynamicBarColor,
                  borderColor: `rgba(${r1}, ${g1}, ${b1}, 0.4)`,
                  backgroundColor: `rgba(${r1}, ${g1}, ${b1}, 0.12)`,
                }}
              >
                {corridasHoje} / {config.dailyGoal}
              </span>
            </div>
          </div>
          <div className="relative w-full bg-[#10141a] h-4 sm:h-5 rounded-full overflow-hidden p-0.5 border border-[#272f3a] shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden flex items-center justify-end pr-1.5"
              style={{
                width: `${goalPercentage}%`,
                background: dynamicBarGradient,
                boxShadow: dynamicGlow,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
              {goalPercentage >= 5 && (
                <div className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-sm shrink-0 z-10" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#64748b] font-mono px-0.5">
            <span className="flex items-center gap-1 text-[#64748b]">
              <span className="w-2 h-2 rounded-full bg-[#64748b] inline-block" />
              0 (Cinza)
            </span>
            <span>25% ({Math.round(config.dailyGoal * 0.25)})</span>
            <span>50% ({Math.round(config.dailyGoal * 0.5)})</span>
            <span>75% ({Math.round(config.dailyGoal * 0.75)})</span>
            <span className="flex items-center gap-1 font-bold text-[#83d600]">
              <span className="w-2 h-2 rounded-full bg-[#83d600] inline-block shadow-[0_0_6px_#83d600]" />
              {config.dailyGoal} (Verde-Pera)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs border-t border-[#1e242b]/70">
          <div className="bg-[#14171c] p-2.5 rounded-lg border border-[#1e242b]">
            <span className="text-[#94a3b8] text-[10px] uppercase font-bold block">Faturamento Solo Est.</span>
            <span className="text-white font-bold text-sm font-mono">
              R$ {projectedEarningsToday.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-[#14171c] p-2.5 rounded-lg border border-[#1e242b]">
            <span className="text-[#94a3b8] text-[10px] uppercase font-bold block">Comissão Central ({config.commissionRate}%)</span>
            <span className="text-[#83d600] font-bold text-sm font-mono">
              R$ {projectedCommissionToday.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="bg-[#14171c] p-2.5 rounded-lg border border-[#1e242b]">
            <span className="text-[#94a3b8] text-[10px] uppercase font-bold block">Projeção Mensal (25 dias)</span>
            <span className="text-white font-bold text-sm font-mono">
              {corridasHoje * 25} / {config.dailyGoal * 25}
            </span>
          </div>
          <div className="bg-[#14171c] p-2.5 rounded-lg border border-[#1e242b]">
            <span className="text-[#94a3b8] text-[10px] uppercase font-bold block">Escala 10 Parceiros</span>
            <span className="text-[#ffc107] font-bold text-sm font-mono">
              R$ 81.000 / ano
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
