import React, { useState, useEffect, useRef } from 'react';
import { Driver, RideCategory } from '../types';
import { jpLocations } from '../mockData';
import { Navigation, Compass, Layers, Car, Bike, Shield, Radio, Sparkles, CheckCircle2, MapPin } from 'lucide-react';

interface InteractiveGpsMapProps {
  drivers: Driver[];
  selectedCategory?: RideCategory | 'TODAS';
  activeRideRoute?: {
    origin: string;
    destination: string;
    progress: number; // 0 to 1
    category: RideCategory;
  } | null;
  onSelectDriver?: (driver: Driver) => void;
  onSelectLocation?: (locationName: string) => void;
  compact?: boolean;
}

export const InteractiveGpsMap: React.FC<InteractiveGpsMapProps> = ({
  drivers,
  selectedCategory = 'TODAS',
  activeRideRoute,
  onSelectDriver,
  onSelectLocation,
  compact = false,
}) => {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [filterCat, setFilterCat] = useState<RideCategory | 'TODAS'>('TODAS');
  const [viewMode, setViewMode] = useState<'leaflet' | 'radar'>('leaflet');
  const [radarActive, setRadarActive] = useState(true);
  const [trafficLayer, setTrafficLayer] = useState(true);
  const [animatedDrivers, setAnimatedDrivers] = useState<Driver[]>(drivers);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Sync drivers and simulate subtle GPS drift for realistic real-time telemetry
  useEffect(() => {
    setAnimatedDrivers(drivers);
  }, [drivers]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedDrivers((prev) =>
        prev.map((drv) => {
          const deltaLat = (Math.random() - 0.5) * 0.0006;
          const deltaLng = (Math.random() - 0.5) * 0.0006;
          return {
            ...drv,
            lat: drv.lat + deltaLat,
            lng: drv.lng + deltaLng,
          };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredDrivers = animatedDrivers.filter((d) => {
    if (filterCat !== 'TODAS') return d.category === filterCat;
    if (selectedCategory !== 'TODAS') return d.category === selectedCategory;
    return true;
  });

  // Leaflet Maps Integration (João Pessoa - PB Dark Mode Verde Pera - 100% Gratuito / Sem Chave ou Faturamento)
  useEffect(() => {
    if (viewMode !== 'leaflet') return;
    const initLeaflet = () => {
      if (!mapContainerRef.current) return;
      const L = (window as any).L;
      if (!L) return;
      const joaoPessoa = [-7.1195, -34.8450];
      if (!leafletMapRef.current) {
        leafletMapRef.current = L.map(mapContainerRef.current, {
          zoomControl: true,
          attributionControl: false
        }).setView(joaoPessoa, 13);
        // Camada Dark Matter CartoDB gratuita
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19
        }).addTo(leafletMapRef.current);
        // Marcador Base W-DRIVER
        const baseMarker = L.circleMarker(joaoPessoa, {
          color: '#ffffff',
          fillColor: '#83d600',
          fillOpacity: 1,
          radius: 9,
          weight: 2.5
        }).addTo(leafletMapRef.current);
        baseMarker.bindPopup(`
          <div style="color:#0a0b0d;font-family:sans-serif;font-size:12px;padding:3px;">
            <strong style="font-size:13px;color:#0a0b0d;">⭐ Central W-DRIVER</strong><br/>
            <span style="color:#475569;">Base Operacional João Pessoa - PB</span>
          </div>
        `);
      } else {
        setTimeout(() => {
          leafletMapRef.current?.invalidateSize();
        }, 150);
      }
      // Atualiza marcadores dos motoristas na malha
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      filteredDrivers.forEach((drv) => {
        const catColor = drv.category === 'W-BIKE' ? '#38bdf8' : drv.category === 'W-MOTO COMUM' || drv.category === 'W-MOTO' ? '#eab308' : drv.category.includes('CARRO') ? '#83d600' : '#f97316';
        const marker = L.circleMarker([drv.lat, drv.lng], {
          color: '#0a0b0d',
          fillColor: drv.status === 'em_corrida' ? '#f59e0b' : catColor,
          fillOpacity: 0.95,
          radius: drv.status === 'em_corrida' ? 7.5 : 6,
          weight: 2
        }).addTo(leafletMapRef.current);
        marker.bindPopup(`
          <div style="color:#0a0b0d;font-family:sans-serif;font-size:11px;padding:3px;min-width:140px;">
            <strong style="font-size:12px;">${drv.name}</strong><br/>
            <span style="color:${catColor};font-weight:bold;">${drv.category}</span> ★ ${drv.rating.toFixed(1)}<br/>
            <span style="color:#64748b;">${drv.vehicle} (${drv.plate})</span><br/>
            <span style="color:${drv.status === 'em_corrida' ? '#d97706' : '#16a34a'};font-weight:bold;">
              ${drv.status === 'em_corrida' ? '🟡 Em Corrida' : '🟢 Disponível'}
            </span>
          </div>
        `);
        marker.on('click', () => {
          setSelectedDriver(drv);
          onSelectDriver?.(drv);
        });
        markersRef.current.push(marker);
      });
    };
    if ((window as any).L) {
      initLeaflet();
    } else {
      const timer = setInterval(() => {
        if ((window as any).L) {
          clearInterval(timer);
          initLeaflet();
        }
      }, 200);
      return () => clearInterval(timer);
    }
  }, [viewMode, filteredDrivers]);

  // Convert lat/lng from JP coordinates to map SVG viewbox
  const mapCoords = (lat: number, lng: number) => {
    const minLat = -7.18;
    const maxLat = -7.06;
    const minLng = -34.92;
    const maxLng = -34.78;
    const x = ((lng - minLng) / (maxLng - minLng)) * 500 + 40;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 420 + 30;
    return { x: Math.max(30, Math.min(550, x)), y: Math.max(20, Math.min(460, y)) };
  };

  const getOriginPos = () => {
    if (!activeRideRoute || !activeRideRoute.origin) return null;
    const orig = (activeRideRoute.origin || '').toLowerCase();
    const loc = jpLocations.find((l) => l.name && l.name.toLowerCase().includes(orig)) || jpLocations[0];
    return { x: loc.x, y: loc.y };
  };
  const getDestPos = () => {
    if (!activeRideRoute || !activeRideRoute.destination) return null;
    const dest = (activeRideRoute.destination || '').toLowerCase();
    const loc = jpLocations.find((l) => l.name && l.name.toLowerCase().includes(dest)) || jpLocations[2];
    return { x: loc.x, y: loc.y };
  };
  const originPos = getOriginPos();
  const destPos = getDestPos();

  const carRoutePos = originPos && destPos && activeRideRoute ? {
    x: originPos.x + (destPos.x - originPos.x) * activeRideRoute.progress,
    y: originPos.y + (destPos.y - originPos.y) * activeRideRoute.progress,
  } : null;

  return (
    <div className="relative w-full h-full bg-[#0a0d13] rounded-xl overflow-hidden border border-[#1e242b] select-none flex flex-col">
      {/* Top Map Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-[#10141b]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#272f3a] shadow-lg text-xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#83d600] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#83d600]"></span>
          </span>
          <span className="font-bold text-white tracking-wide">GPS João Pessoa – PB</span>
          <span className="text-[#94a3b8] text-[10px] hidden sm:inline">({filteredDrivers.length} online na malha)</span>
        </div>
        {/* Map Control Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#10141b]/90 backdrop-blur-md p-1 rounded-lg border border-[#272f3a] shadow-lg">
          <div className="flex items-center bg-[#0a0d13] p-0.5 rounded border border-[#1e242b] mr-1">
            <button
              onClick={() => setViewMode('leaflet')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                viewMode === 'leaflet'
                  ? 'bg-[#83d600] text-black shadow-sm'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <Navigation className="w-3 h-3" />
              <span>Mapa GPS (Leaflet)</span>
            </button>
            <button
              onClick={() => setViewMode('radar')}
              className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
                viewMode === 'radar'
                  ? 'bg-[#83d600] text-black shadow-sm'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <Radio className="w-3 h-3" />
              <span>Radar SVG</span>
            </button>
          </div>
          <button
            onClick={() => setTrafficLayer(!trafficLayer)}
            title="Trânsito em tempo real"
            className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
              trafficLayer ? 'bg-[#83d600]/20 text-[#83d600] border border-[#83d600]/40' : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Tráfego</span>
          </button>
          {viewMode === 'radar' && (
            <button
              onClick={() => setRadarActive(!radarActive)}
              title="Radar sonar de patrulha"
              className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                radarActive ? 'bg-[#83d600]/20 text-[#83d600] border border-[#83d600]/40' : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Radar</span>
            </button>
          )}
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative flex-1 w-full h-full min-h-[340px] overflow-hidden">
        <div
          ref={mapContainerRef}
          className={`w-full h-full min-h-[340px] ${viewMode === 'leaflet' ? 'block' : 'hidden'}`}
          style={{ background: '#0a0b0d' }}
        />

        {viewMode === 'radar' && (
          <svg
            viewBox="0 0 600 480"
            className="w-full h-full object-cover"
            style={{ background: 'radial-gradient(ellipse at 70% 50%, #0d131e 0%, #080b10 100%)' }}
          >
            <path
              d="M 380 0 Q 420 120 440 200 T 470 340 T 490 480 L 600 480 L 600 0 Z"
              fill="#0a1a33"
              opacity="0.85"
            />
            <text x="445" y="360" fill="#64748b" fontSize="9" fontWeight="700">
              Ponta do Seixas
            </text>
            <circle cx="468" cy="348" r="4" fill="#83d600" opacity="0.6" />
            {jpLocations.map((loc) => (
              <g
                key={loc.name}
                className="cursor-pointer group"
                onClick={() => onSelectLocation && onSelectLocation(loc.name)}
              >
                <circle
                  cx={loc.x}
                  cy={loc.y}
                  r="4.5"
                  fill="#1e242b"
                  stroke="#83d600"
                  strokeWidth="1.5"
                />
                <text
                  x={loc.x + 8}
                  y={loc.y + 3}
                  fill="#cbd5e1"
                  fontSize="8"
                  fontWeight="600"
                >
                  {loc.name}
                </text>
              </g>
            ))}
            {filteredDrivers.map((driver) => {
              const pos = mapCoords(driver.lat, driver.lng);
              const isSelected = selectedDriver?.id === driver.id;
              return (
                <g
                  key={driver.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer transition-all duration-700"
                  onClick={() => {
                    setSelectedDriver(driver);
                    if (onSelectDriver) onSelectDriver(driver);
                  }}
                >
                  <circle
                    r={isSelected ? '10' : '7.5'}
                    fill={driver.status === 'em_corrida' ? '#f59e0b' : '#83d600'}
                    stroke="#0a0b0d"
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="2.5"
                    textAnchor="middle"
                    fill="#000000"
                    fontSize={isSelected ? '8' : '6.5'}
                    fontWeight="900"
                  >
                    {driver.category.includes('MOTO') ? 'M' : driver.category === 'W-BIKE' ? 'B' : 'C'}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {selectedDriver && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 bg-[#14171c]/95 backdrop-blur-md border border-[#2a3442] p-3 rounded-xl shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full border-2 border-[#83d600] overflow-hidden bg-zinc-800">
                  <img src={selectedDriver.avatar} alt={selectedDriver.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    {selectedDriver.name}
                    <span className="text-[10px] bg-[#83d600]/20 text-[#83d600] px-1.5 py-0.5 rounded font-black">
                      {selectedDriver.category}
                    </span>
                  </h4>
                  <p className="text-[11px] text-[#94a3b8]">{selectedDriver.vehicle} • {selectedDriver.plate}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="text-[#94a3b8] hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-[#1e242b] text-[11px]">
              <div className="bg-[#0f1115] p-1.5 rounded text-center">
                <span className="text-[#94a3b8] block text-[9px] uppercase font-bold">Avaliação</span>
                <span className="font-bold text-[#ffc107]">★ {selectedDriver.rating}</span>
              </div>
              <div className="bg-[#0f1115] p-1.5 rounded text-center">
                <span className="text-[#94a3b8] block text-[9px] uppercase font-bold">Hoje</span>
                <span className="font-bold text-white">{selectedDriver.completedRidesToday} corridas</span>
              </div>
              <div className="bg-[#0f1115] p-1.5 rounded text-center">
                <span className="text-[#94a3b8] block text-[9px] uppercase font-bold">Bairro</span>
                <span className="font-bold text-[#83d600] truncate block">{selectedDriver.neighborhood}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Bottom Filter Pills */}
      <div className="bg-[#0f1217] px-3 py-2 border-t border-[#1e242b] flex items-center justify-between gap-2 text-xs flex-wrap">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[#94a3b8] text-[10px] font-bold uppercase shrink-0">Filtrar Frota:</span>
          {(['TODAS', 'W-MOTO COMUM', 'W-CARRO COMUM', 'W-BIKE', 'W-EXECUTIVO'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat as any)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all shrink-0 ${
                filterCat === cat
                  ? 'bg-[#83d600] text-black'
                  : 'bg-[#181d24] text-[#94a3b8] hover:text-white border border-[#232a35]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#94a3b8]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#83d600]"></span> Livre
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> Em Corrida
          </span>
        </div>
      </div>
    </div>
  );
};
