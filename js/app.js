/**
 * Aplicação Principal do Nexus Commerce
 * Orquestra catálogo, filtros, modais de detalhes, favoritos, tema e notificações toast.
 */

class App {
  constructor() {
    this.productGrid = document.getElementById('productGrid');
    this.emptySearchState = document.getElementById('emptySearchState');
    this.totalProductsCount = document.getElementById('totalProductsCount');
    
    // Controles de Busca e Filtro
    this.searchInput = document.getElementById('searchInput');
    this.categoryTabs = document.querySelectorAll('.category-tab');
    this.priceRangeInput = document.getElementById('priceRangeInput');
    this.priceRangeValue = document.getElementById('priceRangeValue');
    this.sortSelect = document.getElementById('sortSelect');

    // Badges de cabeçalho
    this.wishlistCountBadge = document.getElementById('wishlistCountBadge');
    this.themeToggleBtn = document.getElementById('themeToggleBtn');

    // Quick View Modal
    this.quickViewModal = document.getElementById('quickViewModal');
    this.quickViewBackdrop = document.getElementById('quickViewBackdrop');
    this.closeQuickViewBtn = document.getElementById('closeQuickViewBtn');

    // Toasts
    this.toastContainer = document.getElementById('toastContainer');

    this.activeQuickViewProduct = null;
    this.selectedQuickViewColor = null;
    this.quickViewQty = 1;
  }

  async init() {
    // Inicializa tema
    window.store.initTheme();
    this.updateThemeIcon();

    // Inicializa componentes UI
    window.cartUI = new window.CartUI();
    window.checkoutUI = new window.CheckoutUI();
    window.adminUI = new window.AdminUI();

    // Assina mudanças da Store
    window.store.subscribe((event, payload) => {
      if (event === 'products:updated') {
        this.renderCatalog();
      } else if (event === 'wishlist:updated') {
        this.updateWishlistCount();
        this.renderCatalog();
      } else if (event === 'theme:updated') {
        this.updateThemeIcon();
      }
    });

    this.bindEvents();
    
    // Carrega produtos
    await window.store.initProducts();
    this.updateWishlistCount();
    window.cartUI.render();
  }

