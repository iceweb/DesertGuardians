<?php
/**
 * Desert Guardians - Highscore API
 * Handles GET (fetch scores), POST (submit score), and session management
 * 
 * Endpoints:
 *   GET /api.php              - Fetch top 20 highscores
 *   GET /api.php?action=session - Request a new game session token
 *   POST /api.php             - Submit a score with validation
 */

require_once 'config.php';

// Get raw input for POST detection
$rawInput = file_get_contents('php://input');
$origMethod = $_SERVER['REQUEST_METHOD'];
$method = $origMethod;

// If we have JSON body data, treat it as POST
if (!empty($rawInput) && $rawInput !== '{}') {
    $method = 'POST';
}

// Debug endpoint (only when explicitly enabled)
if (DEBUG_API && isset($_GET['debug'])) {
    header('Content-Type: application/json');
    echo json_encode([
        'raw_input' => $rawInput,
        'original_method' => $origMethod,
        'detected_method' => $method,
        'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set'
    ]);
    exit();
}

// Set headers
header('Content-Type: application/json');
header('Vary: Origin');

$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = array_filter(array_map('trim', explode(',', ALLOWED_ORIGINS)));

if (ALLOWED_ORIGINS === '*') {
    header('Access-Control-Allow-Origin: *');
} elseif ($requestOrigin && in_array($requestOrigin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $requestOrigin);
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Get database connection
 */
function getDbConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed']);
        exit();
    }
}

/**
 * Sanitize player name
 */
function sanitizeName($name) {
    $name = strip_tags($name);
    $name = trim($name);
    $name = substr($name, 0, 20);
    $name = preg_replace('/[\x00-\x1F\x7F]/', '', $name);
    return $name;
}

/**
 * Get client IP address
 */
function getClientIP() {
    $ip = '';
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    }
    return substr(trim($ip), 0, 45);
}

/**
 * Calculate expected score from game data (server-side validation)
 */
function calculateScore($waveReached, $goldEarned, $hpRemaining, $timeSeconds) {
    $waveScore = $waveReached * WAVE_BONUS_POINTS;
    $goldScore = floor($goldEarned * GOLD_BONUS_MULTIPLIER);
    $hpBonus = $hpRemaining * HP_BONUS_POINTS;
    
    if ($timeSeconds <= OPTIMAL_TIME_SECONDS) {
        $timeMultiplier = MAX_TIME_MULTIPLIER;
    } else {
        $timeMultiplier = max(1.0, MAX_TIME_MULTIPLIER - ($timeSeconds - OPTIMAL_TIME_SECONDS) / 1800);
    }
    
    return floor(($waveScore + $goldScore + $hpBonus) * $timeMultiplier);
}

/**
 * Check rate limit for IP
 */
function checkRateLimit($pdo, $ip) {
    $stmt = $pdo->prepare("SELECT last_submission FROM rate_limits WHERE ip_address = :ip");
    $stmt->execute([':ip' => $ip]);
    $row = $stmt->fetch();
    
    if ($row) {
        $lastSubmission = strtotime($row['last_submission']);
        $timeSince = time() - $lastSubmission;
        if ($timeSince < RATE_LIMIT_SECONDS) {
            return false;
        }
    }
    return true;
}

/**
 * Update rate limit timestamp
 */
