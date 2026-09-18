import React, { useState } from 'react';
import { AppUser, PendingApproval, PlatformConfig } from '../types';
import { WLogo } from './WLogo';
import {
  Shield,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  BookOpen,
  Award,
  Upload,
  LogOut,
  ExternalLink,
  ChevronRight,
  X,
  Sparkles,
  Phone,
  HelpCircle,
  Eye,
  Check,
} from 'lucide-react';

interface UserInAnalysisScreenProps {
  user: AppUser;
  config: PlatformConfig;
  onUpdateUser: (updatedUser: AppUser) => void;
  onUpdatePendingApprovalDoc?: (userCode: string, docName: string, docUrl: string) => void;
  onLogout: () => void;
}

export const UserInAnalysisScreen: React.FC<UserInAnalysisScreenProps> = ({
  user,
  config,
  onUpdateUser,
  onUpdatePendingApprovalDoc,
  onLogout,
}) => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState<'passageiro' | 'motorista' | 'seguranca' | null>(null);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Treinamento do Motorista
  const [trainingAnswers, setTrainingAnswers] = useState<Record<string, string>>(user.trainingAnswers || {});
  const [trainingSubmitted, setTrainingSubmitted] = useState<boolean>(!!user.trainingCompleted);

  // Termos aceitos
  const isTermsAccepted = !!user.termsAccepted;

  const handleAcceptTerms = () => {
    const updated: AppUser = {
      ...user,
      termsAccepted: true,
      termsAcceptedAt: new Date().toLocaleString('pt-BR'),
      termsVersion: config.termsVersion || 'v1.4 - 2026',
    };
    onUpdateUser(updated);
    setShowTermsModal(false);
  };

  const questions = [
    {
      id: 'q1',
      question: '1. Qual a taxa de comissão cobrada pela Central W-DRIVER?',
      options: [
        { key: 'A', text: 'Taxa variável que pode chegar a 40% como outros apps' },
        { key: 'B', text: 'Taxa fixa transparente de apenas 10% (90% fica com o motorista)', correct: true },
        { key: 'C', text: 'Não há cobrança de taxa na plataforma' },
      ],
    },
    {
      id: 'q2',
      question: '2. Em viagens com pagamento via Pix ou Dinheiro, quando a viagem deve ser iniciada?',
      options: [
        { key: 'A', text: 'Imediatamente ao aceitar a corrida no radar' },
        { key: 'B', text: 'Somente após chegar ao local de embarque, verificar confirmação de pagamento e confirmar embarque do passageiro', correct: true },
        { key: 'C', text: 'Apenas quando chegar ao destino final' },
      ],
    },
    {
      id: 'q3',
      question: '3. Em caso de via interditada ou desvio de rota comprovado por obras/acidente:',
      options: [
        { key: 'A', text: 'Cobrar valor por fora em dinheiro do passageiro sem avisar ninguém' },
        { key: 'B', text: 'Acionar a função oficial de Desvio de Rota no app, registrar motivo/foto e solicitar recálculo auditado', correct: true },
        { key: 'C', text: 'Abandonar a corrida e mandar o passageiro descer' },
      ],
    },
    {
      id: 'q4',
      question: '4. Conforme as regras de segurança e o CTB, qual é a prioridade na condução W-DRIVER?',
      options: [
        { key: 'A', text: 'A segurança da vida, direção defensiva, respeito e gentileza com o passageiro', correct: true },
        { key: 'B', text: 'Correr o máximo possível para fazer mais corridas' },
        { key: 'C', text: 'Mexer no celular enquanto estiver dirigindo' },
      ],
    },
    {
      id: 'q5',
      question: '5. Se o motorista chegar ao ponto de embarque e o passageiro não comparecer (No-Show):',
      options: [
        { key: 'A', text: 'A Central fica com 100% da taxa de cancelamento' },
        { key: 'B', text: 'O valor da taxa de No-Show é repassado 100% integralmente ao motorista para cobrir deslocamento', correct: true },
        { key: 'C', text: 'Nenhum valor é devido ao motorista' },
      ],
    },
  ];

  const handleFinishTraining = (e: React.FormEvent) => {
    e.preventDefault();
    let score = 0;
    questions.forEach((q) => {
      const correctOpt = q.options.find((o) => o.correct)?.key;
      if (trainingAnswers[q.id] === correctOpt) {
        score += 1;
      }
    });

    const updated: AppUser = {
      ...user,
      trainingCompleted: true,
      trainingScore: score,
      trainingAnswers: trainingAnswers,
      trainingCompletedAt: new Date().toLocaleString('pt-BR'),
    };
    onUpdateUser(updated);
    setTrainingSubmitted(true);
    setShowTrainingModal(false);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-start p-3 sm:p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner de Identidade */}
      <div className="w-full bg-[#14171c] border border-[#232b38] rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <WLogo size="md" showSubtitle={false} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{user.name}</h1>
                <span className="text-[11px] font-mono font-black bg-[#83d600]/20 text-[#83d600] px-2.5 py-0.5 rounded-full border border-[#83d600]/30">
                  {user.userCode}
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] mt-1">
                {user.role === 'motorista' ? 'Motorista Parceiro' : 'Passageiro Cadastrado'} •{' '}
                {user.city || 'João Pessoa'} - {user.state || 'PB'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-[#0a0b0d] hover:bg-[#1a202c] text-[#94a3b8] hover:text-white border border-[#232b38] text-xs font-bold flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Trocar Perfil / Sair</span>
            </button>
          </div>
        </div>

        {/* Status Badge Principal */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white uppercase tracking-wider">
                  Cadastro em Análise pela Central
                </span>
                <span className="text-[10px] bg-amber-500 text-black font-black px-2 py-0.5 rounded uppercase">
                  Pendente de Homologação
                </span>
              </div>
              <p className="text-xs text-[#cbd5e1] mt-0.5">
                Seus dados e documentos estão sob análise da equipe de segurança W-DRIVER. Somente a Central
                Administrativa pode aprovar o acesso operacional.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/5583988412099?text=Ol%C3%A1%20Central%20W-DRIVER!%20Meu%20cadastro%20est%C3%A1%20em%20an%C3%A1lise.%20C%C3%B3digo:%20"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs flex items-center gap-2 shrink-0 transition-all shadow-md shadow-[#83d600]/20"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Falar com Central (WhatsApp)</span>
          </a>
        </div>
      </div>

      {/* Grid de Passos de Integração e Conformidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Termos de Uso e LGPD */}
        <div className="bg-[#14171c] border border-[#232b38] rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#83d600]" />
                <h3 className="text-sm font-black text-white">Termos de Uso & Políticas</h3>
              </div>
              {isTermsAccepted ? (
                <span className="text-[10px] bg-[#83d600]/20 text-[#83d600] font-black px-2 py-0.5 rounded border border-[#83d600]/40 flex items-center gap-1">
                  <Check className="w-3 h-3" /> ACEITO
                </span>
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/40">
                  LEITURA PENDENTE
                </span>
              )}
            </div>
            <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">
              Consulte os termos oficiais de transporte, divisão justa de tarifas, regras de cancelamento,
              segurança mútua e privacidade de dados.
            </p>
          </div>

          <button
            onClick={() => setShowTermsModal(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0a0b0d] hover:bg-[#1a202c] text-white border border-[#232b38] hover:border-[#83d600]/40 text-xs font-bold flex items-center justify-between transition-all"
          >
            <span>{isTermsAccepted ? 'Rever Termos Assinados' : 'Ler Termos de Uso'}</span>
            <ChevronRight className="w-4 h-4 text-[#83d600]" />
          </button>
        </div>

        {/* Tutoriais e Orientações Oficiais */}
        <div className="bg-[#14171c] border border-[#232b38] rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-black text-white">Tutoriais & Diretrizes</h3>
              </div>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded border border-blue-500/40">
                DISPONÍVEL
              </span>
            </div>
            <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">
              Instruções completas para operação do app, como solicitar corridas, confirmar pagamentos,
              verificar motoristas e utilizar pontos seguros.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowTutorialModal(user.role === 'motorista' ? 'motorista' : 'passageiro')}
              className="py-2 px-3 rounded-xl bg-[#0a0b0d] hover:bg-[#1a202c] text-white border border-[#232b38] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <span>{user.role === 'motorista' ? 'Tutorial Motorista' : 'Tutorial Passageiro'}</span>
            </button>
            <button
              onClick={() => setShowTutorialModal('seguranca')}
              className="py-2 px-3 rounded-xl bg-[#0a0b0d] hover:bg-[#1a202c] text-white border border-[#232b38] text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Regras de Segurança</span>
            </button>
          </div>
        </div>

        {/* Treinamento Obrigatório do Motorista */}
        {user.role === 'motorista' && (
          <div className="bg-[#14171c] border border-[#232b38] rounded-2xl p-5 flex flex-col justify-between space-y-4 md:col-span-2">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-sm font-black text-white">
                    Treinamento Obrigatório do Motorista Parceiro W-DRIVER
                  </h3>
                </div>
                {user.trainingCompleted ? (
                  <span className="text-[10px] bg-[#83d600]/20 text-[#83d600] font-black px-2.5 py-1 rounded border border-[#83d600]/40 flex items-center gap-1">
                    <Check className="w-3 h-3" /> CONCLUÍDO (Nota: {user.trainingScore || 5}/5)
                  </span>
                ) : (
                  <span className="text-[10px] bg-yellow-500/20 text-yellow-400 font-bold px-2.5 py-1 rounded border border-yellow-500/40">
                    PENDENTE ANTES DE RODAR
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94a3b8] mt-2 leading-relaxed">
                Módulo rápido de qualificação: Código de Trânsito Brasileiro (CTB), direção responsável, respeito
                absoluto, regras de tarifas (10% fixo) e funcionamento dos estados de viagem. O término do
                treinamento registra seus acertos na Central.
              </p>
            </div>

            <button
              onClick={() => setShowTrainingModal(true)}
              className="py-3 px-4 rounded-xl bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-[#83d600]/20"
            >
              <Award className="w-4 h-4" />
              <span>
                {user.trainingCompleted
                  ? 'Ver Respostas e Certificação de Conclusão'
                  : 'Iniciar Treinamento Interativo Obrigatório'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL: TERMOS DE USO */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0e1217] border border-[#232b38] rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e242b]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#83d600]" />
                <h2 className="text-base sm:text-lg font-black text-white">
                  Termos de Uso e Políticas da W-DRIVER
                </h2>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-1.5 rounded-lg bg-[#141820] text-[#94a3b8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-[#cbd5e1] leading-relaxed pr-2">
              <div className="p-3 bg-[#141820] rounded-xl border border-[#232b38] text-[11px]">
                <strong className="text-white block mb-1">Versão do Documento: {config.termsVersion || 'v1.4 - 2026'}</strong>
                Última atualização homologada pela Central: {config.termsLastUpdated || '17/09/2026'}
              </div>

              <h4 className="text-sm font-black text-white">1. Propósito e Filosofia W-DRIVER</h4>
              <p>
                A W-DRIVER é uma plataforma de tecnologia em mobilidade que opera sob o lema: "Quem escolhe preço corre
                riscos. Quem escolhe a W-DRIVER escolhe chegar bem!". Nosso compromisso é com a dignidade,
                segurança, transparência de tarifas e valorização do motorista com a maior rentabilidade do Brasil.
              </p>

              <h4 className="text-sm font-black text-white">2. Regra de Tarifas e Divisão Justa</h4>
              <p>
                A Central W-DRIVER retém taxa fixa de apenas 10% (dez por cento) sobre as corridas concluídas. O
                motorista parceiro retém 90% (noventa por cento) do valor integral. Não há cobranças ocultas, leilões
                de tarifas predatórias ou taxas bancárias deduzidas da cota do motorista.
              </p>

              <h4 className="text-sm font-black text-white">3. Regra dos 4 km e Dinâmica Transparente</h4>
              <p>
                Para trajetos urbanos de até 4 km, aplica-se a tarifa mínima justa da categoria (ex: R$ 6,00 para Bike,
                R$ 8,00 para Moto Comum, R$ 12,00 para Carro Comum, R$ 16,00 para Carro Prime). Para distâncias acima
                de 4 km, aplica-se a taxa por km da distância total percorrida. Em contratos pré-pagos fixos, não se
                aplica multiplicador dinâmico.
              </p>

              <h4 className="text-sm font-black text-white">4. Confirmação Obrigatória de Pagamento</h4>
              <p>
                Nenhuma viagem pode ser iniciada sem que o pagamento esteja com status confirmado ou verificado no
                momento do embarque. Em caso de No-Show (não comparecimento do passageiro), a taxa de cancelamento é
                repassada em 100% ao motorista parceiro.
              </p>

              <h4 className="text-sm font-black text-white">5. Proteção de Dados e Gravação de Segurança</h4>
              <p>
                O uso de áudio ou vídeo durante o trajeto é facultado estritamente como medida de proteção à vida e
                integridade física, sujeito à retenção criptografada no cofre de segurança da Central e descarte após o
                prazo legal de auditoria.
              </p>
            </div>

            <div className="pt-3 border-t border-[#1e242b] flex items-center justify-end gap-3">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#141820] text-[#94a3b8] hover:text-white text-xs font-bold"
              >
                Fechar
              </button>
              {!isTermsAccepted && (
                <button
                  onClick={handleAcceptTerms}
                  className="px-5 py-2.5 rounded-xl bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-[#83d600]/25"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Li e Aceito os Termos de Uso</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TREINAMENTO DO MOTORISTA */}
      {showTrainingModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0e1217] border border-[#232b38] rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e242b]">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <h2 className="text-base sm:text-lg font-black text-white">
                  Treinamento & Qualificação W-DRIVER
                </h2>
              </div>
              <button
                onClick={() => setShowTrainingModal(false)}
                className="p-1.5 rounded-lg bg-[#141820] text-[#94a3b8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFinishTraining} className="flex-1 overflow-y-auto py-4 space-y-6 pr-2">
              <div className="p-3.5 bg-[#141820] rounded-xl border border-[#232b38] text-xs text-[#cbd5e1]">
                <strong className="text-white block mb-1">Diretrizes de Qualificação do Motorista</strong>
                Responda às questões obrigatórias abaixo. Suas respostas ficarão registradas no prontuário de homologação
                da Central Administrativa.
              </div>

              {questions.map((q) => (
                <div key={q.id} className="p-4 bg-[#141820]/60 rounded-2xl border border-[#232b38] space-y-3 text-xs">
                  <span className="font-black text-sm text-white block">{q.question}</span>
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const isSelected = trainingAnswers[q.id] === opt.key;
                      return (
                        <label
                          key={opt.key}
                          onClick={() => setTrainingAnswers((prev) => ({ ...prev, [q.id]: opt.key }))}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#83d600]/15 border-[#83d600] text-white'
                              : 'bg-[#0a0b0d] border-[#232b38] text-[#cbd5e1] hover:border-[#83d600]/40'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'border-[#83d600] bg-[#83d600] text-black font-black' : 'border-[#475569]'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <strong className="mr-2 text-[#83d600] font-mono font-bold">Opção {opt.key}:</strong>
                            <span>{opt.text}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-[#1e242b] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTrainingModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#141820] text-[#94a3b8] hover:text-white text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-[#83d600]/25"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Concluir e Enviar para a Central</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TUTORIAL */}
      {showTutorialModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0e1217] border border-[#232b38] rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e242b]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <h2 className="text-base sm:text-lg font-black text-white capitalize">
                  {showTutorialModal === 'motorista'
                    ? 'Tutorial do Motorista W-DRIVER'
                    : showTutorialModal === 'passageiro'
                    ? 'Tutorial do Passageiro W-DRIVER'
                    : 'Guia de Segurança & Ponto Seguro'}
                </h2>
              </div>
              <button
                onClick={() => setShowTutorialModal(null)}
                className="p-1.5 rounded-lg bg-[#141820] text-[#94a3b8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-[#cbd5e1] leading-relaxed pr-2">
              {showTutorialModal === 'passageiro' && (
                <>
                  <div className="p-3 bg-[#141820] rounded-xl border border-[#232b38]">
                    <strong className="text-white block mb-1">Como Solicitar uma Corrida:</strong>
                    1. Seu GPS real detectará sua localização automaticamente via Leaflet/OpenStreetMap. Você pode arrastar o mapa para calibrar o ponto exato.<br/>
                    2. Digite o endereço de destino obrigatório na barra de busca.<br/>
                    3. Escolha a categoria desejada (W-BIKE, W-MOTO COMUM, W-CARRO COMUM, W-EXECUTIVO, etc.).<br/>
                    4. Verifique a tarifa calculada com a regra dos 4 km e escolha a forma de pagamento.<br/>
                    5. Ao concluir a viagem, você receberá o recibo oficial com código #W-XXXX.
                  </div>
                </>
              )}

              {showTutorialModal === 'motorista' && (
                <>
                  <div className="p-3 bg-[#141820] rounded-xl border border-[#232b38]">
                    <strong className="text-white block mb-1">Como Atender Corridas:</strong>
                    1. Mantenha seu status como 'Online' no radar.<br/>
                    2. Ao receber uma chamada, confira a origem, destino, distância e valor líquido (90% seu).<br/>
                    3. Dirija até o local de embarque e clique em 'Cheguei'.<br/>
                    4. Confirme o pagamento (Pix ou Dinheiro) e confirme o embarque antes de iniciar a viagem.<br/>
                    5. Se o passageiro não comparecer dentro do tempo limite, registre o No-Show (100% da taxa é sua).
                  </div>
                </>
              )}

              {showTutorialModal === 'seguranca' && (
                <>
                  <div className="p-3 bg-[#141820] rounded-xl border border-[#232b38]">
                    <strong className="text-white block mb-1">Botão de Emergência W-SOS & Pontos Seguros:</strong>
                    - A W-DRIVER possui botões W-SOS acessíveis durante todo o trajeto.<br/>
                    - O acionamento envia suas coordenadas GPS em tempo real para a Central de Operações em João Pessoa.<br/>
                    - Em locais com restrições ou horários especiais, utilize a rede de Pontos Seguros cadastrados pela Central.
                  </div>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-[#1e242b] flex items-center justify-end">
              <button
                onClick={() => setShowTutorialModal(null)}
                className="px-4 py-2 rounded-xl bg-[#83d600] text-black font-black text-xs"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
