# Wi-Fi Portal SaaS — Documentação Completa

Plataforma multiempresa de Wi-Fi Marketing integrada ao MikroTik Hotspot.

---

## Índice

1. [Instalação local](#instalação-local)
2. [Configuração do Neon (PostgreSQL)](#configuração-do-neon)
3. [Configuração do Cloudinary](#configuração-do-cloudinary)
4. [Deploy na Vercel](#deploy-na-vercel)
5. [Configuração do MikroTik Hotspot](#configuração-do-mikrotik-hotspot)
6. [Configuração do UniFi](#configuração-do-unifi)
7. [Processo de atualização](#processo-de-atualização)
8. [Estrutura do projeto](#estrutura-do-projeto)
9. [Credenciais padrão](#credenciais-padrão)

---

## Instalação local

### Pré-requisitos

- Node.js 20+
- npm ou yarn
- Conta Neon (gratuita): https://neon.tech
- Conta Cloudinary (gratuita): https://cloudinary.com
- Conta Vercel (gratuita): https://vercel.com

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/wifi-portal.git
cd wifi-portal

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 4. Gere o Prisma Client
npm run db:generate

# 5. Execute as migrations (cria as tabelas)
npm run db:push

# 6. Popule o banco com dados iniciais
npm run db:seed

# 7. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

---

## Configuração do Neon

1. Acesse https://neon.tech e crie uma conta gratuita
2. Crie um novo projeto: **Create Project** → nome: `wifi-portal`
3. Selecione a região mais próxima (ex: `aws-sa-east-1` para Brasil)
4. Clique em **Create project**
5. Na tela do projeto, clique em **Connection Details**
6. Selecione **Prisma** no dropdown de framework
7. Copie as duas strings de conexão:

```env
# Cole no .env.local:
DATABASE_URL="postgresql://usuario:senha@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://usuario:senha@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

> **Nota:** Para produção, `DATABASE_URL` usa connection pooling (porta 5432) e `DIRECT_URL` usa conexão direta. O Neon fornece ambas.

---

## Configuração do Cloudinary

1. Acesse https://cloudinary.com e crie uma conta gratuita
2. No Dashboard, localize:
   - **Cloud name**
   - **API Key**
   - **API Secret**
3. Cole no `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="abcdefghijklmnopqrstuvwxyz"
```

O sistema faz upload automático com otimização WebP/AVIF e redimensionamento responsivo.

---

## Deploy na Vercel

### Primeira vez

```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça login
vercel login

# Deploy (na pasta do projeto)
vercel --prod
```

### Variáveis de ambiente na Vercel

1. Acesse https://vercel.com → seu projeto → **Settings** → **Environment Variables**
2. Adicione todas as variáveis do `.env.example`:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET` — gere com: `openssl rand -base64 32`
   - `NEXTAUTH_URL` — URL da sua Vercel (ex: `https://wifi-portal.vercel.app`)
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_APP_URL` — mesma URL da Vercel

3. Após adicionar as variáveis, execute o seed em produção:

```bash
# Execute via Vercel CLI
vercel env pull .env.production.local
npx prisma db push
npx tsx prisma/seed.ts
```

---

## Configuração do MikroTik Hotspot

### Visão geral do fluxo

```
Cliente conecta no Wi-Fi
        ↓
MikroTik detecta cliente sem autenticação
        ↓
MikroTik redireciona para o portal:
https://wifi-portal.vercel.app/portal/SLUG-DA-EMPRESA
?mac=XX:XX:XX:XX:XX:XX
&ip=192.168.88.100
&link-login=https://192.168.88.1/login
&link-login-only=https://192.168.88.1/login?dst=...
&link-orig=http://detectify.com
        ↓
Cliente preenche nome + telefone
        ↓
Sistema salva lead + faz login automático no MikroTik
        ↓
Internet liberada + redirecionamento para promoções
```

### Passo 1 — Criar perfil de servidor Hotspot

Via Winbox:
1. **IP → Hotspot → Server Profiles → +**
2. Configure:
   - **Name:** `portal-wifi`
   - **Login By:** `HTTP PAP`
   - **HTML Directory:** `/flash/hotspot` (padrão)
   - **Login Page:** `login.html` (iremos substituir)

### Passo 2 — Criar usuário guest

1. **IP → Hotspot → Users → +**
2. Configure:
   - **Name:** `guest`
   - **Password:** *(deixe vazio)*
   - **Profile:** `default` (ou crie um perfil com as limitações desejadas)

O sistema usa este usuário `guest` para autenticar automaticamente todos os clientes.

### Passo 3 — Configurar redirecionamento para o portal externo

Via terminal do MikroTik (SSH ou Winbox Terminal):

```routeros
# Cria walled garden para permitir acesso ao portal antes da autenticação
/ip hotspot walled-garden
add dst-host=wifi-portal.vercel.app action=allow
add dst-host=*.vercel.app action=allow
add dst-host=res.cloudinary.com action=allow

# Configura o login page para apontar para o portal externo
/ip hotspot
set [find] login-by=http-pap
```

### Passo 4 — Modificar a página de login padrão

O MikroTik precisa redirecionar para o seu portal. Crie o arquivo `/flash/hotspot/login.html` com:

```html
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="refresh" content="0; url=https://wifi-portal.vercel.app/portal/SLUG-DA-EMPRESA?mac=$(mac)&ip=$(ip)&link-login=$(link-login)&link-login-only=$(link-login-only)&link-orig=$(link-orig)">
</head>
<body>
  <p>Redirecionando para o portal...</p>
</body>
</html>
```

> **Importante:** Substitua `SLUG-DA-EMPRESA` pelo slug cadastrado no painel (ex: `mercado-bom-preco`).

Envie o arquivo via FTP (porta 21) ou pelo Winbox → Files.

### Passo 5 — Configurar interface Hotspot

```routeros
/ip hotspot setup
# Siga o wizard e selecione a interface de rede conectada ao AP UniFi
# Interface: bridge1 (ou a interface do seu AP)
# Address pool: 192.168.88.10-192.168.88.254
# DNS: 8.8.8.8, 8.8.4.4
```

### Variáveis disponíveis do MikroTik

| Variável | Descrição |
|----------|-----------|
| `$(mac)` | MAC address do dispositivo |
| `$(ip)` | IP do dispositivo |
| `$(link-login)` | URL completa de login |
| `$(link-login-only)` | URL de login sem redirecionamento |
| `$(link-orig)` | URL original que o cliente tentava acessar |
| `$(username)` | Nome do usuário (vazio para novos) |
| `$(error)` | Mensagem de erro (se houver) |

---

## Configuração do UniFi

O UniFi é transparente para o sistema — ele apenas distribui o sinal Wi-Fi.

1. No UniFi Controller → **Settings → WiFi → + Create New WiFi**
2. Configure:
   - **Name:** `Loja Wi-Fi Grátis` (SSID visível)
   - **Security:** Open (ou WPA2 com senha simples que você divulga)
   - **Network:** crie uma VLAN separada para convidados
3. **Guest Hotspot:** em alguns setups, pode apontar o gateway para o IP do MikroTik

> Para uma rede segura, coloque o MikroTik entre o roteador principal e o AP UniFi, em modo bridge ou roteado.

---

## Processo de atualização

```bash
# 1. Faça pull das atualizações
git pull origin main

# 2. Instale novas dependências (se houver)
npm install

# 3. Execute migrations (se houver mudanças no schema)
npm run db:push

# 4. Rebuild e redeploy
vercel --prod
```

---

## Estrutura do projeto

```
wifi-portal/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── seed.ts                # Dados iniciais
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth
│   │   │   ├── companies/     # CRUD empresas
│   │   │   ├── campaigns/     # CRUD campanhas
│   │   │   ├── promotions/    # CRUD promoções + imagens
│   │   │   ├── leads/         # Leads + exportação
│   │   │   └── dashboard/     # Stats e métricas
│   │   ├── portal/[slug]/     # Portal público do cliente
│   │   │   └── promocoes/     # Página de promoções
│   │   └── admin/             # Painel administrativo
│   │       ├── dashboard/
│   │       ├── companies/
│   │       ├── campaigns/
│   │       ├── promotions/
│   │       ├── leads/
│   │       ├── reports/
│   │       └── settings/
│   ├── components/
│   │   └── admin/             # Sidebar, Header
│   ├── lib/
│   │   ├── prisma.ts          # Cliente Prisma singleton
│   │   ├── auth.ts            # NextAuth config
│   │   ├── cloudinary.ts      # Upload de imagens
│   │   ├── rate-limit.ts      # Rate limiting
│   │   ├── validations.ts     # Schemas Zod
│   │   └── utils.ts           # Utilitários
│   ├── middleware.ts           # Proteção de rotas
│   └── types/index.ts         # Types TypeScript
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## Credenciais padrão

Após executar `npm run db:seed`:

| Usuário | E-mail | Senha | Tipo |
|---------|--------|-------|------|
| Super Admin | admin@wifiportal.com | admin123 | Super Admin |
| Gerente Demo | gerente@mercadobompreco.com | gerente123 | Company Admin |

**⚠️ Troque as senhas em produção!**

Portal demo: `/portal/mercado-demo`

---

## Segurança em produção

- [ ] Troque `NEXTAUTH_SECRET` por uma chave forte
- [ ] Troque as senhas padrão do seed
- [ ] Configure HTTPS na Vercel (automático)
- [ ] Configure walled garden no MikroTik
- [ ] Revise as permissões de CORS se necessário
- [ ] Habilite LGPD no painel de configurações

---

## Suporte

- Documentação Next.js: https://nextjs.org/docs
- Documentação Prisma: https://www.prisma.io/docs
- Documentação NextAuth: https://authjs.dev
- Documentação MikroTik Hotspot: https://help.mikrotik.com/docs/display/ROS/HotSpot
- Documentação Cloudinary: https://cloudinary.com/documentation
