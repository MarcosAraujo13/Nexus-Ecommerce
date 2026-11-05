/**
 * Gerenciamento de Estado Centralizado (Store) do Nexus Commerce
 * Suporta persistência automática em localStorage e sincronização com a API Node.js quando disponível.
 */

const STORAGE_KEYS = {
  CART: 'nexus_cart_v1',
  WISHLIST: 'nexus_wishlist_v1',
  THEME: 'nexus_theme_v1',
  COUPON: 'nexus_coupon_v1',
  ORDERS: 'nexus_orders_v1',
  CUSTOM_PRODUCTS: 'nexus_custom_products_v1'
};

const AVAILABLE_COUPONS = {
  'BEMVINDO10': { type: 'percent', value: 10, label: '10% OFF Primeira Compra' },
  'NEXUS20': { type: 'percent', value: 20, label: '20% OFF Especial' },
  'FRETEGRATIS': { type: 'free_shipping', value: 0, label: 'Frete Grátis' },
  'PROMO50': { type: 'fixed', value: 50, label: 'R$ 50 de Desconto' }
};

class Store {
  constructor() {
    this.products = [];
    this.cart = this.loadCart();
    this.wishlist = this.loadWishlist();
    this.coupon = this.loadCoupon();
    this.orders = this.loadOrders();
    this.theme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    
    this.filters = {
      category: 'todos',
      search: '',
      maxPrice: 10000,
      sortBy: 'featured'
    };

    this.listeners = [];
  }

  // Assinatura para reatividade
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(event, payload) {
    this.listeners.forEach(cb => cb(event, payload));
  }

