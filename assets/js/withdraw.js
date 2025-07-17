// Gerenciador de Saques
class WithdrawManager {
    constructor() {
        this.init();
    }

    init() {
        this.createWithdrawContent();
        this.setupEventListeners();
    }

    createWithdrawContent() {
        const withdrawContent = document.getElementById('withdraw-content');
        if (!withdrawContent) {
            const mainContent = document.querySelector('.main-content');
            const withdrawSection = document.createElement('div');
            withdrawSection.id = 'withdraw-content';
            withdrawSection.className = 'content-section';
            withdrawSection.innerHTML = this.getWithdrawHTML();
            mainContent.appendChild(withdrawSection);
        } else {
            withdrawContent.innerHTML = this.getWithdrawHTML();
        }
    }

    getWithdrawHTML() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-minus-circle"></i> Sacar</h2>
                <p>Retire dinheiro da sua conta</p>
            </div>

            <div class="withdraw-container">
                <div class="withdraw-card">
                    <div class="balance-info">
                        <span class="balance-label">Saldo Disponível</span>
                        <span class="balance-amount" id="available-balance">R$ 0,00</span>
                    </div>

                    <form id="withdraw-form" class="withdraw-form">
                        <div class="form-group">
                            <label for="withdraw-amount">Valor do Saque</label>
                            <div class="input-group">
                                <span class="currency-symbol">R$</span>
                                <input type="number" id="withdraw-amount" name="amount" 
                                       step="0.01" min="0.01" required
                                       placeholder="0,00">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="withdraw-description">Descrição (opcional)</label>
                            <div class="input-group">
                                <i class="fas fa-comment"></i>
                                <input type="text" id="withdraw-description" name="description" 
                                       placeholder="Ex: Compras, Pagamentos, etc.">
                            </div>
                        </div>

                        <div class="withdraw-info">
                            <div class="info-item">
                                <i class="fas fa-exclamation-triangle"></i>
                                <span>Verifique o valor antes de confirmar</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-clock"></i>
                                <span>Processamento instantâneo</span>
                            </div>
                        </div>

                        <button type="submit" class="btn-danger">
                            <i class="fas fa-minus-circle"></i>
                            Sacar
                        </button>
                    </form>
                </div>

                <div class="recent-withdraws">
                    <h3>Saques Recentes</h3>
                    <div id="recent-withdraws-list">
                        <!-- Carregado dinamicamente -->
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        setTimeout(() => {
            const withdrawForm = document.getElementById('withdraw-form');
            if (withdrawForm) {
                withdrawForm.addEventListener('submit', (e) => this.handleWithdraw(e));
            }

            const amountInput = document.getElementById('withdraw-amount');
            if (amountInput) {
                amountInput.addEventListener('input', (e) => this.formatAmount(e));
            }

            // Carregar saldo disponível
            this.loadAvailableBalance();
            this.loadRecentWithdraws();
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
                const balanceElement = document.getElementById('available-balance');
                if (balanceElement) {
                    balanceElement.textContent = window.app.formatCurrency(response.balance);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar saldo:', error);
        }
    }

    async handleWithdraw(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const amount = parseFloat(formData.get('amount'));
        const description = formData.get('description') || 'Saque realizado';

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
            const response = await window.app.makeRequest('/api/withdraw', {
                method: 'POST',
                body: JSON.stringify({ amount, description })
            });

            if (response.success) {
                window.app.showAlert(`Saque de ${window.app.formatCurrency(amount)} realizado com sucesso!`, 'success');
                
                // Limpar formulário
                e.target.reset();
                
                // Atualizar saldo
                this.loadAvailableBalance();
                if (window.dashboardManager) {
                    window.dashboardManager.loadBalance();
                }
                
                // Carregar saques recentes
                this.loadRecentWithdraws();
            } else {
                window.app.showAlert(response.message || 'Erro ao processar saque', 'error');
            }
        } catch (error) {
            console.error('Erro no saque:', error);
            window.app.showAlert('Erro de conexão. Tente novamente.', 'error');
        } finally {
            // Restaurar botão
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async loadRecentWithdraws() {
        try {
            const response = await window.app.makeRequest('/api/get_transactions?type=withdraw&limit=5');
            
            if (response.success) {
                this.displayRecentWithdraws(response.transactions);
            }
        } catch (error) {
            console.error('Erro ao carregar saques recentes:', error);
        }
    }

    displayRecentWithdraws(withdraws) {
        const container = document.getElementById('recent-withdraws-list');
        if (!container) return;

        if (withdraws.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-minus-circle"></i>
                    <p>Nenhum saque encontrado</p>
                </div>
            `;
            return;
        }

        container.innerHTML = withdraws.map(withdraw => `
            <div class="withdraw-item">
                <div class="withdraw-icon">
                    <i class="fas fa-minus-circle"></i>
                </div>
                <div class="withdraw-details">
                    <div class="withdraw-description">${withdraw.description}</div>
                    <div class="withdraw-date">${this.formatDate(withdraw.created_at)}</div>
                </div>
                <div class="withdraw-amount">
                    -${window.app.formatCurrency(Math.abs(withdraw.amount))}
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

// Estilos específicos para saque
const withdrawStyles = `
<style>
.withdraw-container {
    max-width: 800px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
}

.withdraw-card {
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    padding: 32px;
}

.balance-info {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    padding: 20px;
    border-radius: var(--border-radius);
    margin-bottom: 24px;
    text-align: center;
}

.balance-label {
    display: block;
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 8px;
}

.balance-amount {
    font-size: 24px;
    font-weight: 700;
}

.withdraw-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.withdraw-info {
    background: rgba(239, 68, 68, 0.05);
    border-radius: var(--border-radius);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.withdraw-info .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--danger-color);
    font-size: 14px;
}

.btn-danger {
    background: linear-gradient(135deg, var(--danger-color), #dc2626);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: var(--border-radius);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.btn-danger:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.recent-withdraws {
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    overflow: hidden;
}

.recent-withdraws h3 {
    padding: 20px;
    margin: 0;
    border-bottom: 1px solid var(--border-color);
}

.withdraw-item {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
}

.withdraw-item:last-child {
    border-bottom: none;
}

.withdraw-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger-color);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
}

.withdraw-details {
    flex: 1;
}

.withdraw-description {
    font-weight: 600;
    margin-bottom: 4px;
}

.withdraw-date {
    font-size: 14px;
    color: var(--text-secondary);
}

.withdraw-amount {
    font-weight: 700;
    color: var(--danger-color);
    font-size: 16px;
}

@media (max-width: 768px) {
    .withdraw-container {
        grid-template-columns: 1fr;
        gap: 24px;
    }
}
</style>
`;

// Adicionar estilos
document.head.insertAdjacentHTML('beforeend', withdrawStyles);

// Inicializar gerenciador
window.withdrawManager = new WithdrawManager();