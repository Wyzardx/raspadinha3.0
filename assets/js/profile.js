// Gerenciador de Perfil
class ProfileManager {
    constructor() {
        this.init();
    }

    init() {
        this.createProfileContent();
        this.setupEventListeners();
    }

    createProfileContent() {
        const profileContent = document.getElementById('profile-content');
        if (!profileContent) {
            const mainContent = document.querySelector('.main-content');
            const profileSection = document.createElement('div');
            profileSection.id = 'profile-content';
            profileSection.className = 'content-section';
            profileSection.innerHTML = this.getProfileHTML();
            mainContent.appendChild(profileSection);
        } else {
            profileContent.innerHTML = this.getProfileHTML();
        }
    }

    getProfileHTML() {
        return `
            <div class="page-header">
                <h2><i class="fas fa-user"></i> Meu Perfil</h2>
                <p>Gerencie suas informações pessoais e configurações</p>
            </div>

            <div class="profile-container">
                <div class="profile-sidebar">
                    <div class="profile-avatar">
                        <div class="avatar-circle">
                            <i class="fas fa-user"></i>
                        </div>
                        <button class="change-avatar-btn">
                            <i class="fas fa-camera"></i>
                            Alterar Foto
                        </button>
                    </div>

                    <div class="profile-info">
                        <h3 id="profile-name">Carregando...</h3>
                        <p id="profile-email">Carregando...</p>
                        <div class="profile-stats">
                            <div class="stat-item">
                                <span class="stat-label">Membro desde</span>
                                <span class="stat-value" id="member-since">-</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Total de transações</span>
                                <span class="stat-value" id="total-transactions">-</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="profile-content">
                    <div class="profile-tabs">
                        <button class="tab-btn active" data-tab="personal">
                            <i class="fas fa-user"></i>
                            Dados Pessoais
                        </button>
                        <button class="tab-btn" data-tab="security">
                            <i class="fas fa-shield-alt"></i>
                            Segurança
                        </button>
                        <button class="tab-btn" data-tab="preferences">
                            <i class="fas fa-cog"></i>
                            Preferências
                        </button>
                    </div>

                    <!-- Aba Dados Pessoais -->
                    <div id="personal-tab" class="tab-content active">
                        <div class="section-header">
                            <h3>Informações Pessoais</h3>
                            <p>Atualize seus dados pessoais</p>
                        </div>

                        <form id="personal-form" class="profile-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="edit-name">Nome Completo</label>
                                    <div class="input-group">
                                        <i class="fas fa-user"></i>
                                        <input type="text" id="edit-name" name="name" required>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="edit-cpf">CPF</label>
                                    <div class="input-group">
                                        <i class="fas fa-id-card"></i>
                                        <input type="text" id="edit-cpf" name="cpf" readonly>
                                    </div>
                                    <small class="form-help">CPF não pode ser alterado</small>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="edit-email">Email</label>
                                <div class="input-group">
                                    <i class="fas fa-envelope"></i>
                                    <input type="email" id="edit-email" name="email" required>
                                </div>
                            </div>

                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save"></i>
                                Salvar Alterações
                            </button>
                        </form>
                    </div>

                    <!-- Aba Segurança -->
                    <div id="security-tab" class="tab-content">
                        <div class="section-header">
                            <h3>Segurança da Conta</h3>
                            <p>Altere sua senha e configure a segurança</p>
                        </div>

                        <form id="password-form" class="profile-form">
                            <div class="form-group">
                                <label for="current-password">Senha Atual</label>
                                <div class="input-group">
                                    <i class="fas fa-lock"></i>
                                    <input type="password" id="current-password" name="current_password" required>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="new-password">Nova Senha</label>
                                    <div class="input-group">
                                        <i class="fas fa-lock"></i>
                                        <input type="password" id="new-password" name="new_password" required>
                                    </div>
                                </div>

                                <div class="form-group">
                                    <label for="confirm-password">Confirmar Nova Senha</label>
                                    <div class="input-group">
                                        <i class="fas fa-lock"></i>
                                        <input type="password" id="confirm-password" name="confirm_password" required>
                                    </div>
                                </div>
                            </div>

                            <div class="password-requirements">
                                <h4>Requisitos da senha:</h4>
                                <ul>
                                    <li id="req-length">Mínimo de 6 caracteres</li>
                                    <li id="req-letter">Pelo menos uma letra</li>
                                    <li id="req-number">Pelo menos um número</li>
                                </ul>
                            </div>

                            <button type="submit" class="btn-primary">
                                <i class="fas fa-key"></i>
                                Alterar Senha
                            </button>
                        </form>

                        <div class="security-section">
                            <h4>Sessões Ativas</h4>
                            <div class="session-item">
                                <div class="session-info">
                                    <div class="session-device">
                                        <i class="fas fa-desktop"></i>
                                        <span>Navegador Atual</span>
                                    </div>
                                    <div class="session-details">
                                        <span class="session-location">Última atividade: Agora</span>
                                    </div>
                                </div>
                                <span class="session-status active">Ativa</span>
                            </div>
                        </div>
                    </div>

                    <!-- Aba Preferências -->
                    <div id="preferences-tab" class="tab-content">
                        <div class="section-header">
                            <h3>Preferências</h3>
                            <p>Configure suas preferências do sistema</p>
                        </div>

                        <form id="preferences-form" class="profile-form">
                            <div class="preference-group">
                                <h4>Notificações</h4>
                                <div class="preference-item">
                                    <label class="switch">
                                        <input type="checkbox" id="email-notifications" checked>
                                        <span class="slider"></span>
                                    </label>
                                    <div class="preference-info">
                                        <span class="preference-title">Notificações por Email</span>
                                        <span class="preference-desc">Receber emails sobre transações</span>
                                    </div>
                                </div>

                                <div class="preference-item">
                                    <label class="switch">
                                        <input type="checkbox" id="transaction-alerts" checked>
                                        <span class="slider"></span>
                                    </label>
                                    <div class="preference-info">
                                        <span class="preference-title">Alertas de Transação</span>
                                        <span class="preference-desc">Alertas para todas as movimentações</span>
                                    </div>
                                </div>
                            </div>

                            <div class="preference-group">
                                <h4>Privacidade</h4>
                                <div class="preference-item">
                                    <label class="switch">
                                        <input type="checkbox" id="show-balance">
                                        <span class="slider"></span>
                                    </label>
                                    <div class="preference-info">
                                        <span class="preference-title">Mostrar Saldo</span>
                                        <span class="preference-desc">Exibir saldo na tela inicial</span>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" class="btn-primary">
                                <i class="fas fa-save"></i>
                                Salvar Preferências
                            </button>
                        </form>

                        <div class="danger-zone">
                            <h4>Zona de Perigo</h4>
                            <p>Ações irreversíveis da conta</p>
                            <button class="btn-danger" id="delete-account">
                                <i class="fas fa-trash"></i>
                                Excluir Conta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        setTimeout(() => {
            // Tabs
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
            });

            // Formulários
            const personalForm = document.getElementById('personal-form');
            if (personalForm) {
                personalForm.addEventListener('submit', (e) => this.handlePersonalUpdate(e));
            }

            const passwordForm = document.getElementById('password-form');
            if (passwordForm) {
                passwordForm.addEventListener('submit', (e) => this.handlePasswordChange(e));
            }

            const preferencesForm = document.getElementById('preferences-form');
            if (preferencesForm) {
                preferencesForm.addEventListener('submit', (e) => this.handlePreferencesUpdate(e));
            }

            // Validação de senha em tempo real
            const newPasswordInput = document.getElementById('new-password');
            if (newPasswordInput) {
                newPasswordInput.addEventListener('input', () => this.validatePassword());
            }

            // Botão de excluir conta
            const deleteAccountBtn = document.getElementById('delete-account');
            if (deleteAccountBtn) {
                deleteAccountBtn.addEventListener('click', () => this.handleDeleteAccount());
            }

            // Carregar dados do perfil
            this.loadProfile();
        }, 100);
    }

    switchTab(tabName) {
        // Remover classe active de todas as tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Ativar tab selecionada
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    async loadProfile() {
        try {
            const response = await window.app.makeRequest('/api/get_profile');
            
            if (response.success) {
                this.populateProfileData(response.user);
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            window.app.showAlert('Erro ao carregar dados do perfil', 'error');
        }
    }

    populateProfileData(user) {
        // Sidebar
        document.getElementById('profile-name').textContent = user.name;
        document.getElementById('profile-email').textContent = user.email;
        document.getElementById('member-since').textContent = this.formatDate(user.created_at);
        document.getElementById('total-transactions').textContent = user.transaction_count || 0;

        // Formulário de dados pessoais
        document.getElementById('edit-name').value = user.name;
        document.getElementById('edit-email').value = user.email;
        document.getElementById('edit-cpf').value = user.cpf;
    }

    async handlePersonalUpdate(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const updateData = {
            name: formData.get('name'),
            email: formData.get('email')
        };

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading"></div> Salvando...';
        submitBtn.disabled = true;

        try {
            const response = await window.app.makeRequest('/api/update_profile', {
                method: 'POST',
                body: JSON.stringify(updateData)
            });

            if (response.success) {
                window.app.showAlert('Dados atualizados com sucesso!', 'success');
                
                // Atualizar dados na sidebar
                document.getElementById('profile-name').textContent = updateData.name;
                document.getElementById('profile-email').textContent = updateData.email;
                
                // Atualizar usuário atual
                if (window.app.currentUser) {
                    window.app.currentUser.name = updateData.name;
                    window.app.currentUser.email = updateData.email;
                }
            } else {
                window.app.showAlert(response.message || 'Erro ao atualizar dados', 'error');
            }
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            window.app.showAlert('Erro de conexão', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handlePasswordChange(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const passwordData = {
            current_password: formData.get('current_password'),
            new_password: formData.get('new_password'),
            confirm_password: formData.get('confirm_password')
        };

        // Validações
        if (passwordData.new_password !== passwordData.confirm_password) {
            window.app.showAlert('As senhas não coincidem', 'error');
            return;
        }

        if (passwordData.new_password.length < 6) {
            window.app.showAlert('A nova senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading"></div> Alterando...';
        submitBtn.disabled = true;

        try {
            const response = await window.app.makeRequest('/api/change_password', {
                method: 'POST',
                body: JSON.stringify(passwordData)
            });

            if (response.success) {
                window.app.showAlert('Senha alterada com sucesso!', 'success');
                e.target.reset();
            } else {
                window.app.showAlert(response.message || 'Erro ao alterar senha', 'error');
            }
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            window.app.showAlert('Erro de conexão', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validatePassword() {
        const password = document.getElementById('new-password').value;
        
        // Validar comprimento
        const lengthReq = document.getElementById('req-length');
        if (password.length >= 6) {
            lengthReq.classList.add('valid');
        } else {
            lengthReq.classList.remove('valid');
        }

        // Validar letra
        const letterReq = document.getElementById('req-letter');
        if (/[a-zA-Z]/.test(password)) {
            letterReq.classList.add('valid');
        } else {
            letterReq.classList.remove('valid');
        }

        // Validar número
        const numberReq = document.getElementById('req-number');
        if (/\d/.test(password)) {
            numberReq.classList.add('valid');
        } else {
            numberReq.classList.remove('valid');
        }
    }

    async handlePreferencesUpdate(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const preferences = {
            email_notifications: formData.get('email-notifications') === 'on',
            transaction_alerts: formData.get('transaction-alerts') === 'on',
            show_balance: formData.get('show-balance') === 'on'
        };

        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading"></div> Salvando...';
        submitBtn.disabled = true;

        try {
            const response = await window.app.makeRequest('/api/update_preferences', {
                method: 'POST',
                body: JSON.stringify(preferences)
            });

            if (response.success) {
                window.app.showAlert('Preferências salvas com sucesso!', 'success');
            } else {
                window.app.showAlert(response.message || 'Erro ao salvar preferências', 'error');
            }
        } catch (error) {
            console.error('Erro ao salvar preferências:', error);
            window.app.showAlert('Erro de conexão', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    handleDeleteAccount() {
        const confirmation = confirm(
            'ATENÇÃO: Esta ação é irreversível!\n\n' +
            'Ao excluir sua conta:\n' +
            '• Todos os seus dados serão permanentemente removidos\n' +
            '• Seu histórico de transações será perdido\n' +
            '• Você não poderá recuperar sua conta\n\n' +
            'Tem certeza que deseja continuar?'
        );

        if (confirmation) {
            const finalConfirmation = prompt(
                'Para confirmar a exclusão da conta, digite "EXCLUIR" (em maiúsculas):'
            );

            if (finalConfirmation === 'EXCLUIR') {
                this.deleteAccount();
            } else {
                window.app.showAlert('Exclusão cancelada', 'warning');
            }
        }
    }

    async deleteAccount() {
        try {
            const response = await window.app.makeRequest('/api/delete_account', {
                method: 'DELETE'
            });

            if (response.success) {
                window.app.showAlert('Conta excluída com sucesso', 'success');
                
                // Fazer logout após 2 segundos
                setTimeout(() => {
                    window.app.logout();
                }, 2000);
            } else {
                window.app.showAlert(response.message || 'Erro ao excluir conta', 'error');
            }
        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            window.app.showAlert('Erro de conexão', 'error');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }
}

// Estilos específicos para perfil
const profileStyles = `
<style>
.profile-container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 32px;
}

.profile-sidebar {
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    padding: 32px;
    height: fit-content;
}

.profile-avatar {
    text-align: center;
    margin-bottom: 24px;
}

.avatar-circle {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    margin: 0 auto 16px;
}

.change-avatar-btn {
    background: var(--border-color);
    border: none;
    padding: 8px 16px;
    border-radius: var(--border-radius);
    font-size: 14px;
    cursor: pointer;
    transition: var(--transition);
}

.change-avatar-btn:hover {
    background: var(--text-secondary);
    color: white;
}

.profile-info h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
}

