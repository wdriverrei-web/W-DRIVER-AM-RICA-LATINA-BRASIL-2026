import React, { useState } from 'react';
import { Database, CheckCircle2, AlertCircle, Copy, ExternalLink, X, RefreshCw, ShieldCheck } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRidesCount: number;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({
  isOpen,
  onClose,
  activeRidesCount,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const envSample = `VITE_SUPABASE_URL=https://seu-projeto.supabase.co\nVITE_SUPABASE_ANON_KEY=sua-chave-publica-anon-aqui`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0e1217] border border-[#232b38] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1e242b] pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
              isSupabaseConfigured
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Persistência Compartilhada Multi-Aparelho</h3>
              <p className="text-[11px] text-[#94a3b8]">Passageiro, Motorista e Central no mesmo banco</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-[#141820] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status de Conexão */}
        <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${
          isSupabaseConfigured
            ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
            : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
        }`}>
          {isSupabaseConfigured ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-1">
            <p className="font-black uppercase tracking-wider text-[11px]">
              {isSupabaseConfigured
                ? 'Supabase Conectado em Tempo Real'
                : 'Supabase Não Configurado — Operando em Cache Local (Fallback)'}
            </p>
            <p className="text-[#94a3b8] leading-relaxed">
              {isSupabaseConfigured
                ? 'Todas as corridas, atualizações de status, cadastros, pagamentos e W-SOS estão sendo sincronizados via WebSocket em tempo real entre diferentes celulares e navegadores.'
                : 'O aplicativo está salvando dados com segurança no LocalStorage deste aparelho. Para que passageiro e motorista em celulares diferentes enxerguem a mesma corrida instantaneamente, basta configurar as variáveis abaixo no Supabase.'}
            </p>
          </div>
        </div>

        {/* Variáveis Necessárias */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Variáveis de Ambiente Necessárias
            </span>
            <button
              onClick={copyEnv}
              className="text-[11px] text-[#83d600] hover:underline flex items-center gap-1 font-mono"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
          <pre className="p-3 bg-[#07090d] border border-[#1e242b] rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto select-all">
            {envSample}
          </pre>
        </div>

        {/* Passo a passo da configuração */}
        <div className="p-3.5 bg-[#141820] border border-[#232b38] rounded-xl text-xs space-y-2 text-[#94a3b8]">
          <span className="font-bold text-white text-[11px] uppercase block">Como configurar no Supabase:</span>
          <ol className="list-decimal list-inside space-y-1 leading-relaxed">
            <li>Acesse o <strong className="text-white">Supabase Dashboard</strong> do seu projeto.</li>
            <li>Vá em <strong className="text-white">Project Settings &gt; API</strong> e copie a URL do projeto e a chave anônima pública (anon key).</li>
            <li>Adicione em seu ambiente ou arquivo <code className="text-[#83d600]">.env</code> com os nomes <code className="text-[#83d600]">VITE_SUPABASE_URL</code> e <code className="text-[#83d600]">VITE_SUPABASE_ANON_KEY</code>.</li>
            <li>No Supabase, execute o script SQL incluído em <code className="text-[#83d600]">supabase_schema.sql</code> no menu <strong className="text-white">SQL Editor</strong> para habilitar as tabelas e o Realtime WebSocket.</li>
          </ol>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-[11px] text-[#94a3b8]">
            <ShieldCheck className="w-4 h-4 text-[#83d600]" />
            <span>Nenhuma chave secreta exposta no código-fonte</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#83d600] hover:bg-[#72be00] text-black font-extrabold text-xs rounded-xl transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
