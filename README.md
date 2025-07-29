# 🍽️ Cardápio Digital - Painel Administrativo

Sistema administrativo completo para gestão de restaurantes e lanchonetes, com foco em pedidos online, delivery e controle centralizado.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [API e Serviços](#api-e-serviços)
- [Contribuição](#contribuição)
- [Licença](#licença)

## 🎯 Sobre o Projeto

O **Cardápio Digital Admin** é um painel administrativo moderno e responsivo desenvolvido para facilitar a gestão completa de estabelecimentos alimentícios. O sistema oferece controle em tempo real de pedidos, gestão de cardápio, sistema de delivery integrado e dashboards financeiros.

### ✨ Principais Diferenciais

- 🔄 **Tempo Real**: Atualizações instantâneas de pedidos via WebSocket
- 🗺️ **Delivery Inteligente**: Cálculo automático de rotas e taxas
- 🖨️ **Impressão Automática**: Integração com impressoras térmicas
- 📊 **Analytics**: Dashboards e relatórios financeiros detalhados
- 💬 **Chat Integrado**: Comunicação direta com clientes
- 🔒 **Segurança Avançada**: Rate limiting e proteção DDoS

## 🚀 Funcionalidades

### 📦 Gestão de Pedidos
- Visualização em tempo real de novos pedidos
- Controle de status (Pendente → Preparando → Pronto → Entregue)
- Impressão automática de comandas
- Histórico completo de pedidos

### 🍕 Gestão de Cardápio
- CRUD completo de produtos e categorias
- Upload de imagens
- Controle de disponibilidade
- Gestão de adicionais e variações

### 👥 Gestão de Clientes
- Chat em tempo real com clientes
- Histórico de pedidos por cliente
- Sistema de fidelidade
- Avaliações e feedback

### 🚚 Sistema de Delivery
- Cálculo automático de taxas de entrega
- Integração com mapas (OpenStreetMap)
- Definição de áreas de entrega
- Estimativa de tempo de entrega

### 📈 Relatórios Financeiros
- Dashboard com métricas em tempo real
- Gráficos de vendas por período
- Relatórios de produtos mais vendidos
- Controle de fechamento diário

### ⚙️ Configurações
- Configurações gerais da loja
- Horários de funcionamento
- Formas de pagamento
- Configurações de delivery

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS
- **Radix UI** - Componentes acessíveis
- **Framer Motion** - Animações
- **React Query** - Gerenciamento de estado servidor

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados
- **Real-time Subscriptions** - Atualizações em tempo real

### Mapas & Geolocalização
- **Leaflet** - Biblioteca de mapas
- **React Leaflet** - Integração com React
- **Nominatim** - Geocodificação
- **OSRM** - Cálculo de rotas

### Outras Integrações
- **Google Sheets API** - Relatórios externos
- **RawBT** - Impressão térmica
- **React Hook Form** - Formulários
- **Zod** - Validação de schemas

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- (Opcional) Impressora térmica compatível

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/cardapio-admin.git
cd cardapio-admin
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

4. **Configure o Supabase**
- Edite o arquivo `src/integrations/supabase/client.ts`
- Substitua as credenciais pelas suas

5. **Execute o projeto**
```bash
npm run dev
# ou
yarn dev
```

O projeto estará disponível em `http://localhost:3003`

## ⚙️ Configuração

### Supabase Setup

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Execute as migrations SQL necessárias
3. Configure as políticas RLS (Row Level Security)
4. Ative o Real-time para as tabelas necessárias

### Configuração de Impressora

Para usar a funcionalidade de impressão:

1. Instale o driver da impressora térmica
2. Configure a porta de comunicação
3. Teste a conexão no painel de configurações

## 📖 Uso

### Primeiro Acesso

1. Acesse o sistema
2. Use a função `createAdminUser()` no console do navegador para criar o primeiro admin
3. Faça login com as credenciais criadas
4. Configure os dados básicos da loja

### Fluxo de Trabalho

1. **Configure o cardápio** - Adicione categorias e produtos
2. **Configure delivery** - Defina áreas e taxas de entrega  
3. **Monitore pedidos** - Acompanhe pedidos em tempo real
4. **Gerencie clientes** - Use o chat para comunicação
5. **Analise relatórios** - Acompanhe performance financeira

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── admin/          # Componentes específicos do admin
│   └── ui/             # Componentes de interface reutilizáveis
├── contexts/           # Contextos React (estado global)
├── hooks/              # Custom hooks
├── integrations/       # Integrações externas (Supabase)
├── pages/              # Páginas da aplicação
├── services/           # Serviços e APIs
├── types/              # Definições de tipos TypeScript
└── utils/              # Funções utilitárias
```

## 🔌 API e Serviços

### Principais Serviços

- **clienteService** - Gestão de clientes
- **pedidoService** - Operações de pedidos
- **cardapioService** - Gestão do cardápio
- **deliveryService** - Cálculos de entrega
- **printService** - Impressão de comandas
- **securityService** - Segurança e autenticação

### Real-time Features

O sistema utiliza Supabase Real-time para:
- Novos pedidos
- Mudanças de status
- Mensagens de chat
- Atualizações de estoque

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma [issue](https://github.com/seu-usuario/cardapio-admin/issues)
- Entre em contato: [seu-email@exemplo.com]

---

**Desenvolvido com ❤️ para facilitar a gestão de restaurantes**