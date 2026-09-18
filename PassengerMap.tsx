import React, { useEffect, useRef } from 'react';
import { Driver, OfficialRoadInterdiction } from '../types';

interface PassengerMapProps {
  originCoords: { lat: number; lng: number } | null;
  originAccuracy?: number | null;
  destinationCoords: { lat: number; lng: number } | null;
  destinationLabel?: string;
  routePolyline?: [number, number][];
  alternativePolyline?: [number, number][];
  drivers: Driver[];
  selectedDriverCode?: string;
  interdictions?: OfficialRoadInterdiction[];
  onSelectOrigin?: (coords: { lat: number; lng: number }) => void;
  allowAdjustOrigin?: boolean;
}

export const PassengerMap: React.FC<PassengerMapProps> = ({
  originCoords,
  originAccuracy,
  destinationCoords,
  destinationLabel,
  routePolyline,
  alternativePolyline,
  drivers,
  selectedDriverCode,
  interdictions = [],
  onSelectOrigin,
  allowAdjustOrigin = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const originMarkerRef = useRef<any>(null);
  const originCircleRef = useRef<any>(null);
  const destMarkerRef = useRef<any>(null);
  const polylineLayerRef = useRef<any>(null);
  const altPolylineLayerRef = useRef<any>(null);
  const driverMarkersRef = useRef<any[]>([]);
  const interdictionLayersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    if (!mapInstanceRef.current) {
      // Default to João Pessoa center if origin is not ready yet
      const initialLat = originCoords ? originCoords.lat : -7.1195;
      const initialLng = originCoords ? originCoords.lng : -34.8450;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([initialLat, initialLng], 14);

      // CartoDB Dark Matter tiles (matches W-DRIVER dark theme)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Permitir que o passageiro clique no mapa para ajustar o ponto de embarque
      map.on('click', (e: any) => {
        if (allowAdjustOrigin && onSelectOrigin) {
          onSelectOrigin({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      });

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [allowAdjustOrigin, onSelectOrigin]);

  // Render Interdiction Zones (Círculos vermelhos com avisos oficiais)
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    interdictionLayersRef.current.forEach((layer) => map.removeLayer(layer));
    interdictionLayersRef.current = [];

    interdictions.filter((i) => i.active).forEach((inter) => {
      const circle = L.circle([inter.centerLat, inter.centerLng], {
        radius: inter.radiusMeters,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.25,
        weight: 2,
        dashArray: '4, 6',
      }).addTo(map);

      circle.bindPopup(`
        <div style="color:#0a0b0d;font-family:sans-serif;font-size:11px;padding:3px;max-width:220px;">
          <strong style="color:#ef4444;font-size:12px;">⛔ VIA OFICIALMENTE INTERDITADA</strong><br/>
          <strong>${inter.roadName}</strong> (${inter.neighborhood})<br/>
          <span style="color:#475569;">${inter.reason}</span><br/>
          <span style="color:#64748b;font-size:10px;">Auditado por: ${inter.registeredBy}</span>
        </div>
      `);

      interdictionLayersRef.current.push(circle);
    });
  }, [interdictions]);

  // Update origin marker with drag capability
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (originCoords) {
      const originIcon = L.divIcon({
        className: 'custom-origin-pin',
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;width:36px;height:36px;cursor:grab;">
            <div style="position:absolute;width:32px;height:32px;border-radius:50%;background:rgba(131,214,0,0.35);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width:18px;height:18px;border-radius:50%;background:#83d600;border:3px solid #ffffff;box-shadow:0 0 12px #83d600;z-index:2;display:flex;align-items:center;justify-content:center;color:#000;font-size:10px;font-weight:900;">📍</div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      if (originMarkerRef.current) {
        originMarkerRef.current.setLatLng([originCoords.lat, originCoords.lng]);
      } else {
        const marker = L.marker([originCoords.lat, originCoords.lng], {
          icon: originIcon,
          zIndexOffset: 1000,
          draggable: allowAdjustOrigin,
        }).addTo(map);

        marker.on('dragend', (e: any) => {
          const newLatLng = e.target.getLatLng();
          if (onSelectOrigin) {
            onSelectOrigin({ lat: newLatLng.lat, lng: newLatLng.lng });
          }
        });

        marker.bindPopup(`
          <div style="color:#0a0b0d;font-family:sans-serif;font-size:12px;padding:3px;">
            <strong style="color:#83d600;font-size:13px;">📍 Ponto de Embarque Oficial</strong><br/>
            <span style="color:#1e293b;font-size:11px;">Arraste ou clique no mapa para ajustar</span><br/>
            <span style="color:#64748b;font-size:10px;">Lat: ${originCoords.lat.toFixed(5)}, Lng: ${originCoords.lng.toFixed(5)}</span>
          </div>
        `);

        originMarkerRef.current = marker;
      }

      if (originAccuracy && originAccuracy < 2000) {
        if (originCircleRef.current) {
          originCircleRef.current.setLatLng([originCoords.lat, originCoords.lng]);
          originCircleRef.current.setRadius(originAccuracy);
        } else {
          originCircleRef.current = L.circle([originCoords.lat, originCoords.lng], {
            radius: originAccuracy,
            color: '#83d600',
            fillColor: '#83d600',
            fillOpacity: 0.08,
            weight: 1,
          }).addTo(map);
        }
      }
    } else {
      if (originMarkerRef.current) {
        map.removeLayer(originMarkerRef.current);
        originMarkerRef.current = null;
      }
      if (originCircleRef.current) {
        map.removeLayer(originCircleRef.current);
        originCircleRef.current = null;
      }
    }
  }, [originCoords, originAccuracy, allowAdjustOrigin, onSelectOrigin]);

  // Update destination marker
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (destinationCoords) {
      const destIcon = L.divIcon({
        className: 'custom-dest-pin',
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;width:34px;height:34px;">
            <div style="width:26px;height:26px;border-radius:50%;background:#ef4444;border:3px solid #ffffff;box-shadow:0 0 12px rgba(239,68,68,0.8);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:12px;">
              🏁
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      if (destMarkerRef.current) {
        destMarkerRef.current.setLatLng([destinationCoords.lat, destinationCoords.lng]);
      } else {
        destMarkerRef.current = L.marker([destinationCoords.lat, destinationCoords.lng], {
          icon: destIcon,
          zIndexOffset: 1000,
        }).addTo(map);
      }

      destMarkerRef.current.bindPopup(`
        <div style="color:#0a0b0d;font-family:sans-serif;font-size:12px;padding:3px;">
          <strong style="color:#ef4444;font-size:13px;">🏁 Destino Selecionado</strong><br/>
          <span style="font-weight:bold;color:#1e293b;">${destinationLabel || 'Destino Geocodificado'}</span><br/>
          <span style="color:#64748b;font-size:11px;">Lat: ${destinationCoords.lat.toFixed(5)}, Lng: ${destinationCoords.lng.toFixed(5)}</span>
        </div>
      `);
    } else {
      if (destMarkerRef.current) {
        map.removeLayer(destMarkerRef.current);
        destMarkerRef.current = null;
      }
    }
  }, [destinationCoords, destinationLabel]);

  // Update Route Polyline & Bounds (com suporte a Rota Original e Rota Alternativa)
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (polylineLayerRef.current) {
      map.removeLayer(polylineLayerRef.current);
      polylineLayerRef.current = null;
    }
    if (altPolylineLayerRef.current) {
      map.removeLayer(altPolylineLayerRef.current);
      altPolylineLayerRef.current = null;
    }

    if (routePolyline && routePolyline.length > 0) {
      polylineLayerRef.current = L.polyline(routePolyline, {
        color: alternativePolyline && alternativePolyline.length > 0 ? '#64748b' : '#83d600',
        weight: alternativePolyline && alternativePolyline.length > 0 ? 3 : 5,
        opacity: alternativePolyline && alternativePolyline.length > 0 ? 0.6 : 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: alternativePolyline && alternativePolyline.length > 0 ? '5, 8' : undefined,
      }).addTo(map);

      if (alternativePolyline && alternativePolyline.length > 0) {
        altPolylineLayerRef.current = L.polyline(alternativePolyline, {
          color: '#38bdf8', // Azul celeste para a nova rota alternativa
          weight: 5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
      }

      // Fit map bounds to show route
      const pointsToFit = alternativePolyline && alternativePolyline.length > 0 ? alternativePolyline : routePolyline;
      const bounds = L.latLngBounds(pointsToFit);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    } else if (originCoords && destinationCoords) {
      const bounds = L.latLngBounds([
        [originCoords.lat, originCoords.lng],
        [destinationCoords.lat, destinationCoords.lng],
      ]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    } else if (originCoords) {
      map.panTo([originCoords.lat, originCoords.lng]);
    }
  }, [routePolyline, alternativePolyline, originCoords, destinationCoords]);

  // Render nearby drivers markers (W-0701 ... W-0707)
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    driverMarkersRef.current.forEach((m) => map.removeLayer(m));
    driverMarkersRef.current = [];

    drivers.forEach((driver) => {
      const isSelected = selectedDriverCode && driver.userCode === selectedDriverCode;
      const isMoto = driver.category.includes('MOTO') || driver.category.includes('BIKE');

      const driverIcon = L.divIcon({
        className: 'driver-car-marker',
        html: `
          <div style="background:${isSelected ? '#83d600' : '#141820'};border:2px solid ${isSelected ? '#ffffff' : '#83d600'};border-radius:18px;padding:3px 7px;box-shadow:0 3px 10px rgba(0,0,0,0.6);display:flex;align-items:center;gap:4px;color:${isSelected ? '#000000' : '#ffffff'};font-weight:900;font-size:10px;font-family:monospace;white-space:nowrap;transform:translate(-50%,-50%);">
            <span>${isMoto ? '🏍️' : '🚗'}</span>
            <span>${driver.userCode}</span>
          </div>
        `,
        iconSize: [60, 26],
        iconAnchor: [30, 13],
      });

      const marker = L.marker([driver.lat, driver.lng], { icon: driverIcon }).addTo(map);
      marker.bindPopup(`
        <div style="color:#0a0b0d;font-family:sans-serif;font-size:12px;padding:2px;">
          <strong style="color:#83d600;font-size:13px;">${driver.name}</strong><br/>
          <span style="font-weight:bold;">Código: ${driver.userCode}</span><br/>
          <span style="color:#475569;">${driver.vehicle} (${driver.plate})</span><br/>
          <span style="color:#16a34a;font-weight:bold;">★ ${driver.rating} • ${driver.category}</span>
        </div>
      `);
      driverMarkersRef.current.push(marker);
    });
  }, [drivers, selectedDriverCode]);

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden border border-[#1e242b] shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '320px' }} />

      {/* Quick Map Controls Badge */}
      <div className="absolute top-3 left-3 z-[400] bg-[#0a0b0d]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#1e242b] text-white text-xs flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#83d600] animate-ping" />
        <span className="font-extrabold text-[11px] text-[#83d600]">GPS & OSRM LIVE</span>
        <span className="text-[10px] text-[#94a3b8]">| João Pessoa - PB</span>
      </div>

      {interdictions.some((i) => i.active) && (
        <div className="absolute top-3 right-3 z-[400] bg-red-950/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-red-800/60 text-red-300 text-[10px] font-bold flex items-center gap-1.5">
          <span>⛔ Vias Monitoradas</span>
        </div>
      )}

      {/* Instrução visual para o passageiro */}
      {allowAdjustOrigin && (
        <div className="absolute bottom-3 right-3 z-[400] bg-[#0a0b0d]/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#1e242b] text-[10px] text-[#94a3b8]">
          💡 Clique ou arraste o 📍 para ajustar embarque
        </div>
      )}

      {originAccuracy && originAccuracy > 0 && (
        <div className="absolute bottom-3 left-3 z-[400] bg-[#0a0b0d]/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#1e242b] text-[10px] text-[#94a3b8] font-mono">
          Precisão GPS: ±{Math.round(originAccuracy)}m
        </div>
      )}
    </div>
  );
};
