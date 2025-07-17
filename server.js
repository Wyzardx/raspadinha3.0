const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 8000;
const JWT_SECRET = 'sua_chave_secreta_super_segura_aqui_2024';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.'));

// Inicializar banco de dados SQLite
const db = new sqlite3.Database('./banking.db');

// Criar tabelas
db.serialize(() => {
    // Tabela de usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            cpf TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            balance REAL DEFAULT 0.00,
            is_admin BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabela de transações
    db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('deposit', 'withdraw', 'transfer_sent', 'transfer_received')),
            amount REAL NOT NULL,
            description TEXT,
            target_user_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (target_user_id) REFERENCES users(id)
        )
    `);

    // Criar usuário admin padrão
    const adminEmail = 'admin@banco.com';
    const adminPassword = bcrypt.hashSync('admin123', 10);
    
    db.get("SELECT id FROM users WHERE email = ?", [adminEmail], (err, row) => {
        if (!row) {
            db.run(`
                INSERT INTO users (name, email, cpf, password_hash, balance, is_admin) 
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                'Administrador',
                adminEmail,
                '000.000.000-00',
                adminPassword,
                0.00,
                1
            ]);
        }
    });
});

// Middleware de autenticação
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Token não fornecido' });
    }

    const token = authHeader.substring(7);
    
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido' });
    }
};

// Função para validar CPF
function validateCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    for (let t = 9; t < 11; t++) {
        let d = 0;
        for (let c = 0; c < t; c++) {
            d += parseInt(cpf[c]) * ((t + 1) - c);
        }
        d = ((10 * d) % 11) % 10;
        if (parseInt(cpf[c]) !== d) return false;
    }
    
    return true;
}

// Rotas da API

// Instalação (já feita automaticamente)
app.get('/api/install', (req, res) => {
    res.json({
        success: true,
        message: 'Banco de dados instalado com sucesso!',
        admin_credentials: {
            email: 'admin@banco.com',
            password: 'admin123'
        }
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios' });
    }
    
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
        
        if (!user || !bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({ success: false, message: 'Email ou senha incorretos' });
        }
        
        const token = jwt.sign({
            user_id: user.id,
            email: user.email,
            is_admin: Boolean(user.is_admin)
        }, JWT_SECRET, { expiresIn: '24h' });
        
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                balance: user.balance,
                is_admin: Boolean(user.is_admin)
            }
        });
    });
});

// Registro
app.post('/api/register', (req, res) => {
    const { name, email, cpf, password, confirm_password } = req.body;
    
    // Validações
    if (!name || !email || !cpf || !password || !confirm_password) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios' });
    }
    
    if (password !== confirm_password) {
        return res.status(400).json({ success: false, message: 'As senhas não coincidem' });
    }
    
    if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'A senha deve ter pelo menos 6 caracteres' });
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ success: false, message: 'Email inválido' });
    }
    
    if (!validateCPF(cpf)) {
        return res.status(400).json({ success: false, message: 'CPF inválido' });
    }
    
    // Verificar se email já existe
    db.get("SELECT id FROM users WHERE email = ?", [email], (err, row) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
        
        if (row) {
            return res.status(409).json({ success: false, message: 'Email já cadastrado' });
        }
        
        // Verificar se CPF já existe
        db.get("SELECT id FROM users WHERE cpf = ?", [cpf], (err, row) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
            }
            
            if (row) {
                return res.status(409).json({ success: false, message: 'CPF já cadastrado' });
            }
            
            // Criar usuário
            const passwordHash = bcrypt.hashSync(password, 10);
            
            db.run(`
                INSERT INTO users (name, email, cpf, password_hash, balance) 
                VALUES (?, ?, ?, ?, 0.00)
            `, [name.trim(), email.trim(), cpf, passwordHash], function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
                }
                
                res.json({
                    success: true,
                    message: 'Conta criada com sucesso!'
                });
            });
        });
    });
});

