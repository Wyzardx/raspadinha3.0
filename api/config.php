<?php
// Configurações do banco de dados
define('DB_HOST', 'localhost');
define('DB_NAME', 'banking_system');
define('DB_USER', 'root');
define('DB_PASS', '');

// Configurações JWT
define('JWT_SECRET', 'sua_chave_secreta_super_segura_aqui_2024');
define('JWT_ALGORITHM', 'HS256');

// Configurações gerais
define('TIMEZONE', 'America/Sao_Paulo');
date_default_timezone_set(TIMEZONE);

// Headers CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Tratar requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Classe para conexão com banco de dados
class Database {
    private static $instance = null;
    private $connection;

    private function __construct() {
        try {
            $this->connection = new PDO(
                "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            die(json_encode(['success' => false, 'message' => 'Erro de conexão com banco de dados']));
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }
}

// Classe para JWT
class JWT {
    public static function encode($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => JWT_ALGORITHM]);
        $payload = json_encode($payload);
        
        $headerEncoded = self::base64UrlEncode($header);
        $payloadEncoded = self::base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, JWT_SECRET, true);
        $signatureEncoded = self::base64UrlEncode($signature);
        
        return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
    }

    public static function decode($jwt) {
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            return false;
        }

        $header = json_decode(self::base64UrlDecode($parts[0]), true);
        $payload = json_decode(self::base64UrlDecode($parts[1]), true);
        $signature = self::base64UrlDecode($parts[2]);

        $expectedSignature = hash_hmac('sha256', $parts[0] . "." . $parts[1], JWT_SECRET, true);

        if (!hash_equals($signature, $expectedSignature)) {
            return false;
        }

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }

        return $payload;
    }

    private static function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode($data) {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }
}

// Função para verificar autenticação
function requireAuth() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Token não fornecido']);
        exit();
    }

    $token = $matches[1];
    $payload = JWT::decode($token);
    
    if (!$payload) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Token inválido']);
        exit();
    }

    return $payload;
}

// Função para resposta JSON
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

// Função para validar CPF
function validateCPF($cpf) {
    $cpf = preg_replace('/\D/', '', $cpf);
    
    if (strlen($cpf) != 11) return false;
    
    if (preg_match('/(\d)\1{10}/', $cpf)) return false;
    
    for ($t = 9; $t < 11; $t++) {
        for ($d = 0, $c = 0; $c < $t; $c++) {
            $d += $cpf[$c] * (($t + 1) - $c);
        }
        $d = ((10 * $d) % 11) % 10;
        if ($cpf[$c] != $d) return false;
    }
    
    return true;
}
?>