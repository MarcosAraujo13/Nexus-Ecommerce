/**
 * Módulo de Checkout Completo do Nexus Commerce
 * Wizard em 3 etapas: 
 *  1. Dados & Entrega (com preenchimento automático por CEP)
 *  2. Forma de Pagamento (PIX com QR Code dinâmico, Cartão de Crédito interativo e Boleto)
 *  3. Confirmação do Pedido e Geração do Comprovante
 */

class CheckoutUI {
  constructor() {
    this.modal = document.getElementById('checkoutModal');
    this.backdrop = document.getElementById('checkoutBackdrop');
    this.closeBtn = document.getElementById('closeCheckoutBtn');

    this.currentStep = 1;
    this.selectedPaymentMethod = 'pix';

    // Steps
    this.steps = {
      1: document.getElementById('checkoutStep1'),
      2: document.getElementById('checkoutStep2'),
      3: document.getElementById('checkoutStep3')
    };
    this.stepIndicators = document.querySelectorAll('.checkout-step-indicator');

    // Forms e Botões
    this.addressForm = document.getElementById('checkoutAddressForm');
    this.paymentForm = document.getElementById('checkoutPaymentForm');
    this.btnBackToStep1 = document.getElementById('btnBackToStep1');

    // Resumo lateral do Checkout
    this.checkoutSummaryList = document.getElementById('checkoutSummaryList');
    this.checkoutSubtotal = document.getElementById('checkoutSubtotal');
    this.checkoutDiscount = document.getElementById('checkoutDiscount');
    this.checkoutShipping = document.getElementById('checkoutShipping');
    this.checkoutTotal = document.getElementById('checkoutTotal');

    // Elementos do Cartão Interativo
    this.creditCardPreview = {
      number: document.getElementById('cardPreviewNumber'),
      name: document.getElementById('cardPreviewName'),
      expiry: document.getElementById('cardPreviewExpiry')
    };

    // Campos de input do cartão
    this.cardNumberInput = document.getElementById('cardNumberInput');
    this.cardNameInput = document.getElementById('cardNameInput');
    this.cardExpiryInput = document.getElementById('cardExpiryInput');
    this.cardCvvInput = document.getElementById('cardCvvInput');
    this.cardInstallments = document.getElementById('cardInstallments');

    // CEP input
    this.cepInput = document.getElementById('checkoutCep');

    this.lastCreatedOrder = null;
    this.bindEvents();
  }

  bindEvents() {
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.close());
    if (this.backdrop) this.backdrop.addEventListener('click', () => this.close());

    // Voltar para Passo 1
    if (this.btnBackToStep1) {
      this.btnBackToStep1.addEventListener('click', () => this.goToStep(1));
    }

