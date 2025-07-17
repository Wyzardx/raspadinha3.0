// Gerenciador de Histórico
class HistoryManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.createHistoryContent();
        this.setupEventListeners();
    }

    createHistoryContent() {
        const historyContent = document.getElementById('history-content');
        if (!historyContent) {
            const mainContent = document.querySelector('.main-content');
            const historySection = document.createElement('div');
            historySection.id = 'history-content';
            historySection.className = 'content-section';
            historySection.innerHTML = this.getHistoryHTML();
            mainContent.appendChild(historySection);
        } else {
            historyContent.innerHTML = this.getHistoryHTML();
        }
    }

    getHistoryHTML() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-history"></i> Histórico de Transações</h2>
                <p>Visualize todas as suas movimentações</p>
            </div>

            <div class="history-container">
                <div class="history-filters">
                    <div class="filter-group">
                        <label>Filtrar por tipo:</label>
                        <select id="transaction-filter">
                            <option value="all">Todas as transações</option>
                            <option value="deposit">Depósitos</option>
                            <option value="withdraw">Saques</option>
                            <option value="transfer_sent">Transferências enviadas</option>
                            <option value="transfer_received">Transferências recebidas</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label>Período:</label>
                        <select id="period-filter">
                            <option value="all">Todo o período</option>
                            <option value="today">Hoje</option>
                            <option value="week">Esta semana</option>
                            <option value="month">Este mês</option>
                            <option value="custom">Período personalizado</option>
                        </select>
                    </div>

                    <div class="filter-group" id="custom-date-range" style="display: none;">
                        <label>De:</label>
                        <input type="date" id="start-date">
                        <label>Até:</label>
                        <input type="date" id="end-date">
                    </div>

                    <button id="apply-filters" class="btn-secondary">
                        <i class="fas fa-filter"></i>
                        Aplicar Filtros
                    </button>

                    <button id="export-history" class="btn-secondary">
                        <i class="fas fa-download"></i>
                        Exportar
                    </button>
                </div>

                <div class="history-summary">
                    <div class="summary-card">
                        <div class="summary-icon deposit">
                            <i class="fas fa-plus-circle"></i>
                        </div>
                        <div class="summary-info">
                            <span class="summary-label">Total Depositado</span>
                            <span class="summary-value" id="total-deposits">R$ 0,00</span>
                        </div>
                    </div>

                    <div class="summary-card">
                        <div class="summary-icon withdraw">
                            <i class="fas fa-minus-circle"></i>
                        </div>
                        <div class="summary-info">
                            <span class="summary-label">Total Sacado</span>
                            <span class="summary-value" id="total-withdraws">R$ 0,00</span>
                        </div>
                    </div>

                    <div class="summary-card">
                        <div class="summary-icon transfer">
                            <i class="fas fa-exchange-alt"></i>
                        </div>
                        <div class="summary-info">
                            <span class="summary-label">Total Transferido</span>
                            <span class="summary-value" id="total-transfers">R$ 0,00</span>
                        </div>
                    </div>
                </div>

                <div class="history-list">
                    <div class="list-header">
                        <h3>Transações</h3>
                        <div class="list-controls">
                            <span id="results-count">0 transações encontradas</span>
                        </div>
                    </div>

                    <div id="transactions-list">
                        <!-- Transações carregadas dinamicamente -->
                    </div>

                    <div class="pagination" id="pagination">
                        <!-- Paginação carregada dinamicamente -->
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        setTimeout(() => {
            // Filtros
            const transactionFilter = document.getElementById('transaction-filter');
            const periodFilter = document.getElementById('period-filter');
            const applyFiltersBtn = document.getElementById('apply-filters');
            const exportBtn = document.getElementById('export-history');

            if (transactionFilter) {
                transactionFilter.addEventListener('change', () => this.handleFilterChange());
            }

            if (periodFilter) {
                periodFilter.addEventListener('change', () => this.handlePeriodChange());
            }

            if (applyFiltersBtn) {
                applyFiltersBtn.addEventListener('click', () => this.applyFilters());
            }

            if (exportBtn) {
                exportBtn.addEventListener('click', () => this.exportHistory());
            }

            // Carregar histórico inicial
            this.loadHistory();
        }, 100);
    }

    handleFilterChange() {
        this.currentFilter = document.getElementById('transaction-filter').value;
    }

    handlePeriodChange() {
        const periodFilter = document.getElementById('period-filter');
        const customDateRange = document.getElementById('custom-date-range');
        
        if (periodFilter.value === 'custom') {
            customDateRange.style.display = 'flex';
        } else {
            customDateRange.style.display = 'none';
        }
    }

    applyFilters() {
        this.currentPage = 1;
        this.loadHistory();
    }

    async loadHistory() {
        try {
            // Construir parâmetros da query
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.itemsPerPage
            });

            if (this.currentFilter !== 'all') {
                params.append('type', this.currentFilter);
            }

            // Adicionar filtros de período
            const periodFilter = document.getElementById('period-filter');
            if (periodFilter && periodFilter.value !== 'all') {
                params.append('period', periodFilter.value);
                
                if (periodFilter.value === 'custom') {
                    const startDate = document.getElementById('start-date').value;
                    const endDate = document.getElementById('end-date').value;
                    
                    if (startDate) params.append('start_date', startDate);
                    if (endDate) params.append('end_date', endDate);
                }
            }

            const response = await window.app.makeRequest(`/api/get_transactions?${params.toString()}`);
            
            if (response.success) {
                this.displayTransactions(response.transactions);
                this.updateSummary(response.summary);
                this.updatePagination(response.pagination);
            }
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            window.app.showAlert('Erro ao carregar histórico', 'error');
        }
    }

    displayTransactions(transactions) {
        const container = document.getElementById('transactions-list');
        const resultsCount = document.getElementById('results-count');
        
        if (!container) return;

        // Atualizar contador
        if (resultsCount) {
            resultsCount.textContent = `${transactions.length} transações encontradas`;
        }

        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>Nenhuma transação encontrada</p>
                    <small>Tente ajustar os filtros ou fazer uma nova transação</small>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(transaction => `
            <div class="history-item">
                <div class="transaction-icon ${transaction.type}">
                    <i class="fas fa-${this.getTransactionIcon(transaction.type)}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">
                        <span class="transaction-type">${this.getTransactionTypeLabel(transaction.type)}</span>
                        ${transaction.target_name ? `<span class="transaction-target">${transaction.target_name}</span>` : ''}
                        <span class="transaction-date">${this.formatDate(transaction.created_at)}</span>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${this.getAmountPrefix(transaction.type)}${window.app.formatCurrency(Math.abs(transaction.amount))}
                </div>
            </div>
        `).join('');
    }

    updateSummary(summary) {
        if (!summary) return;

        const totalDeposits = document.getElementById('total-deposits');
        const totalWithdraws = document.getElementById('total-withdraws');
        const totalTransfers = document.getElementById('total-transfers');

        if (totalDeposits) {
            totalDeposits.textContent = window.app.formatCurrency(summary.deposits || 0);
        }
        if (totalWithdraws) {
            totalWithdraws.textContent = window.app.formatCurrency(summary.withdraws || 0);
        }
        if (totalTransfers) {
            totalTransfers.textContent = window.app.formatCurrency(summary.transfers || 0);
        }
    }

    updatePagination(pagination) {
        const paginationContainer = document.getElementById('pagination');
        if (!paginationContainer || !pagination) return;

        const { currentPage, totalPages, hasNext, hasPrev } = pagination;

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination-controls">';

        // Botão anterior
        if (hasPrev) {
            paginationHTML += `<button class="page-btn" data-page="${currentPage - 1}"><i class="fas fa-chevron-left"></i></button>`;
        }

        // Números das páginas
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            paginationHTML += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        // Botão próximo
        if (hasNext) {
            paginationHTML += `<button class="page-btn" data-page="${currentPage + 1}"><i class="fas fa-chevron-right"></i></button>`;
        }

        paginationHTML += '</div>';
        paginationContainer.innerHTML = paginationHTML;

        // Adicionar event listeners
        paginationContainer.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.currentPage) {
                    this.currentPage = page;
                    this.loadHistory();
                }
            });
        });
    }

    async exportHistory() {
        try {
            const params = new URLSearchParams({
                export: 'csv'
            });

            if (this.currentFilter !== 'all') {
                params.append('type', this.currentFilter);
            }

            const response = await window.app.makeRequest(`/api/export_transactions?${params.toString()}`);
            
            if (response.success) {
                // Criar e baixar arquivo CSV
                const blob = new Blob([response.csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `historico_transacoes_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                
                window.app.showAlert('Histórico exportado com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro ao exportar histórico:', error);
            window.app.showAlert('Erro ao exportar histórico', 'error');
        }
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

    getTransactionTypeLabel(type) {
        const labels = {
            'deposit': 'Depósito',
            'withdraw': 'Saque',
            'transfer_sent': 'Transferência Enviada',
            'transfer_received': 'Transferência Recebida'
        };
        return labels[type] || 'Transação';
    }

    getAmountPrefix(type) {
        return ['deposit', 'transfer_received'].includes(type) ? '+' : '-';
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

// Estilos específicos para histórico
const historyStyles = `
<style>
.history-container {
    max-width: 1200px;
    margin: 0 auto;
}

.history-filters {
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    padding: 24px;
    margin-bottom: 24px;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: end;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 150px;
}

.filter-group label {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary);
}

.filter-group select,
.filter-group input {
    padding: 8px 12px;
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: 14px;
}

#custom-date-range {
    flex-direction: row;
    align-items: center;
    gap: 12px;
}

.history-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
}

.summary-card {
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
}

.summary-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}

.summary-icon.deposit {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
}

.summary-icon.withdraw {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger-color);
}

