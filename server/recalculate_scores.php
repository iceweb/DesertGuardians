<?php
/**
 * Interactive HTML score recalculation tool.
 * 
 * Old formula: gold×0.2, time 1.5 pts/sec (cap 3000 or no cap depending on version)
 * New formula: gold×0.25, time 1.0 pts/sec, 60-min baseline, no cap
 * 
 * Open in browser: https://your-server/recalculate_scores.php
 */

// ── Database credentials ──
define('DB_HOST', 'localhost:3306');
define('DB_NAME', 'desertguardians');
define('DB_USER', 'desertguardians');
define('DB_PASS', 'desertguardians#pw');

// ── OLD scoring constants (what the DB scores were calculated with) ──
define('OLD_WAVE_BONUS_POINTS', 100);
define('OLD_GOLD_BONUS_MULTIPLIER', 0.2);
define('OLD_HP_BONUS_POINTS', 100);
define('OLD_TIME_BONUS_MAX_TIME', 4800);      // 80 min
define('OLD_TIME_BONUS_POINTS_PER_SEC', 1.5);
define('OLD_TIME_BONUS_CAP', 3000);
define('OLD_DIFFICULTY_MULTIPLIER_EASY', 0.75);
define('OLD_DIFFICULTY_MULTIPLIER_NORMAL', 1.0);
define('OLD_DIFFICULTY_MULTIPLIER_HARD', 1.25);

// ── NEW scoring constants ──
define('NEW_WAVE_BONUS_POINTS', 100);
define('NEW_GOLD_BONUS_MULTIPLIER', 0.25);
define('NEW_HP_BONUS_POINTS', 100);
define('NEW_TIME_BONUS_MAX_TIME', 3600);      // 60 min
define('NEW_TIME_BONUS_POINTS_PER_SEC', 1.0);
// No cap
define('NEW_DIFFICULTY_MULTIPLIER_EASY', 0.75);
define('NEW_DIFFICULTY_MULTIPLIER_NORMAL', 1.0);
define('NEW_DIFFICULTY_MULTIPLIER_HARD', 1.25);

// Handle AJAX apply request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'apply') {
    header('Content-Type: application/json');
    
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER, DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        
        $updates = json_decode($_POST['updates'], true);
        if (!$updates || !is_array($updates)) {
            echo json_encode(['success' => false, 'error' => 'Invalid update data']);
            exit;
        }
        
        $stmt = $pdo->prepare("UPDATE highscores SET score = :score WHERE id = :id");
        $pdo->beginTransaction();
        
        foreach ($updates as $u) {
            $stmt->execute([':score' => (int)$u['score'], ':id' => (int)$u['id']]);
        }
        
        $pdo->commit();
        echo json_encode(['success' => true, 'count' => count($updates)]);
    } catch (Exception $e) {
        if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Fetch data for display
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    $stmt = $pdo->query("
        SELECT id, player_name, score, wave_reached, total_waves, hp_remaining, 
               gold_earned, creeps_killed, time_seconds, is_victory, difficulty,
               submission_date, client_version
        FROM highscores ORDER BY score DESC
    ");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Database error: " . $e->getMessage());
}

