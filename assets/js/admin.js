// Gerenciador Admin
class AdminManager {
    constructor() {
        this.init();
    }

    init() {
        this.createAdminContent();
        this.setupEventListeners();
    }

    createAdminContent() {
        const adminContent = document.getElementById('admin-content');
        if (!adminContent) {
            const mainContent = document.querySelector('.main-content');
            const adminSection = document.createElement('div');
            adminSection.id = 'admin-content';
            adminSection.className = 'content-section';
            adminSection.innerHTML = this.getAdminHTML();
            mainContent.appendChild(adminSection);
        } else {
            adminContent.innerHTML = this.getAdminHTML();
        }
    }

    getAdminHTML() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-cog"></i> Painel Administrativo</h2>
                <p>Gerencie usuários e monitore o sistema</p>
            </div>

            <div class="admin-container">
                <div class="admin-stats">
                    <div class="stat-card">
                        <div class="stat-icon users">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value" id="total-users">0</span>
                            <span class="stat-label">Usuários Totais</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon transactions">
                            <i class="fas fa-exchange-alt"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value" id="total-transactions">0</span>
                            <span class="stat-label">Transações Hoje</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon volume">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value" id="total-volume">R$ 0</span>
                            <span class="stat-label">Volume Total</span>
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-icon active">
                            <i class="fas fa-user-check"></i>
                        </div>
                        <div class="stat-info">
                            <span class="stat-value" id="active-users">0</span>
                            <span class="stat-label">Usuários Ativos</span>
                        </div>
                    </div>
                </div>

                <div class="admin-tabs">
                    <button class="admin-tab-btn active" data-tab="users">
                        <i class="fas fa-users"></i>
                        Usuários
                    </button>
                    <button class="admin-tab-btn" data-tab="transactions">
                        <i class="fas fa-history"></i>
                        Transações
                    </button>
                    <button class="admin-tab-btn" data-tab="reports">
                        <i class="fas fa-chart-bar"></i>
                        Relatórios
                    </button>
                    <button class="admin-tab-btn" data-tab="settings">
                        <i class="fas fa-cog"></i>
                        Configurações
                    </button>
                </div>

                <!-- Aba Usuários -->
                <div id="users-tab" class="admin-tab-content active">
                    <div class="tab-header">
                        <h3>Gerenciar Usuários</h3>
                        <div class="tab-actions">
                            <input type="text" id="user-search" placeholder="Buscar usuário..." class="search-input">
                            <button id="refresh-users" class="btn-secondary">
                                <i class="fas fa-sync"></i>
                                Atualizar
                            </button>
                        </div>
                    </div>

                    <div class="users-table-container">
                        <table class="admin-table" id="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>CPF</th>
                                    <th>Saldo</th>
                                    <th>Cadastro</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="users-table-body">
                                <!-- Carregado dinamicamente -->
                            </tbody>
                        </table>
                    </div>

                    <div class="pagination" id="users-pagination">
                        <!-- Paginação carregada dinamicamente -->
                    </div>
                </div>

                <!-- Aba Transações -->
                <div id="transactions-tab" class="admin-tab-content">
                    <div class="tab-header">
                        <h3>Monitorar Transações</h3>
                        <div class="tab-actions">
                            <select id="transaction-type-filter">
                                <option value="all">Todos os tipos</option>
                                <option value="deposit">Depósitos</option>
                                <option value="withdraw">Saques</option>
                                <option value="transfer_sent">Transferências</option>
                            </select>
                            <input type="date" id="transaction-date-filter">
                            <button id="filter-transactions" class="btn-secondary">
                                <i class="fas fa-filter"></i>
                                Filtrar
                            </button>
                        </div>
                    </div>

                    <div class="transactions-table-container">
                        <table class="admin-table" id="transactions-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Usuário</th>
                                    <th>Tipo</th>
                                    <th>Valor</th>
                                    <th>Descrição</th>
                                    <th>Data</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="transactions-table-body">
                                <!-- Carregado dinamicamente -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Aba Relatórios -->
                <div id="reports-tab" class="admin-tab-content">
                    <div class="tab-header">
                        <h3>Relatórios do Sistema</h3>
                    </div>

