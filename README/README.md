# 🛒 Nexus Commerce - Projeto Exemplo de E-Commerce

Um e-commerce completo, moderno, rápido e responsivo construído em **JavaScript Vanilla**, **CSS3 com Design System próprio** e um backend em **Node.js Nativo** (sem a necessidade de rodar `npm install`).

---

## 🌟 Principais Recursos & Funcionalidades

### 1. 🛍️ Catálogo Inteligente & Descoberta
- **12 produtos realistas** categorizados em *Smartphones & PCs*, *Áudio & Fones*, *Casa Inteligente* e *Acessórios & Setup*.
- **Busca em tempo real com debounce** para pesquisa instantânea por nome, descrição ou categoria.
- **Filtro por Categorias** com abas de navegação rápida.
- **Filtro por Faixa de Preço** com slider dinâmico (R$ 100 até R$ 10.000).
- **Ordenação Inteligente**: Mais populares, menor preço, maior preço, melhor avaliação e ordem alfabética.
- **Selo Promocional**: Badges dinâmicos como *"Mais Vendido"*, *"-23% OFF"*, *"Lançamento"*, *"Frete Grátis"*.

### 2. 🔍 Modal de Detalhes do Produto (Quick View)
- Galeria com foto em alta resolução.
- Seletor de cores / variantes com atualização visual.
- Tabela com ficha técnica detalhada.
- Contador de quantidade e status de estoque em tempo real.
- Botão direto de *"Adicionar ao Carrinho"*.

### 3. 🛒 Carrinho de Compras Interativo (Slide Drawer)
- Drawer deslizante com animação suave e bloqueio de rolagem da página.
- Ajuste de quantidade (`+` / `-`) ou remoção direta com recálculo automático.
- **Barra de Progresso para Frete Grátis**: Mostra quanto falta para atingir o valor mínimo de R$ 199,00.
- **Sistema de Cupons de Desconto**:
  - `BEMVINDO10`: 10% de desconto na compra.
  - `NEXUS20`: 20% de desconto especial.
  - `FRETEGRATIS`: Zera o custo de frete.
  - `PROMO50`: R$ 50,00 de desconto fixo.
- Resumo financeiro transparente: Subtotal, Desconto, Frete e Total.
- Persistência automática no `localStorage`.

### 4. 💳 Checkout em 3 Etapas (Wizard)
- **Etapa 1: Dados & Entrega**: Preenchimento ágil com busca automática de endereço por CEP (integração ViaCEP com fallback offline).
- **Etapa 2: Pagamento**:
  - **PIX**: Gera QR Code geométrico em SVG dinâmico, código Pix Copia-e-Cola com botão de cópia rápida, desconto de 5% e temporizador de 15 minutos.
  - **Cartão de Crédito**: Espelhamento interativo em tempo real em um cartão 3D (número, titular, validade e CVV) e seletor de parcelamento em até 12x.
  - **Boleto Bancário**: Linha digitável e código de barras simulado.
- **Etapa 3: Confirmação do Pedido**: Geração de código de pedido único (`#NX-XXXXXX`), comprovante detalhado com endereço, lista de produtos e botão para impressão.

### 5. 🛠️ Painel Gerencial / Administrativo
- Modal para **cadastrar novos produtos** no catálogo (título, categoria, preços, estoque, badge e URL de imagem).
- Aba de **Pedidos Realizados** com histórico de todas as compras efetuadas.
- Botão para restaurar o catálogo padrão original a qualquer momento.

### 6. 🎨 Design & Experiência de Usuário (UX/UI)
- **Tema Claro / Escuro (Dark Mode)** com persistência e troca com um clique.
- **Design 100% Responsivo**: Mobile, Tablet e Desktop.
- **Sistema de Notificações Toast**: Alertas flutuantes de sucesso, erro, aviso e informação.
- **Lista de Desejos (Favoritos)**: Botão de coração com contagem dinâmica no cabeçalho.

---

## 🚀 Como Executar o Projeto

Você tem duas opções simples para rodar o projeto:

### Opção 1: Com o Servidor Node.js Nativo (Recomendado)
Não é necessário instalar nenhum pacote externo via `npm`. O servidor utiliza apenas os módulos nativos do Node.js (`http`, `fs`, `path`, `url`).

Abra o terminal na pasta do projeto e execute:
```bash
node server.js
```
Em seguida, abra o navegador em:
👉 **`http://localhost:3000`**

### Opção 2: Abrir Diretamente no Navegador (Sem Servidor)
Como a aplicação foi arquitetada para funcionar também como uma Single Page Application estática, você pode simplesmente:
- Dar um duplo clique no arquivo `index.html`.
- Ou arrastar o arquivo `index.html` para qualquer navegador (Chrome, Edge, Firefox).
- *Todas as funcionalidades (carrinho, filtros, cupons, checkout e pedidos) funcionam perfeitamente utilizando o armazenamento local (`localStorage`).*

---

## 📁 Estrutura de Arquivos

```
├── index.html            # Estrutura semântica principal e modais
├── server.js             # Servidor HTTP nativo e API REST
├── package.json          # Metadados e scripts de inicialização
├── README.md             # Documentação detalhada do projeto
├── css/
│   └── style.css         # Design system, temas light/dark e responsividade
├── js/
│   ├── products-data.js  # Catálogo base inicial com especificações
│   ├── state.js          # Store central de estado, carrinho e persistência
│   ├── cart.js           # Gerenciamento do drawer e cálculos do carrinho
│   ├── checkout.js       # Fluxo de checkout, PIX e validações
│   ├── admin.js          # Painel para adicionar produtos e ver pedidos
│   └── app.js            # Inicialização da aplicação, filtros e toasts
└── data/                 # Pasta gerada pelo servidor com os dados JSON
    ├── products.json     # Catálogo persistido no backend
    └── orders.json       # Histórico de pedidos no backend
```

---

## 🔌 Endpoints da API REST (`server.js`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/products` | Retorna a lista de produtos (aceita `?category=...`) |
| `POST` | `/api/products` | Cadastra um novo produto |
| `POST` | `/api/products/reset` | Restaura a lista de produtos padrão |
| `GET` | `/api/orders` | Retorna todos os pedidos realizados |
| `POST` | `/api/orders` | Registra um novo pedido concluído |

---

## 💡 Ideias de Extensões Futuras
- Integração com gateway de pagamento real (Stripe, Mercado Pago).
- Autenticação com JWT e login social (Google / GitHub).
- Avaliações e comentários reais enviados pelos clientes.
