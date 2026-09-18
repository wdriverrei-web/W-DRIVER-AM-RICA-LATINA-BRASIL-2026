import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AppUser,
  PendingApproval,
  Ride,
  RideReceipt,
  WSosAlert,
} from '../types';

// Leitura segura das variáveis de ambiente (sem expor segredos no código)
const env = (import.meta as any).env || {};
const supabaseUrl = String(env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = String(env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 10
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// =========================================================================
// CORRIDAS COMPARTILHADAS MULTI-APARELHO (PASSAGEIRO <-> MOTORISTA <-> CENTRAL)
// =========================================================================

export async function syncRideToCloud(ride: Ride): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('rides').upsert(
      {
        id: ride.id,
        passenger_name: ride.passengerName,
        passenger_code: ride.passengerCode || null,
        driver_name: ride.driverName || null,
        driver_code: ride.driverCode || null,
        driver_vehicle: ride.driverVehicle || null,
        category: ride.category,
        origin: ride.origin,
        destination: ride.destination,
        pickup_coords: ride.pickupCoords || null,
        price: ride.price,
        status: ride.status,
        payment_method: ride.paymentMethod,
        payment_status: ride.paymentStatus,
        is_no_show: Boolean(ride.isNoShow),
        data: ride,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('[W-DRIVER Supabase] Erro ao sincronizar corrida:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[W-DRIVER Supabase] Falha de conexão ao sincronizar corrida:', err);
    return false;
  }
}

export async function fetchActiveRideFromCloud(): Promise<Ride | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('rides')
      .select('data, status, updated_at')
      .in('status', ['solicitada', 'a_caminho', 'chegou', 'embarque_confirmado', 'em_andamento'])
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return (data.data as Ride) || null;
  } catch (err) {
    console.warn('[W-DRIVER Supabase] Erro ao buscar corrida ativa:', err);
    return null;
  }
}

export async function fetchRecentRidesFromCloud(): Promise<Ride[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('rides')
      .select('data')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error || !data) return [];
    return data.map((d) => d.data as Ride).filter(Boolean);
  } catch (err) {
    console.warn('[W-DRIVER Supabase] Erro ao buscar histórico de corridas:', err);
    return [];
  }
}

export function subscribeToRides(
  onRideChange: (ride: Ride, eventType: 'INSERT' | 'UPDATE' | 'DELETE') => void
) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('wdriver_rides_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rides' },
      (payload) => {
        const rideData = (payload.new as any)?.data as Ride;
        if (rideData) {
          onRideChange(rideData, payload.eventType as any);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// =========================================================================
// USUÁRIOS E CADASTROS COMPARTILHADOS
// =========================================================================

export async function syncUserToCloud(user: AppUser): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('users').upsert(
      {
        id: user.id,
        user_code: user.userCode,
        name: user.name,
        role: user.role,
        phone: user.phone || null,
        status: user.status || 'ativo',
        data: user,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('[W-DRIVER Supabase] Erro ao sincronizar usuário:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[W-DRIVER Supabase] Falha ao sincronizar usuário:', err);
    return false;
  }
}

export async function fetchUsersFromCloud(): Promise<AppUser[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('users')
      .select('data')
      .order('updated_at', { ascending: false });

    if (error || !data) return [];
    return data.map((d) => d.data as AppUser).filter(Boolean);
  } catch (err) {
    console.warn('[W-DRIVER Supabase] Erro ao buscar usuários:', err);
    return [];
  }
}

export function subscribeToUsers(onUserChange: (user: AppUser) => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('wdriver_users_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'users' },
      (payload) => {
        const userData = (payload.new as any)?.data as AppUser;
        if (userData) {
          onUserChange(userData);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// =========================================================================
// APROVAÇÕES PENDENTES (CENTRAL <-> CADASTRO EM OUTRO CELULAR)
// =========================================================================

export async function syncPendingApprovalToCloud(approval: PendingApproval): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('pending_approvals').upsert(
      {
        id: approval.id,
        name: approval.name,
        cpf: approval.cpf,
        type: approval.type,
        status: approval.status,
        data: approval,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('[W-DRIVER Supabase] Erro ao sincronizar aprovação pendente:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[W-DRIVER Supabase] Falha ao sincronizar aprovação:', err);
    return false;
  }
}

export async function fetchPendingApprovalsFromCloud(): Promise<PendingApproval[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('pending_approvals')
      .select('data')
      .order('updated_at', { ascending: false });

    if (error || !data) return [];
    return data.map((d) => d.data as PendingApproval).filter(Boolean);
  } catch (err) {
    console.warn('[W-DRIVER Supabase] Erro ao buscar aprovações pendentes:', err);
    return [];
  }
}

export function subscribeToPendingApprovals(onApprovalChange: (item: PendingApproval) => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('wdriver_approvals_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pending_approvals' },
      (payload) => {
        const item = (payload.new as any)?.data as PendingApproval;
        if (item) {
          onApprovalChange(item);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// =========================================================================
// W-SOS ALERTAS DE EMERGÊNCIA COMPARTILHADOS EM TEMPO REAL
// =========================================================================

export async function syncSosAlertToCloud(alert: WSosAlert): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('sos_alerts').upsert(
      {
        id: alert.id,
        user_code: alert.userCode,
        user_name: alert.userName,
        user_role: alert.userRole,
        location: alert.location,
        coords: alert.coords,
        status: alert.status,
        data: alert,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('[W-DRIVER Supabase] Erro ao sincronizar alerta SOS:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[W-DRIVER Supabase] Falha ao sincronizar SOS:', err);
    return false;
  }
}

export async function fetchSosAlertsFromCloud(): Promise<WSosAlert[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('sos_alerts')
      .select('data')
      .order('updated_at', { ascending: false });

    if (error || !data) return [];
    return data.map((d) => d.data as WSosAlert).filter(Boolean);
  } catch (err) {
    console.warn('[W-DRIVER Supabase] Erro ao buscar alertas SOS:', err);
    return [];
  }
}

export function subscribeToSosAlerts(onAlertChange: (alert: WSosAlert) => void) {
  if (!supabase) return () => {};

  const channel = supabase
    .channel('wdriver_sos_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'sos_alerts' },
      (payload) => {
        const alert = (payload.new as any)?.data as WSosAlert;
        if (alert) {
          onAlertChange(alert);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// =========================================================================
// RECIBOS FINANCEIROS OFICIAIS W-DRIVER
// =========================================================================

export async function syncReceiptToCloud(receipt: RideReceipt): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('receipts').upsert(
      {
        id: receipt.id,
        ride_id: receipt.rideId,
        total_price: receipt.totalPrice,
        driver_share: receipt.driverShare,
        central_share: receipt.centralShare,
        data: receipt,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.warn('[W-DRIVER Supabase] Erro ao sincronizar recibo:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[W-DRIVER Supabase] Falha ao sincronizar recibo:', err);
    return false;
  }
}

export async function fetchReceiptsFromCloud(): Promise<RideReceipt[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('receipts')
      .select('data')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((d) => d.data as RideReceipt).filter(Boolean);
  } catch (err) {
    console.warn('[W-DRIVER Supabase] Erro ao buscar recibos:', err);
    return [];
  }
}
