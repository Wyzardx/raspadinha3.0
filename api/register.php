<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Método não permitido'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

// Validar dados obrigatórios
$required = ['name', 'email', 'cpf', 'password', 'confirm_password'];
foreach ($required as $field) {
    if (!isset($input[$field]) || empty(trim($input[$field]))) {
        jsonResponse(['success' => false, 'message' => 'Todos os campos são obrigatórios'], 400);
    }
}

// Validar senhas
if ($input['password'] !== $input['confirm_password']) {
    jsonResponse(['success' => false, 'message' => 'As senhas não coincidem'], 400);
}

if (strlen($input['password']) < 6) {
    jsonResponse(['success' => false, 'message' => 'A senha deve ter pelo menos 6 caracteres'], 400);
}

// Validar email
if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    jsonResponse(['success' => false, 'message' => 'Email inválido'], 400);
}

// Validar CPF
if (!validateCPF($input['cpf'])) {
    jsonResponse(['success' => false, 'message' => 'CPF inválido'], 400);
}

try {
    $pdo = Database::getInstance()->getConnection();
    
    // Verificar se email já existe
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$input['email']]);
    if ($stmt->fetch()) {
        jsonResponse(['success' => false, 'message' => 'Email já cadastrado'], 409);
    }
    
    // Verificar se CPF já existe
    $stmt = $pdo->prepare("SELECT id FROM users WHERE cpf = ?");
    $stmt->execute([$input['cpf']]);
    if ($stmt->fetch()) {
        jsonResponse(['success' => false, 'message' => 'CPF já cadastrado'], 409);
    }
    
    // Criar usuário
    $passwordHash = password_hash($input['password'], PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("
        INSERT INTO users (name, email, cpf, password_hash, balance) 
        VALUES (?, ?, ?, ?, 0.00)
    ");
    
    $stmt->execute([
        trim($input['name']),
        trim($input['email']),
        $input['cpf'],
        $passwordHash
    ]);
    
    jsonResponse([
        'success' => true,
        'message' => 'Conta criada com sucesso!'
    ]);
    
} catch (Exception $e) {
    jsonResponse(['success' => false, 'message' => 'Erro interno do servidor'], 500);
}
?>