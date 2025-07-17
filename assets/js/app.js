// Aplicação Principal - Gerenciamento de Telas
class BankingApp {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
    }

    checkAuthStatus() {
        const token = localStorage.getItem('auth_token');
        if (token) {
            this.validateToken(token);
        }
    }

    async validateToken(token) {
        try {
            const response = await fetch('api/validate_token.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
                this.showDashboard();
            } else {
                localStorage.removeItem('auth_token');
                this.showLogin();
            }
        } catch (error) {
            console.error('Erro ao validar token:', error);
            this.showLogin();
        }
    }

    setupEventListeners() {
        // Navegação entre telas
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-screen')) {
                const screen = e.target.getAttribute('data-screen');
                this.navigateToScreen(screen);
            }
        });

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    navigateToScreen(screenName) {
        // Ocultar todas as seções de conteúdo
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remover classe active dos links do menu
        document.querySelectorAll('.menu a').forEach(link => {
            link.classList.remove('active');
        });

        // Mostrar seção específica
        const targetSection = document.getElementById(`${screenName}-content`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Ativar link do menu
        const targetLink = document.querySelector(`[data-screen="${screenName}"]`);
        if (targetLink) {
            targetLink.classList.add('active');
        }

        // Carregar conteúdo específico da tela
        this.loadScreenContent(screenName);
    }

    loadScreenContent(screenName) {
        switch (screenName) {
            case 'dashboard':
                if (window.dashboardManager) {
                    window.dashboardManager.loadDashboard();
                }
                break;
            case 'deposit':
                if (window.depositManager) {
                    window.depositManager.init();
                }
                break;
            case 'withdraw':
                if (window.withdrawManager) {
                    window.withdrawManager.init();
                }
                break;
            case 'transfer':
                if (window.transferManager) {
                    window.transferManager.init();
                }
                break;
            case 'history':
                if (window.historyManager) {
                    window.historyManager.loadHistory();
                }
                break;
            case 'profile':
                if (window.profileManager) {
                    window.profileManager.loadProfile();
                }
                break;
            case 'admin':
                if (window.adminManager) {
                    window.adminManager.loadAdmin();
                }
                break;
        }
    }

    showLogin() {
        this.hideAllScreens();
        document.getElementById('login-screen').classList.add('active');
    }

    showRegister() {
        this.hideAllScreens();
        document.getElementById('register-screen').classList.add('active');
    }

    showDashboard() {
        this.hideAllScreens();
        document.getElementById('dashboard-screen').classList.add('active');
        
        // Atualizar nome do usuário
        if (this.currentUser) {
            document.getElementById('user-name').textContent = this.currentUser.name;
            
            // Mostrar menu admin se for admin
            if (this.currentUser.is_admin) {
                document.getElementById('admin-menu').style.display = 'block';
            }
        }

        // Carregar dashboard
        this.navigateToScreen('dashboard');
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }

    logout() {
        localStorage.removeItem('auth_token');
        this.currentUser = null;
        this.showLogin();
    }

    showAlert(message, type = 'success') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;

        // Adicionar ao topo da tela atual
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen) {
            activeScreen.insertBefore(alertDiv, activeScreen.firstChild);
            
            // Remover após 5 segundos
            setTimeout(() => {
                alertDiv.remove();
            }, 5000);
        }
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    async makeRequest(url, options = {}) {
        const token = localStorage.getItem('auth_token');
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, finalOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }
}

// Inicializar aplicação
window.app = new BankingApp();