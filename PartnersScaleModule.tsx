import React, { useState } from 'react';
import { UserCheck, Copy, Check, Plus, Trash2, TrendingUp, MessageSquare, DollarSign, Target, ExternalLink, Sparkles, Trophy, Smartphone, Tablet, Laptop, Award, Car, Bike, PartyPopper } from 'lucide-react';
import { RideCategory } from '../types';

export interface PartnerDriver {
  id: string;
  name: string;
  category: string;
  grossEarnings: number;
  annualGoal: number; // R$ 81.000 standard
  phone: string;
  status: 'ativo' | 'meta_alcancada';
}

const initialPartnerDrivers: PartnerDriver[] = [
  {
    id: 'p1',
    name: 'Diego Wallace (Motorista 01 - Fundador)',
    category: 'W-MOTO / W-CARRO',
    grossEarnings: 6750.0,
    annualGoal: 81000.0,
    phone: '(83) 98800-1010',
    status: 'ativo',
  },
  {
    id: 'p2',
    name: 'Lucas Ferreira (Motorista 02)',
    category: 'W-CARRO',
    grossEarnings: 4850.0,
    annualGoal: 81000.0,
    phone: '(83) 98722-3040',
    status: 'ativo',
  },
  {
    id: 'p3',
    name: 'Marcos Vinícius (Motorista 03)',
    category: 'W-MOTO',
    grossEarnings: 3920.0,
    annualGoal: 81000.0,
    phone: '(83) 99115-4422',
    status: 'ativo',
  },
];

interface PartnersScaleModuleProps {
  commissionRate?: number;
  initialSubTab?: 'parceiros' | 'conquistas' | 'divulgacao';
}

