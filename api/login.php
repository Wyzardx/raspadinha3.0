<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Método não permitido'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['email']) || !isset($input['password'])) {
    jsonResponse(['success' => false, 'message' => 'Email e senha são obrigatórios'], 400);
}

try {
    $pdo = Database::getInstance()->getConnection();
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$input['email']]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($input['password'], $user['password_hash'])) {
        jsonResponse(['success' => false, 'message' => 'Email ou senha incorretos'], 401);
    }
    
    // Gerar token JWT
    $payload = [
        'user_id' => $user['id'],
        'email' => $user['email'],
        'is_admin' => (bool)$user['is_admin'],
        'exp' => time() + (24 * 60 * 60) // 24 horas
    ];
    
    $token = JWT::encode($payload);
    
    jsonResponse([
        'success' => true,
        'message' => 'Login realizado com sucesso',
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'balance' => (float)$user['balance'],
            'is_admin' => (bool)$user['is_admin']
        ]
    ]);
    
} catch (Exception $e) {
    jsonResponse(['success' => false, 'message' => 'Erro interno do servidor'], 500);
}
?>