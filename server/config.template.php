<?php
/**
 * Desert Guardians - Highscore API Configuration Template
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this file to 'config.php'
 * 2. Replace the placeholder values with your actual configuration
 * 3. config.php is in .gitignore and will NOT be committed
 */

// Database Configuration
define('DB_HOST', 'localhost:3306');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');

// Security - MUST match the client's SECRET_KEY in HighscoreAPI.ts
define('SECRET_KEY', 'your-secret-key-here');

// Scoring constants (must match client GAME_CONFIG)
define('WAVE_BONUS_POINTS', 100);
define('GOLD_BONUS_MULTIPLIER', 0.2);
define('HP_BONUS_POINTS', 100);
define('MAX_TIME_MULTIPLIER', 1.5);
define('OPTIMAL_TIME_SECONDS', 900);

// Validation limits
define('MAX_POSSIBLE_SCORE', 25000);    // Theoretical max ~15,000, some headroom
define('MIN_RUN_TIME_SECONDS', 30);     // Minimum game duration
define('RATE_LIMIT_SECONDS', 30);       // Between submissions per IP
define('MAX_WAVES', 35);                // Total waves in game
define('MAX_CASTLE_HP', 25);            // Max castle HP
define('SESSION_EXPIRY_HOURS', 24);     // Session token expiry

// Disable error display in production
ini_set('display_errors', 0);
error_reporting(0);
?>