    // Avançar de Passo 1 para Passo 2 (Validação do Endereço)
    if (this.addressForm) {
      this.addressForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (this.validateAddressForm()) {
          this.goToStep(2);
        }
      });
    }

    // Finalizar Pedido no Passo 2
    if (this.paymentForm) {
      this.paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.processPayment();
      });
    }

    // Mudança de Forma de Pagamento
    document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.selectedPaymentMethod = e.target.value;
        this.renderPaymentMethodPanels();
      });
    });

    // Mascara e Busca CEP
    if (this.cepInput) {
      this.cepInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 5) {
          v = v.replace(/^(\d{5})(\d)/, '$1-$2');
        }
        e.target.value = v.substring(0, 9);

        const cleanCep = v.replace(/\D/g, '');
        if (cleanCep.length === 8) {
          this.fetchCepData(cleanCep);
        }
      });
    }

    // Espelhamento do Cartão de Crédito
    if (this.cardNumberInput) {
      this.cardNumberInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').substring(0, 16);
        v = v.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = v;
        if (this.creditCardPreview.number) {
          this.creditCardPreview.number.textContent = v || '•••• •••• •••• ••••';
        }
      });
    }

    if (this.cardNameInput) {
      this.cardNameInput.addEventListener('input', (e) => {
        const v = e.target.value.toUpperCase();
        if (this.creditCardPreview.name) {
          this.creditCardPreview.name.textContent = v || 'NOME DO TITULAR';
        }
      });
    }

    if (this.cardExpiryInput) {
      this.cardExpiryInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (v.length > 2) {
          v = v.replace(/^(\d{2})(\d)/, '$1/$2');
        }
        e.target.value = v;
        if (this.creditCardPreview.expiry) {
          this.creditCardPreview.expiry.textContent = v || 'MM/AA';
        }
      });
    }

    // Botão de Copiar Código PIX
    const copyPixBtn = document.getElementById('copyPixBtn');
    if (copyPixBtn) {
      copyPixBtn.addEventListener('click', () => {
        const pixCode = document.getElementById('pixCodeDisplay')?.value;
        if (pixCode && navigator.clipboard) {
          navigator.clipboard.writeText(pixCode);
          window.app.showToast('Código PIX copiado para a área de transferência!', 'success');
        }
      });
    }

    // Botão Imprimir Comprovante
    const printReceiptBtn = document.getElementById('printReceiptBtn');
    if (printReceiptBtn) {
      printReceiptBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  // Preenchimento simulado ou real de CEP
  async fetchCepData(cep) {
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (res.ok) {
        const data = await res.json();
        if (!data.erro) {
          document.getElementById('checkoutStreet').value = data.logradouro || '';
          document.getElementById('checkoutNeighborhood').value = data.bairro || '';
          document.getElementById('checkoutCity').value = data.localidade || '';
          document.getElementById('checkoutState').value = data.uf || '';
          document.getElementById('checkoutNumber').focus();
          window.app.showToast('Endereço localizado via CEP!', 'info');
          return;
        }
      }
    } catch (e) {
      // offline fallback
    }

    // Simulação inteligente caso offline
    document.getElementById('checkoutStreet').value = 'Av. Paulista';
    document.getElementById('checkoutNeighborhood').value = 'Bela Vista';
    document.getElementById('checkoutCity').value = 'São Paulo';
    document.getElementById('checkoutState').value = 'SP';
  }

  open() {
    const summary = window.store.getCartSummary();
    if (summary.items.length === 0) {
      window.app.showToast('Carrinho vazio!', 'warning');
      return;
    }

    this.currentStep = 1;
    this.goToStep(1);
    this.renderSummary();
    this.populateInstallments();
    
    if (this.modal) this.modal.classList.add('active');
    if (this.backdrop) this.backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (this.modal) this.modal.classList.remove('active');
    if (this.backdrop) this.backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  goToStep(step) {
    this.currentStep = step;

    // Atualiza visibilidade dos passos
    Object.keys(this.steps).forEach(key => {
      if (this.steps[key]) {
        this.steps[key].style.display = parseInt(key, 10) === step ? 'block' : 'none';
      }
    });

    // Atualiza indicadores visuais da barra superior
    this.stepIndicators.forEach((ind, index) => {
      const stepNum = index + 1;
      ind.classList.remove('active', 'completed');
      if (stepNum === step) {
        ind.classList.add('active');
      } else if (stepNum < step) {
        ind.classList.add('completed');
      }
    });

    if (step === 2) {
      this.renderPaymentMethodPanels();
    }
  }

  validateAddressForm() {
    const name = document.getElementById('checkoutName').value.trim();
    const email = document.getElementById('checkoutEmail').value.trim();
    const phone = document.getElementById('checkoutPhone').value.trim();
    const cep = document.getElementById('checkoutCep').value.trim();
    const street = document.getElementById('checkoutStreet').value.trim();
    const number = document.getElementById('checkoutNumber').value.trim();

    if (!name || !email || !phone || !cep || !street || !number) {
      window.app.showToast('Por favor, preencha todos os campos obrigatórios de entrega.', 'warning');
      return false;
    }

    return true;
  }

  renderPaymentMethodPanels() {
    const pixPanel = document.getElementById('paymentPanelPix');
    const cardPanel = document.getElementById('paymentPanelCard');
    const boletoPanel = document.getElementById('paymentPanelBoleto');

    if (pixPanel) pixPanel.style.display = this.selectedPaymentMethod === 'pix' ? 'block' : 'none';
    if (cardPanel) cardPanel.style.display = this.selectedPaymentMethod === 'card' ? 'block' : 'none';
    if (boletoPanel) boletoPanel.style.display = this.selectedPaymentMethod === 'boleto' ? 'block' : 'none';

    if (this.selectedPaymentMethod === 'pix') {
      this.generatePixQRCode();
    }
  }

  generatePixQRCode() {
    const summary = window.store.getCartSummary();
    const container = document.getElementById('pixQrContainer');
    const pixCodeInput = document.getElementById('pixCodeDisplay');
    
    // Valor com 5% de desconto no PIX
    const pixTotal = summary.total * 0.95;
    const randomTxid = Math.random().toString(36).substring(2, 14).toUpperCase();
    const pixPayload = `00020126580014BR.GOV.BCB.PIX0136nexus-financeiro@nexusecommerce.com.br520400005303986540${pixTotal.toFixed(2)}5802BR5914NEXUS STORE6009SAO PAULO62140510${randomTxid}6304`;

    if (pixCodeInput) {
      pixCodeInput.value = pixPayload;
    }

    // Desenha QR Code SVG geométrico realista
    if (container) {
      container.innerHTML = `
        <div class="pix-qr-wrapper">
          <svg viewBox="0 0 160 160" width="160" height="160" class="pix-svg-qr">
            <!-- Padrão visual do QR Code -->
            <rect width="160" height="160" fill="#ffffff" rx="8" />
            <!-- Marcadores dos 3 cantos -->
            <rect x="15" y="15" width="40" height="40" fill="#000" rx="4" />
            <rect x="23" y="23" width="24" height="24" fill="#fff" rx="2" />
            <rect x="29" y="29" width="12" height="12" fill="#000" rx="1" />

            <rect x="105" y="15" width="40" height="40" fill="#000" rx="4" />
            <rect x="113" y="23" width="24" height="24" fill="#fff" rx="2" />
            <rect x="119" y="29" width="12" height="12" fill="#000" rx="1" />

            <rect x="15" y="105" width="40" height="40" fill="#000" rx="4" />
            <rect x="23" y="113" width="24" height="24" fill="#fff" rx="2" />
            <rect x="29" y="119" width="12" height="12" fill="#000" rx="1" />

            <!-- Padrões internos dinâmicos -->
            <rect x="65" y="20" width="8" height="25" fill="#000" />
            <rect x="80" y="30" width="15" height="8" fill="#000" />
            <rect x="20" y="65" width="30" height="8" fill="#000" />
            <rect x="60" y="60" width="40" height="40" fill="#0284c7" rx="4" />
            <text x="80" y="84" font-size="12" font-weight="bold" fill="#fff" text-anchor="middle">PIX</text>
            <rect x="110" y="65" width="35" height="10" fill="#000" />
            <rect x="65" y="115" width="10" height="30" fill="#000" />
            <rect x="85" y="110" width="25" height="8" fill="#000" />
            <rect x="120" y="115" width="25" height="25" fill="#000" />
          </svg>
          <div class="pix-timer">
            ⏱️ Código válido por: <span id="pixCountdown">14:59</span>
          </div>
        </div>
      `;
    }
  }

  populateInstallments() {
    if (!this.cardInstallments) return;
    const summary = window.store.getCartSummary();
    const total = summary.total;

    let options = '';
    for (let i = 1; i <= 12; i++) {
      if (i === 1) {
        options += `<option value="1">1x de ${formatMoney(total)} (à vista sem juros)</option>`;
      } else if (i <= 6) {
        const val = total / i;
        options += `<option value="${i}">${i}x de ${formatMoney(val)} sem juros</option>`;
      } else {
        const val = (total * 1.05) / i; // juros leves
        options += `<option value="${i}">${i}x de ${formatMoney(val)} com juros (${formatMoney(total * 1.05)})</option>`;
      }
    }
    this.cardInstallments.innerHTML = options;
  }

  renderSummary() {
    const summary = window.store.getCartSummary();

    if (this.checkoutSummaryList) {
      this.checkoutSummaryList.innerHTML = summary.items.map(item => `
        <div class="checkout-item-row">
          <img src="${item.image}" alt="${item.name}" />
          <div class="checkout-item-info">
            <p class="checkout-item-title">${item.name}</p>
            <span class="checkout-item-qty">Qtd: ${item.quantity}</span>
          </div>
          <span class="checkout-item-price">${formatMoney(item.price * item.quantity)}</span>
        </div>
      `).join('');
    }

    if (this.checkoutSubtotal) this.checkoutSubtotal.textContent = formatMoney(summary.subtotal);
    if (this.checkoutDiscount) {
      this.checkoutDiscount.textContent = summary.discount > 0 ? `-${formatMoney(summary.discount)}` : 'R$ 0,00';
    }
    if (this.checkoutShipping) {
      this.checkoutShipping.textContent = summary.shipping === 0 ? 'GRÁTIS' : formatMoney(summary.shipping);
    }
    if (this.checkoutTotal) this.checkoutTotal.textContent = formatMoney(summary.total);
  }

  async processPayment() {
    const submitBtn = document.getElementById('btnSubmitOrder');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processando pedido...';
    }

    const summary = window.store.getCartSummary();
    const customer = {
      name: document.getElementById('checkoutName').value,
      email: document.getElementById('checkoutEmail').value,
      phone: document.getElementById('checkoutPhone').value,
      cep: document.getElementById('checkoutCep').value,
      street: document.getElementById('checkoutStreet').value,
      number: document.getElementById('checkoutNumber').value,
      complement: document.getElementById('checkoutComplement')?.value || '',
      neighborhood: document.getElementById('checkoutNeighborhood').value,
      city: document.getElementById('checkoutCity').value,
      state: document.getElementById('checkoutState').value
    };

    const orderData = {
      customer,
      items: summary.items,
      subtotal: summary.subtotal,
      discount: summary.discount,
      shipping: summary.shipping,
      total: summary.total,
      paymentMethod: this.selectedPaymentMethod.toUpperCase()
    };

    // Simula tempo de processamento de gateway de pagamento
    setTimeout(async () => {
      const order = await window.store.addOrder(orderData);
      this.lastCreatedOrder = order;

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirmar e Finalizar Pedido';
      }

      this.renderSuccessStep(order);
      this.goToStep(3);
      window.app.showToast('🎉 Pedido realizado com sucesso!', 'success');
    }, 1200);
  }

  renderSuccessStep(order) {
    const orderIdEl = document.getElementById('successOrderId');
    const orderDateEl = document.getElementById('successOrderDate');
    const orderPaymentEl = document.getElementById('successOrderPayment');
    const orderTotalEl = document.getElementById('successOrderTotal');
    const orderAddressEl = document.getElementById('successOrderAddress');
    const orderItemsEl = document.getElementById('successOrderItems');

    if (orderIdEl) orderIdEl.textContent = '#' + order.id;
    if (orderDateEl) orderDateEl.textContent = new Date(order.date).toLocaleString('pt-BR');
    if (orderPaymentEl) orderPaymentEl.textContent = order.paymentMethod;
    if (orderTotalEl) orderTotalEl.textContent = formatMoney(order.total);

    if (orderAddressEl) {
      const c = order.customer;
      orderAddressEl.textContent = `${c.street}, ${c.number} ${c.complement || ''} - ${c.neighborhood}, ${c.city}/${c.state} - CEP ${c.cep}`;
    }

    if (orderItemsEl) {
      orderItemsEl.innerHTML = order.items.map(it => `
        <div class="success-item-line">
          <span>${it.quantity}x ${it.name}</span>
          <strong>${formatMoney(it.price * it.quantity)}</strong>
        </div>
      `).join('');
    }
  }
}

window.CheckoutUI = CheckoutUI;
