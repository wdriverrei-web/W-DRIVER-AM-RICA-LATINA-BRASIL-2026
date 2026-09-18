import React, { useState } from 'react';
import { FixedPassenger } from '../types';
import { Users, Plus, Search, Filter, Phone, Calendar, Clock, DollarSign, Check, X, Edit2, Trash2, ArrowUpRight } from 'lucide-react';

interface FixedPassengersModuleProps {
  passengers: FixedPassenger[];
  onAddPassenger: (passenger: Omit<FixedPassenger, 'id'>) => void;
  onToggleStatus: (id: string) => void;
  onDeletePassenger: (id: string) => void;
}

export const FixedPassengersModule: React.FC<FixedPassengersModuleProps> = ({
  passengers,
  onAddPassenger,
  onToggleStatus,
  onDeletePassenger,
}) => {
  const [selectedShift, setSelectedShift] = useState<'todos' | 'manha' | 'almoco' | 'tarde'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New passenger form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newShift, setNewShift] = useState<'manha' | 'almoco' | 'tarde'>('manha');
  const [newOrigin, setNewOrigin] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newDailyValue, setNewDailyValue] = useState('15.00');
  const [newNotes, setNewNotes] = useState('');

  const filteredPassengers = passengers.filter((p) => {
    const search = (searchTerm || '').toLowerCase();
    const matchesShift = selectedShift === 'todos' || p.shift === selectedShift;
    const matchesSearch =
      (p.name?.toLowerCase() || '').includes(search) ||
      (p.origin?.toLowerCase() || '').includes(search) ||
      (p.destination?.toLowerCase() || '').includes(search);
    return matchesShift && matchesSearch;
  });

  const totalMonthlyGuaranteed = passengers
    .filter((p) => p.status === 'ativo')
    .reduce((acc, curr) => acc + curr.monthlyValue, 0);

  const activeCount = passengers.filter((p) => p.status === 'ativo').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newOrigin.trim() || !newDestination.trim()) {
      alert('Preencha os campos obrigatórios (Nome, Origem e Destino).');
      return;
    }
    const dailyNum = parseFloat(newDailyValue) || 15;
    const monthlyNum = dailyNum * 22; // 22 workdays per month
    onAddPassenger({
      name: newName.trim(),
      userCode: `W-FIX-${Math.floor(100 + Math.random() * 900)}`,
      phone: newPhone.trim() || '(83) 98800-0000',
      pickupTime: newTime,
      shift: newShift,
      origin: newOrigin.trim(),
      destination: newDestination.trim(),
      dailyValue: dailyNum,
      monthlyValue: monthlyNum,
      status: 'ativo',
      frequency: 'Segunda a Sexta',
      notes: newNotes.trim() || 'Cliente fixo de rotina programada.',
    });

    setNewName('');
    setNewPhone('');
    setNewOrigin('');
    setNewDestination('');
    setNewDailyValue('15.00');
    setNewNotes('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-[#14171c] border border-[#1e242b] rounded-xl p-4 sm:p-5 shadow-lg flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e242b]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#83d600]/10 border border-[#83d600]/30 text-[#83d600]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              Gestão & Captação de Passageiros Fixos
              <span className="text-[10px] bg-[#83d600]/20 text-[#83d600] px-2 py-0.5 rounded font-bold">
                {activeCount} Clientes Fiéis
              </span>
            </h2>
            <p className="text-xs text-[#94a3b8]">Grade de rotinas agendadas para previsibilidade financeira total</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#83d600] hover:bg-[#83d600]/90 text-black font-extrabold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#83d600]/20"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Fechar Cadastro' : '+ Cadastrar Cliente Fixo'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#0f1115] border border-[#1e242b] p-3.5 rounded-xl">
          <span className="text-[11px] font-bold text-[#94a3b8] uppercase block">Receita Mensal Garantida</span>
          <span className="text-xl sm:text-2xl font-black text-[#83d600]">
            R$ {totalMonthlyGuaranteed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[10px] text-[#94a3b8] block mt-0.5">Sem depender do algoritmo dos apps</span>
        </div>
        <div className="bg-[#0f1115] border border-[#1e242b] p-3.5 rounded-xl">
          <span className="text-[11px] font-bold text-[#94a3b8] uppercase block">Passageiros Fixos Ativos</span>
          <span className="text-xl sm:text-2xl font-black text-white">
            {activeCount} <span className="text-xs text-[#94a3b8] font-normal">/ meta 30 fiéis</span>
          </span>
          <div className="w-full bg-[#1e242b] h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-[#83d600] h-full" style={{ width: `${Math.min(100, (activeCount / 30) * 100)}%` }}></div>
          </div>
        </div>
        <div className="bg-[#0f1115] border border-[#1e242b] p-3.5 rounded-xl">
          <span className="text-[11px] font-bold text-[#94a3b8] uppercase block">Economia em Combustível</span>
          <span className="text-xl sm:text-2xl font-black text-[#ffc107]">
            ~ 35% a menos
          </span>
          <span className="text-[10px] text-[#94a3b8] block mt-0.5">Rotas otimizadas sem rodar vazio</span>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#0f1115] border border-[#2a3442] p-4 rounded-xl flex flex-col gap-3 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1 text-[#83d600]">
            <Plus className="w-3.5 h-3.5" /> Adicionar Passageiro à Grade de Rotina
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[10px] text-[#94a3b8] block mb-1">Nome do Passageiro <span className="text-[#83d600]">(Obrigatório)</span></label>
              <input
                type="text"
                placeholder="Ex: Dra. Juliana (Clínica Epitácio)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[#181d24] border border-[#2a3442] rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#83d600]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#94a3b8] block mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                placeholder="(83) 98800-0000"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="w-full bg-[#181d24] border border-[#2a3442] rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#83d600]"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-[#94a3b8] block mb-1">Horário Habitual</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => {
                    setNewTime(e.target.value);
                    const hour = parseInt(e.target.value.split(':')[0]);
                    if (hour < 11) setNewShift('manha');
                    else if (hour < 15) setNewShift('almoco');
                    else setNewShift('tarde');
                  }}
                  className="w-full bg-[#181d24] border border-[#2a3442] rounded-lg px-2 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-[#94a3b8] block mb-1">Turno</label>
                <select
                  value={newShift}
                  onChange={(e) => setNewShift(e.target.value as any)}
                  className="w-full bg-[#181d24] border border-[#2a3442] rounded-lg px-2 py-2 text-white"
                >
                  <option value="manha">Manhã (09:00)</option>
                  <option value="almoco">Almoço (12:00)</option>
                  <option value="tarde">Tarde/Noite (17:00+)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-[#94a3b8] block mb-1">Origem (Embarque) <span className="text-[#83d600]">(Obrigatório)</span></label>
              <input
                type="text"
                placeholder="Ex: Bessa (Residencial)"
                value={newOrigin}
                onChange={(e) => setNewOrigin(e.target.value)}
                className="w-full bg-[#181d24] border border-[#2a3442] rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#83d600]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#94a3b8] block mb-1">Destino (Desembarque) <span className="text-[#83d600]">(Obrigatório)</span></label>
              <input
                type="text"
                placeholder="Ex: Torre (Consultório)"
                value={newDestination}
                onChange={(e) => setNewDestination(e.target.value)}
                className="w-full bg-[#181d24] border border-[#2a3442] rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-[#83d600]"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#94a3b8] block mb-1">Valor Diário (R$)</label>
              <input
                type="number"
                step="0.50"
                placeholder="15.00"
                value={newDailyValue}
                onChange={(e) => setNewDailyValue(e.target.value)}
                className="w-full bg-[#181d24] border border-[#2a3442] rounded-lg px-2.5 py-2 text-white font-mono focus:outline-none focus:border-[#83d600]"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-lg bg-[#1e242b] text-[#94a3b8] hover:text-white text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#83d600] text-black text-xs font-bold hover:bg-[#83d600]/90"
            >
              Salvar na Grade
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 bg-[#0a0b0d] p-1 rounded-lg border border-[#1e242b] w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedShift('todos')}
            className={`px-3 py-1 rounded-md font-bold transition-all shrink-0 ${
              selectedShift === 'todos' ? 'bg-[#83d600] text-black' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Todos ({passengers.length})
          </button>
          <button
            onClick={() => setSelectedShift('manha')}
            className={`px-3 py-1 rounded-md font-bold transition-all shrink-0 ${
              selectedShift === 'manha' ? 'bg-[#83d600] text-black' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            🌅 Manhã (09:00)
          </button>
          <button
            onClick={() => setSelectedShift('almoco')}
            className={`px-3 py-1 rounded-md font-bold transition-all shrink-0 ${
              selectedShift === 'almoco' ? 'bg-[#83d600] text-black' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            ☕ Almoço (12:00)
          </button>
          <button
            onClick={() => setSelectedShift('tarde')}
            className={`px-3 py-1 rounded-md font-bold transition-all shrink-0 ${
              selectedShift === 'tarde' ? 'bg-[#83d600] text-black' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            🌇 Fim de Tarde (17:00+)
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Buscar por nome ou bairro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0b0d] border border-[#1e242b] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#83d600]"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#1e242b]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#0f1115] text-[#94a3b8] border-b border-[#1e242b]">
              <th className="py-3 px-3.5 font-bold">Passageiro Fixo</th>
              <th className="py-3 px-3 font-bold">Horário & Turno</th>
              <th className="py-3 px-3 font-bold">Rota Habitual</th>
              <th className="py-3 px-3 font-bold">Valor Diário</th>
              <th className="py-3 px-3 font-bold">Mensal Estimado</th>
              <th className="py-3 px-3 font-bold">Status</th>
              <th className="py-3 px-3 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e242b]">
            {filteredPassengers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-[#94a3b8]">
                  Nenhum passageiro fixo encontrado para este filtro.
                </td>
              </tr>
            ) : (
              filteredPassengers.map((p) => (
                <tr key={p.id} className="hover:bg-[#181d24]/60 transition-colors">
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-white">{p.name}</div>
                    <div className="text-[11px] text-[#94a3b8] flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#83d600]" /> {p.phone}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-white flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#83d600]" /> {p.pickupTime}
                    </div>
                    <span className="text-[10px] text-[#94a3b8] uppercase font-bold">
                      {p.shift === 'manha' ? '🌅 Manhã' : p.shift === 'almoco' ? '☕ Almoço' : '🌇 Tarde'}
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-[220px]">
                    <div className="text-white truncate font-medium">{p.origin}</div>
                    <div className="text-[11px] text-[#94a3b8] truncate">➔ {p.destination}</div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-white">
                    R$ {p.dailyValue.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#83d600]">
                    R$ {p.monthlyValue.toFixed(2)}
                  </td>
                  <td className="py-3 px-3">
                    <button
                      onClick={() => onToggleStatus(p.id)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                        p.status === 'ativo'
                          ? 'bg-[#83d600]/15 text-[#83d600] border border-[#83d600]/40'
                          : 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/40'
                      }`}
                    >
                      ● {p.status === 'ativo' ? 'Ativo' : 'Pausado'}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <a
                        href={`https://wa.me/55${p.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-[#1e242b] hover:bg-[#252c38] text-[#83d600] rounded-lg transition-colors"
                        title="Abrir no WhatsApp"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => onDeletePassenger(p.id)}
                        className="p-1.5 bg-[#1e242b] hover:bg-red-950/50 text-[#94a3b8] hover:text-red-400 rounded-lg transition-colors"
                        title="Remover passageiro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
