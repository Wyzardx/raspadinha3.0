// Gerenciador de Transferências
class TransferManager {
    constructor() {
        this.init();
    }

    init() {
        this.createTransferContent();
        this.setupEventListeners();
    }

    createTransferContent() {
        const transferContent = document.getElementById('transfer-content');
        if (!transferContent) {
            const mainContent = document.querySelector('.main-content');
            const transferSection = document.createElement('div');
            transferSection.id = 'transfer-content';
            transferSection.className = 'content-section';
            transferSection.innerHTML = this.getTransferHTML();
            mainContent.appendChild(transferSection);
        } else {
            transferContent.innerHTML = this.getTransferHTML();
        }
    }

    getTransferHTML() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-exchange-alt"></i> Transferir</h2>
                <p>Envie dinheiro para outros usuários</p>
            </div>

            <div class="transfer-container">
                <div class="transfer-card">
                    <div class="balance-info">
                        <span class="balance-label">Saldo Disponível</span>
                        <span class="balance-amount" id="transfer-available-balance">R$ 0,00</span>
                    </div>

                    <form id="transfer-form" class="transfer-form">
                        <div class="form-group">
                            <label for="recipient-email">Email do Destinatário</label>
                            <div class="input-group">
                                <i class="fas fa-user"></i>
                                <input type="email" id="recipient-email" name="recipient_email" required
                                       placeholder="email@exemplo.com">
                                <button type="button" id="verify-recipient" class="verify-btn">
                                    <i class="fas fa-search"></i>
                                </button>
                            </div>
                            <div id="recipient-info" class="recipient-info" style="display: none;">
                                <!-- Info do destinatário aparece aqui -->
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="transfer-amount">Valor da Transferência</label>
                            <div class="input-group">
                                <span class="currency-symbol">R$</span>
                                <input type="number" id="transfer-amount" name="amount" 
                                       step="0.01" min="0.01" required
                                       placeholder="0,00">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="transfer-description">Descrição (opcional)</label>
                            <div class="input-group">
                                <i class="fas fa-comment"></i>
                                <input type="text" id="transfer-description" name="description" 
                                       placeholder="Ex: Pagamento, Empréstimo, etc.">
                            </div>
                        </div>

                        <div class="transfer-info">
                            <div class="info-item">
                                <i class="fas fa-shield-alt"></i>
                                <span>Transferência segura e instantânea</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span>Verifique os dados antes de confirmar</span>
                            </div>
                        </div>

                        <button type="submit" class="btn-primary" disabled id="transfer-submit">
                            <i class="fas fa-exchange-alt"></i>
                            Transferir
                        </button>
                    </form>
                </div>

