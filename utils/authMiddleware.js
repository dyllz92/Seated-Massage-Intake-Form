const crypto = require('crypto');

/**
 * Simple session-based authentication for analytics dashboard
 */
class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours
    this.CLEANUP_INTERVAL = 60 * 1000; // 1 minute
    this.startCleanupInterval();
  }

  /**
   * Generate a secure session ID
   */
  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create a new session
   */
  createSession() {
    const sessionId = this.generateSessionId();
    const expiresAt = Date.now() + this.SESSION_DURATION;

    this.sessions.set(sessionId, {
      createdAt: Date.now(),
      expiresAt,
      lastActivity: Date.now()
    });

    return sessionId;
  }

  /**
   * Validate a session
   */
  isValidSession(sessionId) {
    if (!sessionId || !this.sessions.has(sessionId)) {
      return false;
    }

    const session = this.sessions.get(sessionId);
    if (session.expiresAt < Date.now()) {
      this.sessions.delete(sessionId);
      return false;
    }

    // Update last activity
    session.lastActivity = Date.now();
    return true;
  }

  /**
   * Invalidate a session
   */
  invalidateSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    let cleaned = 0;

    for (const [id, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[Auth] Cleaned up ${cleaned} expired sessions`);
    }
  }

  /**
   * Start automatic cleanup
   */
  startCleanupInterval() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Stop cleanup
   */
  stopCleanupInterval() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Global session manager
const sessionManager = new SessionManager();

/**
 * Middleware to check authentication
 */
function authMiddleware(req, res, next) {
  const sessionId = req.headers['x-session-id'];

  if (!sessionId || !sessionManager.isValidSession(sessionId)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.sessionId = sessionId;
  next();
}

/**
 * Login handler
 */
async function login(req, res) {
  try {
    const { password } = req.body;
    const correctPassword = process.env.ANALYTICS_PASSWORD;

    if (!correctPassword) {
      return res.status(500).json({ error: 'Analytics password not configured' });
    }

    if (password !== correctPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Create session
    const sessionId = sessionManager.createSession();

    return res.json({
      success: true,
      sessionId,
      expiresIn: sessionManager.SESSION_DURATION / 1000 // In seconds
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * Logout handler
 */
function logout(req, res) {
  if (req.sessionId) {
    sessionManager.invalidateSession(req.sessionId);
  }

  return res.json({ success: true });
}

module.exports = {
  sessionManager,
  authMiddleware,
  login,
  logout
};
