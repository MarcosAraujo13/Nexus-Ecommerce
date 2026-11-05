/**
 * Catálogo de Produtos Padrão da Loja Nexus Commerce
 * Fornece dados realistas com fotos em alta definição, especificações técnicas e categorias.
 */

const INITIAL_PRODUCTS = [
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
  },
  {
    id: "prod-9",
    name: "Mouse Sem Fio Ergonômico Precision MX",
    category: "acessorios",
    categoryName: "Acessórios",
    price: 299.00,
    originalPrice: 389.00,
    rating: 4.9,
    reviewsCount: 115,
    badge: "Destaque",
    stock: 35,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
    description: "Sensor óptico de 8000 DPI com rastreamento em qualquer superfície (inclusive vidro), rolagem eletromagnética MagSpeed silenciosa.",
    colors: ["#18181b", "#71717a"],
    specs: {
      "Sensor": "Darkfield 8.000 DPI",
      "Bateria": "Recarregável até 70 dias",
      "Conexão": "Bluetooth & Receptor USB LogiBolt",
      "Botões": "7 botões totalmente programáveis"
    }
  },
  {
    id: "prod-10",
    name: "Câmera de Segurança Externa Solar 2K",
    category: "casa",
    categoryName: "Casa Inteligente",
    price: 529.00,
    originalPrice: 659.00,
    rating: 4.6,
    reviewsCount: 38,
    badge: "Eco Solar",
    stock: 19,
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80",
    description: "Alimentação contínua por painel solar incluso, resolução 2K Quad HD, visão noturna colorida e detecção de pessoas por IA.",
    colors: ["#ffffff"],
    specs: {
      "Resolução": "2K QHD (2560 x 1440)",
      "Alimentação": "Bateria 10.000mAh + Painel Solar",
      "Resistência": "IP66 à prova de intempéries",
      "Visão Noturna": "Colorida com holofotes LED"
    }
  },
  {
    id: "prod-11",
    name: "Fone TWS AirBass Pro com Estojo Sem Fio",
    category: "audio",
    categoryName: "Áudio",
    price: 329.90,
    originalPrice: 429.90,
    rating: 4.7,
    reviewsCount: 84,
    badge: "-23% OFF",
    stock: 40,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    description: "Áudio espacial imersivo de 360°, microfones quádruplos com cancelamento de ruído para chamadas cristalinas e estojo com carga Qi.",
    colors: ["#ffffff", "#000000"],
    specs: {
      "Autonomia dos Fones": "8 horas por recarga",
      "Autonomia com Estojo": "36 horas totais",
      "Proteção": "IPX5 resistente a suor e chuva",
      "Bluetooth": "Versão 5.3 de baixa latência"
    }
  },
  {
    id: "prod-12",
    name: "Suporte Articulado para Monitor com Pistão a Gás",
    category: "acessorios",
    categoryName: "Acessórios",
    price: 249.90,
    originalPrice: 299.90,
    rating: 4.8,
    reviewsCount: 62,
    badge: "Setup Perfeito",
    stock: 28,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
    description: "Compatível com monitores de 17\" a 35\" até 9kg, padrão VESA 75x75 e 100x100, ajuste total de rotação 360°, inclinação e altura.",
    colors: ["#18181b"],
    specs: {
      "Compatibilidade": "Monitores de 17\" até 35\"",
      "Capacidade": "Até 9 kg",
      "Padrão VESA": "75x75 mm e 100x100 mm",
      "Sistema": "Pistão a gás suave"
    }
  }
];

window.INITIAL_PRODUCTS = INITIAL_PRODUCTS;