// Validar token
app.post('/api/validate_token', requireAuth, (req, res) => {
    db.get("SELECT * FROM users WHERE id = ?", [req.user.user_id], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }
        
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                balance: user.balance,
                is_admin: Boolean(user.is_admin)
            }
        });
    });
});

// Obter saldo
app.get('/api/get_balance', requireAuth, (req, res) => {
    db.get("SELECT balance FROM users WHERE id = ?", [req.user.user_id], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }
        
        res.json({
            success: true,
            balance: user.balance
        });
    });
});

// Obter transações
app.get('/api/get_transactions', requireAuth, (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const type = req.query.type;
    
    let query = `
        SELECT t.*, u.name as target_name 
        FROM transactions t
        LEFT JOIN users u ON t.target_user_id = u.id
        WHERE t.user_id = ?
    `;
    
    const params = [req.user.user_id];
    
    if (type && type !== 'all') {
        if (type === 'transfer') {
            query += ` AND (t.type = 'transfer_sent' OR t.type = 'transfer_received')`;
        } else {
            query += ` AND t.type = ?`;
            params.push(type);
        }
    }
    
    query += ` ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    db.all(query, params, (err, transactions) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
        
        const formattedTransactions = transactions.map(transaction => {
            let description = '';
            
            switch (transaction.type) {
                case 'deposit':
                    description = 'Depósito realizado';
                    break;
                case 'withdraw':
                    description = 'Saque realizado';
                    break;
                case 'transfer_sent':
                    description = `Transferência enviada para ${transaction.target_name || 'Usuário'}`;
                    break;
                case 'transfer_received':
                    description = `Transferência recebida de ${transaction.target_name || 'Usuário'}`;
                    break;
            }
            
            return {
                id: transaction.id,
                type: transaction.type,
                amount: transaction.amount,
                description: transaction.description || description,
                target_user_id: transaction.target_user_id,
                target_name: transaction.target_name,
                created_at: transaction.created_at
            };
        });
        
        res.json({
            success: true,
            transactions: formattedTransactions
        });
    });
});

// Depositar
app.post('/api/deposit', requireAuth, (req, res) => {
    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Valor inválido' });
    }
    
    if (amount > 10000) {
        return res.status(400).json({ success: false, message: 'Valor máximo por depósito: R$ 10.000,00' });
    }
    
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Atualizar saldo
        db.run(`
            UPDATE users SET balance = balance + ? WHERE id = ?
        `, [amount, req.user.user_id], function(err) {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
            }
            
            // Registrar transação
            db.run(`
                INSERT INTO transactions (user_id, type, amount, description) 
                VALUES (?, 'deposit', ?, ?)
            `, [req.user.user_id, amount, description || 'Depósito realizado'], function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
                }
                
                db.run('COMMIT');
                res.json({
                    success: true,
                    message: 'Depósito realizado com sucesso'
                });
            });
        });
    });
});

// Sacar
app.post('/api/withdraw', requireAuth, (req, res) => {
    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Valor inválido' });
    }
    
    // Verificar saldo
    db.get("SELECT balance FROM users WHERE id = ?", [req.user.user_id], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
        
        if (!user || user.balance < amount) {
            return res.status(400).json({ success: false, message: 'Saldo insuficiente' });
        }
        
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            // Atualizar saldo
            db.run(`
                UPDATE users SET balance = balance - ? WHERE id = ?
            `, [amount, req.user.user_id], function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
                }
                
                // Registrar transação
                db.run(`
                    INSERT INTO transactions (user_id, type, amount, description) 
                    VALUES (?, 'withdraw', ?, ?)
                `, [req.user.user_id, -amount, description || 'Saque realizado'], function(err) {
                    if (err) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
                    }
                    
                    db.run('COMMIT');
                    res.json({
                        success: true,
                        message: 'Saque realizado com sucesso'
                    });
                });
            });
        });
    });
});

// Verificar usuário para transferência
app.post('/api/verify_user', requireAuth, (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email é obrigatório' });
    }
    
    db.get("SELECT id, name, email FROM users WHERE email = ?", [email], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }
        
        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    });
});

// Transferir
app.post('/api/transfer', requireAuth, (req, res) => {
    const { recipient_email, amount, description } = req.body;
    
    if (!recipient_email || !amount || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Dados inválidos' });
    }
    
    // Verificar se não está transferindo para si mesmo
    db.get("SELECT email FROM users WHERE id = ?", [req.user.user_id], (err, sender) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
        
        if (sender.email === recipient_email) {
            return res.status(400).json({ success: false, message: 'Você não pode transferir para si mesmo' });
        }
        
        // Verificar saldo do remetente
        db.get("SELECT balance FROM users WHERE id = ?", [req.user.user_id], (err, senderBalance) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
            }
            
            if (!senderBalance || senderBalance.balance < amount) {
                return res.status(400).json({ success: false, message: 'Saldo insuficiente' });
            }
            
            // Buscar destinatário
            db.get("SELECT id, name FROM users WHERE email = ?", [recipient_email], (err, recipient) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
                }
                
                if (!recipient) {
                    return res.status(404).json({ success: false, message: 'Destinatário não encontrado' });
                }
                
                db.serialize(() => {
                    db.run('BEGIN TRANSACTION');
                    
                    // Debitar do remetente
                    db.run(`
                        UPDATE users SET balance = balance - ? WHERE id = ?
                    `, [amount, req.user.user_id], function(err) {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
                        }
                        
                        // Creditar ao destinatário
                        db.run(`
                            UPDATE users SET balance = balance + ? WHERE id = ?
                        `, [amount, recipient.id], function(err) {
                            if (err) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
                            }
                            
                            // Registrar transação do remetente
                            db.run(`
                                INSERT INTO transactions (user_id, type, amount, description, target_user_id) 
                                VALUES (?, 'transfer_sent', ?, ?, ?)
                            `, [req.user.user_id, -amount, description || 'Transferência enviada', recipient.id], function(err) {
                                if (err) {
                                    db.run('ROLLBACK');
                                    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
                                }
                                
                                // Registrar transação do destinatário
                                db.run(`
                                    INSERT INTO transactions (user_id, type, amount, description, target_user_id) 
                                    VALUES (?, 'transfer_received', ?, ?, ?)
                                `, [recipient.id, amount, description || 'Transferência recebida', req.user.user_id], function(err) {
                                    if (err) {
                                        db.run('ROLLBACK');
                                        return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
                                    }
                                    
                                    db.run('COMMIT');
                                    res.json({
                                        success: true,
                                        message: 'Transferência realizada com sucesso'
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

// APIs Admin
app.get('/api/admin/stats', requireAuth, (req, res) => {
    if (!req.user.is_admin) {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    
    const stats = {};
    
    // Total de usuários
    db.get("SELECT COUNT(*) as count FROM users", (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
        
        stats.total_users = result.count;
        
        // Transações hoje
        db.get(`
            SELECT COUNT(*) as count FROM transactions 
            WHERE DATE(created_at) = DATE('now')
        `, (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
            }
            
            stats.transactions_today = result.count;
            
            // Volume total
            db.get("SELECT SUM(balance) as total FROM users", (err, result) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
                }
                
                stats.total_volume = result.total || 0;
                stats.active_users = stats.total_users; // Simplificado
                
                res.json({
                    success: true,
                    stats: stats
                });
            });
        });
    });
});

app.get('/api/admin/users', requireAuth, (req, res) => {
    if (!req.user.is_admin) {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    
    db.all(`
        SELECT id, name, email, cpf, balance, is_admin, created_at 
        FROM users 
        ORDER BY created_at DESC
    `, (err, users) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
        
        res.json({
            success: true,
            users: users
        });
    });
});

app.get('/api/admin/transactions', requireAuth, (req, res) => {
    if (!req.user.is_admin) {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
    }
    
    db.all(`
        SELECT t.*, u.name as user_name 
        FROM transactions t
        JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
        LIMIT 100
    `, (err, transactions) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
        
        res.json({
            success: true,
            transactions: transactions
        });
    });
});

// Servir arquivos estáticos
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('Credenciais do admin: admin@banco.com / admin123');
});