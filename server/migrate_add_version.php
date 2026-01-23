<?php
/**
 * Desert Guardians - Database Migration: Add Client Version
 * Run this ONCE on existing databases to add the client_version column
 * 
 * This sets existing scores to 'BETA' and new scores will have the actual version.
 */

require_once 'config.php';

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
    
    // Check if column already exists
    $stmt = $pdo->query("SHOW COLUMNS FROM highscores LIKE 'client_version'");
    $columnExists = $stmt->fetch();
    
    if ($columnExists) {
        echo "⚠️  Column 'client_version' already exists in highscores table.\n";
        echo "    No changes made.\n";
    } else {
        // Add client_version column with 'BETA' as default for existing rows
        $pdo->exec("ALTER TABLE highscores ADD COLUMN client_version VARCHAR(10) DEFAULT 'BETA' AFTER difficulty");
        echo "✓ Added 'client_version' column to highscores table.\n";
        echo "✓ Existing scores marked as 'BETA'.\n";
    }
    
    echo "\n✓ Migration complete!\n";
    echo "⚠️  IMPORTANT: Delete this file after running!\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
