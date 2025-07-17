// Gerenciador de Login
class LoginManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Form de login
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Toggle password visibility
        const togglePassword = document.querySelector('.toggle-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', () => this.togglePasswordVisibility());
        }

        // Links de navegação
        const showRegisterLink = document.getElementById('show-register');
        if (showRegisterLink) {
            showRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.app.showRegister();
            });
        }

        const forgotPasswordLink = document.getElementById('forgot-password');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        // Validação básica
        if (!loginData.email || !loginData.password) {
            window.app.showAlert('Por favor, preencha todos os campos', 'error');
            return;
        }

        // Mostrar loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading"></div> Entrando...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (data.success) {
                // Salvar token
                localStorage.setItem('auth_token', data.token);
                
                // Definir usuário atual
                window.app.currentUser = data.user;
                
                // Redirecionar para dashboard
                window.app.showDashboard();
                
                window.app.showAlert('Login realizado com sucesso!', 'success');
            } else {
                window.app.showAlert(data.message || 'Erro ao fazer login', 'error');
            }
        } catch (error) {
            console.error('Erro no login:', error);
            window.app.showAlert('Erro de conexão. Tente novamente.', 'error');
        } finally {
            // Restaurar botão
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.querySelector('.toggle-password i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.classList.remove('fa-eye');
            toggleIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            toggleIcon.classList.remove('fa-eye-slash');
            toggleIcon.classList.add('fa-eye');
        }
    }

    handleForgotPassword() {
        const email = prompt('Digite seu email para recuperação de senha:');
        
        if (email) {
            // Implementar recuperação de senha
            fetch('api/forgot_password.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.app.showAlert('Email de recuperação enviado!', 'success');
                } else {
                    window.app.showAlert(data.message || 'Erro ao enviar email', 'error');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                window.app.showAlert('Erro de conexão', 'error');
            });
        }
    }
}

// Inicializar gerenciador de login
window.loginManager = new LoginManager();