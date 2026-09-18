import React, { useState } from 'react';
import { WSosAlert } from '../types';
import {
  AlertTriangle,
  Shield,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Search,
  ExternalLink,
  ChevronRight,
  User,
  Radio,
} from 'lucide-react';

interface WSosModuleProps {
  alerts: WSosAlert[];
  onUpdateAlertStatus: (alertId: string, status: 'aberto' | 'em_atendimento' | 'resolvido', note?: string) => void;
}

export const WSosModule: React.FC<WSosModuleProps> = ({ alerts = [], onUpdateAlertStatus }) => {
  const [selectedAlert, setSelectedAlert] = useState<WSosAlert | null>(alerts[0] || null);
  const [filterStatus, setFilterStatus] = useState<'todos' | 'aberto' | 'em_atendimento' | 'resolvido'>('todos');
  const [newNote, setNewNote] = useState('');

  const filteredAlerts = alerts.filter((a) => {
    if (filterStatus === 'todos') return true;
    return a.status === filterStatus;
  });

  const openAlertsCount = alerts.filter((a) => a.status === 'aberto').length;
  const inProgressCount = alerts.filter((a) => a.status === 'em_atendimento').length;

  const handleAddNoteAndStatus = (status: 'aberto' | 'em_atendimento' | 'resolvido') => {
    if (!selectedAlert) return;
    onUpdateAlertStatus(selectedAlert.id, status, newNote.trim() || undefined);
    setNewNote('');
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header SOS */}
      <div className="bg-[#14171c] border border-[#232b38] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                W-SOS — Central de Monitoramento e Emergência
              </h2>
            </div>
            <p className="text-sm text-[#94a3b8] max-w-2xl">
              Canal de segurança prioritário em tempo real para motoristas e passageiros da W-DRIVER.
              Localização GPS precisa, dados da corrida e histórico de intervenções.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#0a0b0d] border border-red-500/30 px-4 py-2 rounded-xl flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${openAlertsCount > 0 ? 'bg-red-500 animate-ping' : 'bg-green-500'}`} />
              <div>
                <span className="text-[10px] text-[#94a3b8] block uppercase font-bold">Alertas Ativos</span>
                <span className="text-sm font-black text-white font-mono">
                  {openAlertsCount} pendentes • {inProgressCount} em atendimento
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Operação SOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Alertas */}
        <div className="bg-[#14171c] border border-[#232b38] rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1e242b]">
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Chamados W-SOS ({alerts.length})
            </span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-[#0a0b0d] border border-[#232b38] rounded-lg px-2 py-1 text-xs text-white"
            >
              <option value="todos">Todos</option>
              <option value="aberto">Abertos</option>
              <option value="em_atendimento">Em Atendimento</option>
              <option value="resolvido">Resolvidos</option>
            </select>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#94a3b8] bg-[#0a0b0d] rounded-xl border border-[#1e242b]">
              Nenhum alerta de emergência registrado no momento.
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredAlerts.map((alert) => {
                const isSelected = selectedAlert?.id === alert.id;
                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#1a202c] border-[#83d600]'
                        : 'bg-[#0a0b0d] border-[#1e242b] hover:border-[#232b38]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-xs text-[#83d600]">{alert.userCode}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                          alert.status === 'aberto'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                            : alert.status === 'em_atendimento'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                            : 'bg-green-500/20 text-green-400 border border-green-500/40'
                        }`}
                      >
                        {alert.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white">{alert.userName}</div>
                    <div className="text-[11px] text-[#94a3b8] truncate mt-0.5">{alert.location}</div>
                    <div className="text-[10px] text-[#64748b] mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detalhes do Alerta Selecionado */}
        <div className="lg:col-span-2 bg-[#14171c] border border-[#232b38] rounded-2xl p-5 shadow-xl space-y-4">
          {selectedAlert ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1e242b] gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white">{selectedAlert.userName}</h3>
                    <span className="text-xs font-mono font-bold text-[#83d600] bg-[#83d600]/10 px-2 py-0.5 rounded">
                      {selectedAlert.userCode}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#94a3b8] bg-[#0a0b0d] px-2 py-0.5 rounded">
                      {selectedAlert.userRole}
                    </span>
                  </div>
                  <p className="text-xs text-[#94a3b8] mt-0.5">Telefone: {selectedAlert.userPhone}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/55${selectedAlert.userPhone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Chamar Usuário</span>
                  </a>
                </div>
              </div>

              {/* Localização GPS */}
              <div className="p-4 bg-[#0a0b0d] rounded-xl border border-[#232b38] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <MapPin className="w-4 h-4 text-red-400" />
                    <span>Ponto Crítico GPS Informado:</span>
                  </div>
                  <span className="font-mono text-[#83d600]">
                    {selectedAlert.coords.lat.toFixed(5)}, {selectedAlert.coords.lng.toFixed(5)}
                  </span>
                </div>
                <p className="text-[#cbd5e1]">{selectedAlert.location}</p>
                {selectedAlert.rideId && (
                  <div className="text-[11px] text-[#94a3b8]">
                    Corrida associada: <strong className="text-white">{selectedAlert.rideId}</strong>
                  </div>
                )}
              </div>

              {/* Histórico de Intervenções */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-[#94a3b8] uppercase tracking-wider block">
                  Histórico de Atendimento
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedAlert.history && selectedAlert.history.length > 0 ? (
                    selectedAlert.history.map((h, i) => (
                      <div key={i} className="p-2.5 bg-[#0a0b0d] rounded-xl border border-[#1e242b] text-[11px]">
                        <div className="flex justify-between text-[#94a3b8] mb-1">
                          <span>Operador: {h.operator}</span>
                          <span>{h.timestamp}</span>
                        </div>
                        <p className="text-white">{h.note}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-[#64748b] bg-[#0a0b0d] rounded-xl">
                      Nenhuma anotação de intervenção registrada ainda.
                    </div>
                  )}
                </div>
              </div>

              {/* Ações de Despacho */}
              <div className="pt-3 border-t border-[#1e242b] space-y-3">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Inserir nota de atendimento da Central..."
                  className="w-full px-3 py-2 bg-[#0a0b0d] border border-[#232b38] rounded-xl text-xs text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#83d600]"
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleAddNoteAndStatus('em_atendimento')}
                    className="px-3.5 py-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/40 text-xs font-bold transition-all"
                  >
                    Marcar em Atendimento
                  </button>
                  <button
                    onClick={() => handleAddNoteAndStatus('resolvido')}
                    className="px-4 py-2 rounded-xl bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs transition-all shadow-md shadow-[#83d600]/20"
                  >
                    Resolver Chamado
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-[#94a3b8]">
              Selecione um alerta W-SOS para inspecionar os dados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
