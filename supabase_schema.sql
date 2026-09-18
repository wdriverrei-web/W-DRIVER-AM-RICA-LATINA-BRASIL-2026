-- =========================================================================
-- W-DRIVER AMÉRICA LATINA BRASIL JOÃO PESSOA-PB
-- SCRIPT DE CRIAÇÃO DE TABELAS E REALTIME NO SUPABASE
-- Cole este script diretamente no Supabase SQL Editor (Dashboard -> SQL Editor)
-- =========================================================================

-- 1. TABELA DE CORRIDAS (Passageiro <-> Motorista <-> Central)
CREATE TABLE IF NOT EXISTS public.rides (
    id TEXT PRIMARY KEY,
    passenger_name TEXT,
    passenger_code TEXT,
    driver_name TEXT,
    driver_code TEXT,
    driver_vehicle TEXT,
    category TEXT,
    origin TEXT,
    destination TEXT,
    pickup_coords JSONB,
    price NUMERIC,
    status TEXT,
    payment_method TEXT,
    payment_status TEXT,
    is_no_show BOOLEAN DEFAULT false,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE USUÁRIOS HOMOLOGADOS E EM ANÁLISE
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    user_code TEXT UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'ativo',
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE APROVAÇÕES PENDENTES (DOCUMENTOS CENTRAL)
CREATE TABLE IF NOT EXISTS public.pending_approvals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cpf TEXT,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'pendente',
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE ALERTAS W-SOS (EMERGÊNCIA COM GPS REAL)
CREATE TABLE IF NOT EXISTS public.sos_alerts (
    id TEXT PRIMARY KEY,
    user_code TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    location TEXT,
    coords JSONB,
    status TEXT DEFAULT 'aberto',
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE RECIBOS OFICIAIS W-DRIVER (W-BANK / REPASSE 90/10)
CREATE TABLE IF NOT EXISTS public.receipts (
    id TEXT PRIMARY KEY,
    ride_id TEXT,
    total_price NUMERIC,
    driver_share NUMERIC,
    central_share NUMERIC,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de performance para busca em tempo real
CREATE INDEX IF NOT EXISTS idx_rides_status ON public.rides (status);
CREATE INDEX IF NOT EXISTS idx_rides_updated ON public.rides (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_user_code ON public.users (user_code);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON public.sos_alerts (status);

-- Habilitar Row Level Security (RLS) com políticas de acesso para anon key
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso irrestrito para anon key do applet W-DRIVER
DROP POLICY IF EXISTS "Permitir tudo para anon em rides" ON public.rides;
CREATE POLICY "Permitir tudo para anon em rides" ON public.rides FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir tudo para anon em users" ON public.users;
CREATE POLICY "Permitir tudo para anon em users" ON public.users FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir tudo para anon em pending_approvals" ON public.pending_approvals;
CREATE POLICY "Permitir tudo para anon em pending_approvals" ON public.pending_approvals FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir tudo para anon em sos_alerts" ON public.sos_alerts;
CREATE POLICY "Permitir tudo para anon em sos_alerts" ON public.sos_alerts FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir tudo para anon em receipts" ON public.receipts;
CREATE POLICY "Permitir tudo para anon em receipts" ON public.receipts FOR ALL TO anon USING (true) WITH CHECK (true);

-- Habilitar Realtime do Supabase para sincronização instantânea entre celulares
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pending_approvals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sos_alerts;