function updateRateLimit($pdo, $ip) {
    $stmt = $pdo->prepare("
        INSERT INTO rate_limits (ip_address, last_submission) 
        VALUES (:ip, NOW()) 
        ON DUPLICATE KEY UPDATE last_submission = NOW()
    ");
    $stmt->execute([':ip' => $ip]);
}

/**
 * Generate a new game session token
 */
function handleSessionRequest() {
    $pdo = getDbConnection();
    $ip = getClientIP();
    
    // Generate unique token
    $token = bin2hex(random_bytes(32));
    
    // Store in database
    $stmt = $pdo->prepare("
        INSERT INTO game_sessions (session_token, ip_address) 
        VALUES (:token, :ip)
    ");
    $stmt->execute([':token' => $token, ':ip' => $ip]);
    
    // Clean up old sessions (older than 24 hours)
    $stmt = $pdo->prepare("
        DELETE FROM game_sessions 
        WHERE created_at < DATE_SUB(NOW(), INTERVAL :hours HOUR)
    ");
    $stmt->execute([':hours' => SESSION_EXPIRY_HOURS]);
    
    echo json_encode([
        'success' => true,
        'session_token' => $token
    ]);
}

/**
 * Validate session token
 */
function validateSession($pdo, $token, $ip) {
    if (empty($token)) {
        return ['valid' => false, 'error' => 'Missing session token'];
    }
    
    $stmt = $pdo->prepare("
        SELECT id, ip_address, used, created_at 
        FROM game_sessions 
        WHERE session_token = :token
    ");
    $stmt->execute([':token' => $token]);
    $session = $stmt->fetch();
    
    if (!$session) {
        return ['valid' => false, 'error' => 'Invalid session token'];
    }
    
    if ($session['used']) {
        return ['valid' => false, 'error' => 'Session already used'];
    }

    if ($session['ip_address'] !== $ip) {
        return ['valid' => false, 'error' => 'Session IP mismatch'];
    }
    
    // Check if session is expired
    $createdAt = strtotime($session['created_at']);
    if (time() - $createdAt > SESSION_EXPIRY_HOURS * 3600) {
        return ['valid' => false, 'error' => 'Session expired'];
    }
    
    return ['valid' => true, 'id' => $session['id']];
}

/**
 * Mark session as used
 */
function markSessionUsed($pdo, $token) {
    $stmt = $pdo->prepare("UPDATE game_sessions SET used = TRUE WHERE session_token = :token");
    $stmt->execute([':token' => $token]);
}

/**
 * Handle GET request - fetch highscores
 */
function handleGetRequest() {
    // Check for session request
    if (isset($_GET['action']) && $_GET['action'] === 'session') {
        handleSessionRequest();
        return;
    }
    
    $pdo = getDbConnection();
    
    $stmt = $pdo->prepare("
        SELECT player_name, score, wave_reached, total_waves, 
               hp_remaining, gold_earned, creeps_killed, time_seconds,
               is_victory, submission_date 
        FROM highscores 
        ORDER BY score DESC, wave_reached DESC, submission_date ASC 
        LIMIT 20
    ");
    $stmt->execute();
    $scores = $stmt->fetchAll();
    
    foreach ($scores as &$score) {
        $date = new DateTime($score['submission_date']);
        $score['date'] = $date->format('d/m/Y');
        $score['is_victory'] = (bool)$score['is_victory'];
        $score['hp_remaining'] = (int)$score['hp_remaining'];
        $score['gold_earned'] = (int)$score['gold_earned'];
        $score['creeps_killed'] = (int)$score['creeps_killed'];
        $score['time_seconds'] = (int)$score['time_seconds'];
        unset($score['submission_date']);
    }
    
    echo json_encode([
        'success' => true,
        'scores' => $scores
    ]);
}

/**
 * Handle POST request - submit score
 */
function handlePostRequest() {
    global $rawInput;
    
    $data = json_decode($rawInput, true);
    if (!$data) {
        $data = $_POST;
    }
    
    // Required fields
    $requiredFields = ['name', 'score', 'waveReached', 'totalWaves', 'hpRemaining', 
                       'goldEarned', 'creepsKilled', 'timeSeconds', 'isVictory', 
                       'sessionToken'];
    
    foreach ($requiredFields as $field) {
        if (!isset($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: $field"]);
            return;
        }
    }
    
    // Extract and sanitize data
    $name = sanitizeName($data['name']);
    $score = intval($data['score']);
    $waveReached = intval($data['waveReached']);
    $totalWaves = intval($data['totalWaves']);
    $hpRemaining = intval($data['hpRemaining']);
    $goldEarned = intval($data['goldEarned']);
    $creepsKilled = intval($data['creepsKilled']);
    $timeSeconds = intval($data['timeSeconds']);
    $isVictory = (bool)$data['isVictory'];
    $sessionToken = $data['sessionToken'];
    
    $pdo = getDbConnection();
    $ip = getClientIP();
    
    // Validate session token
    $sessionResult = validateSession($pdo, $sessionToken, $ip);
    if (!$sessionResult['valid']) {
        http_response_code(403);
        echo json_encode(['error' => $sessionResult['error']]);
        return;
    }
    
    // Check rate limit
    if (!checkRateLimit($pdo, $ip)) {
        http_response_code(429);
        echo json_encode(['error' => 'Too many requests. Please wait.']);
        return;
    }
    
    // Validate name
    if (strlen($name) < 1 || strlen($name) > 20) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid name length']);
        return;
    }
    
    // Validate ranges
    if ($score < 0 || $score > MAX_POSSIBLE_SCORE) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid score']);
        return;
    }
    
    if ($waveReached < 1 || $waveReached > MAX_WAVES) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid wave reached']);
        return;
    }

    if ($totalWaves < 1 || $totalWaves > MAX_WAVES) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid total waves']);
        return;
    }
    
    if ($hpRemaining < 0 || $hpRemaining > MAX_CASTLE_HP) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid HP remaining']);
        return;
    }
    
    if ($timeSeconds < MIN_RUN_TIME_SECONDS) {
        http_response_code(400);
        echo json_encode(['error' => 'Run time too short']);
        return;
    }
    
    // Server-side score recalculation (allow small tolerance for floating point)
    $calculatedScore = calculateScore($waveReached, $goldEarned, $hpRemaining, $timeSeconds);
    $scoreDiff = abs($score - $calculatedScore);
    
    if ($scoreDiff > 5) { // Allow 5 point tolerance for floating point differences
        http_response_code(400);
        echo json_encode([
            'error' => 'Score validation failed',
            'submitted' => $score,
            'calculated' => $calculatedScore
        ]);
        return;
    }
    
    try {
        // Mark session as used
        markSessionUsed($pdo, $sessionToken);
        
        // Update rate limit
        updateRateLimit($pdo, $ip);
        
        // Insert score
        $stmt = $pdo->prepare("
            INSERT INTO highscores (
                player_name, score, wave_reached, total_waves, 
                hp_remaining, gold_earned, creeps_killed, time_seconds, 
                is_victory, session_token, ip_address
            ) VALUES (
                :name, :score, :wave_reached, :total_waves,
                :hp_remaining, :gold_earned, :creeps_killed, :time_seconds,
                :is_victory, :session_token, :ip
            )
        ");
        
        $stmt->execute([
            ':name' => $name,
            ':score' => $score,
            ':wave_reached' => $waveReached,
            ':total_waves' => $totalWaves,
            ':hp_remaining' => $hpRemaining,
            ':gold_earned' => $goldEarned,
            ':creeps_killed' => $creepsKilled,
            ':time_seconds' => $timeSeconds,
            ':is_victory' => $isVictory ? 1 : 0,
            ':session_token' => $sessionToken,
            ':ip' => $ip
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Score submitted successfully',
            'id' => $pdo->lastInsertId()
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error']);
    }
}

// Route request
switch ($method) {
    case 'GET':
        handleGetRequest();
        break;
    case 'POST':
        handlePostRequest();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
?>
