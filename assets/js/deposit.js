// Gerenciador de Depósitos
class DepositManager {
    constructor() {
        this.init();
    }

    init() {
        this.createDepositContent();
        this.setupEventListeners();
    }

    createDepositContent() {
        const depositContent = document.getElementById('deposit-content');
        if (!depositContent) {
            // Criar seção de depósito se não existir
            const mainContent = document.querySelector('.main-content');
            const depositSection = document.createElement('div');
            depositSection.id = 'deposit-content';
            depositSection.className = 'content-section';
            depositSection.innerHTML = this.getDepositHTML();
            mainContent.appendChild(depositSection);
        } else {
            depositContent.innerHTML = this.getDepositHTML();
        }
    }

    getDepositHTML() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-plus-circle"></i> Depositar</h2>
                <p>Adicione dinheiro à sua conta</p>
            </div>

            <div class="deposit-container">
                <div class="deposit-card">
                    <form id="deposit-form" class="deposit-form">
                        <div class="form-group">
                            <label for="deposit-amount">Valor do Depósito</label>
                            <div class="input-group">
                                <span class="currency-symbol">R$</span>
                                <input type="number" id="deposit-amount" name="amount" 
                                       step="0.01" min="0.01" max="10000" required
                                       placeholder="0,00">
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="deposit-description">Descrição (opcional)</label>
                            <div class="input-group">
                                <i class="fas fa-comment"></i>
                                <input type="text" id="deposit-description" name="description" 
                                       placeholder="Ex: Salário, Freelance, etc.">
                            </div>
                        </div>

                        <div class="deposit-info">
                            <div class="info-item">
                                <i class="fas fa-clock"></i>
                                <span>Processamento instantâneo</span>
                            </div>
                            <div class="info-item">
                                <i class="fas fa-shield-alt"></i>
                                <span>Transação 100% segura</span>
                            </div>
                        </div>

                        <button type="submit" class="btn-primary">
                            <i class="fas fa-plus-circle"></i>
                            Depositar
                        </button>
                    </form>
                </div>

                <div class="recent-deposits">
                    <h3>Depósitos Recentes</h3>
                    <div id="recent-deposits-list">
                        <!-- Carregado dinamicamente -->
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Aguardar um pouco para garantir que o DOM foi atualizado
        setTimeout(() => {
            const depositForm = document.getElementById('deposit-form');
            if (depositForm) {
                depositForm.addEventListener('submit', (e) => this.handleDeposit(e));
            }

            // Formatação do valor em tempo real
            const amountInput = document.getElementById('deposit-amount');
            if (amountInput) {
                amountInput.addEventListener('input', (e) => this.formatAmount(e));
            }
        }, 100);
    }

    formatAmount(e) {
        let value = e.target.value;
        // Limitar a 2 casas decimais
        if (value.includes('.')) {
            const parts = value.split('.');
            if (parts[1] && parts[1].length > 2) {
                e.target.value = parts[0] + '.' + parts[1].substring(0, 2);
            }
        }
    }

    async handleDeposit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const amount = parseFloat(formData.get('amount'));
        const description = formData.get('description') || 'Depósito realizado';

        // Validações
        if (!amount || amount <= 0) {
            window.app.showAlert('Por favor, insira um valor válido', 'error');
            return;
        }

        if (amount > 10000) {
            window.app.showAlert('Valor máximo por depósito: R$ 10.000,00', 'error');
            return;
        }

        // Mostrar loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading"></div> Processando...';
        submitBtn.disabled = true;

        try {
            const response = await window.app.makeRequest('/api/deposit', {
                method: 'POST',
                body: JSON.stringify({ amount, description })
            });

            if (response.success) {
                window.app.showAlert(`Depósito de ${window.app.formatCurrency(amount)} realizado com sucesso!`, 'success');
                
                // Limpar formulário
                e.target.reset();
                
                // Atualizar saldo no dashboard
                if (window.dashboardManager) {
                    window.dashboardManager.loadBalance();
                }
                
                // Carregar depósitos recentes
                this.loadRecentDeposits();
            } else {
                window.app.showAlert(response.message || 'Erro ao processar depósito', 'error');
            }
        } catch (error) {
            console.error('Erro no depósito:', error);
            window.app.showAlert('Erro de conexão. Tente novamente.', 'error');
        } finally {
            // Restaurar botão
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async loadRecentDeposits() {
        try {
            const response = await window.app.makeRequest('/api/get_transactions?type=deposit&limit=5');
            
            if (response.success) {
                this.displayRecentDeposits(response.transactions);
            }
        } catch (error) {
            console.error('Erro ao carregar depósitos recentes:', error);
        }
    }

    displayRecentDeposits(deposits) {
        const container = document.getElementById('recent-deposits-list');
        if (!container) return;

        if (deposits.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-plus-circle"></i>
                    <p>Nenhum depósito encontrado</p>
                </div>
            `;
            return;
        }

        container.innerHTML = deposits.map(deposit => `
            <div class="deposit-item">
                <div class="deposit-icon">
                    <i class="fas fa-plus-circle"></i>
                </div>
                <div class="deposit-details">
                    <div class="deposit-description">${deposit.description}</div>
                    <div class="deposit-date">${this.formatDate(deposit.created_at)}</div>
                </div>
                <div class="deposit-amount">
                    +${window.app.formatCurrency(deposit.amount)}
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

// Estilos específicos para depósito
const depositStyles = `
<style>
.deposit-container {
    max-width: 800px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
}

.deposit-card {
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    padding: 32px;
}

.deposit-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.currency-symbol {
    position: absolute;
    left: 12px;
    color: var(--text-secondary);
    font-weight: 600;
    z-index: 1;
}

.currency-symbol + input {
    padding-left: 32px;
}

.deposit-info {
    background: rgba(37, 99, 235, 0.05);
    border-radius: var(--border-radius);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--primary-color);
    font-size: 14px;
}

.recent-deposits {
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    overflow: hidden;
}

.recent-deposits h3 {
    padding: 20px;
    margin: 0;
    border-bottom: 1px solid var(--border-color);
}

.deposit-item {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
}

.deposit-item:last-child {
    border-bottom: none;
}

.deposit-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
}

.deposit-details {
    flex: 1;
}

.deposit-description {
    font-weight: 600;
    margin-bottom: 4px;
}

.deposit-date {
    font-size: 14px;
    color: var(--text-secondary);
}

.deposit-amount {
    font-weight: 700;
    color: var(--success-color);
    font-size: 16px;
}

@media (max-width: 768px) {
    .deposit-container {
        grid-template-columns: 1fr;
        gap: 24px;
    }
}
</style>
`;

// Adicionar estilos
document.head.insertAdjacentHTML('beforeend', depositStyles);

// Inicializar gerenciador
window.depositManager = new DepositManager();