import React, { useState, useEffect, useRef } from 'react';
import {
  AppUser,
  Driver,
  PlatformConfig,
  RideCategory,
  SafePoint,
  TransportContract,
  BlockedUserPair,
  DetailedAddress,
  OfficialRoadInterdiction,
  RouteDeviationRecord,
} from '../types';
import {
  jpLocations,
  calculateRidePrice,
  initialOfficialInterdictions,
  findInterdictionCrossing,
  getDistanceMeters,
} from '../mockData';
import { PassengerMap } from './PassengerMap';
import { WLogo } from './WLogo';
import {
  Navigation,
  MapPin,
  Car,
  Bike,
  CreditCard,
  QrCode,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Phone,
  UserX,
  X,
  Star,
  LogOut,
  ChevronRight,
  FileText,
  DollarSign,
  LocateFixed,
} from 'lucide-react';

interface PassengerPortalProps {
  user: AppUser;
  config: PlatformConfig;
  drivers: Driver[];
  safePoints: SafePoint[];
  contracts: TransportContract[];
  blockedPairs: BlockedUserPair[];
  activeRide?: any;
  onRequestRide?: (ride: any) => void;
  onCancelRide?: () => void;
  onLogout: () => void;
  onRideCompleted: (fare: number, category: RideCategory, origin: string, destination: string) => void;
  onBlockDriver?: (pair: BlockedUserPair) => void;
  onPassengerConfirmDeviation?: (rideId: string) => void;
  onPayComplementaryFare?: (rideId: string, method: string) => void;
  onDeferComplementaryFare?: (rideId: string) => void;
  onTriggerSos?: (alert: any) => void;
}

