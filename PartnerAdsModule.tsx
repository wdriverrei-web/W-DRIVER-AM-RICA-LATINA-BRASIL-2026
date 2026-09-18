import React, { useState } from 'react';
import { PartnerAd } from '../types';
import {
  Image,
  Upload,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Sparkles,
  X,
  FileCheck,
} from 'lucide-react';

interface PartnerAdsModuleProps {
  partnerAds: PartnerAd[];
  onUpdatePartnerAds: (ads: PartnerAd[]) => void;
}

export const PartnerAdsModule: React.FC<PartnerAdsModuleProps> = ({
  partnerAds = [],
  onUpdatePartnerAds,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [plan, setPlan] = useState('Plano Ouro Semestral');
  const [period, setPeriod] = useState('01/01/2026 a 01/07/2026');
  const [linkUrl, setLinkUrl] = useState('');
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);

  const [replaceTargetId, setReplaceTargetId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isReplacing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (isReplacing && replaceTargetId) {
        const updated = partnerAds.map((ad) =>
          ad.id === replaceTargetId ? { ...ad, imageUrl: result } : ad
        );
        onUpdatePartnerAds(updated);
        setReplaceTargetId(null);
      } else {
        setUploadedImageBase64(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePartnerAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) {
      alert('Informe o nome do parceiro.');
      return;
    }
    if (!uploadedImageBase64) {
      alert('Faça o upload da imagem do banner do parceiro.');
      return;
    }

    const newAd: PartnerAd = {
      id: `ad-${Date.now()}`,
      partnerName: partnerName.trim(),
      plan,
      period,
      imageUrl: uploadedImageBase64,
      active: true,
      linkUrl: linkUrl.trim() || undefined,
      createdAt: new Date().toLocaleDateString('pt-BR'),
    };

    onUpdatePartnerAds([...partnerAds, newAd]);
    setPartnerName('');
    setUploadedImageBase64(null);
    setLinkUrl('');
    setShowAddModal(false);
  };

  const handleToggleActive = (id: string) => {
    const updated = partnerAds.map((ad) => (ad.id === id ? { ...ad, active: !ad.active } : ad));
    onUpdatePartnerAds(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja excluir este anúncio de parceiro?')) {
      const updated = partnerAds.filter((ad) => ad.id !== id);
      onUpdatePartnerAds(updated);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-200">
      {/* Header Anúncios */}
      <div className="bg-[#14171c] border border-[#232b38] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-[#83d600]/10 text-[#83d600] border border-[#83d600]/30">
                <Image className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Gestão de Anúncios & Parceiros Oficiais
              </h2>
            </div>
            <p className="text-sm text-[#94a3b8] max-w-2xl">
              Upload direto de banners publicitários (sem necessidade de links externos). Controle de ativação,
              substituição de imagens, vigência de planos e veiculação no app.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs flex items-center gap-2 shadow-lg shadow-[#83d600]/25 transition-all self-start lg:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Anúncio de Parceiro</span>
          </button>
        </div>
      </div>

      {/* Grid de Anúncios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {partnerAds.map((ad) => (
          <div
            key={ad.id}
            className={`bg-[#14171c] border rounded-2xl overflow-hidden flex flex-col justify-between transition-all ${
              ad.active ? 'border-[#232b38] shadow-lg' : 'border-[#1e242b] opacity-60'
            }`}
          >
            <div className="relative aspect-video w-full bg-[#0a0b0d] overflow-hidden group">
              <img
                src={ad.imageUrl}
                alt={ad.partnerName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase border ${
                    ad.active
                      ? 'bg-[#83d600]/20 text-[#83d600] border-[#83d600]/40'
                      : 'bg-red-500/20 text-red-400 border-red-500/40'
                  }`}
                >
                  {ad.active ? 'Ativo no App' : 'Pausado'}
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-black text-white">{ad.partnerName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold text-[#83d600]">{ad.plan}</span>
                  <span className="text-[10px] text-[#94a3b8]">• {ad.period}</span>
                </div>
                {ad.linkUrl && (
                  <a
                    href={ad.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-400 hover:underline flex items-center gap-1 mt-1 truncate"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{ad.linkUrl}</span>
                  </a>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="pt-3 border-t border-[#1e242b] flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleActive(ad.id)}
                    className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                      ad.active
                        ? 'bg-[#0a0b0d] text-[#83d600] border-[#83d600]/30 hover:bg-[#83d600]/10'
                        : 'bg-[#0a0b0d] text-[#94a3b8] border-[#232b38] hover:text-white'
                    }`}
                    title={ad.active ? 'Pausar Anúncio' : 'Ativar Anúncio'}
                  >
                    {ad.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  <label
                    className="p-2 rounded-lg bg-[#0a0b0d] text-[#94a3b8] hover:text-white border border-[#232b38] cursor-pointer transition-all"
                    title="Substituir Imagem do Banner"
                    onClick={() => setReplaceTargetId(ad.id)}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, true)}
                    />
                  </label>
                </div>

                <button
                  onClick={() => handleDelete(ad.id)}
                  className="p-2 rounded-lg bg-[#0a0b0d] hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all"
                  title="Excluir Anúncio"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Cadastro de Anúncio com Upload Direto */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#0e1217] border border-[#232b38] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e242b]">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-[#83d600]" />
                <h3 className="text-sm font-black text-white">Cadastrar Anúncio de Parceiro</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg bg-[#141820] text-[#94a3b8] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartnerAd} className="space-y-4 text-xs">
              <div>
                <label className="text-[#94a3b8] block mb-1 font-bold">Nome do Parceiro / Empresa <span className="text-[#83d600] font-normal text-[11px]">(Obrigatório)</span></label>
                <input
                  type="text"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder="Ex: Auto Elétrica & Baterias Litoral"
                  className="w-full px-3 py-2 bg-[#141820] border border-[#232b38] rounded-xl text-white focus:outline-none focus:border-[#83d600]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#94a3b8] block mb-1 font-bold">Plano de Divulgação</label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="w-full px-3 py-2 bg-[#141820] border border-[#232b38] rounded-xl text-white focus:outline-none focus:border-[#83d600]"
                  >
                    <option value="Plano Bronze Mensal">Plano Bronze Mensal</option>
                    <option value="Plano Prata Trimestral">Plano Prata Trimestral</option>
                    <option value="Plano Ouro Semestral">Plano Ouro Semestral</option>
                    <option value="Plano Diamante Anual">Plano Diamante Anual</option>
                  </select>
                </div>
                <div>
                  <label className="text-[#94a3b8] block mb-1 font-bold">Período de Vigência</label>
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="Ex: 01/01 a 31/12/2026"
                    className="w-full px-3 py-2 bg-[#141820] border border-[#232b38] rounded-xl text-white focus:outline-none focus:border-[#83d600]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#94a3b8] block mb-1 font-bold">Link de Destino / WhatsApp (Opcional)</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Ex: https://wa.me/5583988000000"
                  className="w-full px-3 py-2 bg-[#141820] border border-[#232b38] rounded-xl text-white focus:outline-none focus:border-[#83d600]"
                />
              </div>

              {/* Upload de Imagem Direto */}
              <div>
                <label className="text-[#94a3b8] block mb-1 font-bold">Banner da Imagem (Upload Direto) *</label>
                <div className="border-2 border-dashed border-[#232b38] hover:border-[#83d600]/60 rounded-2xl p-4 text-center cursor-pointer transition-all bg-[#141820] relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, false)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {uploadedImageBase64 ? (
                    <div className="space-y-2">
                      <img
                        src={uploadedImageBase64}
                        alt="Preview"
                        className="max-h-32 mx-auto rounded-lg object-contain"
                      />
                      <span className="text-[11px] text-[#83d600] font-bold block">
                        Imagem carregada com sucesso! Clique para alterar.
                      </span>
                    </div>
                  ) : (
                    <div className="py-4 space-y-1">
                      <Upload className="w-6 h-6 text-[#94a3b8] mx-auto mb-1" />
                      <span className="text-xs text-white font-bold block">
                        Clique ou arraste a imagem do banner
                      </span>
                      <span className="text-[10px] text-[#94a3b8]">PNG, JPG, WEBP (até 5MB)</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#141820] text-[#94a3b8] hover:text-white font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black flex items-center gap-1.5 shadow-md shadow-[#83d600]/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Anúncio</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