.profile-info p {
    margin: 0 0 24px 0;
    color: var(--text-secondary);
}

.profile-stats {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.stat-label {
    font-size: 14px;
    color: var(--text-secondary);
}

.stat-value {
    font-weight: 600;
    color: var(--text-primary);
}

.profile-content {
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    overflow: hidden;
}

.profile-tabs {
    display: flex;
    border-bottom: 1px solid var(--border-color);
}

.tab-btn {
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

.tab-btn:hover,
.tab-btn.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
}

.tab-content {
    display: none;
    padding: 32px;
}

.tab-content.active {
    display: block;
}

.section-header {
    margin-bottom: 32px;
}

.section-header h3 {
    margin: 0 0 8px 0;
    font-size: 20px;
}

.section-header p {
    margin: 0;
    color: var(--text-secondary);
}

.profile-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.form-help {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 4px;
}

.password-requirements {
    background: rgba(37, 99, 235, 0.05);
    border-radius: var(--border-radius);
    padding: 16px;
}

.password-requirements h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
}

.password-requirements ul {
    margin: 0;
    padding-left: 20px;
}

.password-requirements li {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 4px;
}

.password-requirements li.valid {
    color: var(--success-color);
}

.security-section {
    margin-top: 32px;
    padding-top: 32px;
    border-top: 1px solid var(--border-color);
}

