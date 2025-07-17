// Gerenciador de Registro
class RegisterManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCPFMask();
    }

    setupEventListeners() {
        // Form de registro
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Link para voltar ao login
        const showLoginLink = document.getElementById('show-login');
        if (showLoginLink) {
            showLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                window.app.showLogin();
            });
        }

        // Validação em tempo real
        const confirmPasswordInput = document.getElementById('reg-confirm-password');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => this.validatePasswordMatch());
        }
    }

    setupCPFMask() {
        const cpfInput = document.getElementById('reg-cpf');
        if (cpfInput) {
            cpfInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            });
        }
    }

    validatePasswordMatch() {
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('reg-confirm-password').value;
        const confirmInput = document.getElementById('reg-confirm-password');

        if (confirmPassword && password !== confirmPassword) {
            confirmInput.style.borderColor = 'var(--danger-color)';
            return false;
        } else {
            confirmInput.style.borderColor = 'var(--border-color)';
            return true;
        }
    }

    validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        
        if (cpf.length !== 11) return false;
        
        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cpf)) return false;
        
        // Validar dígitos verificadores
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let digit1 = 11 - (sum % 11);
        if (digit1 > 9) digit1 = 0;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        let digit2 = 11 - (sum % 11);
        if (digit2 > 9) digit2 = 0;
        
        return digit1 === parseInt(cpf.charAt(9)) && digit2 === parseInt(cpf.charAt(10));
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const registerData = {
            name: formData.get('name'),
            cpf: formData.get('cpf'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirm_password: formData.get('confirm_password')
        };

        // Validações
        if (!this.validateForm(registerData)) {
            return;
        }

        // Mostrar loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading"></div> Criando conta...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('api/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });

            const data = await response.json();

            if (data.success) {
                window.app.showAlert('Conta criada com sucesso! Faça login para continuar.', 'success');
                
                // Limpar formulário
                e.target.reset();
                
                // Redirecionar para login após 2 segundos
                setTimeout(() => {
                    window.app.showLogin();
                }, 2000);
            } else {
                window.app.showAlert(data.message || 'Erro ao criar conta', 'error');
            }
        } catch (error) {
            console.error('Erro no registro:', error);
            window.app.showAlert('Erro de conexão. Tente novamente.', 'error');
        } finally {
            // Restaurar botão
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    validateForm(data) {
        // Verificar campos obrigatórios
        if (!data.name || !data.cpf || !data.email || !data.password || !data.confirm_password) {
            window.app.showAlert('Por favor, preencha todos os campos', 'error');
            return false;
        }

        // Validar nome (mínimo 2 palavras)
        if (data.name.trim().split(' ').length < 2) {
            window.app.showAlert('Por favor, digite seu nome completo', 'error');
            return false;
        }

        // Validar CPF
        if (!this.validateCPF(data.cpf)) {
            window.app.showAlert('CPF inválido', 'error');
            return false;
        }

        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            window.app.showAlert('Email inválido', 'error');
            return false;
        }

        // Validar senha
        if (data.password.length < 6) {
            window.app.showAlert('A senha deve ter pelo menos 6 caracteres', 'error');
            return false;
        }

        // Validar confirmação de senha
        if (data.password !== data.confirm_password) {
            window.app.showAlert('As senhas não coincidem', 'error');
            return false;
        }

        return true;
    }
}

// Inicializar gerenciador de registro
window.registerManager = new RegisterManager();