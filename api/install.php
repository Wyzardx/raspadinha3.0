<?php
require_once 'config.php';

try {
    $pdo = Database::getInstance()->getConnection();
    
    // Criar tabela de usuários
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            cpf VARCHAR(14) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            balance DECIMAL(15,2) DEFAULT 0.00,
            is_admin BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
    
    // Criar tabela de transações
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type ENUM('deposit', 'withdraw', 'transfer_sent', 'transfer_received') NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            description TEXT,
            target_user_id INT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL
        )
    ");
    
    // Criar usuário admin padrão
    $adminEmail = 'admin@banco.com';
    $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$adminEmail]);
    
    if (!$stmt->fetch()) {
        $stmt = $pdo->prepare("
            INSERT INTO users (name, email, cpf, password_hash, balance, is_admin) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            'Administrador',
            $adminEmail,
            '000.000.000-00',
            $adminPassword,
            0.00,
            true
        ]);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Banco de dados instalado com sucesso!',
        'admin_credentials' => [
            'email' => $adminEmail,
            'password' => 'admin123'
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao instalar banco de dados: ' . $e->getMessage()
    ]);
}
?>