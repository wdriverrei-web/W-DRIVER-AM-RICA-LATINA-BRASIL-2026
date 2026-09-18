import React, { useState } from 'react';
import { RideReceipt } from '../types';
import { WLogo } from './WLogo';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Calendar,
  User,
  Car,
  MapPin,
  Clock,
  Shield,
  FileText,
  X,
  Printer,
} from 'lucide-react';

interface WBankAndReceiptsModuleProps {
  receipts: RideReceipt[];
  commissionRate?: number;
}

export const WBankAndReceiptsModule: React.FC<WBankAndReceiptsModuleProps> = ({
  receipts = [],
  commissionRate = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<RideReceipt | null>(null);
  const [filterPayment, setFilterPayment] = useState<string>('todos');

  const filteredReceipts = receipts.filter((rec) => {
    const matchesSearch =
      rec.rideId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPayment =
      filterPayment === 'todos' || rec.paymentMethod.toLowerCase() === filterPayment.toLowerCase();

    return matchesSearch && matchesPayment;
  });

  const totalGross = receipts.reduce((acc, r) => acc + r.totalPrice, 0);
  const totalCentral = receipts.reduce((acc, r) => acc + r.centralShare, 0);
  const totalDrivers = receipts.reduce((acc, r) => acc + r.driverShare, 0);

  const handleDownloadReceipt = (receipt: RideReceipt) => {
    const content = `
=====================================================
          W-DRIVER AMÉRICA LATINA BRASIL
             BASE JOÃO PESSOA - PARAÍBA
           COMPROVANTE OFICIAL DE VIAGEM
=====================================================
CÓDIGO DA VIAGEM: ${receipt.rideId}
DATA / HORA:      ${receipt.timestamp}
CATEGORIA:        ${receipt.category}
STATUS:           CONCLUÍDA

PASSAGEIRO:       ${receipt.passengerName} (${receipt.passengerCode})
MOTORISTA:        ${receipt.driverName} (${receipt.driverCode})
VEÍCULO:          ${receipt.driverVehicle || 'Veículo Oficial Cadastrado'}

ORIGEM:           ${receipt.origin}
DESTINO:          ${receipt.destination}
DISTÂNCIA:        ${receipt.distanceKm.toFixed(1)} km
DURAÇÃO:          ${receipt.durationMin} min

-----------------------------------------------------
DEMONSTRATIVO FINANCEIRO W-BANK
-----------------------------------------------------
VALOR TOTAL PAGO:         R$ ${receipt.totalPrice.toFixed(2)}
FORMA DE PAGAMENTO:       ${receipt.paymentMethod} (${receipt.paymentStatus})

REPASSE MOTORISTA (90%):  R$ ${receipt.driverShare.toFixed(2)}
TAXA CENTRAL W-DRIVER (10%): R$ ${receipt.centralShare.toFixed(2)}
${receipt.isNoShow ? '\n* TAXA DE NO-SHOW: 100% REPASSADO INTEGRALMENTE AO MOTORISTA' : ''}
=====================================================
"Quem escolhe preço corre riscos.
 Quem escolhe a W-DRIVER escolhe chegar bem!"
=====================================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Recibo_${receipt.rideId.replace('#', '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header W-Bank */}
      <div className="bg-[#14171c] border border-[#1e242b] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#83d600]/10 text-[#83d600] border border-[#83d600]/30">
                <DollarSign className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                W-BANK & Gestão de Recibos
              </h2>
            </div>
            <p className="text-sm text-[#94a3b8] max-w-2xl">
              Auditoria financeira das corridas concluídas com divisão inegociável: 10% Central W-DRIVER e 90%
              Motorista Parceiro. Emissões de recibos oficiais persistidos.
            </p>
          </div>

          <div className="bg-[#0a0b0d] border border-[#1e242b] px-4 py-2.5 rounded-xl flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#83d600]" />
            <div>
              <span className="text-[10px] text-[#94a3b8] block uppercase font-bold">Regra Contábil W-DRIVER</span>
              <span className="text-xs font-black text-white font-mono">10% Central • 90% Motorista</span>
            </div>
          </div>
        </div>

        {/* Cards de Métricas Reais */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-[#1e242b]">
          <div className="bg-[#0a0b0d] border border-[#1e242b] p-4 rounded-xl">
            <span className="text-[10px] text-[#94a3b8] uppercase font-bold block mb-1">
              Faturamento Bruto Total
            </span>
            <div className="text-2xl font-black text-white font-mono">
              R$ {totalGross.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-[#94a3b8] mt-1 block">
              {receipts.length} recibos auditados no sistema
            </span>
          </div>

          <div className="bg-[#0a0b0d] border border-[#1e242b] p-4 rounded-xl">
            <span className="text-[10px] text-[#83d600] uppercase font-bold block mb-1">
              Repasse aos Motoristas (90%)
            </span>
            <div className="text-2xl font-black text-[#83d600] font-mono">
              R$ {totalDrivers.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-[#83d600]/80 mt-1 block">
              Maior rentabilidade do mercado brasileiro
            </span>
          </div>

          <div className="bg-[#0a0b0d] border border-[#1e242b] p-4 rounded-xl">
            <span className="text-[10px] text-blue-400 uppercase font-bold block mb-1">
              Receita Central W-DRIVER (10%)
            </span>
            <div className="text-2xl font-black text-blue-400 font-mono">
              R$ {totalCentral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[11px] text-[#94a3b8] mt-1 block">
              Sem descontos indevidos aos parceiros
            </span>
          </div>
        </div>
      </div>

      {/* Tabela de Recibos */}
      <div className="bg-[#14171c] border border-[#1e242b] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#83d600]" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Recibos Oficiais Persistidos ({filteredReceipts.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código, passageiro, motorista..."
                className="pl-8 pr-3 py-1.5 bg-[#0a0b0d] border border-[#232b38] rounded-xl text-xs text-white placeholder:text-[#64748b] focus:outline-none focus:border-[#83d600] w-64"
              />
            </div>

            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="py-1.5 px-3 bg-[#0a0b0d] border border-[#232b38] rounded-xl text-xs text-white focus:outline-none focus:border-[#83d600]"
            >
              <option value="todos">Todos Pagamentos</option>
              <option value="pix">Pix</option>
              <option value="cartão">Cartão</option>
              <option value="dinheiro">Dinheiro</option>
            </select>
          </div>
        </div>

        {filteredReceipts.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#94a3b8] bg-[#0a0b0d] rounded-xl border border-[#1e242b]">
            Nenhum recibo correspondente encontrado. Os recibos são criados automaticamente a cada corrida
            finalizada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0b0d] text-[#94a3b8] border-b border-[#1e242b]">
                <tr>
                  <th className="p-3 font-bold">Código</th>
                  <th className="p-3 font-bold">Passageiro</th>
                  <th className="p-3 font-bold">Motorista</th>
                  <th className="p-3 font-bold">Categoria</th>
                  <th className="p-3 font-bold">Trajeto</th>
                  <th className="p-3 font-bold text-right">Total</th>
                  <th className="p-3 font-bold text-right">Motorista (90%)</th>
                  <th className="p-3 font-bold text-right">Central (10%)</th>
                  <th className="p-3 font-bold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e242b]">
                {filteredReceipts.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#1a202c]/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#83d600] whitespace-nowrap">{rec.rideId}</td>
                    <td className="p-3 font-medium text-white">{rec.passengerName}</td>
                    <td className="p-3 text-[#cbd5e1]">{rec.driverName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-[#0a0b0d] border border-[#232b38] text-[10px] font-bold text-white">
                        {rec.category}
                      </span>
                    </td>
                    <td className="p-3 max-w-[200px] truncate text-[#94a3b8]" title={`${rec.origin} → ${rec.destination}`}>
                      {rec.origin.split(',')[0]} → {rec.destination.split(',')[0]}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-white">
                      R$ {rec.totalPrice.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-[#83d600]">
                      R$ {rec.driverShare.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-blue-400">
                      R$ {rec.centralShare.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedReceipt(rec)}
                          className="p-1.5 rounded-lg bg-[#0a0b0d] hover:bg-[#83d600]/20 text-[#83d600] border border-[#232b38] transition-colors"
                          title="Visualizar Recibo"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(rec)}
                          className="p-1.5 rounded-lg bg-[#0a0b0d] hover:bg-[#83d600] hover:text-black text-[#94a3b8] border border-[#232b38] transition-colors"
                          title="Baixar Recibo (.txt)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Visualização do Recibo */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0e1217] border border-[#232b38] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e242b]">
              <div className="flex items-center gap-2">
                <WLogo size="sm" showSubtitle={false} />
                <h3 className="text-sm font-black text-white">Recibo Oficial de Corrida</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="p-1.5 rounded-lg bg-[#141820] text-[#94a3b8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#141820] p-4 rounded-2xl border border-[#232b38] space-y-3 text-xs text-[#cbd5e1]">
              <div className="flex justify-between items-center border-b border-[#232b38] pb-2">
                <div>
                  <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">Código</span>
                  <span className="font-mono font-black text-sm text-[#83d600]">{selectedReceipt.rideId}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">Data/Hora</span>
                  <span className="font-bold text-white">{selectedReceipt.timestamp}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <strong className="text-white block">Passageiro:</strong>
                  {selectedReceipt.passengerName} ({selectedReceipt.passengerCode})
                </div>
                <div>
                  <strong className="text-white block">Motorista:</strong>
                  {selectedReceipt.driverName} ({selectedReceipt.driverCode})
                </div>
                <div className="col-span-2">
                  <strong className="text-white block">Categoria:</strong>
                  {selectedReceipt.category} • {selectedReceipt.distanceKm.toFixed(1)} km ({selectedReceipt.durationMin} min)
                </div>
              </div>

              <div className="p-3 bg-[#0a0b0d] rounded-xl space-y-1 text-[11px]">
                <div>
                  <span className="text-[#94a3b8]">Origem: </span>
                  <span className="text-white">{selectedReceipt.origin}</span>
                </div>
                <div>
                  <span className="text-[#94a3b8]">Destino: </span>
                  <span className="text-white">{selectedReceipt.destination}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#232b38] space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-white">
                  <span>Valor Total:</span>
                  <span className="font-mono text-sm">R$ {selectedReceipt.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-[#83d600]">
                  <span>Repasse Motorista (90%):</span>
                  <span className="font-mono font-bold">R$ {selectedReceipt.driverShare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-blue-400">
                  <span>Comissão Central (10%):</span>
                  <span className="font-mono font-bold">R$ {selectedReceipt.centralShare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-[#94a3b8] pt-1">
                  <span>Forma de Pagamento:</span>
                  <span>{selectedReceipt.paymentMethod} ({selectedReceipt.paymentStatus})</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 rounded-xl bg-[#141820] text-[#94a3b8] hover:text-white text-xs font-bold"
              >
                Fechar
              </button>
              <button
                onClick={() => handleDownloadReceipt(selectedReceipt)}
                className="px-4 py-2 rounded-xl bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs flex items-center gap-2 shadow-md shadow-[#83d600]/20"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Recibo (.txt)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
