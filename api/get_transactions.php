<?php
require_once 'config.php';

$payload = requireAuth();

$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

try {
    $pdo = Database::getInstance()->getConnection();
    
    $stmt = $pdo->prepare("
        SELECT t.*, u.name as target_name 
        FROM transactions t
        LEFT JOIN users u ON t.target_user_id = u.id
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC
        LIMIT ? OFFSET ?
    ");
    
    $stmt->execute([$payload['user_id'], $limit, $offset]);
    $transactions = $stmt->fetchAll();
    
    // Formatar transações
    $formattedTransactions = array_map(function($transaction) {
        $description = '';
        
        switch ($transaction['type']) {
            case 'deposit':
                $description = 'Depósito realizado';
                break;
            case 'withdraw':
                $description = 'Saque realizado';
                break;
            case 'transfer_sent':
                $description = 'Transferência enviada para ' . ($transaction['target_name'] ?? 'Usuário');
                break;
            case 'transfer_received':
                $description = 'Transferência recebida de ' . ($transaction['target_name'] ?? 'Usuário');
                break;
        }
        
        return [
            'id' => $transaction['id'],
            'type' => $transaction['type'],
            'amount' => (float)$transaction['amount'],
            'description' => $transaction['description'] ?: $description,
            'target_user_id' => $transaction['target_user_id'],
            'target_name' => $transaction['target_name'],
            'created_at' => $transaction['created_at']
        ];
    }, $transactions);
    
    jsonResponse([
        'success' => true,
        'transactions' => $formattedTransactions
    ]);
    
} catch (Exception $e) {
    jsonResponse(['success' => false, 'message' => 'Erro interno do servidor'], 500);
}
?>