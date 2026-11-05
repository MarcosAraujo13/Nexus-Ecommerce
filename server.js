/**
 * Servidor HTTP Nativo em Node.js para o Nexus Commerce
 * Não requer dependências externas (sem npm install necessário).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Garante que o diretório de dados exista
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Inicializa dados padrão caso não existam
const DEFAULT_PRODUCTS = [
  {
    id: "prod-1",
    name: "Smartphone Nexus Ultra 5G",
    category: "smartphones",
    categoryName: "Smartphones",
    price: 4299.00,
    originalPrice: 4999.00,
    rating: 4.9,
    reviewsCount: 142,
    badge: "Mais Vendido",
    stock: 18,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80",
    description: "Tela AMOLED 6.8\" 120Hz, processador Snapdragon 8 Gen 3, 12GB RAM e 256GB de armazenamento com câmera profissional de 200MP.",
    colors: ["#1e293b", "#0284c7", "#f8fafc"],
    specs: {
      "Tela": "6.8\" AMOLED Dinâmico 2X",
      "Processador": "Snapdragon 8 Gen 3",
      "Memória RAM": "12 GB",
      "Armazenamento": "256 GB",
      "Bateria": "5.000 mAh com carga ultrarrápida 45W"
    }
  },
  {
    id: "prod-2",
    name: "Headphone Sem Fio PureSound Pro",
    category: "audio",
    categoryName: "Áudio",
    price: 849.90,
    originalPrice: 1099.90,
    rating: 4.8,
    reviewsCount: 98,
    badge: "-23% OFF",
    stock: 25,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    description: "Cancelamento ativo de ruído híbrido (ANC), drivers de 40mm de alta fidelidade e até 40 horas de bateria contínua.",
    colors: ["#0f172a", "#f1f5f9", "#b45309"],
    specs: {
      "Tipo": "Over-Ear Bluetooth 5.3",
      "Autonomia": "Até 40 horas",
      "Cancelamento de Ruído": "ANC Híbrido -35dB",
      "Conexão": "Bluetooth / P2 3.5mm",
      "Peso": "260g"
    }
  },
  {
    id: "prod-3",
    name: "Smartwatch Horizon Fit 2",
    category: "acessorios",
    categoryName: "Acessórios",
    price: 649.00,
    originalPrice: 799.00,
    rating: 4.7,
    reviewsCount: 76,
    badge: "Lançamento",
    stock: 12,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    description: "Monitor cardíaco 24/7, SpO2, GPS integrado, resistência à água 5ATM e mais de 100 modos esportivos.",
    colors: ["#0f172a", "#e2e8f0", "#e11d48"],
    specs: {
      "Display": "1.43\" AMOLED Always-On",
      "Resistência": "5 ATM (50 metros)",
      "Bateria": "Até 12 dias de uso típico",
      "Sensores": "Cardíaco, SpO2, Acelerômetro, GPS"
    }
  },
  {
    id: "prod-4",
    name: "Caixa de Som Portátil SoundWave Max",
    category: "audio",
    categoryName: "Áudio",
    price: 459.90,
    originalPrice: 599.90,
    rating: 4.6,
    reviewsCount: 52,
    badge: "Frete Grátis",
    stock: 30,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
    description: "Potência de 40W RMS, graves profundos com radiadores passivos duplos, proteção IPX7 à prova d'água.",
    colors: ["#18181b", "#2563eb", "#dc2626"],
    specs: {
      "Potência": "40W RMS",
      "Proteção": "IPX7 à prova d'água",
      "Bateria": "Até 18 horas de reprodução",
      "Conectividade": "Bluetooth 5.2 / TWS Stereo"
    }
  },
  {
    id: "prod-5",
    name: "Notebook AeroBook Pro 15",
    category: "smartphones",
    categoryName: "Smartphones & Computadores",
    price: 6899.00,
    originalPrice: 7599.00,
    rating: 4.9,
    reviewsCount: 64,
    badge: "Premium",
    stock: 8,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80",
    description: "Corpo unibody em alumínio aeroespacial, processador Core i7 13ª Geração, 16GB DDR5, SSD NVMe 1TB e tela 2.8K OLED.",
    colors: ["#334155", "#94a3b8"],
    specs: {
      "Processador": "Intel Core i7-13700H",
      "Tela": "15.6\" 2.8K 120Hz OLED 100% DCI-P3",
      "Memória": "16 GB DDR5 5200MHz",
      "Armazenamento": "1 TB NVMe Gen4",
      "Peso": "1.49 kg"
    }
  },
  {
    id: "prod-6",
    name: "Lâmpada Inteligente RGB SmartGlow (Kit 3 un)",
    category: "casa",
    categoryName: "Casa Inteligente",
    price: 189.90,
    originalPrice: 249.90,
    rating: 4.5,
    reviewsCount: 110,
    badge: "Kit Especial",
    stock: 45,
    image: "https://images.unsplash.com/photo-1507499739999-097706ad8914?w=600&auto=format&fit=crop&q=80",
    description: "16 milhões de cores, compatível com Alexa e Google Assistente, dimerizável e sem necessidade de hub externo via Wi-Fi.",
    colors: ["#ffffff"],
    specs: {
      "Potência": "10W (equivalente a 75W incandescente)",
      "Luminosidade": "900 lumens",
      "Conexão": "Wi-Fi 2.4GHz + BLE",
      "Vida Útil": "25.000 horas"
    }
  },
  {
    id: "prod-7",
    name: "Teclado Mecânico RGB ChromaKey Pro",
    category: "acessorios",
    categoryName: "Acessórios",
    price: 379.00,
    originalPrice: 459.00,
    rating: 4.8,
    reviewsCount: 89,
    badge: "Gamer",
    stock: 22,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    description: "Switches mecânicos táteis hot-swappable, iluminação RGB por tecla, keycaps PBT double-shot e estrutura em alumínio anodizado.",
    colors: ["#09090b", "#f4f4f5"],
    specs: {
      "Layout": "ABNT2 compacto 75%",
      "Switches": "Mechanical Brown Tactile",
      "Conectividade": "Cabo USB-C trançado destacável",
      "Anti-Ghosting": "100% N-Key Rollover"
    }
  },
  {
    id: "prod-8",
    name: "Aspirador Robô CleanBot LiDAR 3000",
    category: "casa",
    categoryName: "Casa Inteligente",
    price: 1899.00,
    originalPrice: 2299.00,
    rating: 4.7,
    reviewsCount: 43,
    badge: "-17% OFF",
    stock: 14,
    image: "https://images.unsplash.com/photo-1627916607164-7b20241db935?w=600&auto=format&fit=crop&q=80",
    description: "Navegação a laser LiDAR 360°, aspira e passa pano simultaneamente, poder de sucção de 4000Pa e mapeamento multi-andares.",
    colors: ["#ffffff", "#18181b"],
    specs: {
      "Poder de Sucção": "4.000 Pa",
      "Navegação": "Sensor LiDAR a Laser",
      "Autonomia": "Até 150 minutos",
      "Recursos": "Retorno automático à base e recarga inteligente"
    }
  }
];

if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(DEFAULT_PRODUCTS, null, 2), 'utf-8');
}

if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Helpers para leitura e escrita
function getProducts() {
  try {
    return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
  } catch (e) {
    return DEFAULT_PRODUCTS;
  }
}

function saveProducts(data) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getOrders() {
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function saveOrders(data) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Mapa de tipos MIME
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Cria o servidor
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS headers para testes locais caso necessário
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoints
  if (pathname.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    // GET /api/products
    if (pathname === '/api/products' && method === 'GET') {
      const category = parsedUrl.query.category;
      let products = getProducts();
      if (category && category !== 'todos') {
        products = products.filter(p => p.category === category);
      }
      res.writeHead(200);
      res.end(JSON.stringify(products));
      return;
    }

    // POST /api/products
    if (pathname === '/api/products' && method === 'POST') {
      const body = await readRequestBody(req);
      if (!body.name || !body.price) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Nome e Preço são obrigatórios.' }));
        return;
      }
      const products = getProducts();
      const newProduct = {
        id: 'prod-' + Date.now(),
        name: body.name,
        category: body.category || 'outros',
        categoryName: body.categoryName || 'Diversos',
        price: parseFloat(body.price),
        originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
        rating: 5.0,
        reviewsCount: 1,
        badge: body.badge || 'Novo',
        stock: parseInt(body.stock, 10) || 10,
        image: body.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
        description: body.description || '',
        colors: body.colors || ['#000000'],
        specs: body.specs || {}
      };
      products.unshift(newProduct);
      saveProducts(products);
      res.writeHead(201);
      res.end(JSON.stringify(newProduct));
      return;
    }

    // POST /api/products/reset
    if (pathname === '/api/products/reset' && method === 'POST') {
      saveProducts(DEFAULT_PRODUCTS);
      res.writeHead(200);
      res.end(JSON.stringify(DEFAULT_PRODUCTS));
      return;
    }

    // GET /api/orders
    if (pathname === '/api/orders' && method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify(getOrders()));
      return;
    }

    // POST /api/orders
    if (pathname === '/api/orders' && method === 'POST') {
      const body = await readRequestBody(req);
      if (!body.items || !body.items.length) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'O pedido deve conter itens.' }));
        return;
      }
      const orders = getOrders();
      const newOrder = {
        id: 'NX-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toISOString(),
        customer: body.customer || {},
        items: body.items,
        subtotal: body.subtotal,
        discount: body.discount || 0,
        shipping: body.shipping || 0,
        total: body.total,
        paymentMethod: body.paymentMethod || 'PIX',
        status: 'Aprovado'
      };
      orders.unshift(newOrder);
      saveOrders(orders);
      res.writeHead(201);
      res.end(JSON.stringify(newOrder));
      return;
    }

    // Rota não encontrada na API
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint não encontrado' }));
    return;
  }

  // Servir arquivos estáticos da pasta raiz
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  let safePath = path.normalize(path.join(__dirname, reqPath));

  // Proteção contra Directory Traversal
  if (!safePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Acesso negado');
    return;
  }

  fs.stat(safePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback para index.html se não encontrar
      const fallbackPath = path.join(__dirname, 'index.html');
      if (fs.existsSync(fallbackPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        fs.createReadStream(fallbackPath).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        res.end('Arquivo não encontrado');
      }
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(safePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 Servidor Nexus E-Commerce ativo!`);
  console.log(`🌐 Acesse no navegador: http://localhost:${PORT}`);
  console.log(`📦 Dados persistidos em: ./data/`);
  console.log(`====================================================`);
});
