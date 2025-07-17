<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['success' => false, 'message' => 'Método não permitido'], 405);
}

$payload = requireAuth();

try {
    $pdo = Database::getInstance()->getConnection();
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$payload['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        jsonResponse(['success' => false, 'message' => 'Usuário não encontrado'], 404);
    }
    
    jsonResponse([
        'success' => true,
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