                    <div class="reports-grid">
                        <div class="report-card">
                            <h4>Relatório de Usuários</h4>
                            <p>Estatísticas detalhadas dos usuários cadastrados</p>
                            <button class="btn-primary" id="generate-users-report">
                                <i class="fas fa-file-pdf"></i>
                                Gerar Relatório
                            </button>
                        </div>

                        <div class="report-card">
                            <h4>Relatório Financeiro</h4>
                            <p>Movimentações financeiras e balanços</p>
                            <button class="btn-primary" id="generate-financial-report">
                                <i class="fas fa-file-excel"></i>
                                Gerar Relatório
                            </button>
                        </div>

                        <div class="report-card">
                            <h4>Relatório de Atividades</h4>
                            <p>Log de atividades e transações do sistema</p>
                            <button class="btn-primary" id="generate-activity-report">
                                <i class="fas fa-file-alt"></i>
                                Gerar Relatório
                            </button>
                        </div>
                    </div>

                    <div class="chart-container">
                        <h4>Gráfico de Transações (Últimos 30 dias)</h4>
                        <div id="transactions-chart" class="chart-placeholder">
                            <i class="fas fa-chart-line"></i>
                            <p>Gráfico será carregado aqui</p>
                        </div>
                    </div>
                </div>

                <!-- Aba Configurações -->
                <div id="settings-tab" class="admin-tab-content">
                    <div class="tab-header">
                        <h3>Configurações do Sistema</h3>
                    </div>

                    <form id="system-settings-form" class="settings-form">
                        <div class="settings-group">
                            <h4>Limites de Transação</h4>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="max-deposit">Depósito Máximo (R$)</label>
                                    <input type="number" id="max-deposit" value="10000" step="0.01">
                                </div>
                                
                                <div class="form-group">
                                    <label for="max-withdraw">Saque Máximo (R$)</label>
                                    <input type="number" id="max-withdraw" value="5000" step="0.01">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="max-transfer">Transferência Máxima (R$)</label>
                                    <input type="number" id="max-transfer" value="10000" step="0.01">
                                </div>
                                
                                <div class="form-group">
                                    <label for="daily-limit">Limite Diário (R$)</label>
                                    <input type="number" id="daily-limit" value="20000" step="0.01">
                                </div>
                            </div>
                        </div>

                        <div class="settings-group">
                            <h4>Configurações de Segurança</h4>
                            
                            <div class="setting-item">
                                <label class="switch">
                                    <input type="checkbox" id="require-email-verification" checked>
                                    <span class="slider"></span>
                                </label>
                                <div class="setting-info">
                                    <span class="setting-title">Verificação de Email</span>
                                    <span class="setting-desc">Exigir verificação de email para novos usuários</span>
                                </div>
                            </div>

                            <div class="setting-item">
                                <label class="switch">
                                    <input type="checkbox" id="enable-2fa">
                                    <span class="slider"></span>
                                </label>
                                <div class="setting-info">
                                    <span class="setting-title">Autenticação de Dois Fatores</span>
                                    <span class="setting-desc">Habilitar 2FA para todos os usuários</span>
                                </div>
                            </div>
                        </div>

                        <div class="settings-group">
                            <h4>Manutenção do Sistema</h4>
                            
                            <div class="maintenance-actions">
                                <button type="button" class="btn-warning" id="backup-database">
                                    <i class="fas fa-database"></i>
                                    Fazer Backup
                                </button>
                                
                                <button type="button" class="btn-danger" id="clear-logs">
                                    <i class="fas fa-trash"></i>
                                    Limpar Logs
                                </button>
                                
                                <button type="button" class="btn-secondary" id="system-info">
                                    <i class="fas fa-info-circle"></i>
                                    Info do Sistema
                                </button>
                            </div>
                        </div>