                <div class="recent-transfers">
                    <h3>Transferências Recentes</h3>
                    <div id="recent-transfers-list">
                        <!-- Carregado dinamicamente -->
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        setTimeout(() => {
            const transferForm = document.getElementById('transfer-form');
            if (transferForm) {
                transferForm.addEventListener('submit', (e) => this.handleTransfer(e));
            }

            const verifyBtn = document.getElementById('verify-recipient');
            if (verifyBtn) {
                verifyBtn.addEventListener('click', () => this.verifyRecipient());
            }

            const recipientEmail = document.getElementById('recipient-email');
            if (recipientEmail) {
                recipientEmail.addEventListener('input', () => this.resetRecipientVerification());
            }

            const amountInput = document.getElementById('transfer-amount');
            if (amountInput) {
                amountInput.addEventListener('input', (e) => this.formatAmount(e));
            }

            // Carregar dados iniciais
            this.loadAvailableBalance();
            this.loadRecentTransfers();
        }, 100);
    }

    formatAmount(e) {
        let value = e.target.value;
        if (value.includes('.')) {
            const parts = value.split('.');
            if (parts[1] && parts[1].length > 2) {
                e.target.value = parts[0] + '.' + parts[1].substring(0, 2);
            }
        }
    }

    async loadAvailableBalance() {
        try {
            const response = await window.app.makeRequest('/api/get_balance');
            if (response.success) {
                const balanceElement = document.getElementById('transfer-available-balance');
                if (balanceElement) {
                    balanceElement.textContent = window.app.formatCurrency(response.balance);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar saldo:', error);
        }
    }

    resetRecipientVerification() {
        const recipientInfo = document.getElementById('recipient-info');
        const submitBtn = document.getElementById('transfer-submit');
        
        if (recipientInfo) {
            recipientInfo.style.display = 'none';
        }
        if (submitBtn) {
            submitBtn.disabled = true;
        }
    }

    async verifyRecipient() {
        const emailInput = document.getElementById('recipient-email');
        const email = emailInput.value.trim();
        
        if (!email) {
            window.app.showAlert('Digite o email do destinatário', 'error');
            return;
        }

        if (email === window.app.currentUser.email) {
            window.app.showAlert('Você não pode transferir para si mesmo', 'error');
            return;
        }

        const verifyBtn = document.getElementById('verify-recipient');
        const originalText = verifyBtn.innerHTML;
        verifyBtn.innerHTML = '<div class="loading"></div>';
        verifyBtn.disabled = true;

        try {
            const response = await window.app.makeRequest('/api/verify_user', {
                method: 'POST',
                body: JSON.stringify({ email })
            });

            if (response.success) {
                this.showRecipientInfo(response.user);
                document.getElementById('transfer-submit').disabled = false;
            } else {
                window.app.showAlert(response.message || 'Usuário não encontrado', 'error');
            }
        } catch (error) {
            console.error('Erro ao verificar destinatário:', error);
            window.app.showAlert('Erro ao verificar destinatário', 'error');
        } finally {
            verifyBtn.innerHTML = originalText;
            verifyBtn.disabled = false;
        }
    }

    showRecipientInfo(user) {
        const recipientInfo = document.getElementById('recipient-info');
        recipientInfo.innerHTML = `
            <div class="recipient-card">
                <div class="recipient-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="recipient-details">
                    <div class="recipient-name">${user.name}</div>
                    <div class="recipient-email">${user.email}</div>
                </div>
                <div class="recipient-status">
                    <i class="fas fa-check-circle"></i>
                    <span>Verificado</span>
                </div>
            </div>
        `;
        recipientInfo.style.display = 'block';
    }

    async handleTransfer(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const recipientEmail = formData.get('recipient_email');
        const amount = parseFloat(formData.get('amount'));
        const description = formData.get('description') || 'Transferência realizada';

        // Validações
        if (!amount || amount <= 0) {
            window.app.showAlert('Por favor, insira um valor válido', 'error');
            return;
        }

        // Verificar saldo disponível
        try {
            const balanceResponse = await window.app.makeRequest('/api/get_balance');
            if (balanceResponse.success && amount > balanceResponse.balance) {
                window.app.showAlert('Saldo insuficiente', 'error');
                return;
            }
        } catch (error) {
            window.app.showAlert('Erro ao verificar saldo', 'error');
            return;
        }

        // Mostrar loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading"></div> Processando...';
        submitBtn.disabled = true;

        try {
            const response = await window.app.makeRequest('/api/transfer', {
                method: 'POST',
                body: JSON.stringify({ 
                    recipient_email: recipientEmail,
                    amount, 
                    description 
                })
            });

            if (response.success) {
                window.app.showAlert(`Transferência de ${window.app.formatCurrency(amount)} realizada com sucesso!`, 'success');
                
                // Limpar formulário
                e.target.reset();
                this.resetRecipientVerification();
                
                // Atualizar saldo
                this.loadAvailableBalance();
                if (window.dashboardManager) {
                    window.dashboardManager.loadBalance();
                }
                
                // Carregar transferências recentes
                this.loadRecentTransfers();
            } else {
                window.app.showAlert(response.message || 'Erro ao processar transferência', 'error');
            }
        } catch (error) {
            console.error('Erro na transferência:', error);
            window.app.showAlert('Erro de conexão. Tente novamente.', 'error');
        } finally {
            // Restaurar botão
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async loadRecentTransfers() {
        try {
            const response = await window.app.makeRequest('/api/get_transactions?type=transfer&limit=10');
            
            if (response.success) {
                this.displayRecentTransfers(response.transactions);
            }
        } catch (error) {
            console.error('Erro ao carregar transferências recentes:', error);
        }
    }

    displayRecentTransfers(transfers) {
        const container = document.getElementById('recent-transfers-list');
        if (!container) return;

        if (transfers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exchange-alt"></i>
                    <p>Nenhuma transferência encontrada</p>
                </div>
            `;
            return;
        }

        container.innerHTML = transfers.map(transfer => `
            <div class="transfer-item">
                <div class="transfer-icon ${transfer.type}">
                    <i class="fas fa-${transfer.type === 'transfer_sent' ? 'arrow-right' : 'arrow-left'}"></i>
                </div>
                <div class="transfer-details">
                    <div class="transfer-description">${transfer.description}</div>
                    <div class="transfer-target">${transfer.type === 'transfer_sent' ? 'Para: ' : 'De: '}${transfer.target_name || 'Usuário'}</div>
                    <div class="transfer-date">${this.formatDate(transfer.created_at)}</div>
                </div>
                <div class="transfer-amount ${transfer.type}">
                    ${transfer.type === 'transfer_sent' ? '-' : '+'}${window.app.formatCurrency(Math.abs(transfer.amount))}
                </div>
            </div>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Estilos específicos para transferência
const transferStyles = `
<style>
.transfer-container {
    max-width: 900px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
}

.transfer-card {
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    padding: 32px;
}

.transfer-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.verify-btn {
    position: absolute;
    right: 8px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    cursor: pointer;
    transition: var(--transition);
}

.verify-btn:hover {
    background: var(--primary-dark);
}

.recipient-info {
    margin-top: 12px;
}

.recipient-card {
    background: rgba(16, 185, 129, 0.05);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: var(--border-radius);
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
}

.recipient-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--success-color);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
}

.recipient-details {
    flex: 1;
}

.recipient-name {
    font-weight: 600;
    margin-bottom: 4px;
}

.recipient-email {
    font-size: 14px;
    color: var(--text-secondary);
}

.recipient-status {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--success-color);
    font-size: 14px;
}

.transfer-info {
    background: rgba(37, 99, 235, 0.05);
    border-radius: var(--border-radius);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.transfer-info .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--primary-color);
    font-size: 14px;
}

.recent-transfers {
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    overflow: hidden;
}

.recent-transfers h3 {
    padding: 20px;
    margin: 0;
    border-bottom: 1px solid var(--border-color);
}

.transfer-item {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
}

.transfer-item:last-child {
    border-bottom: none;
}

.transfer-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
}

.transfer-icon.transfer_sent {
    background: rgba(245, 158, 11, 0.1);
    color: var(--warning-color);
}

.transfer-icon.transfer_received {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
}

.transfer-details {
    flex: 1;
}

.transfer-description {
    font-weight: 600;
    margin-bottom: 4px;
}

.transfer-target {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 2px;
}

.transfer-date {
    font-size: 12px;
    color: var(--text-secondary);
}

.transfer-amount {
    font-weight: 700;
    font-size: 16px;
}

.transfer-amount.transfer_sent {
    color: var(--danger-color);
}

.transfer-amount.transfer_received {
    color: var(--success-color);
}

@media (max-width: 768px) {
    .transfer-container {
        grid-template-columns: 1fr;
        gap: 24px;
    }
}
</style>
`;

// Adicionar estilos
document.head.insertAdjacentHTML('beforeend', transferStyles);

// Inicializar gerenciador
window.transferManager = new TransferManager();