// Calculate all scores
$entries = [];
foreach ($rows as $row) {
    // Old formula components
    $oldWaveScore = $row['wave_reached'] * OLD_WAVE_BONUS_POINTS;
    $oldGoldScore = floor($row['gold_earned'] * OLD_GOLD_BONUS_MULTIPLIER);
    $oldHpBonus = $row['hp_remaining'] * OLD_HP_BONUS_POINTS;

    $oldTimeBonus = 0;
    if ($row['is_victory']) {
        $oldTimeBonus = min(OLD_TIME_BONUS_CAP, floor(max(0, OLD_TIME_BONUS_MAX_TIME - $row['time_seconds']) * OLD_TIME_BONUS_POINTS_PER_SEC));
    }

    switch ($row['difficulty']) {
        case 'Easy':  $oldDiffMult = OLD_DIFFICULTY_MULTIPLIER_EASY; break;
        case 'Hard':  $oldDiffMult = OLD_DIFFICULTY_MULTIPLIER_HARD; break;
        default:      $oldDiffMult = OLD_DIFFICULTY_MULTIPLIER_NORMAL;
    }

    // New formula components
    $waveScore = $row['wave_reached'] * NEW_WAVE_BONUS_POINTS;
    $goldScore = floor($row['gold_earned'] * NEW_GOLD_BONUS_MULTIPLIER);
    $hpBonus = $row['hp_remaining'] * NEW_HP_BONUS_POINTS;

    $newTimeBonus = 0;
    if ($row['is_victory']) {
        $newTimeBonus = floor(max(0, NEW_TIME_BONUS_MAX_TIME - $row['time_seconds']) * NEW_TIME_BONUS_POINTS_PER_SEC);
    }

    switch ($row['difficulty']) {
        case 'Easy':  $diffMult = NEW_DIFFICULTY_MULTIPLIER_EASY; break;
        case 'Hard':  $diffMult = NEW_DIFFICULTY_MULTIPLIER_HARD; break;
        default:      $diffMult = NEW_DIFFICULTY_MULTIPLIER_NORMAL;
    }

    $oldScore = (int)$row['score'];
    $newSubtotal = $waveScore + $goldScore + $hpBonus + $newTimeBonus;
    $newScore = floor($newSubtotal * $diffMult);
    $timeMin = floor($row['time_seconds'] / 60);
    $timeSec = $row['time_seconds'] % 60;

    // Component percentages (before difficulty multiplier)
    $pctWave = $newSubtotal > 0 ? round($waveScore / $newSubtotal * 100) : 0;
    $pctGold = $newSubtotal > 0 ? round($goldScore / $newSubtotal * 100) : 0;
    $pctHp   = $newSubtotal > 0 ? round($hpBonus / $newSubtotal * 100) : 0;
    $pctTime = $newSubtotal > 0 ? round($newTimeBonus / $newSubtotal * 100) : 0;

    $entries[] = [
        'id'           => (int)$row['id'],
        'name'         => htmlspecialchars($row['player_name']),
        'oldScore'     => $oldScore,
        'newScore'     => $newScore,
        'diff'         => $newScore - $oldScore,
        'changed'      => $newScore !== $oldScore,
        'wave'         => $row['wave_reached'] . '/' . $row['total_waves'],
        'waveNum'      => (int)$row['wave_reached'],
        'hp'           => (int)$row['hp_remaining'],
        'gold'         => (int)$row['gold_earned'],
        'kills'        => (int)$row['creeps_killed'],
        'time'         => sprintf("%d:%02d", $timeMin, $timeSec),
        'timeSec'      => (int)$row['time_seconds'],
        'victory'      => (bool)$row['is_victory'],
        'difficulty'   => $row['difficulty'],
        'diffMult'     => $diffMult,
        'date'         => substr($row['submission_date'], 0, 10),
        'version'      => htmlspecialchars($row['client_version'] ?? '?'),
        'oldTimeBonus' => $oldTimeBonus,
        'newTimeBonus' => $newTimeBonus,
        'compWave'     => $waveScore,
        'compGold'     => $goldScore,
        'compHp'       => $hpBonus,
        'compTime'     => $newTimeBonus,
        'pctWave'      => $pctWave,
        'pctGold'      => $pctGold,
        'pctHp'        => $pctHp,
        'pctTime'      => $pctTime,
    ];
}

$changedCount = count(array_filter($entries, fn($e) => $e['changed']));
$unchangedCount = count($entries) - $changedCount;

// Sort by new score for leaderboard
$leaderboard = $entries;
usort($leaderboard, fn($a, $b) => $b['newScore'] - $a['newScore']);

