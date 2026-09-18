import React, { useState } from 'react';
import { AppUser, Driver, PendingApproval, RideCategory, UserRole } from '../types';
import { initialDemoUsers } from '../mockData';
import { getNextDriverUserCode, getNextPassengerUserCode } from '../storage';
import { WLogo } from './WLogo';
import {
  User,
  Car,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  UserPlus,
  KeyRound,
  AlertCircle,
  X,
  FileCheck,
  Upload,
  Bike,
} from 'lucide-react';

interface AuthGatewayModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentUser: AppUser | null;
  onSelectUser: (user: AppUser) => void;
  onRegisterNewUser: (newUser: AppUser, pendingDoc?: Partial<PendingApproval>) => void;
  existingDrivers?: Driver[];
  existingUsers?: AppUser[];
  pendingApprovals?: PendingApproval[];
}

export const AuthGatewayModal: React.FC<AuthGatewayModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  onRegisterNewUser,
  existingDrivers = [],
  existingUsers = [],
  pendingApprovals = [],
}) => {
  const [activeTab, setActiveTab] = useState<'perfis' | 'novo_passageiro' | 'novo_motorista' | 'admin_login'>('perfis');

  // Campos Passageiro
  const [pName, setPName] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pCpf, setPCpf] = useState('');
  const [pCity, setPCity] = useState('João Pessoa');
  const [pDocUploaded, setPDocUploaded] = useState(false);

  // Campos Motorista
  const [dName, setDName] = useState('');
  const [dEmail, setDEmail] = useState('');
  const [dPhone, setDPhone] = useState('');
  const [dCpf, setDCpf] = useState('');
  const [dVehicleType, setDVehicleType] = useState<'carro' | 'moto' | 'bike'>('carro');
  const [dVehicle, setDVehicle] = useState('');
  const [dPlate, setDPlate] = useState('');
  const [dCategory, setDCategory] = useState<RideCategory>('W-CARRO COMUM');
  const [dCnhUploaded, setDCnhUploaded] = useState(false);
  const [dCrlvUploaded, setDCrlvUploaded] = useState(false);

  if (!isOpen) return null;

  // Próximos códigos reais sequenciais calculados
  const nextDriverCode = getNextDriverUserCode(existingDrivers, pendingApprovals);
  const nextPassCode = getNextPassengerUserCode(existingUsers, pendingApprovals);

  const handleRegisterPassenger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pPhone.trim()) {
      alert('Por favor, informe seu nome e telefone.');
      return;
    }

    const newPassenger: AppUser = {
      id: `usr-pass-${Date.now()}`,
      userCode: nextPassCode,
      name: pName.trim(),
      email: pEmail.trim() || `${nextPassCode.toLowerCase()}@w-driver.com.br`,
      role: 'passageiro',
      phone: pPhone.trim(),
      cpf: pCpf.trim() || '000.000.000-00',
      state: 'PB',
      city: pCity,
      status: 'em_analise', // Status inicial obrigatório: EM ANÁLISE PELA CENTRAL
      termsAccepted: false,
      rating: 5.0,
    };

    const pendingDoc: Partial<PendingApproval> = {
      id: `appr-pass-${Date.now()}`,
      name: newPassenger.name,
      cpf: newPassenger.cpf,
      phone: newPassenger.phone,
      type: 'passageiro',
      registerDate: new Date().toLocaleDateString('pt-BR'),
      status: 'pendente',
      docsSent: pDocUploaded ? 1 : 0,
      docsTotal: 1,
      documentTypes: ['Documento com Foto (RG/CPF)'],
    };

    onRegisterNewUser(newPassenger, pendingDoc);
  };

  const handleRegisterDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dName.trim() || !dPhone.trim() || !dVehicle.trim()) {
      alert('Por favor, preencha todos os campos do motorista e veículo.');
      return;
    }

    // Regra inegociável: Motorista sequencial a partir de W-0708 (nunca W-MOT-XXXX)
    const newDriver: AppUser = {
      id: `usr-drv-${Date.now()}`,
      userCode: nextDriverCode,
      name: dName.trim(),
      email: dEmail.trim() || `${nextDriverCode.toLowerCase()}@w-driver.com.br`,
      role: 'motorista',
      phone: dPhone.trim(),
      cpf: dCpf.trim() || '000.000.000-00',
      state: 'PB',
      city: 'João Pessoa',
      status: 'em_analise', // Status inicial obrigatório: EM ANÁLISE PELA CENTRAL
      vehicle: dVehicle.trim(),
      plate: dPlate.trim().toUpperCase() || 'QRA-2026',
      category: dCategory,
      rating: 5.0,
      completedRides: 0,
      todayEarnings: 0,
      termsAccepted: false,
      trainingCompleted: false,
    };

    const docsSentCount = (dCnhUploaded ? 1 : 0) + (dCrlvUploaded ? 1 : 0);

    const pendingDoc: Partial<PendingApproval> = {
      id: `appr-drv-${Date.now()}`,
      name: newDriver.name,
      cpf: newDriver.cpf,
      phone: newDriver.phone,
      type: 'motorista',
      vehicleInfo: `${dVehicle.trim()} • Placa ${newDriver.plate}`,
      category: dCategory,
      registerDate: new Date().toLocaleDateString('pt-BR'),
      status: 'pendente',
      docsSent: docsSentCount > 0 ? docsSentCount : 1,
      docsTotal: 3,
      documentTypes: ['CNH com EAR', 'CRLV do Veículo', 'Atestado de Antecedentes'],
    };

    onRegisterNewUser(newDriver, pendingDoc);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminUser = initialDemoUsers.find((u) => u.role === 'admin') || initialDemoUsers[0];
    onSelectUser(adminUser);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0e1217] border border-[#232b38] rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e242b]">
          <div className="flex items-center gap-3">
            <WLogo size="sm" showSubtitle={false} />
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Acesso & Cadastros W-DRIVER
                <span className="text-[10px] bg-[#83d600]/20 text-[#83d600] font-black px-2 py-0.5 rounded border border-[#83d600]/30">
                  JOÃO PESSOA - PB
                </span>
              </h2>
              <p className="text-xs text-[#94a3b8]">Passageiro • Motorista Parceiro • Central CEO</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#141820] text-[#94a3b8] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Barra de Abas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#07090d] p-1.5 rounded-xl border border-[#1e242b] text-xs font-bold">
          <button
            onClick={() => setActiveTab('perfis')}
            className={`py-2 px-2 rounded-lg text-center transition-all ${
              activeTab === 'perfis'
                ? 'bg-[#83d600] text-black shadow-md'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Acesso Rápido
          </button>
          <button
            onClick={() => setActiveTab('novo_passageiro')}
            className={`py-2 px-2 rounded-lg text-center transition-all ${
              activeTab === 'novo_passageiro'
                ? 'bg-[#83d600] text-black shadow-md'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Novo Passageiro
          </button>
          <button
            onClick={() => setActiveTab('novo_motorista')}
            className={`py-2 px-2 rounded-lg text-center transition-all ${
              activeTab === 'novo_motorista'
                ? 'bg-[#83d600] text-black shadow-md'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Novo Motorista
          </button>
          <button
            onClick={() => setActiveTab('admin_login')}
            className={`py-2 px-2 rounded-lg text-center transition-all ${
              activeTab === 'admin_login'
                ? 'bg-[#83d600] text-black shadow-md'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Central / CEO
          </button>
        </div>

        {/* ABA: ACESSO RÁPIDO */}
        {activeTab === 'perfis' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider block">
              Selecione o perfil desejado para operar:
            </span>

            <div
              onClick={() => {
                const pass = initialDemoUsers.find((u) => u.role === 'passageiro') || initialDemoUsers[3];
                onSelectUser(pass);
              }}
              className="p-4 bg-[#141820] hover:bg-[#1a202c] border border-[#232b38] hover:border-[#83d600]/50 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white">PASSAGEIRO OFICIAL</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono font-bold">
                      W-PASS-0705
                    </span>
                  </div>
                  <p className="text-xs text-[#94a3b8] mt-0.5">Ana Cláudia Mendes – João Pessoa - PB</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#94a3b8] group-hover:text-[#83d600] group-hover:translate-x-1 transition-all" />
            </div>

            <div
              onClick={() => {
                const w0701 = initialDemoUsers.find((u) => u.userCode === 'W-0701') || initialDemoUsers[1];
                onSelectUser(w0701);
              }}
              className="p-4 bg-[#141820] hover:bg-[#1a202c] border-2 border-[#83d600]/60 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-4 group shadow-lg shadow-[#83d600]/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#83d600]/20 border border-[#83d600] flex items-center justify-center text-[#83d600] group-hover:scale-105 transition-transform">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-[#83d600]">MOTORISTA W-0701 (PROPRIETÁRIO)</span>
                    <span className="text-[10px] bg-[#83d600] text-black px-2 py-0.5 rounded font-mono font-black">
                      W-0701
                    </span>
                  </div>
                  <p className="text-xs text-white mt-0.5 font-bold">Diego Wallace – Frota Fundadora Oficial</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#83d600] group-hover:translate-x-1 transition-all" />
            </div>

            <div
              onClick={() => {
                const adm = initialDemoUsers.find((u) => u.role === 'admin') || initialDemoUsers[0];
                onSelectUser(adm);
              }}
              className="p-4 bg-[#141820] hover:bg-[#1a202c] border-2 border-amber-500/40 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-4 group shadow-lg shadow-amber-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-white">CENTRAL ADMINISTRATIVA / CEO</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                      W-ADM-001
                    </span>
                  </div>
                  <p className="text-xs text-[#94a3b8] mt-0.5">Diego Wallace – Painel de Controle Master W-DRIVER</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        )}

        {/* ABA: NOVO PASSAGEIRO */}
        {activeTab === 'novo_passageiro' && (
          <form onSubmit={handleRegisterPassenger} className="space-y-4 text-xs">
            <div className="p-3 bg-[#141820] rounded-xl border border-[#232b38] flex items-center justify-between">
              <span className="text-[#94a3b8]">Código a ser atribuído:</span>
              <span className="font-mono font-black text-white bg-[#0a0b0d] px-2.5 py-1 rounded border border-[#232b38] text-xs">
                {nextPassCode}
              </span>
            </div>

            <div>
              <label className="text-[#94a3b8] block mb-1 font-bold">Nome Completo <span className="text-[#83d600] text-xs font-normal">(Obrigatório)</span></label>
              <input
                type="text"
                value={pName}
                onChange={(e) => setPName(e.target.value)}
                placeholder="Ex: Mariana Silveira"
                className="w-full px-3 py-2 bg-[#141820] border border-[#232b38] rounded-xl text-white focus:outline-none focus:border-[#83d600]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#94a3b8] block mb-1 font-bold">WhatsApp / Telefone <span className="text-[#83d600] text-xs font-normal">(Obrigatório)</span></label>
                <input
                  type="tel"
                  value={pPhone}
                  onChange={(e) => setPPhone(e.target.value)}
                  placeholder="(83) 98888-0000"
                  className="w-full px-3 py-2 bg-[#141820] border border-[#232b38] rounded-xl text-white focus:outline-none focus:border-[#83d600]"
                />
              </div>
              <div>
                <label className="text-[#94a3b8] block mb-1 font-bold">CPF</label>
                <input
                  type="text"
                  value={pCpf}
                  onChange={(e) => setPCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 bg-[#141820] border border-[#232b38] rounded-xl text-white focus:outline-none focus:border-[#83d600]"
                />
              </div>
            </div>

            <div>
              <label className="text-[#94a3b8] block mb-1 font-bold">E-mail</label>
              <input
                type="email"
                value={pEmail}
                onChange={(e) => setPEmail(e.target.value)}
                placeholder="mariana@exemplo.com"
                className="w-full px-3 py-2 bg-[#141820] border border-[#232b38] rounded-xl text-white focus:outline-none focus:border-[#83d600]"
              />
            </div>

            <div>
              <label className="text-[#94a3b8] block mb-1 font-bold">Documento com Foto (Opcional)</label>
              <label className="border-2 border-dashed border-[#232b38] hover:border-[#83d600]/50 rounded-xl p-3 text-center cursor-pointer block transition-colors bg-[#141820]">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={() => setPDocUploaded(true)}
                />
                <span className="text-xs text-[#94a3b8] flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#83d600]" />
                  {pDocUploaded ? 'Documento carregado com sucesso!' : 'Enviar foto do RG ou CNH'}
                </span>
              </label>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200">
              ℹ️ Seu cadastro entrará com status <strong>EM ANÁLISE PELA CENTRAL</strong>. Você poderá ler os termos
              e tutoriais enquanto aguarda a homologação da Central.
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs rounded-xl transition-all shadow-lg shadow-[#83d600]/25 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>CADASTRAR PASSAGEIRO (STATUS: EM ANÁLISE)</span>
            </button>
          </form>
        )}

        {/* ABA: NOVO MOTORISTA */}
        {activeTab === 'novo_motorista' && (
          <form onSubmit={handleRegisterDriver} className="space-y-4 text-xs">
            <div className="p-3 bg-[#141820] rounded-xl border border-[#232b38] flex items-center justify-between">
              <div>
                <span className="text-[#94a3b8] block">Próximo Código Oficial Sequencial:</span>
                <span className="text-[10px] text-[#83d600]">Continuidade da frota piloto</span>
              </div>
              <span className="font-mono font-black text-[#83d600] bg-[#0a0b0d] px-3 py-1.5 rounded-lg border border-[#83d600]/40 text-sm">
                {nextDriverCode}
              </span>
            </div>

            <div>
              <label className="text-[#94a3b8] block mb-1 font-bold">Nome Completo do Motorista <span className="text-[#83d600] text-xs font-normal">(Obrigatório)</span></label>
              <input
                type="text"
                value={dName}
                onChange={(e) => setDName(e.target.value)}
                placeholder="Ex: Carlos Eduardo de Oliveira"
                className="w-full px-3 py-2 bg-[#141820] border border-[#232b38] rounded-xl text-white focus:outline-none focus:border-[#83d600]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#94a3b8] block mb-1 font-bold">WhatsApp / Telefone <span className="text-[#83d600] text-xs font-normal">(Obrigatório)</span></label>
                <input
                  type="tel"
                  value={dPhone}
                  onChange={(e) => setDPhone(e.target.value)}
                  placeholder="(83) 98888-1111"
                  className="w-full px-3 py-2 bg-[#141820] border border-[#232b38] rounded-xl text-white focus:outline-none focus:border-[#83d600]"
                />
              </div>
              <div>
                <label className="text-[#94a3b8] block mb-1 font-bold">CPF</label>
                <input
                  type="text"
                  value={dCpf}
                  onChange={(e) => setDCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 bg-[#141820] border border-[#232b38] rounded-xl text-white focus:outline-none focus:border-[#83d600]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#94a3b8] block mb-1 font-bold">Modelo do Veículo <span className="text-[#83d600] text-xs font-normal">(Obrigatório)</span></label>
                <input
                  type="text"
                  value={dVehicle}
                  onChange={(e) => setDVehicle(e.target.value)}
                  placeholder="Ex: Chevrolet Onix 1.0"
                  className="w-full px-3 py-2 bg-[#141820] border border-[#232b38] rounded-xl text-white focus:outline-none focus:border-[#83d600]"
                />
              </div>
              <div>
                <label className="text-[#94a3b8] block mb-1 font-bold">Placa do Veículo</label>
                <input
                  type="text"
                  value={dPlate}
                  onChange={(e) => setDPlate(e.target.value)}
                  placeholder="Ex: QRF-9E88"
                  className="w-full px-3 py-2 bg-[#141820] border border-[#232b38] rounded-xl text-white uppercase focus:outline-none focus:border-[#83d600]"
                />
              </div>
            </div>

            <div>
              <label className="text-[#94a3b8] block mb-1 font-bold">Categoria Inicial Pretendida</label>
              <select
                value={dCategory}
                onChange={(e) => setDCategory(e.target.value as RideCategory)}
                className="w-full px-3 py-2 bg-[#141820] border border-[#232b38] rounded-xl text-white focus:outline-none focus:border-[#83d600]"
              >
                <option value="W-CARRO COMUM">W-CARRO COMUM (Sedans/Hatchs compactos)</option>
                <option value="W-CARRO PRIME">W-CARRO PRIME (Sedans médios ar gelado)</option>
                <option value="W-MOTO COMUM">W-MOTO COMUM (Até 160cc)</option>
                <option value="W-MOTO PRIME">W-MOTO PRIME (250cc+ com baú)</option>
                <option value="W-BIKE">W-BIKE (Entregas e rotas orla)</option>
                <option value="W-EXECUTIVO">W-EXECUTIVO (Veículos executivos pretos)</option>
                <option value="W-TÁXI">W-TÁXI (Homologado Prefeitura JP)</option>
                <option value="W-DELIVERY">W-DELIVERY (Cargas e entregas)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="border-2 border-dashed border-[#232b38] hover:border-[#83d600]/50 rounded-xl p-2.5 text-center cursor-pointer block transition-colors bg-[#141820]">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={() => setDCnhUploaded(true)}
                />
                <span className="text-[11px] text-[#94a3b8] flex items-center justify-center gap-1">
                  <Upload className="w-3 h-3 text-[#83d600]" />
                  {dCnhUploaded ? 'CNH com EAR Anexada' : 'Upload CNH (EAR)'}
                </span>
              </label>

              <label className="border-2 border-dashed border-[#232b38] hover:border-[#83d600]/50 rounded-xl p-2.5 text-center cursor-pointer block transition-colors bg-[#141820]">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={() => setDCrlvUploaded(true)}
                />
                <span className="text-[11px] text-[#94a3b8] flex items-center justify-center gap-1">
                  <Upload className="w-3 h-3 text-[#83d600]" />
                  {dCrlvUploaded ? 'CRLV Anexado' : 'Upload CRLV'}
                </span>
              </label>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200 space-y-1">
              <p>
                ℹ️ Status inicial obrigatório: <strong>EM ANÁLISE PELA CENTRAL</strong>.
              </p>
              <p>
                O motorista deverá ler os termos de uso e realizar o <strong>Treinamento Obrigatório</strong> na tela
                de espera. Somente a Central pode autorizar a operação na malha viária.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs rounded-xl transition-all shadow-lg shadow-[#83d600]/25 flex items-center justify-center gap-2"
            >
              <Car className="w-4 h-4" />
              <span>FINALIZAR PRÉ-CADASTRO ({nextDriverCode})</span>
            </button>
          </form>
        )}

        {/* ABA: CENTRAL / CEO */}
        {activeTab === 'admin_login' && (
          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
            <div className="p-4 bg-[#141820] rounded-2xl border border-[#232b38] space-y-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#83d600]" />
                <span className="font-black text-sm text-white">Central Administrativa – Autenticação Master</span>
              </div>
              <p className="text-[#94a3b8] text-xs">
                Acesso irrestrito à Central W-DRIVER América Latina Brasil (João Pessoa - PB).
              </p>
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs rounded-xl transition-all shadow-lg shadow-[#83d600]/25 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ACESSAR CENTRAL ADMINISTRATIVA W-DRIVER</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
