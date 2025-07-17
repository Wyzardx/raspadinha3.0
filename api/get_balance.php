<?php
require_once 'config.php';

$payload = requireAuth();

try {
    $pdo = Database::getInstance()->getConnection();
    
    $stmt = $pdo->prepare("SELECT balance FROM users WHERE id = ?");
    $stmt->execute([$payload['user_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        jsonResponse(['success' => false, 'message' => 'Usuário não encontrado'], 404);
    }
    
    jsonResponse([
        'success' => true,
        'balance' => (float)$user['balance']
    ]);
    
} catch (Exception $e) {
    jsonResponse(['success' => false, 'message' => 'Erro interno do servidor'], 500);
}
?>