$updatesJson = json_encode(
    array_map(fn($e) => ['id' => $e['id'], 'score' => $e['newScore']],
        array_values(array_filter($entries, fn($e) => $e['changed']))
    )
);
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Desert Guardians — Score Recalculation</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #1a1a2e;
    color: #e0e0e0;
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    padding: 20px;
    min-height: 100vh;
  }
  .container { max-width: 1600px; margin: 0 auto; }
  
  h1 {
    text-align: center;
    color: #ffd700;
    font-size: 28px;
    margin-bottom: 5px;
  }
  .subtitle {
    text-align: center;
    color: #888;
    font-size: 14px;
    margin-bottom: 30px;
  }
  
  .formula-box {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 30px;
  }
  .formula {
    background: #16213e;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 15px 25px;
    text-align: center;
  }
  .formula.old { border-color: #664444; }
  .formula.new { border-color: #446644; }
  .formula h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .formula.old h3 { color: #ff6666; }
  .formula.new h3 { color: #66ff66; }
  .formula p { color: #ccc; font-size: 14px; }
  .formula span { color: #fff; font-weight: bold; }
  
  .stats-bar {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-bottom: 25px;
  }
  .stat {
    background: #16213e;
    border-radius: 6px;
    padding: 10px 20px;
    text-align: center;
  }
  .stat .num { font-size: 24px; font-weight: bold; color: #ffd700; }
  .stat .label { font-size: 12px; color: #888; text-transform: uppercase; }
  
  .tab-bar {
    display: flex;
    gap: 4px;
    margin-bottom: 0;
  }
  .tab {
    background: #16213e;
    color: #888;
    border: 1px solid #333;
    border-bottom: none;
    border-radius: 8px 8px 0 0;
    padding: 10px 24px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s;
  }
  .tab:hover { color: #ccc; background: #1a2744; }
  .tab.active { background: #0f3460; color: #ffd700; border-color: #0f3460; }
  
  .tab-content {
    display: none;
    background: #0f3460;
    border-radius: 0 8px 8px 8px;
    padding: 0;
    overflow-x: auto;
  }
  .tab-content.active { display: block; }
  
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  th {
    background: #16213e;
    color: #ffd700;
    padding: 10px 12px;
    text-align: left;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    position: sticky;
    top: 0;
    white-space: nowrap;
  }
  td {
    padding: 8px 12px;
    border-bottom: 1px solid #1a2744;
    white-space: nowrap;
  }
  tr:hover td { background: rgba(255, 215, 0, 0.05); }
  tr.changed td { background: rgba(255, 215, 0, 0.03); }
  
  .score { font-weight: bold; font-variant-numeric: tabular-nums; }
  .old-score { color: #ff8888; }
  .new-score { color: #88ff88; }
  .diff-pos { color: #66ff66; }
  .diff-neg { color: #ff6666; }
  .diff-zero { color: #666; }
  .rank { color: #ffd700; font-weight: bold; }
  .rank-1 { color: #ffd700; }
  .rank-2 { color: #c0c0c0; }
  .rank-3 { color: #cd7f32; }
  .name { color: #e0e0e0; font-weight: 500; }
  .time-col { color: #88ccff; }
  .diff-H { color: #ff6666; }
  .diff-N { color: #ffcc44; }
  .diff-E { color: #66cc66; }
  .victory { color: #66ff66; }
  .defeat { color: #ff6666; }
  .changed-marker { color: #ffd700; font-weight: bold; }
  .bonus-change { font-size: 12px; }
  .win-icon { font-size: 14px; }
  .version { color: #888; font-size: 12px; }
  
  .pct-bar { display: flex; height: 18px; border-radius: 3px; overflow: hidden; min-width: 120px; font-size: 10px; }
  .pct-bar .seg { display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; }
  .seg-wave { background: #4a90d9; }
  .seg-gold { background: #d4a017; }
  .seg-hp { background: #e05050; }
  .seg-time { background: #50b050; }
  
  .comp-val { font-variant-numeric: tabular-nums; }
  .comp-wave { color: #6ab0ff; }
  .comp-gold { color: #ffd700; }
  .comp-hp { color: #ff8888; }
  .comp-time { color: #88ff88; }
  .comp-pct { color: #888; font-size: 11px; }
  
  .text-right { text-align: right; }
  .text-center { text-align: center; }
  
  .action-bar {
    margin-top: 30px;
    text-align: center;
    padding: 25px;
    background: #16213e;
    border-radius: 8px;
    border: 1px solid #333;
  }
  .action-bar p {
    margin-bottom: 15px;
    font-size: 15px;
    color: #ccc;
  }
  .action-bar .count { color: #ffd700; font-weight: bold; font-size: 18px; }
  
  .btn {
    padding: 12px 40px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    margin: 0 8px;
  }
  .btn-apply {
    background: #28a745;
    color: #fff;
  }
  .btn-apply:hover { background: #34c759; transform: translateY(-1px); }
  .btn-apply:disabled { background: #555; color: #999; cursor: not-allowed; transform: none; }
  .btn-cancel {
    background: #444;
    color: #ccc;
  }
  .btn-cancel:hover { background: #555; }
  
  .result-msg {
    margin-top: 15px;
    padding: 12px 20px;
    border-radius: 6px;
    display: none;
    font-weight: 500;
    font-size: 15px;
  }
  .result-msg.success { display: block; background: #1a3a1a; color: #66ff66; border: 1px solid #2a5a2a; }
  .result-msg.error { display: block; background: #3a1a1a; color: #ff6666; border: 1px solid #5a2a2a; }
</style>
</head>
<body>
<div class="container">
  <h1>&#127984; Desert Guardians &mdash; Score Recalculation</h1>
  <p class="subtitle">Review all score changes before applying to the database</p>
  
  <div class="formula-box">
    <div class="formula old">
      <h3>Old Formula</h3>
      <p>Gold: <span>&times;0.2</span> &middot; Time: <span>1.5 pts/s</span> &middot; Baseline: <span>80 min</span> &middot; Cap: <span>3,000</span></p>
    </div>
    <div class="formula new">
      <h3>New Formula</h3>
      <p>Gold: <span>&times;0.25</span> &middot; Time: <span>1.0 pts/s</span> &middot; Baseline: <span>60 min</span> &middot; Cap: <span>None</span></p>
    </div>
  </div>
  
  <div class="stats-bar">
    <div class="stat">
      <div class="num"><?= count($entries) ?></div>
      <div class="label">Total Scores</div>
    </div>
    <div class="stat">
      <div class="num" style="color: #66ff66;"><?= $changedCount ?></div>
      <div class="label">Changed</div>
    </div>
    <div class="stat">
      <div class="num" style="color: #888;"><?= $unchangedCount ?></div>
      <div class="label">Unchanged</div>
    </div>
  </div>
  
  <div class="tab-bar">
    <div class="tab active" onclick="switchTab(this, 'changes')">&#128202; Score Changes</div>
    <div class="tab" onclick="switchTab(this, 'balance')">&#9878; Balance</div>
    <div class="tab" onclick="switchTab(this, 'leaderboard')">&#127942; Final Leaderboard</div>
  </div>
  
  <div id="tab-changes" class="tab-content active">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Player</th>
          <th>Diff</th>
          <th class="text-right">Old Score</th>
          <th class="text-right">New Score</th>
          <th class="text-right">Change</th>
          <th class="text-center">Time</th>
          <th class="text-center">Win</th>
          <th class="text-right">Old T.Bonus</th>
          <th class="text-right">New T.Bonus</th>
        </tr>
      </thead>
      <tbody>
        <?php $rank = 0; foreach ($entries as $e): $rank++; ?>
        <tr class="<?= $e['changed'] ? 'changed' : '' ?>">
          <td class="rank"><?= $rank ?></td>
          <td class="name"><?= $e['name'] ?></td>
          <td class="diff-<?= $e['difficulty'][0] ?>"><?= $e['difficulty'][0] ?></td>
          <td class="text-right score old-score"><?= number_format($e['oldScore']) ?></td>
          <td class="text-right score new-score"><?= number_format($e['newScore']) ?></td>
          <td class="text-right <?= $e['diff'] > 0 ? 'diff-pos' : ($e['diff'] < 0 ? 'diff-neg' : 'diff-zero') ?>">
            <?= $e['diff'] > 0 ? '+' : '' ?><?= number_format($e['diff']) ?>
          </td>
          <td class="text-center time-col"><?= $e['time'] ?></td>
          <td class="text-center win-icon"><?= $e['victory'] ? '<span class="victory">&#10003;</span>' : '<span class="defeat">&#10007;</span>' ?></td>
          <td class="text-right bonus-change"><?= number_format($e['oldTimeBonus']) ?></td>
          <td class="text-right bonus-change" style="color: <?= $e['newTimeBonus'] > $e['oldTimeBonus'] ? '#66ff66' : ($e['newTimeBonus'] < $e['oldTimeBonus'] ? '#ff6666' : '#aaa') ?>">
            <?= number_format($e['newTimeBonus']) ?>
          </td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  
  <div id="tab-balance" class="tab-content">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Player</th>
          <th>Diff</th>
          <th class="text-right">Score</th>
          <th class="text-right">Wave Pts</th>
          <th class="text-right">Gold Pts</th>
          <th class="text-right">HP Pts</th>
          <th class="text-right">Time Pts</th>
          <th class="text-right">&times;Mult</th>
          <th>Distribution</th>
          <th class="text-center">Time</th>
          <th class="text-center">Win</th>
        </tr>
      </thead>
      <tbody>
        <?php $rank = 0; foreach ($leaderboard as $e): $rank++; ?>
        <tr>
          <td class="rank <?= $rank <= 3 ? 'rank-' . $rank : '' ?>"><?= $rank ?></td>
          <td class="name"><?= $e['name'] ?></td>
          <td class="diff-<?= $e['difficulty'][0] ?>"><?= $e['difficulty'][0] ?></td>
          <td class="text-right score new-score"><?= number_format($e['newScore']) ?></td>
          <td class="text-right comp-val comp-wave"><?= number_format($e['compWave']) ?> <span class="comp-pct">(<?= $e['pctWave'] ?>%)</span></td>
          <td class="text-right comp-val comp-gold"><?= number_format($e['compGold']) ?> <span class="comp-pct">(<?= $e['pctGold'] ?>%)</span></td>
          <td class="text-right comp-val comp-hp"><?= number_format($e['compHp']) ?> <span class="comp-pct">(<?= $e['pctHp'] ?>%)</span></td>
          <td class="text-right comp-val comp-time"><?= number_format($e['compTime']) ?> <span class="comp-pct">(<?= $e['pctTime'] ?>%)</span></td>
          <td class="text-right" style="color: #ccc;">&times;<?= $e['diffMult'] ?></td>
          <td>
            <div class="pct-bar">
              <?php if ($e['pctWave'] > 0): ?><div class="seg seg-wave" style="width:<?= $e['pctWave'] ?>%" title="Wave <?= $e['pctWave'] ?>%"><?= $e['pctWave'] > 8 ? $e['pctWave'].'%' : '' ?></div><?php endif; ?>
              <?php if ($e['pctGold'] > 0): ?><div class="seg seg-gold" style="width:<?= $e['pctGold'] ?>%" title="Gold <?= $e['pctGold'] ?>%"><?= $e['pctGold'] > 8 ? $e['pctGold'].'%' : '' ?></div><?php endif; ?>
              <?php if ($e['pctHp'] > 0): ?><div class="seg seg-hp" style="width:<?= $e['pctHp'] ?>%" title="HP <?= $e['pctHp'] ?>%"><?= $e['pctHp'] > 8 ? $e['pctHp'].'%' : '' ?></div><?php endif; ?>
              <?php if ($e['pctTime'] > 0): ?><div class="seg seg-time" style="width:<?= $e['pctTime'] ?>%" title="Time <?= $e['pctTime'] ?>%"><?= $e['pctTime'] > 8 ? $e['pctTime'].'%' : '' ?></div><?php endif; ?>
            </div>
          </td>
          <td class="text-center time-col"><?= $e['time'] ?></td>
          <td class="text-center win-icon"><?= $e['victory'] ? '<span class="victory">&#10003;</span>' : '<span class="defeat">&#10007;</span>' ?></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
    <div style="padding: 15px 20px; background: #16213e; display: flex; gap: 25px; align-items: center; font-size: 13px;">
      <span style="color: #888;">Legend:</span>
      <span><span style="display:inline-block;width:12px;height:12px;background:#4a90d9;border-radius:2px;vertical-align:middle;"></span> Wave (<?= NEW_WAVE_BONUS_POINTS ?> pts/wave)</span>
      <span><span style="display:inline-block;width:12px;height:12px;background:#d4a017;border-radius:2px;vertical-align:middle;"></span> Gold (&times;<?= NEW_GOLD_BONUS_MULTIPLIER ?>)</span>
      <span><span style="display:inline-block;width:12px;height:12px;background:#e05050;border-radius:2px;vertical-align:middle;"></span> HP (<?= NEW_HP_BONUS_POINTS ?> pts/HP)</span>
      <span><span style="display:inline-block;width:12px;height:12px;background:#50b050;border-radius:2px;vertical-align:middle;"></span> Time (<?= NEW_TIME_BONUS_POINTS_PER_SEC ?> pts/sec, <?= NEW_TIME_BONUS_MAX_TIME/60 ?>-min baseline)</span>
    </div>
  </div>

  <div id="tab-leaderboard" class="tab-content">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Player</th>
          <th>Diff</th>
          <th class="text-right">Score</th>
          <th class="text-center">Wave</th>
          <th class="text-center">HP</th>
          <th class="text-right">Gold</th>
          <th class="text-right">Kills</th>
          <th class="text-center">Time</th>
          <th class="text-center">Win</th>
          <th>Date</th>
          <th>Ver</th>
        </tr>
      </thead>
      <tbody>
        <?php $rank = 0; foreach ($leaderboard as $e): $rank++; ?>
        <tr class="<?= $e['changed'] ? 'changed' : '' ?>">
          <td class="rank <?= $rank <= 3 ? 'rank-' . $rank : '' ?>"><?= $rank ?></td>
          <td class="name"><?= $e['name'] ?></td>
          <td class="diff-<?= $e['difficulty'][0] ?>"><?= $e['difficulty'][0] ?></td>
          <td class="text-right score new-score">
            <?= number_format($e['newScore']) ?>
            <?php if ($e['changed']): ?><span class="changed-marker">*</span><?php endif; ?>
          </td>
          <td class="text-center"><?= $e['wave'] ?></td>
          <td class="text-center"><?= $e['hp'] ?></td>
          <td class="text-right"><?= number_format($e['gold'] / 1000, 1) ?>K</td>
          <td class="text-right"><?= number_format($e['kills']) ?></td>
          <td class="text-center time-col"><?= $e['time'] ?></td>
          <td class="text-center win-icon"><?= $e['victory'] ? '<span class="victory">&#10003;</span>' : '<span class="defeat">&#10007;</span>' ?></td>
          <td class="version"><?= $e['date'] ?></td>
          <td class="version"><?= $e['version'] ?></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  
  <?php if ($changedCount > 0): ?>
  <div class="action-bar" id="action-bar">
    <p><span class="count"><?= $changedCount ?></span> score(s) will be updated in the database.</p>
    <button class="btn btn-apply" id="btn-apply" onclick="applyChanges()">&#10003; Apply Changes</button>
    <button class="btn btn-cancel" onclick="location.reload()">&#8635; Reload</button>
    <div class="result-msg" id="result-msg"></div>
  </div>
  <?php else: ?>
  <div class="action-bar">
    <p>All scores already match the new formula. No changes needed.</p>
  </div>
  <?php endif; ?>
</div>

<script>
const updatesData = <?= $updatesJson ?>;

function switchTab(el, tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  el.classList.add('active');
}

function applyChanges() {
  const btn = document.getElementById('btn-apply');
  const msg = document.getElementById('result-msg');
  
  if (!confirm('Are you sure you want to update ' + updatesData.length + ' scores in the database?\n\nThis cannot be undone.')) {
    return;
  }
  
  btn.disabled = true;
  btn.textContent = 'Applying...';
  msg.style.display = 'none';
  
  const form = new FormData();
  form.append('action', 'apply');
  form.append('updates', JSON.stringify(updatesData));
  
  fetch(window.location.href, { method: 'POST', body: form })
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        msg.className = 'result-msg success';
        msg.textContent = '\u2713 Successfully updated ' + data.count + ' scores. Reload to verify.';
        msg.style.display = 'block';
        btn.textContent = '\u2713 Applied';
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    })
    .catch(err => {
      msg.className = 'result-msg error';
      msg.textContent = '\u2717 Error: ' + err.message;
      msg.style.display = 'block';
      btn.disabled = false;
      btn.textContent = '\u2713 Apply Changes';
    });
}
</script>
</body>
</html>
