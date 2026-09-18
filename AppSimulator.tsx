import React, { useState, useEffect } from 'react';
import { Driver, PlatformConfig, RideCategory } from '../types';
import { jpLocations, calculateRidePrice } from '../mockData';
import { WLogo } from './WLogo';
import {
  Smartphone,
  Navigation,
  MapPin,
  Clock,
  DollarSign,
  Shield,
  CheckCircle,
  Car,
  Bike,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Radio,
  Volume2,
  VolumeX,
  FileText,
  ShieldAlert,
} from 'lucide-react';

interface AppSimulatorProps {
  config: PlatformConfig;
  drivers: Driver[];
  onRideCompleted: (fare: number, category: RideCategory, origin: string, destination: string) => void;
  onRequestRideStateChange?: (activeRoute: { origin: string; destination: string; progress: number; category: RideCategory } | null) => void;
}

export const AppSimulator: React.FC<AppSimulatorProps> = ({
  config,
  drivers,
  onRideCompleted,
  onRequestRideStateChange,
}) => {
  const [appMode, setAppMode] = useState<'passenger' | 'driver'>('passenger');
  const [origin, setOrigin] = useState(jpLocations[0].name);
  const [destination, setDestination] = useState(jpLocations[2].name);
  const [selectedCategory, setSelectedCategory] = useState<RideCategory>('W-MOTO COMUM');
  const [isContractMode, setIsContractMode] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'Cartão' | 'W-Bank' | 'Dinheiro'>('Pix');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [rideState, setRideState] = useState<'idle' | 'searching' | 'accepted' | 'in_progress' | 'completed'>('idle');
  const [assignedDriver, setAssignedDriver] = useState<Driver | null>(null);
  const [etaMinutes, setEtaMinutes] = useState(4);
  const [routeProgress, setRouteProgress] = useState(0);

  const originLoc = jpLocations.find((l) => l.name === origin) || jpLocations[0];
  const destLoc = jpLocations.find((l) => l.name === destination) || jpLocations[2];
  const dx = (originLoc.x - destLoc.x) * 0.04;
  const dy = (originLoc.y - destLoc.y) * 0.04;
  const distanceKm = Math.max(1.8, Math.round(Math.sqrt(dx * dx + dy * dy) * 10) / 10);
  const estimatedMin = Math.round(distanceKm * 2.2 + 3);

  const pricingResult = calculateRidePrice(selectedCategory, distanceKm, config, isContractMode);
  const calculatedFare = pricingResult.price;
  const centralCommission = pricingResult.commissionCentral;
  const driverEarnings = pricingResult.driverEarnings;

  const handleRequestRide = () => {
    setRideState('searching');
    setTimeout(() => {
      const matchingDriver =
        drivers.find((d) => d.category === selectedCategory && d.status === 'online') || drivers[0];
      setAssignedDriver(matchingDriver);
      setRideState('accepted');
      setEtaMinutes(3);
      if (onRequestRideStateChange) {
        onRequestRideStateChange({
          origin,
          destination,
          progress: 0.15,
          category: selectedCategory,
        });
      }
      setTimeout(() => {
        setRideState('in_progress');
        setRouteProgress(0.5);
        if (onRequestRideStateChange) {
          onRequestRideStateChange({
            origin,
            destination,
            progress: 0.5,
            category: selectedCategory,
          });
        }
        setTimeout(() => {
          setRideState('completed');
          setRouteProgress(1);
          onRideCompleted(calculatedFare, selectedCategory, origin, destination);
          if (onRequestRideStateChange) {
            onRequestRideStateChange(null);
          }
        }, 4000);
      }, 3500);
    }, 2500);
  };

  const handleResetRide = () => {
    setRideState('idle');
    setAssignedDriver(null);
    setRouteProgress(0);
    if (onRequestRideStateChange) {
      onRequestRideStateChange(null);
    }
  };

  return (
    <div className="bg-[#14171c] border border-[#1e242b] rounded-xl p-4 sm:p-5 shadow-lg flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1e242b]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#83d600]/10 border border-[#83d600]/30 text-[#83d600]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              Simulador Integrado do Aplicativo
              <span className="text-[10px] bg-[#83d600]/20 text-[#83d600] px-2 py-0.5 rounded font-bold">
                W-APP TESTNET
              </span>
            </h2>
            <p className="text-xs text-[#94a3b8]">Simule pedidos de passageiros e aceite chamados</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center py-2">
        <div className="w-full max-w-[340px] bg-[#050608] rounded-[36px] border-[5px] border-[#2d3442] p-3 shadow-[0_0_35px_rgba(0,0,0,0.85)] relative overflow-hidden">
          <div className="bg-[#0e1117] rounded-[24px] p-3.5 flex flex-col gap-3 min-h-[460px] border border-[#1a202a] text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e242b]">
              <WLogo size="sm" showText={false} />
              <div className="text-center">
                <span className="text-[11px] font-black text-white tracking-wider block">
                  W-DRIVER APP
                </span>
                <span className="text-[9px] text-[#83d600] font-bold">João Pessoa – GPS Ativo</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#83d600] animate-ping"></span>
            </div>

            {rideState === 'idle' ? (
              <>
                <div className="bg-[#141820] p-2.5 rounded-xl border border-[#1e242b] space-y-2">
                  <div>
                    <label className="text-[9px] text-[#94a3b8] uppercase font-bold">Origem</label>
                    <select
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full bg-[#090b0f] text-white p-1.5 rounded font-bold text-xs"
                    >
                      {jpLocations.map((l) => (
                        <option key={l.name} value={l.name}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-[#94a3b8] uppercase font-bold">Destino</label>
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-[#090b0f] text-white p-1.5 rounded font-bold text-xs"
                    >
                      {jpLocations.map((l) => (
                        <option key={l.name} value={l.name}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-[#141820] p-3 rounded-xl border border-[#1e242b] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94a3b8]">Distância Estimada:</span>
                    <span className="font-bold text-white font-mono">{distanceKm} km</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94a3b8]">Valor:</span>
                    <span className="font-black text-sm text-[#83d600] font-mono">
                      R$ {calculatedFare.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleRequestRide}
                  className="w-full bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#83d600]/25 mt-auto"
                >
                  <span>SOLICITAR CORRIDA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : rideState === 'searching' ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 gap-4">
                <span className="animate-spin text-2xl text-[#83d600]">🔄</span>
                <h3 className="font-black text-white text-sm">Buscando motorista próximo...</h3>
              </div>
            ) : rideState === 'accepted' || rideState === 'in_progress' ? (
              <div className="flex-1 flex flex-col gap-3 justify-between">
                <div className="bg-[#83d600]/20 border border-[#83d600] p-3 rounded-xl text-center">
                  <span className="text-xs font-bold text-[#83d600] block">
                    {rideState === 'accepted' ? 'Motorista a caminho' : 'Corrida em andamento'}
                  </span>
                  <span className="text-white font-bold">{assignedDriver?.name} ({assignedDriver?.userCode})</span>
                </div>
                <div className="w-full bg-[#1e242b] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#83d600] h-full transition-all" style={{ width: `${routeProgress * 100}%` }}></div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-3 gap-3">
                <CheckCircle className="w-10 h-10 text-[#83d600]" />
                <h3 className="font-black text-white text-sm">Corrida Finalizada!</h3>
                <button
                  onClick={handleResetRide}
                  className="w-full bg-[#83d600] text-black font-black text-xs py-2.5 rounded-xl hover:bg-[#83d600]/90 transition-all"
                >
                  Nova Simulação
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
