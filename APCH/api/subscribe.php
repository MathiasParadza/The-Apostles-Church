<?php
// api/subscribe.php
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// Rate limiting
session_start();
$ip = $_SERVER['REMOTE_ADDR'];
$time = time();
$limit = 5; // 5 attempts per hour
$window = 3600; // 1 hour

if (!isset($_SESSION['rate_limit'][$ip])) {
    $_SESSION['rate_limit'][$ip] = [];
}

// Clean old entries
$_SESSION['rate_limit'][$ip] = array_filter($_SESSION['rate_limit'][$ip], function($timestamp) use ($time, $window) {
    return $timestamp > ($time - $window);
});

if (count($_SESSION['rate_limit'][$ip]) >= $limit) {
    http_response_code(429);
    echo json_encode(['error' => 'Too many attempts. Please try again later.']);
    exit;
}

// Get and validate email
$input = json_decode(file_get_contents('php://input'), true);
$email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL);

if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

// Add to rate limit
$_SESSION['rate_limit'][$ip][] = $time;

// In production, you would:
// 1. Check if email already exists
// 2. Add to database
// 3. Send confirmation email
// 4. Return appropriate response

// For now, simulate success
echo json_encode([
    'success' => true,
    'message' => 'Thank you for subscribing! Please check your email to confirm.'
]);