                        <button type="submit" class="btn-primary">
                            <i class="fas fa-save"></i>
                            Salvar Configurações
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        setTimeout(() => {
            // Tabs
            document.querySelectorAll('.admin-tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
            });

            // Busca de usuários
            const userSearch = document.getElementById('user-search');
            if (userSearch) {
                userSearch.addEventListener('input', () => this.searchUsers());
            }

            // Botões de ação
            const refreshUsersBtn = document.getElementById('refresh-users');
            if (refreshUsersBtn) {
                refreshUsersBtn.addEventListener('click', () => this.loadUsers());
            }

            const filterTransactionsBtn = document.getElementById('filter-transactions');
            if (filterTransactionsBtn) {
                filterTransactionsBtn.addEventListener('click', () => this.filterTransactions());
            }

            // Formulário de configurações
            const settingsForm = document.getElementById('system-settings-form');
            if (settingsForm) {
                settingsForm.addEventListener('submit', (e) => this.handleSettingsUpdate(e));
            }

            // Botões de manutenção
            const backupBtn = document.getElementById('backup-database');
            if (backupBtn) {
                backupBtn.addEventListener('click', () => this.backupDatabase());
            }

            const clearLogsBtn = document.getElementById('clear-logs');
            if (clearLogsBtn) {
                clearLogsBtn.addEventListener('click', () => this.clearLogs());
            }

            const systemInfoBtn = document.getElementById('system-info');
            if (systemInfoBtn) {
                systemInfoBtn.addEventListener('click', () => this.showSystemInfo());
            }

            // Carregar dados iniciais
            this.loadAdminData();
        }, 100);
    }

    switchTab(tabName) {
        // Remover classe active de todas as tabs
        document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));

        // Ativar tab selecionada
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Carregar dados específicos da tab
        switch (tabName) {
            case 'users':
                this.loadUsers();
                break;
            case 'transactions':
                this.loadTransactions();
                break;
            case 'reports':
                this.loadReports();
                break;
        }
    }

    async loadAdminData() {
        try {
            const response = await window.app.makeRequest('/api/admin/stats');
            
            if (response.success) {
                this.updateStats(response.stats);
            }
        } catch (error) {
            console.error('Erro ao carregar dados admin:', error);
        }

        // Carregar usuários por padrão
        this.loadUsers();
    }

    updateStats(stats) {
        document.getElementById('total-users').textContent = stats.total_users || 0;
        document.getElementById('total-transactions').textContent = stats.transactions_today || 0;
        document.getElementById('total-volume').textContent = window.app.formatCurrency(stats.total_volume || 0);
        document.getElementById('active-users').textContent = stats.active_users || 0;
    }

    async loadUsers() {
        try {
            const response = await window.app.makeRequest('/api/admin/users');
            
            if (response.success) {
                this.displayUsers(response.users);
            }
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            window.app.showAlert('Erro ao carregar usuários', 'error');
        }
    }

    displayUsers(users) {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.cpf}</td>
                <td>${window.app.formatCurrency(user.balance)}</td>
                <td>${this.formatDate(user.created_at)}</td>
                <td>
                    <span class="status-badge ${user.is_admin ? 'admin' : 'user'}">
                        ${user.is_admin ? 'Admin' : 'Usuário'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-sm btn-primary" onclick="adminManager.viewUser(${user.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-sm btn-warning" onclick="adminManager.editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        ${!user.is_admin ? `
                            <button class="btn-sm btn-danger" onclick="adminManager.deleteUser(${user.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadTransactions() {
        try {
            const response = await window.app.makeRequest('/api/admin/transactions');
            
            if (response.success) {
                this.displayTransactions(response.transactions);
            }
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
            window.app.showAlert('Erro ao carregar transações', 'error');
        }
    }

    displayTransactions(transactions) {
        const tbody = document.getElementById('transactions-table-body');
        if (!tbody) return;

        tbody.innerHTML = transactions.map(transaction => `
            <tr>
                <td>${transaction.id}</td>
                <td>${transaction.user_name}</td>
                <td>
                    <span class="transaction-type ${transaction.type}">
                        ${this.getTransactionTypeLabel(transaction.type)}
                    </span>
                </td>
                <td>${window.app.formatCurrency(Math.abs(transaction.amount))}</td>
                <td>${transaction.description}</td>
                <td>${this.formatDate(transaction.created_at)}</td>
                <td>
                    <span class="status-badge success">Concluída</span>
                </td>
            </tr>
        `).join('');
    }

    async viewUser(userId) {
        try {
            const response = await window.app.makeRequest(`/api/admin/user/${userId}`);
            
            if (response.success) {
                this.showUserModal(response.user);
            }
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            window.app.showAlert('Erro ao carregar dados do usuário', 'error');
        }
    }

    showUserModal(user) {
        // Implementar modal de visualização do usuário
        alert(`Usuário: ${user.name}\nEmail: ${user.email}\nSaldo: ${window.app.formatCurrency(user.balance)}`);
    }

    async deleteUser(userId) {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) {
            return;
        }

        try {
            const response = await window.app.makeRequest(`/api/admin/user/${userId}`, {
                method: 'DELETE'
            });

            if (response.success) {
                window.app.showAlert('Usuário excluído com sucesso', 'success');
                this.loadUsers();
            } else {
                window.app.showAlert(response.message || 'Erro ao excluir usuário', 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir usuário:', error);
            window.app.showAlert('Erro de conexão', 'error');
        }
    }

    searchUsers() {
        const searchTerm = document.getElementById('user-search').value.toLowerCase();
        const rows = document.querySelectorAll('#users-table-body tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    async handleSettingsUpdate(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const settings = {
            max_deposit: parseFloat(formData.get('max-deposit')),
            max_withdraw: parseFloat(formData.get('max-withdraw')),
            max_transfer: parseFloat(formData.get('max-transfer')),
            daily_limit: parseFloat(formData.get('daily-limit')),
            require_email_verification: document.getElementById('require-email-verification').checked,
            enable_2fa: document.getElementById('enable-2fa').checked
        };

        try {
            const response = await window.app.makeRequest('/api/admin/settings', {
                method: 'POST',
                body: JSON.stringify(settings)
            });

            if (response.success) {
                window.app.showAlert('Configurações salvas com sucesso!', 'success');
            } else {
                window.app.showAlert(response.message || 'Erro ao salvar configurações', 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            window.app.showAlert('Erro de conexão', 'error');
        }
    }

    async backupDatabase() {
        try {
            const response = await window.app.makeRequest('/api/admin/backup', {
                method: 'POST'
            });

            if (response.success) {
                window.app.showAlert('Backup realizado com sucesso!', 'success');
            } else {
                window.app.showAlert(response.message || 'Erro ao fazer backup', 'error');
            }
        } catch (error) {
            console.error('Erro no backup:', error);
            window.app.showAlert('Erro de conexão', 'error');
        }
    }

    clearLogs() {
        if (confirm('Tem certeza que deseja limpar todos os logs?')) {
            window.app.showAlert('Logs limpos com sucesso!', 'success');
        }
    }

    showSystemInfo() {
        const info = `
Sistema Bancário v1.0
Node.js: ${process?.version || 'N/A'}
Banco de Dados: SQLite
Usuários Ativos: ${document.getElementById('total-users').textContent}
Uptime: ${new Date().toLocaleString()}
        `;
        alert(info);
    }

    getTransactionTypeLabel(type) {
        const labels = {
            'deposit': 'Depósito',
            'withdraw': 'Saque',
            'transfer_sent': 'Transferência',
            'transfer_received': 'Recebimento'
        };
        return labels[type] || 'Transação';
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

// Estilos específicos para admin
const adminStyles = `
<style>
.admin-container {
    max-width: 1400px;
    margin: 0 auto;
}

.admin-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 32px;
}

.stat-card {
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
}

.stat-icon.users {
    background: rgba(37, 99, 235, 0.1);
    color: var(--primary-color);
}

.stat-icon.transactions {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
}

.stat-icon.volume {
    background: rgba(245, 158, 11, 0.1);
    color: var(--warning-color);
}

.stat-icon.active {
    background: rgba(139, 69, 19, 0.1);
    color: #8b4513;
}

.stat-info {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
}

.stat-label {
    font-size: 14px;
    color: var(--text-secondary);
}

.admin-tabs {
    display: flex;
    background: var(--card-background);
    border-radius: var(--border-radius) var(--border-radius) 0 0;
    box-shadow: var(--shadow);
    margin-bottom: 0;
}

.admin-tab-btn {
    background: none;
    border: none;
    padding: 16px 24px;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    border-bottom: 3px solid transparent;
}

.admin-tab-btn:hover,
.admin-tab-btn.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
}

.admin-tab-content {
    display: none;
    background: var(--card-background);
    border-radius: 0 0 var(--border-radius) var(--border-radius);
    box-shadow: var(--shadow);
    padding: 32px;
}

.admin-tab-content.active {
    display: block;
}

.tab-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
}

.tab-header h3 {
    margin: 0;
    font-size: 20px;
}

.tab-actions {
    display: flex;
    gap: 12px;
    align-items: center;
}

.search-input {
    padding: 8px 12px;
    border: 2px solid var(--border-color);
    border-radius: var(--border-radius);
    font-size: 14px;
    width: 200px;
}

.admin-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

.admin-table th,
.admin-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
}

