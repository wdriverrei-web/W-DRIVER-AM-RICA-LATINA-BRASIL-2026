import React, { useState } from 'react';
import { Occurrence, PendingApproval } from '../types';
import { ShieldCheck, FileCheck, Check, X, Eye, AlertTriangle, Clock, UserCheck, Search, Filter, ShieldAlert } from 'lucide-react';

interface ApprovalsAndOccurrencesProps {
  pendingList: PendingApproval[];
  occurrences: Occurrence[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onResolveOccurrence: (id: string) => void;
}

export const ApprovalsAndOccurrences: React.FC<ApprovalsAndOccurrencesProps> = ({
  pendingList,
  occurrences,
  onApprove,
  onReject,
  onResolveOccurrence,
}) => {
  const [activeTab, setActiveTab] = useState<'motoristas' | 'passageiros' | 'ocorrencias'>('motoristas');
  const [selectedPending, setSelectedPending] = useState<PendingApproval | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const motoristasList = pendingList.filter((p) => p.type === 'motorista');
  const passageirosList = pendingList.filter((p) => p.type === 'passageiro');

  const handleOpenReject = (item: PendingApproval) => {
    setSelectedPending(item);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (selectedPending) {
      onReject(selectedPending.id, rejectReason || 'Documentação ilegível ou pendente de regularização.');
      setShowRejectModal(false);
      setSelectedPending(null);
      setRejectReason('');
    }
  };

  return (
    <div className="bg-[#14171c] border border-[#1e242b] rounded-xl p-4 sm:p-5 shadow-lg flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e242b]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#83d600]/10 border border-[#83d600]/30 text-[#83d600]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              Aprovações Pendentes & Ocorrências
              <span className="text-[10px] bg-[#ffc107]/20 text-[#ffc107] px-2 py-0.5 rounded font-bold">
                Auditoria de Segurança
              </span>
            </h2>
            <p className="text-xs text-[#94a3b8]">Verificação cadastral minuciosa (CNH, CRLV, Antecedentes e Chamados)</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-[#0a0b0d] p-1 rounded-lg border border-[#1e242b] overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('motoristas')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all shrink-0 ${
              activeTab === 'motoristas' ? 'bg-[#83d600] text-black' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Motoristas ({motoristasList.length})
          </button>
          <button
            onClick={() => setActiveTab('passageiros')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all shrink-0 ${
              activeTab === 'passageiros' ? 'bg-[#83d600] text-black' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Passageiros ({passageirosList.length})
          </button>
          <button
            onClick={() => setActiveTab('ocorrencias')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all shrink-0 ${
              activeTab === 'ocorrencias' ? 'bg-[#ffc107] text-black' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            ⚠️ Ocorrências ({occurrences.filter((o) => o.status !== 'resolvida').length})
          </button>
        </div>
      </div>

      {activeTab !== 'ocorrencias' ? (
        <div className="overflow-x-auto rounded-xl border border-[#1e242b]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0f1115] text-[#94a3b8] border-b border-[#1e242b]">
                <th className="py-3 px-3.5 font-bold">Candidato / Usuário</th>
                <th className="py-3 px-3 font-bold">Tipo & Categoria</th>
                <th className="py-3 px-3 font-bold">Data Cadastro</th>
                <th className="py-3 px-3 font-bold">Documentos</th>
                <th className="py-3 px-3 font-bold">Status</th>
                <th className="py-3 px-3 font-bold text-right">Ações de Verificação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e242b]">
              {(activeTab === 'motoristas' ? motoristasList : passageirosList).map((item) => (
                <tr key={item.id} className="hover:bg-[#181d24]/60 transition-colors">
                  <td className="py-3 px-3.5">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      {item.name}
                      {item.status === 'aprovado' && <UserCheck className="w-3.5 h-3.5 text-[#83d600]" />}
                    </div>
                    <div className="text-[11px] text-[#94a3b8]">
                      CPF: {item.cpf} • {item.phone}
                    </div>
                    {item.vehicleInfo && (
                      <div className="text-[10px] text-[#83d600] mt-0.5">{item.vehicleInfo}</div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className="capitalize font-bold text-white block">{item.type}</span>
                    {item.category && (
                      <span className="text-[10px] bg-[#1e242b] text-[#94a3b8] px-1.5 py-0.5 rounded font-mono">
                        {item.category}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[#94a3b8] font-medium">{item.registerDate}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">
                        {item.docsSent} / {item.docsTotal} enviados
                      </span>
                    </div>
                    <div className="w-24 bg-[#1e242b] h-1.5 rounded-full mt-1 overflow-hidden">
                      <div
                        className="bg-[#83d600] h-full"
                        style={{ width: `${(item.docsSent / item.docsTotal) * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'aprovado'
                          ? 'bg-[#83d600]/20 text-[#83d600]'
                          : item.status === 'recusado'
                          ? 'bg-[#ef4444]/20 text-[#ef4444]'
                          : 'bg-[#ffc107]/20 text-[#ffc107]'
                      }`}
                    >
                      {item.status === 'aprovado'
                        ? 'Aprovado'
                        : item.status === 'recusado'
                        ? 'Recusado'
                        : 'Pendente'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedPending(item)}
                        className="p-1.5 bg-[#1e242b] hover:bg-[#252c38] text-[#94a3b8] hover:text-white rounded-lg transition-colors"
                        title="Ver documentos detalhados"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {item.status === 'pendente' && (
                        <>
                          <button
                            onClick={() => onApprove(item.id)}
                            className="p-1.5 bg-[#83d600]/15 hover:bg-[#83d600] text-[#83d600] hover:text-black rounded-lg transition-colors"
                            title="Aprovar cadastro"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenReject(item)}
                            className="p-1.5 bg-[#ef4444]/15 hover:bg-[#ef4444] text-[#ef4444] hover:text-white rounded-lg transition-colors"
                            title="Recusar cadastro"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#1e242b]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0f1115] text-[#94a3b8] border-b border-[#1e242b]">
                <th className="py-3 px-3.5 font-bold">Tipo da Ocorrência</th>
                <th className="py-3 px-3 font-bold">Descrição do Fato</th>
                <th className="py-3 px-3 font-bold">Corrida & Partes</th>
                <th className="py-3 px-3 font-bold">Data/Hora</th>
                <th className="py-3 px-3 font-bold">Status</th>
                <th className="py-3 px-3 font-bold text-right">Ação Central</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e242b]">
              {occurrences.map((oc) => (
                <tr key={oc.id} className="hover:bg-[#181d24]/60 transition-colors">
                  <td className="py-3 px-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        oc.priority === 'alta'
                          ? 'bg-[#ef4444]/20 text-[#ef4444]'
                          : oc.priority === 'media'
                          ? 'bg-[#ffc107]/20 text-[#ffc107]'
                          : 'bg-[#3b82f6]/20 text-[#3b82f6]'
                      }`}
                    >
                      {oc.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <div className="text-white font-medium">{oc.description}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-[#83d600] font-mono font-bold">{oc.rideId}</div>
                    <div className="text-[11px] text-[#94a3b8]">
                      {oc.driver} • {oc.passenger}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-[#94a3b8]">{oc.date}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        oc.status === 'resolvida'
                          ? 'bg-[#83d600]/20 text-[#83d600]'
                          : oc.status === 'em_analise'
                          ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                          : 'bg-[#ffc107]/20 text-[#ffc107]'
                      }`}
                    >
                      {oc.status === 'resolvida' ? 'Resolvida' : oc.status === 'em_analise' ? 'Em Análise' : 'Aberta'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {oc.status !== 'resolvida' ? (
                      <button
                        onClick={() => onResolveOccurrence(oc.id)}
                        className="bg-[#83d600]/20 hover:bg-[#83d600] text-[#83d600] hover:text-black font-bold text-[11px] px-2.5 py-1 rounded transition-colors"
                      >
                        Marcar Resolvida
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#83d600] font-bold flex items-center justify-end gap-1">
                        <Check className="w-3.5 h-3.5" /> Concluído
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedPending && !showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171c] border border-[#2a3442] rounded-2xl max-w-xl w-full p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e242b]">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#83d600]" />
                  Dossiê de Documentação: {selectedPending.name}
                </h3>
                <p className="text-xs text-[#94a3b8]">{selectedPending.vehicleInfo || selectedPending.phone}</p>
              </div>
              <button
                onClick={() => setSelectedPending(null)}
                className="text-[#94a3b8] hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>
            <div className="my-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {selectedPending.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-[#0f1115] border border-[#1e242b] p-3 rounded-lg flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-4 h-4 text-[#83d600]" />
                    <div>
                      <span className="font-bold text-white block">{doc.name}</span>
                      <span className="text-[10px] text-[#94a3b8]">Formato: {doc.type} • Enviado {doc.dateUploaded}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      doc.status === 'aprovado'
                        ? 'bg-[#83d600]/20 text-[#83d600]'
                        : 'bg-[#ffc107]/20 text-[#ffc107]'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#1e242b]">
              <button
                onClick={() => setSelectedPending(null)}
                className="px-3.5 py-1.5 bg-[#1e242b] text-[#94a3b8] hover:text-white text-xs font-semibold rounded-lg"
              >
                Fechar
              </button>
              {selectedPending.status === 'pendente' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenReject(selectedPending)}
                    className="px-3.5 py-1.5 bg-red-950/40 text-red-400 hover:bg-red-900/60 text-xs font-bold rounded-lg border border-red-800/40"
                  >
                    Recusar...
                  </button>
                  <button
                    onClick={() => {
                      onApprove(selectedPending.id);
                      setSelectedPending(null);
                    }}
                    className="px-4 py-1.5 bg-[#83d600] text-black text-xs font-bold rounded-lg hover:bg-[#83d600]/90"
                  >
                    Aprovar e Habilitar na Frota
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedPending && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#14171c] border border-red-900/50 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <h3 className="text-sm font-black text-white flex items-center gap-2 mb-1 text-red-400">
              <AlertTriangle className="w-4 h-4" /> Recusar Cadastro de {selectedPending.name}
            </h3>
            <p className="text-xs text-[#94a3b8] mb-3">
              Informe a justificativa que será enviada por notificação ao usuário:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Ex: CNH com data de validade vencida ou foto ilegível..."
              className="w-full h-24 bg-[#0a0b0d] border border-[#2a3442] rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500"
            />
            <div className="flex items-center justify-end gap-2 mt-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 bg-[#1e242b] text-[#94a3b8] hover:text-white text-xs font-semibold rounded-lg"
              >
                Voltar
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700"
              >
                Confirmar Recusa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