  // Inicializa produtos (tenta API primeiro, fallback para localStorage e catálogo inicial)
  async initProducts() {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        this.products = await response.json();
      } else {
        throw new Error('API não respondeu com 200');
      }
    } catch (err) {
      // Fallback offline / local
      const localCustom = localStorage.getItem(STORAGE_KEYS.CUSTOM_PRODUCTS);
      if (localCustom) {
        try {
          this.products = JSON.parse(localCustom);
        } catch (e) {
          this.products = [...window.INITIAL_PRODUCTS];
        }
      } else {
        this.products = [...window.INITIAL_PRODUCTS];
      }
    }
    // Atualiza links de imagem quebrados caso estejam no cache local
    this.products = this.products.map(p => {
      if (p.id === 'prod-6' && (!p.image || p.image.includes('1550524514-9b9868352b2b'))) {
        p.image = 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=600&auto=format&fit=crop&q=80';
      }
      return p;
    });

    this.notify('products:updated', this.products);
  }

  // Carrinho
  loadCart() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      let cart = saved ? JSON.parse(saved) : [];
      cart = cart.map(item => {
        if (item.id === 'prod-6' && (!item.image || item.image.includes('1550524514-9b9868352b2b'))) {
          item.image = 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=600&auto=format&fit=crop&q=80';
        }
        return item;
      });
      return cart;
    } catch (e) {
      return [];
    }
  }

  saveCart() {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(this.cart));
    this.notify('cart:updated', this.getCartSummary());
  }

  addToCart(productId, quantity = 1, selectedColor = null) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return false;

    const existingIndex = this.cart.findIndex(
      item => item.id === productId && item.selectedColor === (selectedColor || product.colors[0])
    );

    const color = selectedColor || product.colors[0];

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
      if (this.cart[existingIndex].quantity > product.stock) {
        this.cart[existingIndex].quantity = product.stock;
      }
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        categoryName: product.categoryName,
        selectedColor: color,
        quantity: Math.min(quantity, product.stock),
        stock: product.stock
      });
    }

    this.saveCart();
    return true;
  }

  updateQuantity(productId, color, delta) {
    const item = this.cart.find(i => i.id === productId && i.selectedColor === color);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeFromCart(productId, color);
      return;
    }
    if (item.quantity > item.stock) {
      item.quantity = item.stock;
    }

    this.saveCart();
  }

  removeFromCart(productId, color) {
    this.cart = this.cart.filter(item => !(item.id === productId && item.selectedColor === color));
    this.saveCart();
  }

  clearCart() {
    this.cart = [];
    this.coupon = null;
    localStorage.removeItem(STORAGE_KEYS.COUPON);
    this.saveCart();
  }

  // Cálculos do Carrinho
  getCartSummary() {
    const itemCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let discount = 0;
    let shipping = subtotal >= 199 || subtotal === 0 ? 0 : 25.00;

    if (this.coupon) {
      if (this.coupon.type === 'percent') {
        discount = (subtotal * this.coupon.value) / 100;
      } else if (this.coupon.type === 'fixed') {
        discount = Math.min(this.coupon.value, subtotal);
      } else if (this.coupon.type === 'free_shipping') {
        shipping = 0;
      }
    }

    const total = Math.max(0, subtotal - discount + shipping);
    const freeShippingRemaining = Math.max(0, 199 - subtotal);
    const freeShippingProgress = Math.min(100, (subtotal / 199) * 100);

    return {
      items: this.cart,
      itemCount,
      subtotal,
      discount,
      shipping,
      total,
      freeShippingRemaining,
      freeShippingProgress,
      coupon: this.coupon
    };
  }

  // Cupons
  loadCoupon() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COUPON);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  applyCoupon(code) {
    const formatted = (code || '').trim().toUpperCase();
    if (AVAILABLE_COUPONS[formatted]) {
      this.coupon = {
        code: formatted,
        ...AVAILABLE_COUPONS[formatted]
      };
      localStorage.setItem(STORAGE_KEYS.COUPON, JSON.stringify(this.coupon));
      this.saveCart();
      return { success: true, message: `Cupom ${formatted} aplicado com sucesso!` };
    }
    return { success: false, message: 'Cupom inválido ou expirado.' };
  }

  removeCoupon() {
    this.coupon = null;
    localStorage.removeItem(STORAGE_KEYS.COUPON);
    this.saveCart();
  }

  // Wishlist (Favoritos)
  loadWishlist() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  toggleWishlist(productId) {
    const idx = this.wishlist.indexOf(productId);
    let added = false;
    if (idx > -1) {
      this.wishlist.splice(idx, 1);
    } else {
      this.wishlist.push(productId);
      added = true;
    }
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(this.wishlist));
    this.notify('wishlist:updated', { wishlist: this.wishlist, productId, added });
    return added;
  }

  isWishlisted(productId) {
    return this.wishlist.includes(productId);
  }

  // Pedidos
  loadOrders() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  async addOrder(orderData) {
    const newOrder = {
      id: 'NX-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toISOString(),
      ...orderData,
      status: 'Aprovado'
    };

    // Tenta persistir no servidor
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        const serverOrder = await res.json();
        newOrder.id = serverOrder.id || newOrder.id;
      }
    } catch (err) {
      console.warn('API de pedidos indisponível, salvando localmente.');
    }

    this.orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
    this.clearCart();
    this.notify('order:created', newOrder);
    return newOrder;
  }

  // Admin: Adicionar Produto
  async addProduct(productData) {
    let savedProduct = null;
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        savedProduct = await res.json();
      }
    } catch (e) {}

    if (!savedProduct) {
      savedProduct = {
        id: 'prod-' + Date.now(),
        rating: 5.0,
        reviewsCount: 1,
        ...productData
      };
    }

    this.products.unshift(savedProduct);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PRODUCTS, JSON.stringify(this.products));
    this.notify('products:updated', this.products);
    return savedProduct;
  }

  // Tema Claro / Escuro
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEYS.THEME, this.theme);
    document.documentElement.setAttribute('data-theme', this.theme);
    this.notify('theme:updated', this.theme);
    return this.theme;
  }

  initTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  // Filtros e Busca
  getFilteredProducts() {
    let filtered = [...this.products];

    // Categoria
    if (this.filters.category && this.filters.category !== 'todos') {
      filtered = filtered.filter(p => p.category === this.filters.category);
    }

    // Busca textual
    if (this.filters.search.trim()) {
      const term = this.filters.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.categoryName.toLowerCase().includes(term)
      );
    }

    // Preço Máximo
    filtered = filtered.filter(p => p.price <= this.filters.maxPrice);

    // Ordenação
    switch (this.filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // featured / padrão
        break;
    }

    return filtered;
  }
}

// Instância global única da loja
window.store = new Store();