export const PartnersScaleModule: React.FC<PartnersScaleModuleProps> = ({
  commissionRate = 10,
  initialSubTab = 'parceiros',
}) => {
  const [subTab, setSubTab] = useState<'parceiros' | 'conquistas' | 'divulgacao'>(initialSubTab);
  const [partners, setPartners] = useState<PartnerDriver[]>(initialPartnerDrivers);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [forceCelebration, setForceCelebration] = useState(false);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerCategory, setNewPartnerCategory] = useState('W-MOTO');
  const [newPartnerGross, setNewPartnerGross] = useState('81000.00');
  const [showAddModal, setShowAddModal] = useState(false);

  const copyMotorista = `Chega de pagar até 40% de taxa por corrida! Na W-DRIVER a taxa é FIXA em apenas 10%. Em uma corrida de R$ 20, R$ 18 ficam inteiramente com você. Venha rodar com a maior rentabilidade da cidade. Cadastre-se na Central W-DRIVER!`;
  const copyPassageiro = `Precisa se deslocar com preço justo e motoristas credenciados? Vá de W-DRIVER! W-MOTO, W-CARRO, W-BIKE e W-TÁXI com atendimento de primeira e opção de agendamento fixo. Chame a Central W-DRIVER!`;
  const copyPassageiroFixo = `🚨 Rotina sem atraso em João Pessoa! Tenha seu motorista particular credenciado todos os dias no mesmo horário (ida ao trabalho, colégio ou consultório). Preço tabelado e justo. Reserve sua vaga na Central W-DRIVER!`;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const totalPartnersCount = partners.length;
  const maxPartnersTarget = 10;
  const totalGrossRevenue = partners.reduce((acc, p) => acc + p.grossEarnings, 0);
  const totalCentralCommission = totalGrossRevenue * (commissionRate / 100);
  const projectedAnnualCentral = maxPartnersTarget * 81000 * (commissionRate / 100);
  const isCelebrationTriggered = totalPartnersCount >= maxPartnersTarget || forceCelebration;

  const isCelularUnlocked = totalPartnersCount >= 3;
  const isTabletUnlocked = totalPartnersCount >= 5;
  const isNotebookUnlocked = totalPartnersCount >= 7;
  const isMotoUnlocked = totalPartnersCount >= 9;
  const isCarroUnlocked = totalPartnersCount >= 10;
  const unlockedCount = [
    isCelularUnlocked,
    isTabletUnlocked,
    isNotebookUnlocked,
    isMotoUnlocked,
    isCarroUnlocked,
  ].filter(Boolean).length;

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (partners.length >= maxPartnersTarget) {
      alert('Meta de 10 motoristas parceiros ativos atingida no painel!');
      return;
    }
    const grossNum = parseFloat(newPartnerGross) || 81000.0;
    const nextIndex = partners.length + 1;
    const nameFormatted = newPartnerName.trim() || `Motorista Parceiro 0${nextIndex}`;
    const newPartner: PartnerDriver = {
      id: `p${Date.now()}`,
      name: nameFormatted,
      category: newPartnerCategory,
      grossEarnings: grossNum,
      annualGoal: 81000.0,
      phone: '(83) 98800-0000',
      status: 'ativo',
    };
    const updated = [...partners, newPartner];
    setPartners(updated);
    setNewPartnerName('');
    setNewPartnerGross('81000.00');
    setShowAddModal(false);
  };

  const handleAddEarnings = (id: string, amount: number) => {
    setPartners(
      partners.map((p) => (p.id === id ? { ...p, grossEarnings: p.grossEarnings + amount } : p))
    );
  };

  const handleDeletePartner = (id: string) => {
    if (partners.length <= 1) {
      alert('É necessário manter pelo menos 1 motorista fundador no painel.');
      return;
    }
    setPartners(partners.filter((p) => p.id !== id));
  };

  const handleFillAll10Partners = () => {
    const defaultList: PartnerDriver[] = [
      { id: 'p1', name: 'Diego Wallace (Motorista 01 - Fundador)', category: 'W-MOTO / W-CARRO', grossEarnings: 81000.0, annualGoal: 81000.0, phone: '(83) 98800-1010', status: 'ativo' },
      { id: 'p2', name: 'Lucas Ferreira (Motorista 02)', category: 'W-CARRO', grossEarnings: 81000.0, annualGoal: 81000.0, phone: '(83) 98722-3040', status: 'ativo' },
      { id: 'p3', name: 'Marcos Vinícius (Motorista 03)', category: 'W-MOTO', grossEarnings: 81000.0, annualGoal: 81000.0, phone: '(83) 99115-4422', status: 'ativo' },
      { id: 'p4', name: 'Thiago Barbosa (Motorista 04)', category: 'W-CARRO', grossEarnings: 81000.0, annualGoal: 81000.0, phone: '(83) 99344-5511', status: 'ativo' },
      { id: 'p5', name: 'André Albuquerque (Motorista 05)', category: 'W-MOTO', grossEarnings: 81000.0, annualGoal: 81000.0, phone: '(83) 98811-9922', status: 'ativo' },
      { id: 'p6', name: 'Rodrigo Pontes (Motorista 06)', category: 'W-CARRO', grossEarnings: 81000.0, annualGoal: 81000.0, phone: '(83) 99655-3344', status: 'ativo' },
      { id: 'p7', name: 'Felipe Cavalcanti (Motorista 07)', category: 'W-MOTO', grossEarnings: 81000.0, annualGoal: 81000.0, phone: '(83) 98700-6677', status: 'ativo' },
      { id: 'p8', name: 'Gabriel Santana (Motorista 08)', category: 'W-CARRO', grossEarnings: 81000.0, annualGoal: 81000.0, phone: '(83) 99123-8899', status: 'ativo' },
      { id: 'p9', name: 'Matheus Queiroz (Motorista 09)', category: 'W-MOTO', grossEarnings: 81000.0, annualGoal: 81000.0, phone: '(83) 98877-2233', status: 'ativo' },
      { id: 'p10', name: 'Danilo Guimarães (Motorista 10)', category: 'W-CARRO', grossEarnings: 81000.0, annualGoal: 81000.0, phone: '(83) 99988-1122', status: 'ativo' },
    ];
    setPartners(defaultList);
    setForceCelebration(true);
  };

  return (
    <div className="bg-[#14171c] border border-[#1e242b] rounded-xl p-4 sm:p-5 shadow-lg flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e242b]">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
            Gestão de Parceiros & Meta da Central
            <span className="text-[10px] bg-[#83d600]/20 text-[#83d600] px-2 py-0.5 rounded font-bold border border-[#83d600]/30">
              Taxa Fixa: {commissionRate}%
            </span>
          </h2>
          <p className="text-xs text-[#94a3b8]">Planejamento Estratégico – Escala de Comissão e Captação</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0a0b0d] p-1 rounded-lg border border-[#1e242b] text-xs">
          <button
            onClick={() => setSubTab('parceiros')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'parceiros' ? 'bg-[#83d600] text-black' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>🎯 Meta 10 Parceiros (10%)</span>
          </button>
          <button
            onClick={() => setSubTab('conquistas')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'conquistas' ? 'bg-[#83d600] text-black' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>🏆 Plano de Conquistas & Frota</span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded font-mono font-bold">
              {unlockedCount}/5
            </span>
          </button>
          <button
            onClick={() => setSubTab('divulgacao')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'divulgacao' ? 'bg-[#83d600] text-black' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>📣 Textos de Captação</span>
          </button>
        </div>
      </div>

      {isCelebrationTriggered && (
        <div className="bg-gradient-to-r from-[#132400] via-[#1e3a00] to-[#83d600] border border-[#83d600] text-white p-4 sm:p-5 rounded-xl shadow-[0_0_30px_rgba(131,214,0,0.35)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="text-center sm:text-left">
            <div className="text-sm sm:text-base font-black flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xl">🎉</span>
              <span>PARABÉNS! OBJETIVO ALCANÇADO! MISSÃO CUMPRIDA! HORA DA CONFRATERNIZAÇÃO!</span>
            </div>
            <p className="text-xs text-white/85 mt-1 font-medium">
              Todas as conquistas liberadas (Celular, Tablet, Notebook, Moto 0km e Carro 0km). Central consolidada com R$ 81.000,00 de comissão.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowCelebrationModal(true)}
              className="bg-black hover:bg-neutral-900 text-[#83d600] border border-[#83d600] px-3.5 py-2 rounded-lg text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5 transition-all"
            >
              <span>🎊 Abrir Tela de Confraternização</span>
            </button>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0f1115] border border-[#1e242b] rounded-xl p-4">
          <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block">Meta de Parceiros</span>
          <div className="text-2xl font-black text-white my-1">
            <span className="text-[#83d600]">{totalPartnersCount}</span> / {maxPartnersTarget}
          </div>
          <div className="text-[11px] text-[#83d600] font-semibold">10 motoristas ativos atinge o teto</div>
          <div className="w-full bg-[#1e242b] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#83d600] h-full transition-all duration-300"
              style={{ width: `${(totalPartnersCount / maxPartnersTarget) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-[#0f1115] border border-[#1e242b] rounded-xl p-4">
          <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block">Faturamento Bruto Parceiros</span>
          <div className="text-2xl font-black text-white my-1 font-mono">
            R$ {totalGrossRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#94a3b8]">Meta individual: R$ 81.000 /ano</div>
          <div className="w-full bg-[#1e242b] h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-sky-500 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (totalGrossRevenue / (maxPartnersTarget * 81000)) * 100)}%` }}
            ></div>
          </div>
        </div>
        <div className="bg-[#0f1115] border border-[#1e242b] rounded-xl p-4 relative overflow-hidden">
          <span className="text-[10px] font-bold text-[#83d600] uppercase tracking-wider block">
            Comissão Retida Central ({commissionRate}%)
          </span>
          <div className="text-2xl font-black text-[#83d600] my-1 font-mono">
            R$ {totalCentralCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#ffc107] font-bold">
            Meta 10 parceiros: R$ {projectedAnnualCentral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-[#0f1115] border border-[#1e242b] rounded-xl p-4">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Conquistas Liberadas</span>
          <div className="text-2xl font-black text-amber-300 my-1 font-mono">
            {unlockedCount} <span className="text-sm font-normal text-[#94a3b8]">/ 5 bens</span>
          </div>
          <div className="text-[11px] text-[#94a3b8]">Nível 1 & Nível 2</div>
        </div>
      </section>

      {subTab === 'parceiros' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              🚗 Acompanhamento Individual dos 10 Motoristas Parceiros
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleFillAll10Partners}
                className="bg-[#1e242b] hover:bg-[#252c38] text-[#83d600] border border-[#83d600]/40 text-xs px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>⚡ Preencher os 10 (Meta R$ 81k)</span>
              </button>
              <button
                onClick={() => {
                  if (partners.length >= 10) {
                    alert('Meta de 10 parceiros já foi atingida!');
                    return;
                  }
                  setShowAddModal(true);
                }}
                className="bg-[#83d600] hover:bg-[#83d600]/90 text-black font-extrabold text-xs px-3.5 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#83d600]/20"
              >
                <Plus className="w-4 h-4" />
                + Cadastrar Novo Motorista
              </button>
            </div>
          </div>

          {showAddModal && (
            <form onSubmit={handleAddPartner} className="bg-[#0f1115] border border-[#2a3442] p-4 rounded-xl space-y-3 animate-in fade-in text-xs">
              <div className="flex justify-between items-center text-white font-bold pb-2 border-b border-[#1e242b]">
                <span className="text-[#83d600] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Adicionar Motorista Parceiro ({partners.length + 1}/10)
                </span>
                <button type="button" onClick={() => setShowAddModal(false)} className="text-[#94a3b8] hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-[#94a3b8] block mb-1">Nome do Motorista</label>
                  <input
                    type="text"
                    placeholder={`Ex: Motorista Parceiro 0${partners.length + 1}`}
                    value={newPartnerName}
                    onChange={(e) => setNewPartnerName(e.target.value)}
                    className="w-full bg-[#181d24] border border-[#2a3442] rounded-lg px-2.5 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#94a3b8] block mb-1">Categoria de Atuação</label>
                  <select
                    value={newPartnerCategory}
                    onChange={(e) => setNewPartnerCategory(e.target.value)}
                    className="w-full bg-[#181d24] border border-[#2a3442] rounded-lg px-2.5 py-2 text-white"
                  >
                    <option value="W-MOTO">W-MOTO</option>
                    <option value="W-CARRO">W-CARRO</option>
                    <option value="W-MOTO / W-CARRO">W-MOTO / W-CARRO</option>
                    <option value="W-TÁXI">W-TÁXI</option>
                    <option value="W-EXECUTIVE">W-EXECUTIVE</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#94a3b8] block mb-1">Faturamento Bruto Inicial (R$)</label>
                  <input
                    type="number"
                    step="50"
                    placeholder="0.00"
                    value={newPartnerGross}
                    onChange={(e) => setNewPartnerGross(e.target.value)}
                    className="w-full bg-[#181d24] border border-[#2a3442] rounded-lg px-2.5 py-2 text-white font-mono"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#1e242b] text-[#94a3b8]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#83d600] text-black font-bold"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto rounded-xl border border-[#1e242b]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0f1115] text-[#94a3b8] border-b border-[#1e242b]">
                  <th className="py-3 px-3.5 font-bold">Motorista Parceiro</th>
                  <th className="py-3 px-3 font-bold">Categoria</th>
                  <th className="py-3 px-3 font-bold">Faturamento Bruto</th>
                  <th className="py-3 px-3 font-bold">Comissão Central ({commissionRate}%)</th>
                  <th className="py-3 px-3 font-bold text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e242b]">
                {partners.map((partner, index) => {
                  const commission = partner.grossEarnings * (commissionRate / 100);
                  return (
                    <tr key={partner.id} className="hover:bg-[#181d24]/60 transition-colors">
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{partner.name}</span>
                          {index === 0 && (
                            <span className="text-[9px] bg-[#83d600]/20 text-[#83d600] px-1.5 py-0.5 rounded font-bold">
                              Fundador
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#94a3b8]">{partner.phone}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[11px] bg-[#0a0b0d] border border-[#2a3442] px-2 py-0.5 rounded font-mono font-bold text-white">
                          {partner.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        R$ {partner.grossEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#83d600]">
                        R$ {commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAddEarnings(partner.id, 250)}
                            className="px-2 py-1 bg-[#1e242b] hover:bg-[#252c38] text-[#83d600] rounded text-[11px] font-bold transition-colors"
                          >
                            +R$ 250
                          </button>
                          {index > 0 && (
                            <button
                              onClick={() => handleDeletePartner(partner.id)}
                              className="p-1.5 bg-[#1e242b] hover:bg-red-950/60 text-[#94a3b8] hover:text-red-400 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'divulgacao' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              📢 Textos Prontos para Copiar e Enviar (WhatsApp, Grupos & Redes Sociais)
            </h3>
          </div>
          <div className="space-y-4">
            <div className="bg-[#0f1115] border border-[#1e242b] p-4 rounded-xl space-y-2">
              <label className="text-xs font-bold text-[#83d600]">MENSAGEM PARA MOTORISTAS (TAXA FIXA DE 10%):</label>
              <textarea
                readOnly
                value={copyMotorista}
                className="w-full h-24 bg-[#14171c] border border-[#2a3442] p-3 rounded-lg text-xs text-white resize-none font-sans focus:outline-none"
              />
              <button
                onClick={() => handleCopy(copyMotorista, 'mot')}
                className="bg-[#83d600] hover:bg-[#83d600]/90 text-black font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5"
              >
                {copiedId === 'mot' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'mot' ? 'Copiado!' : 'Copiar Mensagem Motorista'}</span>
              </button>
            </div>
            <div className="bg-[#0f1115] border border-[#1e242b] p-4 rounded-xl space-y-2">
              <label className="text-xs font-bold text-[#83d600]">MENSAGEM PARA PASSAGEIROS:</label>
              <textarea
                readOnly
                value={copyPassageiro}
                className="w-full h-24 bg-[#14171c] border border-[#2a3442] p-3 rounded-lg text-xs text-white resize-none font-sans focus:outline-none"
              />
              <button
                onClick={() => handleCopy(copyPassageiro, 'pas')}
                className="bg-[#83d600] hover:bg-[#83d600]/90 text-black font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5"
              >
                {copiedId === 'pas' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'pas' ? 'Copiado!' : 'Copiar Mensagem Passageiro'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {subTab === 'conquistas' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className={`p-4 rounded-xl border ${isCelularUnlocked ? 'bg-[#14171c] border-[#83d600]' : 'bg-[#0f1115] border-[#1e242b] opacity-60'}`}>
              <Smartphone className="w-6 h-6 text-[#83d600]" />
              <h4 className="text-sm font-bold text-white mt-2">Celular Novo</h4>
              <p className="text-xs text-[#94a3b8]">Suporte WhatsApp W-DRIVER (Requer 3 parceiros)</p>
            </div>
            <div className={`p-4 rounded-xl border ${isTabletUnlocked ? 'bg-[#14171c] border-[#83d600]' : 'bg-[#0f1115] border-[#1e242b] opacity-60'}`}>
              <Tablet className="w-6 h-6 text-[#83d600]" />
              <h4 className="text-sm font-bold text-white mt-2">Tablet</h4>
              <p className="text-xs text-[#94a3b8]">Monitoramento de Tráfego (Requer 5 parceiros)</p>
            </div>
            <div className={`p-4 rounded-xl border ${isNotebookUnlocked ? 'bg-[#14171c] border-[#83d600]' : 'bg-[#0f1115] border-[#1e242b] opacity-60'}`}>
              <Laptop className="w-6 h-6 text-[#83d600]" />
              <h4 className="text-sm font-bold text-white mt-2">Notebook</h4>
              <p className="text-xs text-[#94a3b8]">Gestão da Central (Requer 7 parceiros)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