.security-section h4 {
    margin: 0 0 16px 0;
}

.session-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: rgba(37, 99, 235, 0.05);
    border-radius: var(--border-radius);
}

.session-device {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
}

.session-details {
    font-size: 14px;
    color: var(--text-secondary);
    margin-top: 4px;
}

.session-status.active {
    color: var(--success-color);
    font-weight: 600;
}

.preference-group {
    margin-bottom: 32px;
}

.preference-group h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
}

.preference-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid var(--border-color);
}

.preference-item:last-child {
    border-bottom: none;
}

.preference-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.preference-title {
    font-weight: 600;
}

.preference-desc {
    font-size: 14px;
    color: var(--text-secondary);
}

.switch {
    position: relative;
    display: inline-block;
    width: 50px;
    height: 24px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--border-color);
    transition: var(--transition);
    border-radius: 24px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: var(--transition);
    border-radius: 50%;
}

input:checked + .slider {
    background-color: var(--primary-color);
}

input:checked + .slider:before {
    transform: translateX(26px);
}

.danger-zone {
    margin-top: 32px;
    padding-top: 32px;
    border-top: 1px solid var(--border-color);
}

.danger-zone h4 {
    margin: 0 0 8px 0;
    color: var(--danger-color);
}

.danger-zone p {
    margin: 0 0 16px 0;
    color: var(--text-secondary);
    font-size: 14px;
}

@media (max-width: 768px) {
    .profile-container {
        grid-template-columns: 1fr;
        gap: 24px;
    }
    
    .profile-tabs {
        overflow-x: auto;
    }
    
    .tab-btn {
        white-space: nowrap;
        min-width: 120px;
    }
}
</style>
`;

// Adicionar estilos
document.head.insertAdjacentHTML('beforeend', profileStyles);

// Inicializar gerenciador
window.profileManager = new ProfileManager();