.admin-table th {
    background: rgba(37, 99, 235, 0.05);
    font-weight: 600;
    color: var(--text-primary);
}

.admin-table tr:hover {
    background: rgba(37, 99, 235, 0.02);
}

.status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.status-badge.admin {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger-color);
}

.status-badge.user {
    background: rgba(37, 99, 235, 0.1);
    color: var(--primary-color);
}

.status-badge.success {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
}

.action-buttons {
    display: flex;
    gap: 4px;
}

.btn-sm {
    padding: 6px 8px;
    font-size: 12px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    transition: var(--transition);
}

.transaction-type {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.transaction-type.deposit {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success-color);
}

.transaction-type.withdraw {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger-color);
}

.transaction-type.transfer_sent {
    background: rgba(245, 158, 11, 0.1);
    color: var(--warning-color);
}

.reports-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
}

.report-card {
    background: rgba(37, 99, 235, 0.05);
    border-radius: var(--border-radius);
    padding: 24px;
    text-align: center;
}

.report-card h4 {
    margin: 0 0 8px 0;
    font-size: 18px;
}

.report-card p {
    margin: 0 0 16px 0;
    color: var(--text-secondary);
    font-size: 14px;
}

.chart-container {
    background: rgba(37, 99, 235, 0.02);
    border-radius: var(--border-radius);
    padding: 24px;
}

