/**
 * Painel Administrativo e Rastreamento de Pedidos do Nexus Commerce
 * Permite cadastrar produtos, inspecionar pedidos salvos e redefinir catálogo.
 */

class AdminUI {
  constructor() {
    this.modal = document.getElementById('adminModal');
    this.backdrop = document.getElementById('adminBackdrop');
    this.closeBtn = document.getElementById('closeAdminBtn');

    this.tabButtons = document.querySelectorAll('.admin-tab-btn');
    this.tabContents = {
      addProduct: document.getElementById('adminTabAddProduct'),
      orders: document.getElementById('adminTabOrders')
    };

    this.addProductForm = document.getElementById('adminAddProductForm');
    this.resetCatalogBtn = document.getElementById('adminResetCatalogBtn');
    this.ordersTableBody = document.getElementById('adminOrdersTableBody');
    this.ordersEmptyState = document.getElementById('adminOrdersEmpty');

    this.bindEvents();
  }

  bindEvents() {
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
    if (this.backdrop) this.backdrop.addEventListener('click', () => this.close());

    // Abrir modal administrativo
    document.querySelectorAll('[data-action="open-admin"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });

    // Alternar abas do painel
    this.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Submissão do formulário de novo produto
    if (this.addProductForm) {
      this.addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleCreateProduct();
      });
    }

    // Resetar catálogo
    if (this.resetCatalogBtn) {
      this.resetCatalogBtn.addEventListener('click', async () => {
        if (confirm('Deseja realmente restaurar os produtos padrão do catálogo?')) {
          try {
            await fetch('/api/products/reset', { method: 'POST' });
          } catch (e) {}
          localStorage.removeItem('nexus_custom_products_v1');
          await window.store.initProducts();
          window.app.showToast('Catálogo restaurado para o padrão!', 'info');
          this.close();
        }
      });
    }
  }

  open() {
    this.switchTab('addProduct');
    this.renderOrders();
    if (this.modal) this.modal.classList.add('active');
    if (this.backdrop) this.backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (this.modal) this.modal.classList.remove('active');
    if (this.backdrop) this.backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  switchTab(tabKey) {
    this.tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });

    Object.keys(this.tabContents).forEach(key => {
      if (this.tabContents[key]) {
        this.tabContents[key].style.display = key === tabKey ? 'block' : 'none';
      }
    });

    if (tabKey === 'orders') {
      this.renderOrders();
    }
  }

  async handleCreateProduct() {
    const name = document.getElementById('adminProdName').value.trim();
    const category = document.getElementById('adminProdCategory').value;
    const price = parseFloat(document.getElementById('adminProdPrice').value);
    const originalPrice = document.getElementById('adminProdOriginalPrice').value 
      ? parseFloat(document.getElementById('adminProdOriginalPrice').value) 
      : null;
    const stock = parseInt(document.getElementById('adminProdStock').value, 10) || 10;
    const badge = document.getElementById('adminProdBadge').value.trim() || 'Novo';
    const image = document.getElementById('adminProdImage').value.trim() || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';
    const description = document.getElementById('adminProdDescription').value.trim();

    const categoryNames = {
      smartphones: 'Smartphones & Computadores',
      audio: 'Áudio & Fones',
      casa: 'Casa Inteligente',
      acessorios: 'Acessórios & Periféricos'
    };

    if (!name || isNaN(price) || price <= 0) {
      window.app.showToast('Preencha ao menos o Nome e Preço válido.', 'warning');
      return;
    }

    const newProd = await window.store.addProduct({
      name,
      category,
      categoryName: categoryNames[category] || 'Diversos',
      price,
      originalPrice,
      stock,
      badge,
      image,
      description,
      colors: ['#0f172a', '#2563eb', '#ffffff'],
      specs: { "Garantia": "12 meses oficial", "Origem": "Nacional" }
    });

    window.app.showToast(`Produto "${name}" cadastrado com sucesso!`, 'success');
    this.addProductForm.reset();
    this.close();
  }

  renderOrders() {
    const orders = window.store.orders;
    if (!orders || orders.length === 0) {
      if (this.ordersEmptyState) this.ordersEmptyState.style.display = 'block';
      if (this.ordersTableBody) this.ordersTableBody.innerHTML = '';
      return;
    }

    if (this.ordersEmptyState) this.ordersEmptyState.style.display = 'none';

    if (this.ordersTableBody) {
      this.ordersTableBody.innerHTML = orders.map(order => `
        <tr>
          <td><strong>#${order.id}</strong></td>
          <td>${new Date(order.date).toLocaleDateString('pt-BR')}</td>
          <td>${order.customer?.name || 'Cliente'}</td>
          <td>${order.paymentMethod}</td>
          <td><span class="order-status-badge status-${(order.status || 'aprovado').toLowerCase()}">${order.status || 'Aprovado'}</span></td>
          <td><strong>${(order.total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></td>
        </tr>
      `).join('');
    }
  }
}

window.AdminUI = AdminUI;
