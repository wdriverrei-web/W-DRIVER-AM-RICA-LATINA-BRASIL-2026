import React, { useState } from 'react';
import { PlatformConfig } from '../types';
import { Settings, Sliders, Download, Copy, Check, Palette, Percent, DollarSign } from 'lucide-react';

interface PlatformSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: PlatformConfig;
  onUpdateConfig: (newConfig: Partial<PlatformConfig>) => void;
}

export const PlatformSettingsModal: React.FC<PlatformSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  const [commission, setCommission] = useState(config.commissionRate);
  const [color, setColor] = useState(config.primaryColor);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const colorPresets = [
    { name: 'Verde Pera Oficial', hex: '#83d600' },
    { name: 'Verde Lima Neon', hex: '#a3e635' },
    { name: 'Verde Esmeralda', hex: '#10b981' },
    { name: 'Dourado Âmbar', hex: '#f59e0b' },
    { name: 'Azul Elétrico', hex: '#3b82f6' },
  ];

  const handleApplyColor = (newColor: string) => {
    setColor(newColor);
    document.documentElement.style.setProperty('--verde-pera', newColor);
    document.documentElement.style.setProperty('--verde-pera-light', newColor);
    onUpdateConfig({ primaryColor: newColor });
  };

  const handleApplyCommission = (rate: number) => {
    setCommission(rate);
    document.documentElement.style.setProperty('--taxa-central', rate.toString());
    onUpdateConfig({ commissionRate: rate });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#14171c] border border-[#2a3442] rounded-2xl max-w-lg w-full p-5 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e242b]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#83d600]" />
            <div>
              <h3 className="text-sm font-black text-white">Parâmetros & Variáveis CSS (:root)</h3>
              <p className="text-xs text-[#94a3b8]">Customização instantânea do ecossistema W-DRIVER</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white text-lg p-1">
            ✕
          </button>
        </div>
        <div className="my-4 space-y-4 text-xs">
          <div>
            <label className="text-[11px] font-bold text-[#94a3b8] uppercase flex items-center gap-1.5 mb-2">
              <Palette className="w-3.5 h-3.5 text-[#83d600]" /> Cor Primária da Marca (:root --verde-pera)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colorPresets.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => handleApplyColor(c.hex)}
                  className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
                    color === c.hex ? 'border-white ring-2 ring-[#83d600]' : 'border-[#2a3442] hover:border-white'
                  }`}
                  style={{ backgroundColor: '#0f1115' }}
                >
                  <span className="w-5 h-5 rounded-full shadow-sm mb-1" style={{ backgroundColor: c.hex }}></span>
                  <span className="text-[9px] text-[#94a3b8] truncate font-bold">{c.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-bold text-[#94a3b8] uppercase flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-[#83d600]" /> Taxa da Central W-DRIVER
              </label>
              <span className="text-sm font-black text-[#83d600] font-mono">{commission}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="1"
              value={commission}
              onChange={(e) => handleApplyCommission(Number(e.target.value))}
              className="w-full accent-[#83d600] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#94a3b8] mt-1">
              <span>5% (Mínima)</span>
              <span>10% (Padrão Recomendado)</span>
              <span>20% (Máxima)</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-3 border-t border-[#1e242b]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#83d600] text-black font-bold text-xs rounded-lg hover:bg-[#83d600]/90"
          >
            Concluir & Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};
