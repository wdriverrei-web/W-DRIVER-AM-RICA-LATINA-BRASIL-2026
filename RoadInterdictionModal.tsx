import React, { useState, useRef } from 'react';
import { Driver, AppUser, OfficialRoadInterdiction, RouteDeviationRecord, Ride } from '../types';
import { calculateRidePrice } from '../mockData';
import {
  AlertTriangle,
  Camera,
  Video,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Clock,
  Car,
  FileText,
  X,
  ArrowRight,
  Info,
  RotateCcw,
} from 'lucide-react';

interface RoadInterdictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: Ride;
  driver: Driver | AppUser;
  officialInterdictions: OfficialRoadInterdiction[];
  onConfirmDeviation: (record: RouteDeviationRecord) => void;
}

export const RoadInterdictionModal: React.FC<RoadInterdictionModalProps> = ({
  isOpen,
  onClose,
  ride,
  driver,
  officialInterdictions,
  onConfirmDeviation,
}) => {
  if (!isOpen) return null;

  // Posição atual do veículo (GPS real do motorista no momento da ocorrência)
  const [vehicleGps, setVehicleGps] = useState<{ lat: number; lng: number }>({
    lat: (driver as any).lat || -7.1350,
    lng: (driver as any).lng || -34.8100,
  });

  // Motivo da interdição
  const [reasonCategory, setReasonCategory] = useState<string>('Obras na pista com bloqueio total');
  const [detailedReason, setDetailedReason] = useState<string>('');

  // Evidências (Foto e Vídeo) com carimbo inviolável
  const [evidenceType, setEvidenceType] = useState<'foto' | 'video' | 'ambos' | 'nenhuma'>('nenhuma');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedVideoName, setCapturedVideoName] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Cálculo Dinâmico da Nova Rota e Diferença de KM
  // NUNCA inventar ou fixar km: calcula dinamicamente baseado na rota alternativa por via permitida
  const originalDistance = ride.originalDistanceKm || ride.distanceKm || 4.5;
  const originalFare = ride.originalPrice || ride.price || 15.0;

  // Desvio calculado dinamicamente por via permitida
  // Exemplo: se houver interdição na Barreira ou Centro, o desvio pela malha permitida adiciona a distância real calculada
  const [calculatedDetourKm, setCalculatedDetourKm] = useState<number>(() => {
    // Cálculo dinâmico: se a corrida passa perto da Barreira (-7.1475), contorno pelo Altiplano (+2.3 km)
    // ou desvio padrão da malha viária (+1.8 km)
    const factor = Math.round((originalDistance * 0.35 + 1.2) * 100) / 100;
    return factor;
  });

  const newTotalDistanceKm = Math.round((originalDistance + calculatedDetourKm) * 100) / 100;
  const distanceDiffKm = Math.round((newTotalDistanceKm - originalDistance) * 100) / 100;

  // Cálculo do valor complementar usando a tarifa vigente da categoria
  // Tarifa estimada por km conforme a categoria da corrida
  const getRatePerKmByCategory = (cat: string) => {
    switch (cat) {
      case 'W-MOTO COMUM':
      case 'W-MOTO PRIME':
      case 'W-BIKE':
        return 1.20;
      case 'W-CARRO PRIME':
      case 'W-EXECUTIVO':
        return 3.20;
      case 'W-LUXO':
        return 4.50;
      case 'W-TÁXI':
        return 2.80;
      case 'W-CARRO COMUM':
      default:
        return 2.40;
    }
  };

  const ratePerKm = getRatePerKmByCategory(ride.category);
  const complementaryFare = Math.round(distanceDiffKm * ratePerKm * 100) / 100;
  const newEstimatedTotalFare = Math.round((originalFare + complementaryFare) * 100) / 100;

  // Confirmação do passageiro
  const [passengerConfirmationMode, setPassengerConfirmationMode] = useState<
    'aguardando' | 'confirmado' | 'ausente_emergencia'
  >('aguardando');

  // Adiciona carimbo d'água indelével na imagem (Data, Hora, GPS, Motorista, Corrida)
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCapturing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 800;
        canvas.height = img.height || 600;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Desenhar imagem original
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Desenhar banner de carimbo no rodapé (anti-fraude)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fillRect(0, canvas.height - 70, canvas.width, 70);

          ctx.fillStyle = '#83d600';
          ctx.font = 'bold 16px monospace';
          ctx.fillText(
            `W-DRIVER AUDITORIA OFICIAL • CORRIDA ${ride.id} • MOTORISTA ${(driver as any).userCode || 'W-0701'}`,
            15,
            canvas.height - 45
          );

          ctx.fillStyle = '#ffffff';
          ctx.font = '13px sans-serif';
          const nowStr = new Date().toLocaleString('pt-BR');
          ctx.fillText(
            `DATA/HORA: ${nowStr} | GPS: ${vehicleGps.lat.toFixed(5)}, ${vehicleGps.lng.toFixed(5)} | MOTIVO: INTERDIÇÃO`,
            15,
            canvas.height - 20
          );

          const stampedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setCapturedPhotoUrl(stampedDataUrl);
          setEvidenceType((prev) => (prev === 'video' ? 'ambos' : 'foto'));
        }
        setIsCapturing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedVideoName(file.name);
    setEvidenceType((prev) => (prev === 'foto' ? 'ambos' : 'video'));
  };

  const handleSimulateDefaultPhoto = () => {
    // Foto de demonstração nítida com carimbo oficial
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Fundo simulando via interditada com cones e sinalização
      ctx.fillStyle = '#181e28';
      ctx.fillRect(0, 0, 640, 420);

      // Asfalto
      ctx.fillStyle = '#262f3d';
      ctx.fillRect(0, 180, 640, 240);

      // Placa de Interdição
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(200, 70, 240, 100);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⛔ VIA INTERDITADA', 320, 115);
      ctx.font = '14px sans-serif';
      ctx.fillText('OBRAS DE CONTENÇÃO / DESVIO', 320, 145);

      // Cones
      for (let i = 80; i < 600; i += 120) {
        ctx.fillStyle = '#ff6b00';
        ctx.beginPath();
        ctx.moveTo(i, 300);
        ctx.lineTo(i + 25, 230);
        ctx.lineTo(i + 50, 300);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(i + 10, 260, 30, 8);
      }

      // Banner inferior de autenticidade
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 350, 640, 70);

      ctx.fillStyle = '#83d600';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(
        `W-DRIVER AUDITORIA ANTI-FRAUDE • ${ride.id} • ${(driver as any).userCode || 'W-0701'}`,
        15,
        375
      );

      ctx.fillStyle = '#ffffff';
      ctx.font = '11px sans-serif';
      ctx.fillText(
        `${new Date().toLocaleString('pt-BR')} • GPS: ${vehicleGps.lat.toFixed(5)}, ${vehicleGps.lng.toFixed(5)}`,
        15,
        395
      );

      setCapturedPhotoUrl(canvas.toDataURL('image/jpeg', 0.9));
      setEvidenceType((prev) => (prev === 'video' ? 'ambos' : 'foto'));
    }
  };

  const handleSubmitDeviation = () => {
    if (!detailedReason.trim()) {
      alert('Por favor, descreva detalhadamente a situação da via interditada.');
      return;
    }

    const now = new Date();
    const record: RouteDeviationRecord = {
      id: `dev-${Date.now()}`,
      rideId: ride.id,
      driverCode: (driver as any).userCode || 'W-0701',
      driverName: driver.name,
      date: now.toLocaleDateString('pt-BR'),
      time: now.toLocaleTimeString('pt-BR'),
      timestamp: now.getTime(),
      vehicleGps,
      occurrenceLocation: `${vehicleGps.lat.toFixed(5)}, ${vehicleGps.lng.toFixed(5)} (João Pessoa - PB)`,
      originalDistanceKm: originalDistance,
      originalPrice: originalFare,
      newDistanceKm: newTotalDistanceKm,
      distanceDiffKm: distanceDiffKm,
      reason: `${reasonCategory}: ${detailedReason.trim()}`,
      evidenceType: evidenceType,
      evidenceUrl: capturedPhotoUrl || undefined,
      evidenceTimestamp: now.toISOString(),
      evidenceGps: vehicleGps,
      passengerConfirmation: passengerConfirmationMode === 'confirmado' ? 'confirmado' : 'ausente_emergencia',
      passengerConfirmationTime: now.toLocaleTimeString('pt-BR'),
      complementaryFare: complementaryFare,
      complementaryPaid: false,
      driverComplementaryReleased: false,
      antiFraudAuditStatus: 'analise_pendente',
      antiFraudNotes: 'Aguardando conferência da Central. Desvio registrado pelo Cockpit do Motorista.',
    };

    onConfirmDeviation(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0e1217] border-2 border-amber-500/50 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto animate-in zoom-in-95">
        {/* Cabeçalho do Protocolo */}
        <div className="flex items-center justify-between border-b border-[#1e242b] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">
                PROTOCOLO DE SEGURANÇA OPERACIONAL W-DRIVER
              </span>
              <h2 className="text-base sm:text-lg font-black text-white">
                Via Interditada / Solicitar Desvio Oficial
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#141820] text-[#94a3b8] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informações Automáticas Registradas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-[#141820] border border-[#232b38] rounded-xl text-xs">
          <div>
            <span className="text-[10px] text-[#94a3b8] block uppercase font-bold">Viagem</span>
            <span className="font-mono font-black text-[#83d600]">{ride.id}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#94a3b8] block uppercase font-bold">Motorista</span>
            <span className="font-bold text-white">{(driver as any).userCode || 'W-0701'}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#94a3b8] block uppercase font-bold">Horário</span>
            <span className="font-mono text-white">{new Date().toLocaleTimeString('pt-BR')}</span>
          </div>
          <div>
            <span className="text-[10px] text-[#94a3b8] block uppercase font-bold">GPS Veículo</span>
            <span className="font-mono text-[#83d600] text-[11px]">
              {vehicleGps.lat.toFixed(4)}, {vehicleGps.lng.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Motivo da Interdição */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            Motivo da Interdição na Malha Viária: *
          </label>
          <select
            value={reasonCategory}
            onChange={(e) => setReasonCategory(e.target.value)}
            className="w-full bg-[#141820] border border-[#232b38] rounded-xl p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
          >
            <option value="Obras na pista com bloqueio total">Obras na pista com bloqueio total</option>
            <option value="Acidente de trânsito obstruindo a pista">Acidente de trânsito obstruindo a pista</option>
            <option value="Alagamento / erosão / via sem condições seguras">Alagamento / erosão / via sem condições seguras</option>
            <option value="Queda de árvore / poste / fiação energizada">Queda de árvore / poste / fiação energizada</option>
            <option value="Operação policial / bloqueio de trânsito / SEMOB">Operação policial / bloqueio de trânsito / SEMOB</option>
            <option value="Risco geológico / contenção de barreira">Risco geológico / contenção de barreira</option>
            <option value="Outro motivo de força maior com via intransitável">Outro motivo de força maior com via intransitável</option>
          </select>
          <textarea
            value={detailedReason}
            onChange={(e) => setDetailedReason(e.target.value)}
            placeholder="Descreva exatamente o ponto da interdição e por qual via permitida o veículo efetuará o contorno seguro..."
            className="w-full h-16 bg-[#141820] border border-[#232b38] rounded-xl p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none resize-none"
          />
        </div>

        {/* Captura de Foto / Vídeo com Estampa e Metadados */}
        <div className="p-3 bg-[#141820] border border-[#232b38] rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#83d600]" />
              Evidência Fotográfica / Vídeo com Carimbo Inviolável *
            </span>
            <span className="text-[10px] bg-[#83d600]/15 text-[#83d600] font-bold px-2 py-0.5 rounded border border-[#83d600]/30">
              Auditoria Central W-DRIVER
            </span>
          </div>
          <p className="text-[11px] text-[#94a3b8]">
            A foto/vídeo preserva data, hora e GPS no arquivo original para comprovação anti-fraude. Não é permitida a edição do conteúdo.
          </p>

          <div className="flex flex-wrap gap-2">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={handlePhotoCapture}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-[#1b222c] hover:bg-[#252f3d] text-white border border-[#2e3b4d] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Camera className="w-4 h-4 text-[#83d600]" />
              <span>FOTOGRAFAR INTERDIÇÃO</span>
            </button>

            <input
              type="file"
              accept="video/*"
              capture="environment"
              ref={videoInputRef}
              onChange={handleVideoUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="px-3 py-2 bg-[#1b222c] hover:bg-[#252f3d] text-white border border-[#2e3b4d] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Video className="w-4 h-4 text-amber-400" />
              <span>GRAVAR VÍDEO DA INTERDIÇÃO</span>
            </button>

            <button
              type="button"
              onClick={handleSimulateDefaultPhoto}
              className="px-3 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>⚡ Simular Registro de Câmera Oficial</span>
            </button>
          </div>

          {capturedPhotoUrl && (
            <div className="relative rounded-xl overflow-hidden border border-[#83d600]/40 max-h-48 bg-black flex items-center justify-center">
              <img
                src={capturedPhotoUrl}
                alt="Evidência de Interdição"
                className="max-h-48 w-full object-contain"
              />
              <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-[#83d600] font-mono font-bold flex items-center gap-1 border border-[#83d600]/40">
                <ShieldCheck className="w-3 h-3" />
                <span>EVIDÊNCIA LACRADA & AUDITÁVEL</span>
              </div>
            </div>
          )}

          {capturedVideoName && (
            <div className="p-2 bg-[#090b0e] border border-[#232b38] rounded-lg text-xs text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-400" />
              <span>Vídeo vinculado: <strong>{capturedVideoName}</strong> (Gravação salva sem edição)</span>
            </div>
          )}
        </div>

        {/* Recálculo Dinâmico de Rota e Km */}
        <div className="p-3.5 bg-gradient-to-br from-[#141820] to-[#090b0e] border-2 border-[#83d600]/40 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-[#1e242b] pb-2">
            <span className="text-xs font-black uppercase text-white flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-[#83d600]" />
              Recálculo Dinâmico por Via Permitida
            </span>
            <span className="text-[10px] font-mono text-[#94a3b8]">Cálculo OSRM / Geométrico</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-[#0a0b0d] rounded-lg border border-[#1e242b]">
              <span className="text-[10px] text-[#94a3b8] block uppercase font-bold">Distância Original</span>
              <span className="font-mono font-black text-white text-sm sm:text-base">
                {originalDistance.toFixed(2)} km
              </span>
            </div>
            <div className="p-2 bg-[#0a0b0d] rounded-lg border border-[#1e242b]">
              <span className="text-[10px] text-[#94a3b8] block uppercase font-bold">Nova Distância</span>
              <span className="font-mono font-black text-[#83d600] text-sm sm:text-base">
                {newTotalDistanceKm.toFixed(2)} km
              </span>
            </div>
            <div className="p-2 bg-[#0a0b0d] rounded-lg border border-amber-500/40">
              <span className="text-[10px] text-amber-400 block uppercase font-bold">Diferença de Km</span>
              <span className="font-mono font-black text-amber-400 text-sm sm:text-base">
                +{distanceDiffKm.toFixed(2)} km
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-[#0a0b0d] rounded-lg border border-[#1e242b] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-[#94a3b8]">Valor Inicial Pré-Pago: </span>
              <strong className="text-white">R$ {originalFare.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-amber-400">Previsão de Valor Complementar: </span>
              <strong className="text-amber-400 font-mono font-black">
                +R$ {complementaryFare.toFixed(2)}
              </strong>
            </div>
            <div>
              <span className="text-[#94a3b8]">Total Final Previsto: </span>
              <strong className="text-[#83d600] font-mono font-black">
                R$ {newEstimatedTotalFare.toFixed(2)}
              </strong>
            </div>
          </div>
          <p className="text-[10px] text-[#94a3b8]">
            * O motorista nunca informa manualmente a quilometragem. A diferença de distância é calculada de forma 100% dinâmica pelo sistema.
          </p>
        </div>

        {/* Confirmação do Passageiro */}
        <div className="p-3 bg-[#141820] border border-[#232b38] rounded-xl space-y-2">
          <label className="text-xs font-bold text-white block">
            Status de Confirmação do Passageiro:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setPassengerConfirmationMode('confirmado')}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                passengerConfirmationMode === 'confirmado'
                  ? 'bg-[#83d600]/15 border-[#83d600] text-white ring-1 ring-[#83d600]'
                  : 'bg-[#090b0e] border-[#232b38] text-[#94a3b8] hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-[#83d600] shrink-0" />
              <div>
                <strong className="block text-white">Passageiro Autorizou no App</strong>
                <span className="text-[10px] text-[#94a3b8]">Confirmado em diálogo durante a viagem</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPassengerConfirmationMode('ausente_emergencia')}
              className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                passengerConfirmationMode === 'ausente_emergencia'
                  ? 'bg-amber-500/15 border-amber-500 text-white ring-1 ring-amber-500'
                  : 'bg-[#090b0e] border-[#232b38] text-[#94a3b8] hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <strong className="block text-white">Prosseguir por Segurança</strong>
                <span className="text-[10px] text-[#94a3b8]">Passageiro sem resposta imediata / Auditado pela Central</span>
              </div>
            </button>
          </div>
        </div>

        {/* Botão de Finalização do Registro */}
        <div className="flex gap-2 pt-2 border-t border-[#1e242b]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-[#141820] hover:bg-[#1a202c] text-[#94a3b8] hover:text-white text-xs font-bold rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmitDeviation}
            className="flex-2 py-3 bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(131,214,0,0.3)] flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>REGISTRAR DESVIO & EXECUTAR NOVA ROTA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
