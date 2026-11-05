/**
 * Módulo de Gerenciamento do Carrinho de Compras
 * Controla o drawer lateral, atualizações em tempo real, cupons e barra de frete grátis.
 */

function formatMoney(value) {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

class CartUI {
  constructor() {
    this.drawer = document.getElementById('cartDrawer');
    this.backdrop = document.getElementById('cartBackdrop');
    this.closeBtn = document.getElementById('closeCartBtn');
    this.cartItemsList = document.getElementById('cartItemsList');
    this.cartEmptyState = document.getElementById('cartEmptyState');
    this.cartFooter = document.getElementById('cartFooter');
    
    // Contadores
    this.cartCountBadges = document.querySelectorAll('.cart-count-badge');
    
    // Resumo de valores
    this.cartSubtotalEl = document.getElementById('cartSubtotal');
    this.cartDiscountRow = document.getElementById('cartDiscountRow');
    this.cartDiscountEl = document.getElementById('cartDiscount');
    this.cartShippingEl = document.getElementById('cartShipping');
    this.cartTotalEl = document.getElementById('cartTotal');
    
    // Barra de Frete Grátis
    this.shippingProgressFill = document.getElementById('shippingProgressFill');
    this.shippingProgressText = document.getElementById('shippingProgressText');
    
    // Cupom
    this.couponForm = document.getElementById('couponForm');
    this.couponInput = document.getElementById('couponInput');
    this.appliedCouponBadge = document.getElementById('appliedCouponBadge');
    
    // Botão de Checkout
    this.checkoutBtn = document.getElementById('checkoutBtn');

    this.bindEvents();
  }

  bindEvents() {
    // Fechar ao clicar no backdrop ou botão X
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
    if (this.backdrop) this.backdrop.addEventListener('click', () => this.close());

    // Botões que abrem o carrinho
    document.querySelectorAll('[data-action="open-cart"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });

    // Tecla ESC para fechar
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });

    // Submissão do cupom
    if (this.couponForm) {
      this.couponForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = this.couponInput.value;
        if (!code) return;

        const result = window.store.applyCoupon(code);
        if (result.success) {
          window.app.showToast(result.message, 'success');
          this.couponInput.value = '';
        } else {
          window.app.showToast(result.message, 'error');
        }
      });
    }

    // Botão de ir para Checkout
    if (this.checkoutBtn) {
      this.checkoutBtn.addEventListener('click', () => {
        const summary = window.store.getCartSummary();
        if (summary.items.length === 0) {
          window.app.showToast('Seu carrinho está vazio!', 'warning');
          return;
        }
        this.close();
        window.checkoutUI.open();
      });
    }

    // Assina atualizações da Store
    window.store.subscribe((event, payload) => {
      if (event === 'cart:updated') {
        this.render();
      }
    });
  }

  isOpen() {
    return this.drawer && this.drawer.classList.contains('active');
  }

  open() {
    if (!this.drawer) return;
    this.render();
    this.drawer.classList.add('active');
    if (this.backdrop) this.backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.drawer) return;
    this.drawer.classList.remove('active');
    if (this.backdrop) this.backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  render() {
    const summary = window.store.getCartSummary();
    
    // Atualiza badges em qualquer lugar da tela
    this.cartCountBadges.forEach(badge => {
      badge.textContent = summary.itemCount;
      badge.style.display = summary.itemCount > 0 ? 'inline-flex' : 'none';
    });

    if (summary.items.length === 0) {
      if (this.cartItemsList) this.cartItemsList.innerHTML = '';
      if (this.cartEmptyState) this.cartEmptyState.style.display = 'flex';
      if (this.cartFooter) this.cartFooter.style.display = 'none';
      if (this.shippingProgressFill) this.shippingProgressFill.style.width = '0%';
      if (this.shippingProgressText) {
        this.shippingProgressText.innerHTML = `Adicione produtos acima de <strong>R$ 199,00</strong> para frete grátis!`;
      }
      return;
    }

    if (this.cartEmptyState) this.cartEmptyState.style.display = 'none';
    if (this.cartFooter) this.cartFooter.style.display = 'block';

    // Barra de Frete Grátis
    if (this.shippingProgressFill && this.shippingProgressText) {
      this.shippingProgressFill.style.width = `${summary.freeShippingProgress}%`;
      if (summary.freeShippingRemaining <= 0 || (summary.coupon && summary.coupon.type === 'free_shipping')) {
        this.shippingProgressText.innerHTML = `🎉 <strong>Parabéns!</strong> Você ganhou <strong>Frete Grátis</strong>!`;
        this.shippingProgressFill.style.backgroundColor = 'var(--color-success)';
      } else {
        this.shippingProgressText.innerHTML = `Faltam <strong>${formatMoney(summary.freeShippingRemaining)}</strong> para você ganhar <strong>Frete Grátis</strong>!`;
        this.shippingProgressFill.style.backgroundColor = 'var(--color-primary)';
      }
    }

    // Lista de itens
    if (this.cartItemsList) {
      this.cartItemsList.innerHTML = summary.items.map(item => `
        <div class="cart-item" data-id="${item.id}" data-color="${item.selectedColor}">
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1507499739999-097706ad8914?w=600&auto=format&fit=crop&q=80';" />
          </div>
          <div class="cart-item-details">
            <div class="cart-item-header">
              <span class="cart-item-category">${item.categoryName || 'Produto'}</span>
              <button class="cart-item-remove" onclick="window.store.removeFromCart('${item.id}', '${item.selectedColor}')" title="Remover item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
            <h4 class="cart-item-title">${item.name}</h4>
            <div class="cart-item-meta">
              <span class="color-dot" style="background-color: ${item.selectedColor};" title="Cor selecionada"></span>
              <span class="cart-item-price">${formatMoney(item.price)}</span>
            </div>
            <div class="cart-item-bottom">
              <div class="quantity-control">
                <button class="qty-btn" onclick="window.store.updateQuantity('${item.id}', '${item.selectedColor}', -1)" title="Diminuir">
                  -
                </button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" onclick="window.store.updateQuantity('${item.id}', '${item.selectedColor}', 1)" title="Aumentar" ${item.quantity >= item.stock ? 'disabled' : ''}>
                  +
                </button>
              </div>
              <span class="cart-item-subtotal">${formatMoney(item.price * item.quantity)}</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Atualização dos totais
    if (this.cartSubtotalEl) this.cartSubtotalEl.textContent = formatMoney(summary.subtotal);
    
    if (this.cartDiscountRow && this.cartDiscountEl) {
      if (summary.discount > 0) {
        this.cartDiscountRow.style.display = 'flex';
        this.cartDiscountEl.textContent = `-${formatMoney(summary.discount)}`;
      } else {
        this.cartDiscountRow.style.display = 'none';
      }
    }

    if (this.cartShippingEl) {
      this.cartShippingEl.innerHTML = summary.shipping === 0 
        ? '<span class="free-shipping-tag">GRÁTIS</span>' 
        : formatMoney(summary.shipping);
    }

    if (this.cartTotalEl) this.cartTotalEl.textContent = formatMoney(summary.total);

    // Badge de Cupom Aplicado
    if (this.appliedCouponBadge) {
      if (summary.coupon) {
        this.appliedCouponBadge.style.display = 'flex';
        this.appliedCouponBadge.innerHTML = `
          <span>🏷️ ${summary.coupon.code} (${summary.coupon.label})</span>
          <button type="button" class="btn-remove-coupon" onclick="window.store.removeCoupon()" title="Remover cupom">✕</button>
        `;
      } else {
        this.appliedCouponBadge.style.display = 'none';
        this.appliedCouponBadge.innerHTML = '';
      }
    }
  }
}

window.CartUI = CartUI;
