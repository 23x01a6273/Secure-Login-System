import bcrypt from 'bcryptjs';
import { User, LoginHistoryEntry } from './types';

// In-Memory Database State with persistent-style clean API access
class SecureDatabase {
  private users: Map<string, User> = new Map();
  private history: LoginHistoryEntry[] = [];
  private mfaCodes: Map<string, { code: string; expiresAt: number; userId: string }> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Generate a secure hash for default pilot seed user "commander" with access pass "control123"
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('control123', salt);

    const commander: User = {
      id: 'usr_commander',
      username: 'commander',
      email: 'commander@fortress.io',
      passwordHash,
      mfaSecret: 'CYBER_SECURE_FORTRESS_KEY_2026',
      mfaEnabled: true,
      createdAt: new Date().toISOString(),
    };

    this.users.set(commander.id, commander);

    // Seed historical attempts
    this.history.push(
      {
        id: 'log_1',
        userId: 'usr_commander',
        username: 'commander',
        timestamp: '2026-05-24 14:22:01',
        location: 'Zurich, CH',
        device: 'Workstation_Alpha_01',
        status: 'Authorized',
      },
      {
        id: 'log_2',
        userId: 'usr_commander',
        username: 'commander',
        timestamp: '2026-05-24 11:45:12',
        location: 'London, UK',
        device: 'Mobile_Client_iOS',
        status: 'Authorized',
      },
      {
        id: 'log_3',
        userId: 'usr_commander',
        username: 'commander',
        timestamp: '2026-05-23 23:10:44',
        location: 'Unknown',
        device: 'Safari 17.0 (MacOS)',
        status: 'Blocked',
      }
    );
  }

  // Parameterized-equivalent user query by Email
  public async findByEmail(email: string): Promise<User | null> {
    const cleanEmail = String(email || '').trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === cleanEmail) {
        return { ...user }; // Return copy to prevent external mutation
      }
    }
    return null;
  }

  // Parameterized-equivalent user query by Username
  public async findByUsername(username: string): Promise<User | null> {
    const cleanUsername = String(username || '').trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === cleanUsername) {
        return { ...user };
      }
    }
    return null;
  }

  // Parameterized lookup or query
  public async findUserByUsernameOrEmail(identity: string): Promise<User | null> {
    const match = String(identity || '').trim();
    if (match.includes('@')) {
      return this.findByEmail(match);
    }
    return this.findByUsername(match);
  }

  // Secure user insertion with bcrypt password hashing
  public async registerUser(username: string, email: string, passwordPlain: string): Promise<User> {
    const cleanUsername = String(username || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();

    // Check duplicate
    const existsEmail = await this.findByEmail(cleanEmail);
    if (existsEmail) {
      throw new Error('Identity link already established for this email address.');
    }

    const existsName = await this.findByUsername(cleanUsername);
    if (existsName) {
      throw new Error('System code is already assigned to this username.');
    }

    // Hash control password safely
    const salt = bcrypt.genSaltSync(12);
    const passwordHash = bcrypt.hashSync(passwordPlain, salt);

    const newUser: User = {
      id: `usr_${Math.random().toString(36).substring(2, 11)}`,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      mfaSecret: Math.random().toString(36).substring(2, 10).toUpperCase(),
      mfaEnabled: true, // Enabled by default for military-grade security!
      createdAt: new Date().toISOString(),
    };

    this.users.set(newUser.id, newUser);
    return { ...newUser };
  }

  // Fetch audit history for user
  public async getHistory(userId: string): Promise<LoginHistoryEntry[]> {
    return this.history
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Log active security checkpoint outcome
  public async recordHistory(
    userId: string,
    username: string,
    location: string,
    device: string,
    status: 'Authorized' | 'Blocked'
  ): Promise<LoginHistoryEntry> {
    const newEntry: LoginHistoryEntry = {
      id: `log_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      username,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      location: location || 'Unknown Node',
      device: device || 'Web Terminal Client',
      status,
    };
    this.history.push(newEntry);
    return newEntry;
  }

  // Create active double-factor authentication token code
  public createMfaCode(userId: string): string {
    // Generate simple 6-digit random code
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minute validity
    this.mfaCodes.set(userId, { code: rawOtp, expiresAt, userId });
    return rawOtp;
  }

  // Check double-factor authentication token code
  public verifyMfaCode(userId: string, codeInput: string): boolean {
    const entry = this.mfaCodes.get(userId);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.mfaCodes.delete(userId);
      return false; // Code expired
    }

    if (entry.code === codeInput.trim()) {
      this.mfaCodes.delete(userId); // Use once only
      return true;
    }

    return false;
  }

  // Retrieve current active code silently to show to Commander during development/acceptance
  public getActiveCode(userId: string): string | null {
    const entry = this.mfaCodes.get(userId);
    if (entry && Date.now() < entry.expiresAt) {
      return entry.code;
    }
    return null;
  }
}

export const db = new SecureDatabase();