export const PassengerPortal: React.FC<PassengerPortalProps> = ({
  user,
  config,
  drivers,
  safePoints,
  contracts,
  blockedPairs,
  activeRide,
  onRequestRide,
  onCancelRide,
  onLogout,
  onRideCompleted,
  onBlockDriver,
  onPassengerConfirmDeviation,
  onPayComplementaryFare,
  onDeferComplementaryFare,
  onTriggerSos,
}) => {
  // GPS Real da Origem (exclusivamente do aparelho do passageiro, com centro de João Pessoa imediato)
  const defaultJpCoords = { lat: -7.1153, lng: -34.8231 }; // João Pessoa - PB (Tambaú / Orla)
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number }>(defaultJpCoords);
  const [detectedGpsCoords, setDetectedGpsCoords] = useState<{ lat: number; lng: number }>(defaultJpCoords);
  const [originAccuracy, setOriginAccuracy] = useState<number | null>(15);
  const [originAddress, setOriginAddress] = useState<string>('João Pessoa - PB (Tambaú / Orla)');
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'connected' | 'denied' | 'fallback'>('searching');

  // Endereço Detalhado de Embarque (Rua, Número, CEP, Complemento, Quadra e Lote)
  const [detailedAddress, setDetailedAddress] = useState<DetailedAddress>({
    street: 'Av. Almirante Tamandaré',
    number: '100',
    neighborhood: 'Tambaú',
    cep: '58039-010',
    complement: '',
    blockAndLot: '',
  });
  const [isPickupConfirmed, setIsPickupConfirmed] = useState<boolean>(true);
  const [pickupDiscrepancyWarning, setPickupDiscrepancyWarning] = useState<string | null>(null);
  const [showAddressDetailsForm, setShowAddressDetailsForm] = useState<boolean>(false);

  // Destino Informado (digitado ou selecionado de pontos de referência cadastrados)
  const [destinationInput, setDestinationInput] = useState<string>('');
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationLabel, setDestinationLabel] = useState<string>('');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  // Rota OSRM Real & Detecção de Interdição Oficial
  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([]);
  const [alternativeRoutePolyline, setAlternativeRoutePolyline] = useState<[number, number][]>([]);
  const [activeInterdictionAlert, setActiveInterdictionAlert] = useState<OfficialRoadInterdiction | null>(null);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number>(0);
  const [routeDurationMin, setRouteDurationMin] = useState<number>(0);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);

  // Desvio de Rota em Andamento (Notificação do Motorista)
  const [showDeviationAuthorizeModal, setShowDeviationAuthorizeModal] = useState<boolean>(false);
  const [complementaryPaidLocally, setComplementaryPaidLocally] = useState<boolean>(false);
  const [complementaryDeferredLocally, setComplementaryDeferredLocally] = useState<boolean>(false);
  const [complementaryPayMethod, setComplementaryPayMethod] = useState<'Pix' | 'Cartão' | 'Dinheiro'>('Pix');

  // Categorias & Regras de Tarifa
  const categoriesList: { id: RideCategory; label: string; icon: string; desc: string }[] = [
    { id: 'W-MOTO COMUM', label: 'W-MOTO COMUM', icon: '🏍️', desc: 'Rápido, econômico e ágil' },
    { id: 'W-MOTO PRIME', label: 'W-MOTO PRIME', icon: '⚡', desc: 'Motos de alta cilindrada' },
    { id: 'W-CARRO COMUM', label: 'W-CARRO COMUM', icon: '🚗', desc: 'Conforto e ar-condicionado' },
    { id: 'W-CARRO PRIME', label: 'W-CARRO PRIME', icon: '✨', desc: 'Sedans executivos e SUVs' },
    { id: 'W-BIKE', label: 'W-BIKE', icon: '🚲', desc: 'Sustentável e orla' },
    { id: 'W-TÁXI', label: 'W-TÁXI', icon: '🚕', desc: 'Faixa exclusiva e taxímetro' },
    { id: 'W-EXECUTIVO', label: 'W-EXECUTIVO', icon: '💼', desc: 'Motorista bilíngue/executivo' },
    { id: 'W-LUXO', label: 'W-LUXO', icon: '👑', desc: 'Veículos importados de luxo' },
  ];
  const [selectedCategory, setSelectedCategory] = useState<RideCategory>('W-CARRO COMUM');

  // Chamada Direta por Código de Motorista (W-0701 a W-0707)
  const [directDriverCode, setDirectDriverCode] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  // Forma de Pagamento
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'Cartão' | 'Dinheiro'>('Pix');
  const [pixKeyCopied, setPixKeyCopied] = useState<boolean>(false);

  // Fluxo da Corrida: idle -> requested -> accepted -> in_trip -> completed
  const [rideStep, setRideStep] = useState<'idle' | 'requested' | 'accepted' | 'in_trip' | 'completed'>('idle');
  const [rideId, setRideId] = useState<string>('');
  const [activeDriver, setActiveDriver] = useState<Driver | null>(null);
  const [tripProgress, setTripProgress] = useState<number>(0);

  // Sincronização em tempo real com activeRide do App
  useEffect(() => {
    if (!activeRide) {
      if (rideStep !== 'idle' && rideStep !== 'completed') {
        setRideStep('idle');
        setRideId('');
        setActiveDriver(null);
      }
      return;
    }

    setRideId(activeRide.id);

    if (activeRide.driverCode) {
      const drv = drivers.find((d) => d.userCode === activeRide.driverCode);
      if (drv) setActiveDriver(drv);
    }

    if (activeRide.status === 'solicitada') {
      setRideStep('requested');
    } else if (activeRide.status === 'a_caminho') {
      setRideStep('accepted');
    } else if (activeRide.status === 'em_andamento') {
      setRideStep('in_trip');
    } else if (activeRide.status === 'concluida') {
      setRideStep('completed');
    }
  }, [activeRide, drivers]);

  // Bloqueio Mútuo com Justificativa
  const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
  const [blockReason, setBlockReason] = useState<string>('');
  const [blockError, setBlockError] = useState<string | null>(null);

  // 1. Obter GPS REAL DA ORIGEM exclusivamente pelo aparelho do passageiro
  const requestRealGps = () => {
    setGpsStatus('searching');
    setOriginAddress('Conectando aos satélites GPS...');

    if (!navigator.geolocation) {
      setGpsStatus('fallback');
      setOriginCoords(defaultJpCoords);
      setDetectedGpsCoords(defaultJpCoords);
      setOriginAddress('João Pessoa (Tambaú - GPS Fallback)');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setOriginCoords(coords);
        setDetectedGpsCoords(coords);
        setOriginAccuracy(pos.coords.accuracy || 15);
        setGpsStatus('connected');
        setPickupDiscrepancyWarning(null);

        // Reverse Geocoding para obter o nome da rua e bairro real da origem
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=18&addressdetails=1`,
            {
              headers: { 'User-Agent': 'W-Driver-PassengerApp/1.0' },
            }
          );
          if (resp.ok) {
            const data = await resp.json();
            const road = data.address?.road || data.address?.suburb || 'Sua localização atual';
            const houseNumber = data.address?.house_number || '';
            const neighbourhood = data.address?.neighbourhood || data.address?.city_district || '';
            const postcode = data.address?.postcode || '';
            const display = neighbourhood ? `${road}, ${neighbourhood}` : road;
            setOriginAddress(display || data.display_name.split(',')[0]);
            setDetailedAddress((prev) => ({
              ...prev,
              street: road || prev.street,
              number: houseNumber || prev.number,
              neighborhood: neighbourhood || prev.neighborhood,
              cep: postcode || prev.cep,
            }));
          } else {
            setOriginAddress(`GPS Real (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`);
          }
        } catch {
          setOriginAddress(`GPS Real (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`);
        }
      },
      (err) => {
        console.warn('GPS Error:', err);
        setGpsStatus('denied');
        setOriginCoords(defaultJpCoords);
        setDetectedGpsCoords(defaultJpCoords);
        setOriginAddress('João Pessoa - PB (Tambaú / Orla)');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    requestRealGps();
  }, []);

  // Ajuste interativo do ponto de embarque caso o GPS apresente desvio de alguns metros
  const handleAdjustPickupCoords = async (newCoords: { lat: number; lng: number }) => {
    setOriginCoords(newCoords);
    setIsPickupConfirmed(false);

    // Comparar endereço, GPS detectado e ponto escolhido no mapa
    const distMeters = getDistanceMeters(
      detectedGpsCoords.lat,
      detectedGpsCoords.lng,
      newCoords.lat,
      newCoords.lng
    );

    if (distMeters > 150) {
      setPickupDiscrepancyWarning(
        `O ponto marcado no mapa está a ${Math.round(distMeters)}m do seu sinal GPS. Por favor, confirme se este é exatamente o local onde você aguardará o motorista.`
      );
    } else {
      setPickupDiscrepancyWarning(null);
    }

    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newCoords.lat}&lon=${newCoords.lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'W-Driver-PassengerApp/1.0' } }
      );
      if (resp.ok) {
        const data = await resp.json();
        const road = data.address?.road || data.address?.suburb || 'Ponto de Embarque no Mapa';
        const houseNumber = data.address?.house_number || '';
        const neighbourhood = data.address?.neighbourhood || data.address?.city_district || '';
        const postcode = data.address?.postcode || '';
        const display = neighbourhood ? `${road}, ${neighbourhood}` : road;
        setOriginAddress(display || data.display_name.split(',')[0]);
        setDetailedAddress((prev) => ({
          ...prev,
          street: road || prev.street,
          number: houseNumber || prev.number,
          neighborhood: neighbourhood || prev.neighborhood,
          cep: postcode || prev.cep,
        }));
      }
    } catch {
      setOriginAddress(`Ponto Confirmado (${newCoords.lat.toFixed(5)}, ${newCoords.lng.toFixed(5)})`);
    }

    if (destinationCoords) {
      calculateOsrmRoute(newCoords, destinationCoords);
    }
  };

  const handleConfirmPickupLocation = () => {
    setIsPickupConfirmed(true);
    setPickupDiscrepancyWarning(null);
  };

  // 2. FUNÇÃO DE CÁLCULO DE ROTA REAL PELO OSRM COM DETECÇÃO DE INTERDIÇÃO OFICIAL
  const calculateOsrmRoute = async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ) => {
    setIsCalculatingRoute(true);
    setActiveInterdictionAlert(null);
    setAlternativeRoutePolyline([]);

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('OSRM request failed');
      const data = await res.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        let distKm = Math.max(0.5, Math.round((route.distance / 1000) * 10) / 10);
        let durMin = Math.max(2, Math.round(route.duration / 60));
        let coordsLatLng: [number, number][] = route.geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );

        // Checar se a rota cruza alguma via interditada oficial (ex: Barreira do Cabo Branco)
        const crossing = findInterdictionCrossing(coordsLatLng, initialOfficialInterdictions);
        if (crossing && crossing.detourWaypointLat && crossing.detourWaypointLng) {
          setActiveInterdictionAlert(crossing);
          try {
            // Calcular rota alternativa oficial contornando o bloqueio por via autorizada
            const detourUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${crossing.detourWaypointLng},${crossing.detourWaypointLat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
            const detourRes = await fetch(detourUrl);
            if (detourRes.ok) {
              const detourData = await detourRes.json();
              if (detourData.routes && detourData.routes.length > 0) {
                const detourRoute = detourData.routes[0];
                distKm = Math.max(0.5, Math.round((detourRoute.distance / 1000) * 10) / 10);
                durMin = Math.max(2, Math.round(detourRoute.duration / 60));
                coordsLatLng = detourRoute.geometry.coordinates.map(
                  (c: [number, number]) => [c[1], c[0]]
                );
              }
            }
          } catch (detourErr) {
            console.warn('Detour route fetch failed:', detourErr);
          }
        }

        setRouteDistanceKm(distKm);
        setRouteDurationMin(durMin);
        setRoutePolyline(coordsLatLng);
        return;
      }
      throw new Error('Sem rota OSRM retornada');
    } catch (e) {
      console.warn('OSRM Route fallback:', e);
      // Fallback geométrico de alta precisão para malha viária de João Pessoa
      const dLat = (destination.lat - origin.lat) * 111;
      const dLng = (destination.lng - origin.lng) * 111 * Math.cos(origin.lat * (Math.PI / 180));
      const straightKm = Math.sqrt(dLat * dLat + dLng * dLng) * 1.35; // Fator de sinuosidade urbana
      const dist = Math.max(1.0, Math.round(straightKm * 10) / 10);
      setRouteDistanceKm(dist);
      setRouteDurationMin(Math.round(dist * 2.5 + 3));
      setRoutePolyline([
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ]);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // 3. FORWARD GEOCODING do DESTINO com Nominatim / OpenStreetMap
  const handlePerformGeocoding = async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setDestinationCoords(null);
      setDestinationLabel('');
      setRoutePolyline([]);
      setRouteDistanceKm(0);
      setRouteDurationMin(0);
      setGeocodingError(null);
      return;
    }

    // Limpar imediatamente rota e destino anteriores
    setRoutePolyline([]);
    setRouteDistanceKm(0);
    setRouteDurationMin(0);
    setGeocodingError(null);
    setIsGeocoding(true);

    const currentOrigin = originCoords || defaultJpCoords;

    // Regra 8: Para pontos de referência cadastrados pela Central, permitir seleção direta
    const matchedRef = jpLocations.find(
      (loc) => loc.name && loc.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (matchedRef) {
      const dest = { lat: matchedRef.lat, lng: matchedRef.lng };
      setDestinationCoords(dest);
      setDestinationLabel(matchedRef.name);
      setGeocodingError(null);
      await calculateOsrmRoute(currentOrigin, dest);
      setIsGeocoding(false);
      return;
    }

    const matchedSafePoint = safePoints.find(
      (sp) =>
        (sp.safePointName && sp.safePointName.toLowerCase() === trimmed.toLowerCase()) ||
        (sp.referenceAddress && sp.referenceAddress.toLowerCase().includes(trimmed.toLowerCase())) ||
        (sp.neighborhood && sp.neighborhood.toLowerCase().includes(trimmed.toLowerCase()))
    );
    if (matchedSafePoint && matchedSafePoint.lat && matchedSafePoint.lng) {
      const dest = { lat: matchedSafePoint.lat, lng: matchedSafePoint.lng };
      setDestinationCoords(dest);
      setDestinationLabel(matchedSafePoint.safePointName);
      setGeocodingError(null);
      await calculateOsrmRoute(currentOrigin, dest);
      setIsGeocoding(false);
      return;
    }

    // Regras 3, 4, 5, 6, 7: Forward geocoding real com Nominatim
    try {
      // Prioriza a região metropolitana de João Pessoa - PB
      const searchQuery = trimmed.toLowerCase().includes('joão pessoa') || trimmed.toLowerCase().includes('paraíba')
        ? trimmed
        : `${trimmed}, João Pessoa, Paraíba, Brasil`;

      const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery
      )}&limit=1&addressdetails=1&countrycodes=br`;

      const response = await fetch(endpoint, {
        headers: { 'User-Agent': 'W-Driver-PassengerApp/1.0' },
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do serviço de geocodificação');
      }

      const results = await response.json();

      if (results && results.length > 0) {
        const first = results[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);

        if (!isNaN(lat) && !isNaN(lng)) {
          // Substituir por nova coordenada real definitiva
          const dest = { lat, lng };
          setDestinationCoords(dest);
          const label = first.display_name.split(',').slice(0, 3).join(', ');
          setDestinationLabel(label);
          setGeocodingError(null);
          // Calcular a rota real imediatamente
          await calculateOsrmRoute(currentOrigin, dest);
        } else {
          setGeocodingError('Coordenadas inválidas recebidas. Tente especificar rua e número.');
          setDestinationCoords(null);
          setDestinationLabel('');
          setRouteDistanceKm(0);
        }
      } else {
        // Regra 10: Se o destino não puder ser localizado: não criar corrida, não mostrar botão de confirmação, informar claramente o erro
        setGeocodingError('Endereço não localizado no mapa. Verifique o nome da rua, número ou ponto de referência e tente novamente.');
        setDestinationCoords(null);
        setDestinationLabel('');
        setRouteDistanceKm(0);
      }
    } catch (err) {
      setGeocodingError('Erro ao consultar endereço via satélite. Verifique sua conexão e tente novamente.');
      setDestinationCoords(null);
      setDestinationLabel('');
      setRouteDistanceKm(0);
    } finally {
      setIsGeocoding(false);
    }
  };

  // 4. Calcular Tarifa com base na distância real calculada pelo OSRM
  const pricing = calculateRidePrice(selectedCategory, routeDistanceKm, config, false);
  const totalFare = pricing.price;

  // 5. Filtrar motoristas bloqueados mutuamente
  const availableDrivers = drivers.filter((drv) => {
    const isBlocked = blockedPairs.some(
      (bp) =>
        (bp.blockerCode === user.userCode && bp.blockedCode === drv.userCode) ||
        (bp.blockerCode === drv.userCode && bp.blockedCode === user.userCode) ||
        (bp.user1Code === user.userCode && bp.user2Code === drv.userCode) ||
        (bp.user2Code === user.userCode && bp.user1Code === drv.userCode)
    );
    return !isBlocked;
  });

  // 6. CONFIRMAR E SOLICITAR VIAGEM (Regras 4, 5, 6, 7 e 8)
  const handleConfirmAndRequestRide = () => {
    // Validações obrigatórias
    if (!originCoords) {
      alert('Origem GPS não identificada. Por favor, ative o GPS.');
      return;
    }
    if (!destinationCoords || routeDistanceKm <= 0) {
      alert('Por favor, busque e confirme um endereço de destino válido antes de solicitar.');
      return;
    }
    if (!selectedCategory) {
      alert('Selecione uma categoria de veículo.');
      return;
    }
    if (!paymentMethod) {
      alert('Selecione uma forma de pagamento.');
      return;
    }

    // Regra 5: Se informou motorista específico (W-0701 até W-0707)
    let targetDriver: Driver | undefined;
    if (directDriverCode.trim()) {
      const codeUpper = directDriverCode.trim().toUpperCase();
      const validFleetCodes = ['W-0701', 'W-0702', 'W-0703', 'W-0704', 'W-0705', 'W-0706', 'W-0707'];
      if (!validFleetCodes.includes(codeUpper)) {
        alert(`Código inválido "${codeUpper}". Para chamada direta, informe um código oficial entre W-0701 e W-0707.`);
        setGeocodingError(`Código inválido "${codeUpper}". Para chamada direta, informe um motorista de W-0701 a W-0707.`);
        return;
      }

      // Verificar bloqueio mútuo
      const isBlocked = blockedPairs.some(
        (bp) =>
          (bp.blockerCode === user.userCode && bp.blockedCode === codeUpper) ||
          (bp.blockerCode === codeUpper && bp.blockedCode === user.userCode)
      );
      if (isBlocked) {
        alert(`O motorista ${codeUpper} está bloqueado mutuamente e não pode ser chamado.`);
        return;
      }

      targetDriver = drivers.find((d) => d.userCode === codeUpper);
      if (!targetDriver) {
        alert(`Motorista ${codeUpper} não encontrado na frota.`);
        return;
      }
    }

    // Gerar código único no formato #W-XXXX
    const uniqueRideCode = `#W-${Math.floor(1000 + Math.random() * 9000)}`;
    setRideId(uniqueRideCode);
    setActiveDriver(targetDriver || null);
    setRideStep('requested');

    // Montar objeto de corrida real
    const newRide = {
      id: uniqueRideCode,
      rideType: 'avulsa' as const,
      passengerName: user.name,
      passengerCode: user.userCode,
      driverName: targetDriver ? targetDriver.name : undefined,
      driverCode: targetDriver ? targetDriver.userCode : undefined,
      driverVehicle: targetDriver ? targetDriver.vehicle : undefined,
      category: selectedCategory,
      origin: originAddress,
      destination: destinationLabel || destinationInput,
      pickupCoords: originCoords,
      destinationCoords: destinationCoords,
      pickupDetailedAddress: detailedAddress,
      pickupConfirmed: isPickupConfirmed,
      distanceKm: routeDistanceKm,
      originalDistanceKm: routeDistanceKm,
      durationMin: routeDurationMin,
      price: totalFare,
      originalPrice: totalFare,
      multiplierDynamic: 1.0,
      commissionRate: config.commissionRate / 100,
      commissionValue: pricing.commissionCentral,
      netDriverValue: pricing.driverEarnings,
      status: 'solicitada' as const,
      timestamp: 'Agora',
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === 'Pix' ? ('aguardando_confirmacao' as const) : ('confirmado' as const),
      state: 'PB',
      isDirectCallByCode: !!targetDriver,
      calledDriverCode: targetDriver ? targetDriver.userCode : undefined,
      hasDeviation: false,
    };

    // Propagar corrida para a Central e para o DriverPortal
    if (onRequestRide) {
      onRequestRide(newRide);
    }
  };

  const handleCancelRide = () => {
    setRideStep('idle');
    setRideId('');
    setActiveDriver(null);
    setTripProgress(0);
    if (onCancelRide) {
      onCancelRide();
    }
  };

  const handleResetRide = () => {
    setRideStep('idle');
    setRideId('');
    setActiveDriver(null);
    setTripProgress(0);
    setShowBlockModal(false);
    setBlockReason('');
  };

  // Bloqueio Mútuo de Motorista
  const handleConfirmBlock = () => {
    if (!activeDriver) return;
    if (!blockReason.trim() || blockReason.trim().length < 5) {
      setBlockError('A justificativa de segurança é obrigatória (mínimo 5 caracteres).');
      return;
    }

    const newBlock: BlockedUserPair = {
      id: `blk-${Date.now()}`,
      blockerCode: user.userCode,
      blockerName: user.name,
      blockedCode: activeDriver.userCode,
      blockedName: activeDriver.name,
      blockedBy: 'passageiro',
      reason: blockReason.trim(),
      date: new Date().toLocaleDateString('pt-BR'),
      active: true,
    };

    if (onBlockDriver) {
      onBlockDriver(newBlock);
    }
    setShowBlockModal(false);
    alert(`Motorista ${activeDriver.name} (${activeDriver.userCode}) foi bloqueado permanentemente para você.`);
  };

  const handleTriggerPassengerSos = () => {
    const coords = originCoords || defaultJpCoords;
    if (onTriggerSos) {
      onTriggerSos({
        userId: user.id,
        userCode: user.userCode,
        userName: user.name,
        userRole: 'passageiro',
        userPhone: user.phone,
        location: originAddress || `GPS Passageiro (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)})`,
        coords,
        rideId: activeRide?.id,
      });
    }
    alert('🚨 ALERTA W-SOS TRANSMITIDO PARA A CENTRAL JOÃO PESSOA COM SUAS COORDENADAS GPS!');
  };

  return (
    <div className="min-h-screen bg-[#07090d] text-white flex flex-col font-sans">
      {/* Header W-DRIVER */}
      <header className="bg-[#0e1217] border-b border-[#1e242b] sticky top-0 z-40 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <WLogo size="sm" showSubtitle={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">PORTAL DO PASSAGEIRO</span>
                <span className="text-[10px] bg-[#83d600]/20 text-[#83d600] font-black px-2 py-0.5 rounded-full border border-[#83d600]/30 font-mono">
                  {user.userCode}
                </span>
              </div>
              <p className="text-[11px] text-[#94a3b8]">{user.name} • João Pessoa - PB</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerPassengerSos}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all active:scale-95"
              title="Acionar Botão de Emergência W-SOS"
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
              <span>W-SOS</span>
            </button>
            <button
              onClick={requestRealGps}
              className="px-2.5 py-1.5 rounded-xl bg-[#141820] border border-[#232b38] text-xs font-bold text-[#83d600] hover:border-[#83d600] flex items-center gap-1.5 transition-colors"
              title="Recalibrar GPS Real"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Recalibrar GPS</span>
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-[#141820] border border-[#232b38] text-[#94a3b8] hover:text-white transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full p-3 sm:p-5 flex-1 flex flex-col gap-4">
        {/* Banner de Status do GPS Real & Endereço de Embarque Confirmado */}
        <div className="bg-[#0e1217] border border-[#1e242b] rounded-2xl p-3 sm:p-4 flex flex-col gap-3 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#83d600]/15 border border-[#83d600]/30 flex items-center justify-center text-[#83d600] shrink-0">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-[#94a3b8] uppercase font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#83d600] animate-pulse"></span>
                  PONTO OFICIAL DE EMBARQUE • GPS DO PASSAGEIRO
                </span>
                <h3 className="text-sm font-black text-white">{originAddress}</h3>
                {originCoords && (
                  <span className="text-[11px] text-[#83d600] font-mono">
                    Lat: {originCoords.lat.toFixed(5)} • Lng: {originCoords.lng.toFixed(5)}
                    {originAccuracy && ` (Precisão ±${Math.round(originAccuracy)}m)`}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAddressDetailsForm(!showAddressDetailsForm)}
                className="text-xs bg-[#141820] hover:bg-[#1a202c] border border-[#232b38] px-3 py-1.5 rounded-xl font-bold text-white transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-[#83d600]" />
                <span>{showAddressDetailsForm ? 'Fechar Detalhes' : 'Endereço Completo'}</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmPickupLocation}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                  isPickupConfirmed
                    ? 'bg-[#83d600]/20 text-[#83d600] border border-[#83d600]/50'
                    : 'bg-[#83d600] text-black hover:bg-[#83d600]/90 shadow-sm'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isPickupConfirmed ? 'Embarque Confirmado' : 'Confirmar Ponto'}</span>
              </button>
            </div>
          </div>

          {/* Alerta de Discrepância entre GPS e Ponto Marcado no Mapa (> 150m) */}
          {pickupDiscrepancyWarning && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{pickupDiscrepancyWarning}</span>
              </div>
              <button
                type="button"
                onClick={handleConfirmPickupLocation}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-lg shrink-0 transition-colors"
              >
                Confirmar Ponto Selecionado
              </button>
            </div>
          )}

          {/* Formulário Detalhado de Endereço de Embarque */}
          {showAddressDetailsForm && (
            <div className="p-3.5 bg-[#141820] border border-[#232b38] rounded-xl space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#83d600] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  Dados Cadastrais do Local de Embarque
                </span>
                <span className="text-[11px] text-[#94a3b8]">Será enviado diretamente ao motorista</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-[#94a3b8] font-bold uppercase block mb-1">
                    Rua / Avenida <span className="text-[#83d600] font-normal">(Obrigatório)</span>
                  </label>
                  <input
                    type="text"
                    value={detailedAddress.street}
                    onChange={(e) => setDetailedAddress({ ...detailedAddress, street: e.target.value })}
                    className="w-full bg-[#0e1217] border border-[#232b38] rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-[#83d600] focus:outline-none"
                    placeholder="Nome do logradouro"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#94a3b8] font-bold uppercase block mb-1">
                    Número <span className="text-[#83d600] font-normal">(Obrigatório)</span>
                  </label>
                  <input
                    type="text"
                    value={detailedAddress.number}
                    onChange={(e) => setDetailedAddress({ ...detailedAddress, number: e.target.value })}
                    className="w-full bg-[#0e1217] border border-[#232b38] rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-[#83d600] focus:outline-none"
                    placeholder="Nº ou S/N"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#94a3b8] font-bold uppercase block mb-1">Bairro</label>
                  <input
                    type="text"
                    value={detailedAddress.neighborhood || ''}
                    onChange={(e) => setDetailedAddress({ ...detailedAddress, neighborhood: e.target.value })}
                    className="w-full bg-[#0e1217] border border-[#232b38] rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-[#83d600] focus:outline-none"
                    placeholder="Bairro"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#94a3b8] font-bold uppercase block mb-1">CEP</label>
                  <input
                    type="text"
                    value={detailedAddress.cep || ''}
                    onChange={(e) => setDetailedAddress({ ...detailedAddress, cep: e.target.value })}
                    className="w-full bg-[#0e1217] border border-[#232b38] rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-[#83d600] focus:outline-none font-mono"
                    placeholder="58000-000"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#94a3b8] font-bold uppercase block mb-1">Quadra e Lote</label>
                  <input
                    type="text"
                    value={detailedAddress.blockAndLot || ''}
                    onChange={(e) => setDetailedAddress({ ...detailedAddress, blockAndLot: e.target.value })}
                    className="w-full bg-[#0e1217] border border-[#232b38] rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-[#83d600] focus:outline-none"
                    placeholder="Ex: Qd 12 Lt 04"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[10px] text-[#94a3b8] font-bold uppercase block mb-1">Complemento / Ponto de Referência</label>
                  <input
                    type="text"
                    value={detailedAddress.complement || ''}
                    onChange={(e) => setDetailedAddress({ ...detailedAddress, complement: e.target.value })}
                    className="w-full bg-[#0e1217] border border-[#232b38] rounded-lg px-2.5 py-1.5 text-white font-medium focus:border-[#83d600] focus:outline-none"
                    placeholder="Ex: Apto 302, em frente à padaria, portaria 2"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressDetailsForm(false);
                    handleConfirmPickupLocation();
                  }}
                  className="px-3 py-1.5 bg-[#83d600] text-black font-black text-xs rounded-lg hover:bg-[#83d600]/90 transition-colors"
                >
                  Salvar e Confirmar Embarque
                </button>
              </div>
            </div>
          )}

          {/* Alerta de Interdição Oficial Detectada na Rota */}
          {activeInterdictionAlert && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-200 flex items-start gap-2.5 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-red-300">
                  ⛔ Interdição Oficial no Percurso: {activeInterdictionAlert.roadName}
                </strong>
                <p className="text-[11px] text-red-200/90 mt-0.5">
                  {activeInterdictionAlert.officialReason} — Rota recalculada preventivamente com desvio seguro aprovado pela Central W-DRIVER.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Layout Principal: Mapa à esquerda, Painel de Pedido à direita */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Mapa Leaflet Real com OSRM e Interdições */}
          <div className="lg:col-span-7 flex flex-col min-h-[380px] lg:min-h-[520px]">
            <PassengerMap
              originCoords={originCoords}
              originAccuracy={originAccuracy}
              destinationCoords={destinationCoords}
              destinationLabel={destinationLabel}
              routePolyline={routePolyline}
              drivers={availableDrivers}
              selectedDriverCode={directDriverCode}
              allowAdjustOrigin={rideStep === 'idle'}
              onSelectOrigin={handleAdjustPickupCoords}
              interdictions={initialOfficialInterdictions}
              alternativePolyline={alternativeRoutePolyline}
            />
          </div>

          {/* Painel de Interação do Passageiro */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {rideStep === 'idle' ? (
              <div className="bg-[#0e1217] border border-[#1e242b] rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
                <div>
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    Para onde você vai hoje?
                  </h2>
                  <p className="text-xs text-[#94a3b8]">
                    Digite o endereço exato ou selecione um ponto de referência.
                  </p>
                </div>

                {/* Input de Destino com Forward Geocoding Nominatim */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider block">
                    DESTINO (Rua, Número, Bairro ou Ponto) <span className="text-[#83d600] text-[10px] font-normal">(Obrigatório)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ex: Av. Epitácio Pessoa, 1200 ou Manaíra Shopping"
                      value={destinationInput}
                      onChange={(e) => {
                        setDestinationInput(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handlePerformGeocoding(destinationInput);
                        }
                      }}
                      className="w-full bg-[#141820] border border-[#232b38] rounded-xl pl-3.5 pr-24 py-3 text-white text-xs sm:text-sm font-medium focus:border-[#83d600] focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      disabled={isGeocoding || !destinationInput.trim()}
                      onClick={() => handlePerformGeocoding(destinationInput)}
                      className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#83d600] hover:bg-[#83d600]/90 disabled:bg-[#1a202c] disabled:text-[#64748b] text-black font-black text-xs rounded-lg transition-all flex items-center gap-1.5"
                    >
                      {isGeocoding ? (
                        <span className="animate-spin text-xs">🔄</span>
                      ) : (
                        <>
                          <Search className="w-3.5 h-3.5" />
                          <span>Buscar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Feedback do Geocoding */}
                  {isGeocoding && (
                    <div className="p-2.5 bg-[#141820] border border-[#83d600]/30 rounded-xl text-xs text-[#83d600] flex items-center gap-2 animate-pulse">
                      <Search className="w-3.5 h-3.5" />
                      <span>Buscando coordenadas reais via satélite OpenStreetMap...</span>
                    </div>
                  )}

                  {geocodingError && (
                    <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-start gap-2 animate-in fade-in">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Atenção:</strong>
                        <span>{geocodingError}</span>
                      </div>
                    </div>
                  )}

                  {destinationCoords && (
                    <div className="p-2.5 bg-[#83d600]/10 border border-[#83d600]/40 rounded-xl text-xs text-white flex items-center justify-between gap-2 animate-in fade-in">
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="w-4 h-4 text-[#83d600] shrink-0" />
                        <span className="truncate font-semibold">{destinationLabel || destinationInput}</span>
                      </div>
                      <span className="text-[10px] text-[#83d600] font-mono shrink-0">
                        {destinationCoords.lat.toFixed(4)}, {destinationCoords.lng.toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pontos de Referência Rápidos da Central */}
                <div>
                  <span className="text-[10px] text-[#94a3b8] uppercase font-bold block mb-1.5">
                    Pontos de Referência Cadastrados na Central:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {jpLocations.slice(0, 6).map((loc) => (
                      <button
                        key={loc.name}
                        type="button"
                        onClick={() => {
                          setDestinationInput(loc.name);
                          handlePerformGeocoding(loc.name);
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                          destinationLabel === loc.name
                            ? 'bg-[#83d600] text-black font-bold border-[#83d600]'
                            : 'bg-[#141820] text-[#cbd5e1] border-[#232b38] hover:border-[#83d600]'
                        }`}
                      >
                        📍 {loc.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seletor de Categoria W-DRIVER */}
                <div>
                  <label className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider block mb-1.5">
                    CATEGORIA DO VEÍCULO
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                    {categoriesList.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-[#83d600]/15 border-[#83d600] text-white ring-1 ring-[#83d600]'
                              : 'bg-[#141820] border-[#232b38] text-[#94a3b8] hover:text-white'
                          }`}
                        >
                          <span className="text-xl">{cat.icon}</span>
                          <div className="truncate">
                            <span className="text-xs font-bold block truncate text-white">{cat.label}</span>
                            <span className="text-[10px] text-[#94a3b8] block truncate">{cat.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Chamar Motorista por Código Exato (W-0701 a W-0707) */}
                <div className="p-3 bg-[#141820] border border-[#232b38] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-[#ffc107]" />
                      Chamar Motorista Específico (Opcional)
                    </label>
                    <span className="text-[10px] text-[#83d600] font-mono">W-0701 a W-0707</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Ex: W-0701"
                    value={directDriverCode}
                    onChange={(e) => setDirectDriverCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#0a0b0d] border border-[#232b38] rounded-lg px-3 py-1.5 text-xs text-white font-mono font-bold uppercase focus:border-[#83d600] focus:outline-none"
                  />
                </div>

                {/* Painel de Cálculo de Distância e Preço OSRM Real */}
                {destinationCoords && routeDistanceKm > 0 ? (
                  <div className="p-4 bg-gradient-to-br from-[#141820] to-[#0a0b0d] border-2 border-[#83d600]/50 rounded-2xl space-y-3 shadow-lg">
                    <div className="flex items-center justify-between border-b border-[#1e242b] pb-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#94a3b8] block">
                          Distância Real OSRM
                        </span>
                        <span className="text-base font-black font-mono text-white">
                          {routeDistanceKm} km
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] uppercase font-bold text-[#94a3b8] block">Tempo Est.</span>
                        <span className="text-base font-black font-mono text-white">
                          ~{routeDurationMin} min
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-[#83d600] block">Valor da Corrida</span>
                        <span className="text-xl font-black font-mono text-[#83d600]">
                          R$ {totalFare.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#94a3b8] flex items-center justify-between">
                      <span>{pricing.ruleExplanation}</span>
                      <span className="text-white font-bold">Motorista recebe 90%</span>
                    </div>

                    {/* Forma de Pagamento */}
                    <div className="pt-2 border-t border-[#1e242b] flex items-center justify-between gap-2">
                      <span className="text-xs text-[#94a3b8] font-bold">Pagamento:</span>
                      <div className="flex gap-1.5">
                        {(['Pix', 'Cartão', 'Dinheiro'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setPaymentMethod(m)}
                            className={`text-xs px-3 py-1 rounded-lg font-bold transition-all ${
                              paymentMethod === m
                                ? 'bg-[#83d600] text-black'
                                : 'bg-[#141820] text-[#94a3b8] hover:text-white border border-[#232b38]'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      id="btn-confirmar-solicitar-viagem"
                      type="button"
                      onClick={handleConfirmAndRequestRide}
                      className="w-full py-3.5 sm:py-4 bg-[#83d600] hover:bg-[#72be00] text-black font-black text-sm rounded-xl transition-all shadow-[0_0_25px_rgba(131,214,0,0.35)] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider border-2 border-[#83d600] active:scale-[0.99]"
                    >
                      <CheckCircle2 className="w-5 h-5 text-black stroke-[2.5]" />
                      <span>CONFIRMAR E SOLICITAR VIAGEM</span>
                      <ArrowRight className="w-5 h-5 text-black stroke-[2.5]" />
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-[#141820] border border-[#232b38] rounded-xl text-center text-xs text-[#94a3b8]">
                    Digite um endereço de destino e clique em <strong>Buscar</strong> para traçar a rota real pelo OSRM e calcular o valor.
                  </div>
                )}
              </div>
            ) : rideStep === 'requested' ? (
              <div className="bg-[#0e1217] border-2 border-[#83d600]/40 rounded-2xl p-5 space-y-4 shadow-2xl animate-in fade-in">
                <div className="flex items-center justify-between border-b border-[#1e242b] pb-3">
                  <div>
                    <span className="text-xs font-black font-mono text-[#83d600] px-2.5 py-1 rounded-md bg-[#83d600]/15 border border-[#83d600]/40 inline-block mb-1.5">
                      {rideId}
                    </span>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#83d600]" />
                      Solicitação de viagem enviada
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#94a3b8] block">Total</span>
                    <span className="text-xl font-black text-[#83d600] font-mono">
                      R$ {totalFare.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status de procura ou motorista selecionado */}
                <div className="p-4 bg-[#141820] border border-[#232b38] rounded-xl space-y-2.5">
                  {activeDriver ? (
                    <div>
                      <span className="text-[10px] text-[#ffc107] font-bold uppercase tracking-wider block">
                        ⭐ Chamada Direta por Código ({activeDriver.userCode})
                      </span>
                      <div className="flex items-center justify-between mt-1.5">
                        <div>
                          <h4 className="text-sm font-black text-white">{activeDriver.name}</h4>
                          <p className="text-xs text-[#94a3b8]">{activeDriver.vehicle} • Placa {activeDriver.plate}</p>
                        </div>
                        <span className="text-xs bg-[#83d600] text-black font-bold px-2.5 py-1 rounded font-mono">
                          {activeDriver.userCode}
                        </span>
                      </div>
                      <div className="mt-2.5 text-xs text-[#83d600] flex items-center gap-2 animate-pulse font-semibold">
                        <Clock className="w-4 h-4" />
                        <span>Chamando exclusivamente {activeDriver.name}... Aguardando resposta.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-[#83d600] font-bold uppercase tracking-wider">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#83d600] animate-ping"></span>
                        <span>Radar W-DRIVER Transmitindo</span>
                      </div>
                      <p className="text-xs text-white">
                        Solicitação transmitida para os motoristas homologados mais próximos na categoria <strong>{selectedCategory}</strong>.
                      </p>
                      <p className="text-[11px] text-[#94a3b8]">
                        Acompanhando em tempo real. O primeiro motorista a aceitar assumirá a corrida.
                      </p>
                    </div>
                  )}
                </div>

                {/* Dados da Viagem */}
                <div className="p-3 bg-[#0a0b0d] border border-[#1e242b] rounded-xl text-xs space-y-2 text-[#cbd5e1]">
                  <div className="flex items-start gap-2">
                    <span className="text-[#83d600] text-xs">🟢</span>
                    <div className="truncate">
                      <span className="text-[10px] text-[#94a3b8] block uppercase font-bold">Origem (GPS Real)</span>
                      <span className="text-white font-medium truncate block">{originAddress}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 text-xs">🏁</span>
                    <div className="truncate">
                      <span className="text-[10px] text-[#94a3b8] block uppercase font-bold">Destino Localizado</span>
                      <span className="text-white font-medium truncate block">{destinationLabel || destinationInput}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#1e242b] flex items-center justify-between text-[11px] text-[#94a3b8]">
                    <span>Distância: <strong className="text-white">{routeDistanceKm} km</strong></span>
                    <span>Tempo: <strong className="text-white">~{routeDurationMin} min</strong></span>
                    <span>Pagamento: <strong className="text-white">{paymentMethod}</strong></span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCancelRide}
                  className="w-full py-2.5 bg-[#141820] hover:bg-red-950/40 text-[#94a3b8] hover:text-red-400 border border-[#232b38] hover:border-red-800/60 font-bold text-xs rounded-xl transition-all"
                >
                  Cancelar Solicitação
                </button>
              </div>
            ) : rideStep === 'accepted' || rideStep === 'in_trip' ? (
              <div className="bg-[#0e1217] border border-[#1e242b] rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#1e242b] pb-3">
                  <div>
                    <span className="text-[10px] text-[#83d600] font-black font-mono block">
                      CORRIDA {rideId}
                    </span>
                    <h3 className="text-base font-black text-white">
                      {rideStep === 'accepted' ? 'Motorista a Caminho' : 'Em Viagem para o Destino'}
                    </h3>
                  </div>
                  <span className="text-lg font-black text-[#83d600] font-mono">
                    R$ {totalFare.toFixed(2)}
                  </span>
                </div>

                {activeDriver && (
                  <div className="p-4 bg-[#141820] border border-[#232b38] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#83d600]/20 border border-[#83d600] flex items-center justify-center text-xl font-black text-[#83d600]">
                          {activeDriver.userCode}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">{activeDriver.name}</h4>
                          <span className="text-xs text-[#ffc107]">★ {activeDriver.rating} • {activeDriver.category}</span>
                        </div>
                      </div>
                      <span className="text-xs bg-[#83d600] text-black font-bold px-2 py-1 rounded font-mono">
                        {activeDriver.userCode}
                      </span>
                    </div>
                    <div className="text-xs text-[#cbd5e1] border-t border-[#1e242b] pt-2 flex justify-between">
                      <span>Veículo: <strong>{activeDriver.vehicle}</strong></span>
                      <span>Placa: <strong>{activeDriver.plate}</strong></span>
                    </div>
                  </div>
                )}

                {/* Barra de Progresso */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-[#94a3b8]">
                    <span>Progresso da Rota</span>
                    <span>{Math.round(tripProgress * 100)}%</span>
                  </div>
                  <div className="w-full bg-[#1e242b] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#83d600] h-full transition-all duration-500"
                      style={{ width: `${tripProgress * 100}%` }}
                    />
                  </div>
                </div>

                {/* Notificação de Desvio de Rota Solicitado pelo Motorista durante a corrida */}
                {activeRide?.hasDeviation && activeRide?.deviationRecord && (
                  <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        DESVIO DE ROTA / VIA INTERDITADA
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-black font-mono ${
                        activeRide.deviationRecord.passengerConfirmation === 'confirmado'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {activeRide.deviationRecord.passengerConfirmation === 'confirmado' ? 'AUTORIZADO' : 'AGUARDANDO CONFIRMAÇÃO'}
                      </span>
                    </div>
                    <p className="text-xs text-amber-200/90">
                      Motivo: <strong>{activeRide.deviationRecord.reason}</strong> (+{activeRide.deviationRecord.distanceDiffKm.toFixed(1)} km recalculados).
                    </p>
                    {activeRide.deviationRecord.passengerConfirmation !== 'confirmado' && (
                      <button
                        type="button"
                        onClick={() => setShowDeviationAuthorizeModal(true)}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Ver Evidência e Autorizar Desvio
                      </button>
                    )}
                  </div>
                )}

                {/* Pagamento Pix QR Code se selecionado */}
                {paymentMethod === 'Pix' && (
                  <div className="p-3 bg-[#0a0b0d] border border-[#232b38] rounded-xl text-center space-y-2">
                    <span className="text-xs text-[#83d600] font-bold block">
                      Pagamento via Pix Direto da Central W-DRIVER
                    </span>
                    <span className="text-[11px] text-[#94a3b8] block font-mono">
                      Chave Pix: pix@w-driver.com.br (R$ {totalFare.toFixed(2)})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('pix@w-driver.com.br');
                        setPixKeyCopied(true);
                        setTimeout(() => setPixKeyCopied(false), 2000);
                      }}
                      className="text-xs px-3 py-1 bg-[#141820] hover:bg-[#1a202c] text-white rounded-lg border border-[#232b38]"
                    >
                      {pixKeyCopied ? 'Chave Copiada!' : 'Copiar Chave Pix'}
                    </button>
                  </div>
                )}

                {/* Botão de Bloqueio Mútuo de Emergência */}
                <button
                  type="button"
                  onClick={() => setShowBlockModal(true)}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center justify-center gap-1.5 pt-2"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>Reportar ou Bloquear Motorista</span>
                </button>
              </div>
            ) : (
              <div className="bg-[#0e1217] border border-[#1e242b] rounded-2xl p-5 sm:p-6 text-center space-y-4 shadow-xl">
                <CheckCircle2 className="w-14 h-14 text-[#83d600] mx-auto" />
                <div>
                  <h3 className="text-lg font-black text-white">Corrida Concluída com Sucesso!</h3>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    Obrigado por rodar com a W-DRIVER João Pessoa.
                  </p>
                </div>

                {/* RESUMO FINANCEIRO DETALHADO (com recálculo de km e desvios) */}
                <div className="p-4 bg-[#141820] border border-[#232b38] rounded-xl text-left space-y-3">
                  <div className="flex items-center justify-between border-b border-[#232b38] pb-2">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-[#83d600]" />
                      Extrato Financeiro da Viagem
                    </span>
                    <span className="text-[11px] font-mono text-[#83d600] font-bold">
                      {activeRide?.id || rideId}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#94a3b8]">
                      <span>Distância Original:</span>
                      <span className="font-mono text-white">
                        {(activeRide?.originalDistanceKm || activeRide?.distanceKm || routeDistanceKm).toFixed(1)} km
                      </span>
                    </div>

                    {activeRide?.hasDeviation && activeRide?.deviationRecord && (
                      <>
                        <div className="flex justify-between text-[#94a3b8]">
                          <span>Nova Distância Recalculada (OSRM):</span>
                          <span className="font-mono text-white">
                            {activeRide.deviationRecord.newDistanceKm.toFixed(1)} km
                          </span>
                        </div>
                        <div className="flex justify-between text-amber-400 font-medium">
                          <span>Diferença de Distância (Desvio):</span>
                          <span className="font-mono">
                            +{activeRide.deviationRecord.distanceDiffKm.toFixed(1)} km
                          </span>
                        </div>
                      </>
                    )}

                    <div className="border-t border-[#232b38] pt-1.5 flex justify-between text-[#94a3b8]">
                      <span>Valor Original Pré-Pago:</span>
                      <span className="font-mono text-white">
                        R$ {(activeRide?.originalPrice || activeRide?.price || totalFare).toFixed(2)}
                      </span>
                    </div>

                    {activeRide?.hasDeviation && activeRide?.deviationRecord && (
                      <div className="flex justify-between text-amber-400 font-bold">
                        <span>Valor Complementar da Viagem:</span>
                        <span className="font-mono">
                          R$ {activeRide.deviationRecord.complementaryFare.toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-[#232b38] pt-2 flex justify-between text-sm font-black text-white">
                      <span>Valor Final da Viagem:</span>
                      <span className="font-mono text-[#83d600]">
                        R${' '}
                        {(
                          (activeRide?.originalPrice || activeRide?.price || totalFare) +
                          (activeRide?.deviationRecord?.complementaryFare || 0)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Quitação do Complementar se houver */}
                  {activeRide?.hasDeviation && activeRide?.deviationRecord && activeRide.deviationRecord.complementaryFare > 0 && (
                    <div className="pt-2 border-t border-[#232b38] space-y-2">
                      {complementaryPaidLocally ? (
                        <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/50 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Valor complementar quitado com sucesso via {complementaryPayMethod}!</span>
                        </div>
                      ) : complementaryDeferredLocally ? (
                        <div className="p-2.5 bg-amber-950/40 border border-amber-800/50 rounded-lg text-xs text-amber-300 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Complementar lançado como saldo pendente para sua próxima viagem.</span>
                        </div>
                      ) : (
                        <div className="space-y-2 bg-[#0e1217] p-3 rounded-lg border border-[#232b38]">
                          <span className="text-[11px] font-bold text-amber-400 block">
                            Quitar Complementar de R$ {activeRide.deviationRecord.complementaryFare.toFixed(2)}:
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setComplementaryPaidLocally(true);
                                if (onPayComplementaryFare) {
                                  onPayComplementaryFare(activeRide.id, complementaryPayMethod);
                                }
                              }}
                              className="py-2 bg-[#83d600] hover:bg-[#83d600]/90 text-black font-black text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Pagar Imediatamente
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setComplementaryDeferredLocally(true);
                                if (onDeferComplementaryFare) {
                                  onDeferComplementaryFare(activeRide.id);
                                }
                              }}
                              className="py-2 bg-[#141820] hover:bg-[#1a202c] text-[#94a3b8] hover:text-white font-bold text-xs rounded-lg border border-[#232b38] transition-colors"
                            >
                              Lançar Saldo Pendente
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleResetRide}
                  className="w-full py-3 bg-[#83d600] text-black font-black text-xs rounded-xl hover:bg-[#83d600]/90 transition-all shadow-md"
                >
                  SOLICITAR NOVA CORRIDA
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Autorização de Desvio pelo Passageiro */}
      {showDeviationAuthorizeModal && activeRide?.deviationRecord && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1217] border border-amber-500/50 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#1e242b] pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4" /> Solicitação de Desvio de Rota
              </h3>
              <button
                onClick={() => setShowDeviationAuthorizeModal(false)}
                className="text-[#94a3b8] hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#cbd5e1]">
              O motorista <strong>{activeRide.deviationRecord.driverName} ({activeRide.deviationRecord.driverCode})</strong> identificou uma via interditada no trajeto e registrou a ocorrência com evidência fotográfica autenticada:
            </p>

            {/* Visualizador de Foto com Carimbo Indelével */}
            {activeRide.deviationRecord.photoEvidenceUrl && (
              <div className="space-y-1">
                <span className="text-[10px] text-[#94a3b8] uppercase font-bold block">
                  Foto Comprovatória com Carimbo de Autenticidade:
                </span>
                <div className="rounded-xl overflow-hidden border border-[#232b38] bg-black max-h-56 flex items-center justify-center">
                  <img
                    src={activeRide.deviationRecord.photoEvidenceUrl}
                    alt="Evidência de Interdição"
                    className="w-full h-auto object-contain max-h-56"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            )}

            {/* Detalhes do Desvio e Recálculo OSRM */}
            <div className="p-3.5 bg-[#141820] border border-[#232b38] rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-[#94a3b8]">
                <span>Motivo Reportado:</span>
                <strong className="text-white">{activeRide.deviationRecord.reason}</strong>
              </div>
              <div className="flex justify-between text-[#94a3b8]">
                <span>Distância Original:</span>
                <span className="font-mono text-white">{activeRide.deviationRecord.originalDistanceKm.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between text-[#94a3b8]">
                <span>Nova Distância Recalculada (OSRM):</span>
                <span className="font-mono text-white">{activeRide.deviationRecord.newDistanceKm.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between text-amber-400 font-bold border-t border-[#232b38] pt-1.5">
                <span>Diferença de Distância:</span>
                <span className="font-mono">+{activeRide.deviationRecord.distanceDiffKm.toFixed(1)} km</span>
              </div>
              <div className="flex justify-between text-white font-black">
                <span>Valor Complementar Estimado:</span>
                <span className="font-mono text-[#83d600]">R$ {activeRide.deviationRecord.complementaryFare.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeviationAuthorizeModal(false)}
                className="px-3 py-2 bg-[#141820] text-[#94a3b8] hover:text-white text-xs font-bold rounded-lg"
              >
                Revisar Depois
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onPassengerConfirmDeviation) {
                    onPassengerConfirmDeviation(activeRide.id);
                  }
                  setShowDeviationAuthorizeModal(false);
                }}
                className="px-4 py-2 bg-[#83d600] hover:bg-[#83d600]/90 text-black text-xs font-black rounded-lg transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Autorizar Desvio de Rota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Bloqueio Mútuo com Justificativa Obrigatória */}
      {showBlockModal && activeDriver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1217] border border-red-900/60 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1e242b] pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2 text-red-400">
                <ShieldAlert className="w-4 h-4" /> Bloqueio Mútuo de Motorista
              </h3>
              <button
                onClick={() => setShowBlockModal(false)}
                className="text-[#94a3b8] hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#94a3b8]">
              Você está prestes a bloquear o motorista <strong>{activeDriver.name} ({activeDriver.userCode})</strong>. Vocês nunca mais serão pareados em nenhuma corrida.
            </p>
            <div>
              <label className="text-xs font-bold text-white block mb-1">
                Justificativa Obrigatória de Segurança: *
              </label>
              <textarea
                value={blockReason}
                onChange={(e) => {
                  setBlockReason(e.target.value);
                  setBlockError(null);
                }}
                placeholder="Ex: Direção perigosa, desrespeito ou comportamento inadequado..."
                className="w-full h-24 bg-[#141820] border border-[#232b38] rounded-xl p-3 text-xs text-white focus:border-red-500 focus:outline-none resize-none"
              />
              {blockError && <span className="text-[11px] text-red-400 mt-1 block">{blockError}</span>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBlockModal(false)}
                className="px-3 py-1.5 bg-[#141820] text-[#94a3b8] hover:text-white text-xs font-bold rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBlock}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Confirmar Bloqueio Permanente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
