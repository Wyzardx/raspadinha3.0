// Gerenciador do Dashboard
class DashboardManager {
    constructor() {
        this.balance = 0;
        this.recentTransactions = [];
    }

    async loadDashboard() {
        await this.loadBalance();
        await this.loadRecentTransactions();
        this.updateUI();
    }

    async loadBalance() {
        try {
            const data = await window.app.makeRequest('api/get_balance.php');
            this.balance = data.balance;
        } catch (error) {
            console.error('Erro ao carregar saldo:', error);
            window.app.showAlert('Erro ao carregar saldo', 'error');
        }
    }

    async loadRecentTransactions() {
        try {
            const data = await window.app.makeRequest('api/get_transactions.php?limit=5');
            this.recentTransactions = data.transactions;
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
            window.app.showAlert('Erro ao carregar transações recentes', 'error');
        }
    }

    updateUI() {
        // Atualizar saldo
        const balanceElement = document.getElementById('current-balance');
        if (balanceElement) {
            balanceElement.textContent = window.app.formatCurrency(this.balance);
        }

        // Atualizar transações recentes
        this.updateRecentTransactions();
    }

    updateRecentTransactions() {
        const container = document.getElementById('recent-transactions-list');
        if (!container) return;

        if (this.recentTransactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>Nenhuma transação encontrada</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-icon ${transaction.type}">
                    <i class="fas fa-${this.getTransactionIcon(transaction.type)}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-date">${this.formatDate(transaction.created_at)}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'deposit' ? '+' : '-'}${window.app.formatCurrency(Math.abs(transaction.amount))}
                </div>
            </div>
        `).join('');
    }

    getTransactionIcon(type) {
        const icons = {
            'deposit': 'plus-circle',
            'withdraw': 'minus-circle',
            'transfer_sent': 'arrow-right',
            'transfer_received': 'arrow-left'
        };
        return icons[type] || 'exchange-alt';
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

// Adicionar estilos para transações
const transactionStyles = `
<style>
.transaction-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--border-color);
    transition: var(--transition);
}

.transaction-item:hover {
    background: rgba(37, 99, 235, 0.05);
}

.transaction-item:last-child {
    border-bottom: none;
}

.transaction-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
}

.transaction-icon.deposit {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
}

.transaction-icon.withdraw {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger-color);
}

.transaction-icon.transfer_sent {
    background: rgba(245, 158, 11, 0.1);
    color: var(--warning-color);
}

.transaction-icon.transfer_received {
    background: rgba(37, 99, 235, 0.1);
    color: var(--primary-color);
}

.transaction-details {
    flex: 1;
}

.transaction-description {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.transaction-date {
    font-size: 14px;
    color: var(--text-secondary);
}

.transaction-amount {
    font-weight: 700;
    font-size: 16px;
}

.transaction-amount.deposit {
    color: var(--success-color);
}

.transaction-amount.withdraw,
.transaction-amount.transfer_sent {
    color: var(--danger-color);
}

.transaction-amount.transfer_received {
    color: var(--success-color);
}

.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-secondary);
}

.empty-state i {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
}

.balance-card {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    padding: 24px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 300px;
}

.balance-info {
    display: flex;
    flex-direction: column;
}

.balance-label {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 4px;
}

.balance-amount {
    font-size: 28px;
    font-weight: 700;
}

.balance-card i {
    font-size: 32px;
    opacity: 0.8;
}

.quick-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 32px;
}

.action-btn {
    background: var(--card-background);
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: var(--transition);
    text-decoration: none;
    color: var(--text-primary);
}

.action-btn:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.action-btn i {
    font-size: 24px;
    color: var(--primary-color);
}

.action-btn span {
    font-weight: 600;
}

.recent-transactions {
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    overflow: hidden;
}

.recent-transactions h3 {
    padding: 20px;
    margin: 0;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-primary);
}
</style>
`;

// Adicionar estilos ao head
document.head.insertAdjacentHTML('beforeend', transactionStyles);

// Inicializar gerenciador do dashboard
window.dashboardManager = new DashboardManager();