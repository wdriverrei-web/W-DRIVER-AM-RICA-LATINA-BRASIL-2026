# W-DRIVER AMÉRICA LATINA BRASIL JOÃO PESSOA-PB
> *"Quem escolhe preço corre riscos. Quem escolhe a W-DRIVER escolhe chegar bem!"*

Plataforma oficial de mobilidade urbana e logística para João Pessoa - PB. Viagens avulsas com tarifas transparentes, repasse de 90% para o motorista, contratos de transporte pré-pagos sem dinâmica, botão de emergência W-SOS integrado ao GPS e módulo financeiro W-BANK.

---

## 🚀 Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Motion
- **Mapas**: Leaflet / OpenStreetMap (100% gratuito, sem chaves pagas do Google Maps)
- **Ícones**: Lucide React
- **Persistência & Realtime**: Supabase (PostgreSQL + WebSockets em tempo real) com Fallback LocalStorage

---

## 📁 Estrutura do Projeto

```text
├── src/
│   ├── components/       # Módulos: Passageiro, Motorista, Central, W-BANK, W-SOS, Mapas
│   ├── lib/
│   │   └── supabase.ts   # Conexão e sincronização em tempo real (Postgres Changes)
│   ├── security/         # Controle de acesso e governança (RBAC)
│   ├── types.ts          # Interfaces de dados oficiais (Ride, AppUser, WSosAlert, etc.)
│   ├── storage.ts        # Cache local (LocalStorage)
│   ├── App.tsx           # Ponto de entrada com despachos e reações em tempo real
│   └── main.tsx
├── supabase_schema.sql   # Script SQL para criação das tabelas no Supabase
├── .env.example          # Exemplo das variáveis de ambiente
└── package.json
```

---

## ⚙️ Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as credenciais do seu Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

*(Essas chaves são obtidas no painel do Supabase em **Project Settings > API**)*.

---

## 🗄️ Configuração do Banco de Dados

1. Acesse o painel do seu projeto no [Supabase](https://supabase.com).
2. Vá em **SQL Editor** e clique em **New query**.
3. Copie o conteúdo de `supabase_schema.sql` e execute clicando em **Run**.

---

## 📦 Como Rodar Localmente

```bash
# 1. Instalar as dependências
npm install

# 2. Executar o servidor de desenvolvimento
npm run dev

# 3. Compilar para produção
npm run build
```

---

## 🌐 Hospedagem em Produção (Vercel / Netlify / Cloud Run)

Este projeto está pronto para deploy contínuo integrado ao GitHub:
1. Conecte o repositório na **Vercel** ou **Netlify**.
2. Adicione as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. O deploy é automático em cada push!
