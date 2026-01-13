/**
 * Desert Guardians - Highscore API Client
 * Communicates with the PHP backend for global leaderboard
 */

// API Configuration
const API_URL = 'https://iceweb.ch/dg/api.php';
const SECRET_KEY = 'DesertGuardians2026SecretKey!@#$';

/**
 * Data required for score submission
 */
export interface ScoreSubmission {
  name: string;
  score: number;
  waveReached: number;
  totalWaves: number;
  hpRemaining: number;
  goldEarned: number;
  creepsKilled: number;
  timeSeconds: number;
  isVictory: boolean;
}

/**
 * Score entry from global leaderboard
 */
export interface GlobalScore {
  player_name: string;
  score: number;
  wave_reached: number;
  total_waves: number;
  is_victory: boolean;
  date: string;
}

/**
 * API response types
 */
interface SessionResponse {
  success: boolean;
  session_token?: string;
  error?: string;
}

interface ScoresResponse {
  success: boolean;
  scores?: GlobalScore[];
  error?: string;
}

interface SubmitResponse {
  success: boolean;
  message?: string;
  id?: number;
  error?: string;
}

/**
 * Highscore API client for global leaderboard
 */
export class HighscoreAPI {
  private static sessionToken: string | null = null;
  private static isOnline: boolean = true;

  /**
   * Request a new game session token from the server
   * Call this when a new game starts
   */
  static async requestSession(): Promise<string | null> {
    try {
      const response = await fetch(`${API_URL}?action=session`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        console.warn('HighscoreAPI: Failed to get session, status:', response.status);
        this.isOnline = false;
        return null;
      }
      
      const data: SessionResponse = await response.json();
      
      if (data.success && data.session_token) {
        this.sessionToken = data.session_token;
        this.isOnline = true;
        console.log('HighscoreAPI: Session token received');
        return this.sessionToken;
      } else {
        console.warn('HighscoreAPI: Session request failed:', data.error);
        return null;
      }
    } catch (error) {
      console.warn('HighscoreAPI: Network error getting session:', error);
      this.isOnline = false;
      return null;
    }
  }

  /**
   * Fetch global leaderboard scores
   */
  static async fetchScores(): Promise<GlobalScore[]> {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        console.warn('HighscoreAPI: Failed to fetch scores, status:', response.status);
        return [];
      }
      
      const data: ScoresResponse = await response.json();
      
      if (data.success && data.scores) {
        this.isOnline = true;
        return data.scores;
      } else {
        console.warn('HighscoreAPI: Fetch scores failed:', data.error);
        return [];
      }
    } catch (error) {
      console.warn('HighscoreAPI: Network error fetching scores:', error);
      this.isOnline = false;
      return [];
    }
  }

  /**
   * Submit a score to the global leaderboard
   */
  static async submitScore(submission: ScoreSubmission): Promise<{ success: boolean; error?: string }> {
    if (!this.sessionToken) {
      console.warn('HighscoreAPI: No session token, cannot submit score');
      return { success: false, error: 'No session token. Score saved locally only.' };
    }

    try {
      const hash = await this.generateHash(
        submission.name,
        submission.score,
        submission.waveReached,
        this.sessionToken
      );

      const payload = {
        ...submission,
        sessionToken: this.sessionToken,
        hash
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data: SubmitResponse = await response.json();

      // Consume the session token regardless of result
      this.sessionToken = null;

      if (data.success) {
        this.isOnline = true;
        console.log('HighscoreAPI: Score submitted successfully, id:', data.id);
        return { success: true };
      } else {
        console.warn('HighscoreAPI: Score submission failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.warn('HighscoreAPI: Network error submitting score:', error);
      this.isOnline = false;
      this.sessionToken = null;
      return { success: false, error: 'Network error. Score saved locally only.' };
    }
  }

  /**
   * Generate SHA-256 hash for authentication
   */
  private static async generateHash(
    name: string,
    score: number,
    waveReached: number,
    sessionToken: string
  ): Promise<string> {
    const message = `${name}${score}${waveReached}${sessionToken}${SECRET_KEY}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    
    // Use Web Crypto API for SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get the current session token (for debugging)
   */
  static getSessionToken(): string | null {
    return this.sessionToken;
  }

  /**
   * Check if we have a valid session token
   */
  static hasSession(): boolean {
    return this.sessionToken !== null;
  }

  /**
   * Check if we appear to be online
   */
  static getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Clear the session token (e.g., when returning to menu)
   */
  static clearSession(): void {
    this.sessionToken = null;
  }
}