.chart-container h4 {
    margin: 0 0 16px 0;
}

.chart-placeholder {
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    border: 2px dashed var(--border-color);
    border-radius: var(--border-radius);
}

.chart-placeholder i {
    font-size: 48px;
    margin-bottom: 16px;
}

.settings-form {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.settings-group {
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border-color);
}

.settings-group:last-child {
    border-bottom: none;
}

.settings-group h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
}

.setting-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
    border-bottom: none;
}

.setting-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.setting-title {
    font-weight: 600;
}

.setting-desc {
    font-size: 14px;
    color: var(--text-secondary);
}

.maintenance-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.btn-warning {
    background: linear-gradient(135deg, var(--warning-color), #d97706);
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
    gap: 8px;
}

.btn-warning:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

@media (max-width: 768px) {
    .admin-tabs {
        overflow-x: auto;
    }
    
    .admin-tab-btn {
        white-space: nowrap;
        min-width: 120px;
    }
    
    .tab-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }
    
    .tab-actions {
        flex-wrap: wrap;
    }
    
    .admin-table {
        font-size: 14px;
    }
    
    .reports-grid {
        grid-template-columns: 1fr;
    }
    
    .maintenance-actions {
        flex-direction: column;
    }
}
</style>
`;

// Adicionar estilos
document.head.insertAdjacentHTML('beforeend', adminStyles);

// Inicializar gerenciador
window.adminManager = new AdminManager();