.summary-icon.transfer {
    background: rgba(37, 99, 235, 0.1);
    color: var(--primary-color);
}

.summary-info {
    display: flex;
    flex-direction: column;
}

.summary-label {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 4px;
}

.summary-value {
    font-size: 20px;
    font-weight: 700;
    color: var(--text-primary);
}

.history-list {
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    overflow: hidden;
}

.list-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.list-header h3 {
    margin: 0;
}

.list-controls {
    font-size: 14px;
    color: var(--text-secondary);
}

.history-item {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border-color);
    transition: var(--transition);
}

.history-item:hover {
    background: rgba(37, 99, 235, 0.02);
}

.history-item:last-child {
    border-bottom: none;
}

.transaction-details {
    flex: 1;
    margin-left: 16px;
}

.transaction-description {
    font-weight: 600;
    margin-bottom: 6px;
}

.transaction-meta {
    display: flex;
    gap: 12px;
    font-size: 14px;
    color: var(--text-secondary);
}

.transaction-type {
    background: rgba(37, 99, 235, 0.1);
    color: var(--primary-color);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.pagination {
    padding: 20px;
    border-top: 1px solid var(--border-color);
}

.pagination-controls {
    display: flex;
    justify-content: center;
    gap: 8px;
}

.page-btn {
    background: var(--card-background);
    border: 2px solid var(--border-color);
    color: var(--text-primary);
    padding: 8px 12px;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: var(--transition);
}

.page-btn:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
}

.page-btn.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
}

@media (max-width: 768px) {
    .history-filters {
        flex-direction: column;
        align-items: stretch;
    }
    
    .filter-group {
        min-width: auto;
    }
    
    #custom-date-range {
        flex-direction: column;
        align-items: stretch;
    }
    
    .history-summary {
        grid-template-columns: 1fr;
    }
    
    .transaction-meta {
        flex-direction: column;
        gap: 4px;
    }
}
</style>
`;

// Adicionar estilos
document.head.insertAdjacentHTML('beforeend', historyStyles);

// Inicializar gerenciador
window.historyManager = new HistoryManager();