  bindEvents() {
    // Alternador de tema
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => {
        window.store.toggleTheme();
      });
    }

    // Busca com debounce
    let searchTimer = null;
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          window.store.filters.search = e.target.value;
          this.renderCatalog();
        }, 200);
      });
    }

    // Filtro por categorias
    this.categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        window.store.filters.category = tab.dataset.category;
        this.renderCatalog();
      });
    });

    // Filtro por Preço Máximo
    if (this.priceRangeInput) {
      this.priceRangeInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        window.store.filters.maxPrice = val;
        if (this.priceRangeValue) {
          this.priceRangeValue.textContent = `Até R$ ${val.toLocaleString('pt-BR')}`;
        }
        this.renderCatalog();
      });
    }

    // Ordenação
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', (e) => {
        window.store.filters.sortBy = e.target.value;
        this.renderCatalog();
      });
    }

    // Fechar Quick View Modal
    if (this.closeQuickViewBtn) {
      this.closeQuickViewBtn.addEventListener('click', () => this.closeQuickView());
    }
    if (this.quickViewBackdrop) {
      this.quickViewBackdrop.addEventListener('click', () => this.closeQuickView());
    }

    // Delegação de cliques nos cards de produto
    if (this.productGrid) {
      this.productGrid.addEventListener('click', (e) => {
        const btnAdd = e.target.closest('[data-action="add-cart"]');
        const btnWishlist = e.target.closest('[data-action="toggle-wishlist"]');
        const btnQuickView = e.target.closest('[data-action="quick-view"]');

        if (btnAdd) {
          const id = btnAdd.dataset.id;
          window.store.addToCart(id, 1);
          this.showToast('Item adicionado ao carrinho!', 'success');
          // Leve animação no botão
          btnAdd.classList.add('added-anim');
          setTimeout(() => btnAdd.classList.remove('added-anim'), 600);
          return;
        }

        if (btnWishlist) {
          const id = btnWishlist.dataset.id;
          const isAdded = window.store.toggleWishlist(id);
          this.showToast(isAdded ? 'Adicionado aos favoritos!' : 'Removido dos favoritos.', 'info');
          return;
        }

        if (btnQuickView) {
          const id = btnQuickView.dataset.id;
          this.openQuickView(id);
          return;
        }
      });
    }
  }

  updateThemeIcon() {
    if (!this.themeToggleBtn) return;
    const isDark = window.store.theme === 'dark';
    this.themeToggleBtn.innerHTML = isDark
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }

  updateWishlistCount() {
    if (this.wishlistCountBadge) {
      const count = window.store.wishlist.length;
      this.wishlistCountBadge.textContent = count;
      this.wishlistCountBadge.style.display = count > 0 ? 'inline-flex' : 'none';
    }
  }

  renderCatalog() {
    const products = window.store.getFilteredProducts();

    if (this.totalProductsCount) {
      this.totalProductsCount.textContent = `${products.length} produtos encontrados`;
    }

    if (products.length === 0) {
      if (this.productGrid) this.productGrid.innerHTML = '';
      if (this.emptySearchState) this.emptySearchState.style.display = 'flex';
      return;
    }

    if (this.emptySearchState) this.emptySearchState.style.display = 'none';

    if (this.productGrid) {
      this.productGrid.innerHTML = products.map(product => {
        const isFav = window.store.isWishlisted(product.id);
        const installmentVal = (product.price / 10).toFixed(2);
        
        return `
          <div class="product-card" data-id="${product.id}">
            <!-- Imagem e Badges -->
            <div class="product-media">
              <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1507499739999-097706ad8914?w=600&auto=format&fit=crop&q=80';" />
              ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
              
              <button class="wishlist-btn ${isFav ? 'active' : ''}" data-action="toggle-wishlist" data-id="${product.id}" title="${isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>

              <button class="quick-view-btn" data-action="quick-view" data-id="${product.id}">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Espiar
              </button>
            </div>

            <!-- Dados do Produto -->
            <div class="product-info">
              <span class="product-category">${product.categoryName}</span>
              <h3 class="product-title" title="${product.name}">${product.name}</h3>

              <!-- Avaliações -->
              <div class="product-rating">
                <div class="stars">★ ★ ★ ★ ★</div>
                <span class="rating-num">${product.rating}</span>
                <span class="rating-count">(${product.reviewsCount})</span>
              </div>

              <!-- Preços -->
              <div class="product-pricing">
                ${product.originalPrice ? `<span class="original-price">R$ ${product.originalPrice.toFixed(2)}</span>` : ''}
                <span class="current-price">R$ ${product.price.toFixed(2)}</span>
                <span class="installment-text">em até 10x de R$ ${installmentVal} sem juros</span>
              </div>

              <!-- Ações -->
              <div class="product-card-actions">
                <button class="btn-add-cart" data-action="add-cart" data-id="${product.id}">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Quick View Modal
  openQuickView(productId) {
    const product = window.store.products.find(p => p.id === productId);
    if (!product) return;

    this.activeQuickViewProduct = product;
    this.selectedQuickViewColor = product.colors ? product.colors[0] : null;
    this.quickViewQty = 1;

    // Preenche informações
    document.getElementById('qvImage').src = product.image;
    document.getElementById('qvCategory').textContent = product.categoryName;
    document.getElementById('qvTitle').textContent = product.name;
    document.getElementById('qvRating').textContent = `${product.rating} (${product.reviewsCount} avaliações)`;
    document.getElementById('qvPrice').textContent = `R$ ${product.price.toFixed(2)}`;
    document.getElementById('qvDescription').textContent = product.description;
    document.getElementById('qvStock').textContent = `${product.stock} unidades disponíveis`;
    document.getElementById('qvQtyInput').value = 1;

    // Cores
    const colorsContainer = document.getElementById('qvColors');
    if (colorsContainer && product.colors) {
      colorsContainer.innerHTML = product.colors.map((c, i) => `
        <button class="qv-color-dot ${i === 0 ? 'selected' : ''}" style="background-color: ${c};" data-color="${c}" title="Cor"></button>
      `).join('');

      colorsContainer.querySelectorAll('.qv-color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          colorsContainer.querySelectorAll('.qv-color-dot').forEach(d => d.classList.remove('selected'));
          dot.classList.add('selected');
          this.selectedQuickViewColor = dot.dataset.color;
        });
      });
    }

    // Especificações
    const specsList = document.getElementById('qvSpecs');
    if (specsList && product.specs) {
      specsList.innerHTML = Object.entries(product.specs).map(([k, v]) => `
        <div class="qv-spec-row">
          <span class="qv-spec-key">${k}:</span>
          <span class="qv-spec-val">${v}</span>
        </div>
      `).join('');
    }

    // Botões de quantidade
    document.getElementById('qvQtyMinus').onclick = () => {
      if (this.quickViewQty > 1) {
        this.quickViewQty--;
        document.getElementById('qvQtyInput').value = this.quickViewQty;
      }
    };
    document.getElementById('qvQtyPlus').onclick = () => {
      if (this.quickViewQty < product.stock) {
        this.quickViewQty++;
        document.getElementById('qvQtyInput').value = this.quickViewQty;
      }
    };

    // Botão Adicionar do Modal
    document.getElementById('qvAddToCartBtn').onclick = () => {
      window.store.addToCart(product.id, this.quickViewQty, this.selectedQuickViewColor);
      this.closeQuickView();
      window.cartUI.open();
      this.showToast('Produto adicionado ao seu carrinho!', 'success');
    };

    if (this.quickViewModal) this.quickViewModal.classList.add('active');
    if (this.quickViewBackdrop) this.quickViewBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeQuickView() {
    if (this.quickViewModal) this.quickViewModal.classList.remove('active');
    if (this.quickViewBackdrop) this.quickViewBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Notificações Toast
  showToast(message, type = 'info') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || '•'}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }
}

// Inicialização após o DOM carregar
window.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
