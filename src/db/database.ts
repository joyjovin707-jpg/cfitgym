// @ts-ignore
import initSqlJs from 'sql.js/dist/sql-asm.js';
import type { Database } from 'sql.js';
import { SCHEMA_SQL, generateSeedSql } from './schemaText.ts';
import {
  AdminUser,
  StaffUser,
  Trainer,
  Member,
  AttendanceRecord,
  PaymentRecord,
  GymClass,
  ClassBooking,
  DashboardStats,
  SqlQueryResult
} from '../types/index.ts';

const DB_STORAGE_KEY = 'cfit_sqlite_db_v2';

class GymDatabase {
  private SQL: any = null;
  private db: Database | null = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<void> | null = null;
  private subscribers: Set<() => void> = new Set();

  constructor() {
    this.init();
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  private notify() {
    this.persist();
    for (const cb of this.subscribers) {
      try {
        cb();
      } catch (err) {
        console.error('Database subscriber error:', err);
      }
    }
  }

  private async loadSqlEngine(): Promise<any> {
    if (this.SQL) return this.SQL;
    try {
      this.SQL = await initSqlJs();
      return this.SQL;
    } catch (err) {
      console.error('Failed to initialize sql-asm engine:', err);
      throw err;
    }
  }

  public async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        const SQL = await this.loadSqlEngine();

        // Try to load from localStorage
        let savedBase64: string | null = null;
        if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
          try {
            savedBase64 = window.localStorage.getItem(DB_STORAGE_KEY);
          } catch (e) {
            console.warn('Could not read from localStorage:', e);
          }
        }
        if (savedBase64) {
          try {
            const binary = Uint8Array.from(atob(savedBase64), (c) => c.charCodeAt(0));
            this.db = new SQL.Database(binary);
            // Convert all attendance records to Reception Desk
            try {
              this.db?.run(`UPDATE attendance SET check_in_method = 'Reception Desk' WHERE check_in_method != 'Reception Desk'`);
            } catch {
              // Table might not exist yet if empty db
            }
            // Ensure class_bookings table exists and is migrated
            try {
              this.db?.run(`
                CREATE TABLE IF NOT EXISTS class_bookings (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  class_id INTEGER NOT NULL,
                  member_id TEXT NOT NULL,
                  booked_at TEXT NOT NULL,
                  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
                  FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
                  UNIQUE(class_id, member_id)
                );
              `);
              const cbCountRes = this.db?.exec('SELECT COUNT(*) FROM class_bookings');
              if (cbCountRes && cbCountRes.length > 0 && Number(cbCountRes[0].values[0][0]) === 0) {
                this.db?.run(`
                  INSERT OR IGNORE INTO class_bookings (class_id, member_id, booked_at)
                  VALUES (1, 'GYM-0142', '2026-09-25 10:00:00'),
                         (1, 'GYM-0071', '2026-09-25 11:30:00'),
                         (1, 'GYM-0057', '2026-09-25 14:15:00'),
                         (2, 'GYM-0198', '2026-09-25 09:00:00'),
                         (2, 'GYM-0311', '2026-09-25 10:20:00'),
                         (2, 'GYM-0233', '2026-09-25 12:45:00'),
                         (3, 'GYM-0198', '2026-09-25 08:30:00'),
                         (3, 'GYM-0233', '2026-09-25 15:10:00'),
                         (4, 'GYM-0142', '2026-09-25 16:00:00'),
                         (4, 'GYM-0311', '2026-09-25 16:30:00'),
                         (5, 'GYM-0071', '2026-09-25 17:00:00'),
                         (5, 'GYM-0057', '2026-09-25 17:15:00');
                  UPDATE classes SET booked_count = (SELECT COUNT(*) FROM class_bookings WHERE class_id = classes.id);
                `);
              }
            } catch {
              // Ignore migration error
            }

            // Ensure staff_users table exists and is migrated
            try {
              this.db?.run(`
                CREATE TABLE IF NOT EXISTS staff_users (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  username TEXT UNIQUE NOT NULL,
                  password TEXT NOT NULL,
                  full_name TEXT NOT NULL,
                  role TEXT NOT NULL DEFAULT 'Staff',
                  email TEXT,
                  phone TEXT,
                  shift TEXT DEFAULT 'Morning',
                  status TEXT DEFAULT 'Active',
                  can_manage_members INTEGER DEFAULT 1,
                  can_process_payments INTEGER DEFAULT 1,
                  can_manage_classes INTEGER DEFAULT 1,
                  can_manage_trainers INTEGER DEFAULT 1,
                  created_at TEXT NOT NULL
                );
              `);
              const suCountRes = this.db?.exec('SELECT COUNT(*) FROM staff_users');
              if (suCountRes && suCountRes.length > 0 && Number(suCountRes[0].values[0][0]) === 0) {
                this.db?.run(`
                  INSERT OR IGNORE INTO staff_users (id, username, password, full_name, role, email, phone, shift, status, can_manage_members, can_process_payments, can_manage_classes, can_manage_trainers, created_at)
                  VALUES (1, 'admin', 'admin123', 'Gym Administrator', 'Admin', 'admin@cfitgym.com', '+91 98470 11223', 'Full Day', 'Active', 1, 1, 1, 1, '2025-01-01 00:00:00'),
                         (2, 'staff', 'staff123', 'Reception Frontdesk', 'Staff', 'reception@cfitgym.com', '+91 98470 44556', 'Morning', 'Active', 1, 1, 1, 1, '2025-03-15 08:30:00'),
                         (3, 'vishnu', 'staff123', 'Vishnu Nair', 'Staff', 'vishnu.nair@cfitgym.com', '+91 94471 22334', 'Evening', 'Active', 1, 1, 1, 1, '2025-06-20 14:00:00'),
                         (4, 'anjali', 'staff123', 'Anjali Menon', 'Staff', 'anjali.m@cfitgym.com', '+91 98950 33445', 'Morning', 'Active', 1, 1, 1, 0, '2025-08-10 09:15:00');
                `);
              }
              this.db?.run(`
                INSERT OR IGNORE INTO admin (username, password, role) VALUES ('admin', 'admin123', 'Admin access');
                INSERT OR IGNORE INTO admin (username, password, role) VALUES ('staff', 'staff123', 'Staff access');
              `);
              this.persist();
            } catch {
              // Ignore migration error
            }
          } catch (e) {
            console.warn('Failed to parse saved database, creating fresh one:', e);
            const freshDb = new SQL.Database();
            this.executeSqlSchema(freshDb, generateSeedSql(new Date()));
            this.db = freshDb;
            this.persist();
          }
        } else {
          const freshDb = new SQL.Database();
          this.executeSqlSchema(freshDb, generateSeedSql(new Date()));
          this.db = freshDb;
          this.persist();
        }
      } catch (err) {
        console.error('Failed to initialize SQLite database:', err);
        throw err;
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initPromise;
  }

  private executeSqlSchema(db: Database, schema: string) {
    const lines = schema.split('\n');
    let statement = '';
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith('--') || line.length === 0) continue;
      statement += rawLine + '\n';
      if (line.endsWith(';')) {
        try {
          db.run(statement);
        } catch (e) {
          console.warn('Error running SQL statement during schema init:', statement, e);
        }
        statement = '';
      }
    }
  }

  public persist() {
    if (!this.db) return;
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
    try {
      const binary = this.db.export();
      let binaryString = '';
      const len = binary.byteLength;
      for (let i = 0; i < len; i++) {
        binaryString += String.fromCharCode(binary[i]);
      }
      window.localStorage.setItem(DB_STORAGE_KEY, btoa(binaryString));
    } catch (e) {
      console.warn('Unable to persist database to localStorage:', e);
    }
  }

  public async getDb(): Promise<Database> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  public async resetToDefaults(): Promise<void> {
    const SQL = await this.loadSqlEngine();
    const freshDb = new SQL.Database();
    this.executeSqlSchema(freshDb, generateSeedSql(new Date()));
    this.db = freshDb;
    this.persist();
    this.notify();
  }

  public exportDbFile(): Uint8Array | null {
    if (!this.db) return null;
    return this.db.export();
  }

  public async importDbFile(data: Uint8Array): Promise<void> {
    const SQL = await this.loadSqlEngine();
    this.db = new SQL.Database(data);
    try {
      this.db?.run(`UPDATE attendance SET check_in_method = 'Reception Desk' WHERE check_in_method != 'Reception Desk'`);
    } catch {
      // Table might not exist yet
    }
    this.persist();
    this.notify();
  }

  public executeRaw(sqlText: string): SqlQueryResult {
    if (!this.db) {
      return { columns: [], values: [], error: 'Database not initialized yet.' };
    }
    const startTime = performance.now();
    try {
      const results = this.db.exec(sqlText);
      const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
      
      // If it modified data, persist
      if (!sqlText.trim().toUpperCase().startsWith('SELECT')) {
        this.notify();
      }

      if (results.length > 0) {
        return {
          columns: results[0].columns,
          values: results[0].values,
          executionTimeMs,
        };
      }
      return {
        columns: ['Status'],
        values: [['Query executed successfully with 0 result sets.']],
        executionTimeMs,
      };
    } catch (e: any) {
      return {
        columns: [],
        values: [],
        error: e?.message || String(e),
        executionTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
      };
    }
  }

  // ==================== DASHBOARD STATS ====================
  public async getDashboardStats(): Promise<DashboardStats> {
    const db = await this.getDb();
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    // 1. Active members
    const activeRes = db.exec("SELECT COUNT(*) AS count FROM members WHERE status = 'Active'");
    const activeMembers = (activeRes[0]?.values[0]?.[0] as number) || 0;

    // 2. Checked in today (dynamically matches today's date YYYY-MM-DD)
    const checkedRes = db.exec(`SELECT COUNT(*) FROM attendance WHERE check_in_time LIKE '${todayStr}%'`);
    const checkedInToday = (checkedRes[0]?.values[0]?.[0] as number) || 0;

    // 3. Revenue MTD
    const revRes = db.exec("SELECT SUM(amount) FROM payments WHERE payment_status = 'Paid'");
    const revenueMtd = (revRes[0]?.values[0]?.[0] as number) || 0;

    // 4. Expiring within 7 days (members marked Expiring or expiring within the next 7 days)
    const expRes = db.exec(`
      SELECT COUNT(*) FROM members 
      WHERE status = 'Expiring' 
         OR (status = 'Active' AND expiry_date <= date('${todayStr}', '+7 days') AND expiry_date >= '${todayStr}')
    `);
    const expiringCount = (expRes[0]?.values[0]?.[0] as number) || 0;

    // 5. Expiring members list
    const expMembersRes = db.exec(`
      SELECT m.id, m.member_id, m.full_name, m.plan_type, m.trainer_id, m.join_date, m.expiry_date, m.status, t.full_name as trainer_name
      FROM members m
      LEFT JOIN trainers t ON m.trainer_id = t.id
      WHERE m.status = 'Expiring'
         OR (m.status = 'Active' AND m.expiry_date <= date('${todayStr}', '+7 days') AND m.expiry_date >= '${todayStr}')
      ORDER BY m.expiry_date ASC
      LIMIT 5
    `);
    const expiringMembers: Member[] = [];
    if (expMembersRes.length > 0) {
      for (const row of expMembersRes[0].values) {
        expiringMembers.push({
          id: Number(row[0]),
          member_id: String(row[1]),
          full_name: String(row[2]),
          plan_type: String(row[3]),
          trainer_id: row[4] ? Number(row[4]) : null,
          join_date: String(row[5]),
          expiry_date: String(row[6]),
          status: row[7] as any,
          trainer_name: row[8] ? String(row[8]) : undefined,
        });
      }
    }

    // 6. Today's classes
    const classes = await this.getClasses();

    // 7. Last 7 days checkin distribution ending on today
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const checkinsLast7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const dayLabel = dayNames[d.getDay()];
      const dayRes = db.exec(`SELECT COUNT(*) FROM attendance WHERE check_in_time LIKE '${dStr}%'`);
      const rawCount = (dayRes[0]?.values[0]?.[0] as number) || 0;
      const count = rawCount > 0 
        ? rawCount 
        : (i === 0 ? checkedInToday : Math.floor(120 + ((d.getDay() * 23) % 75)));
      const percentage = Math.min(100, Math.max(15, Math.round((count / 210) * 100)));
      checkinsLast7Days.push({ day: dayLabel, count, percentage });
    }

    return {
      activeMembers,
      checkedInToday,
      revenueMtd,
      expiringCount,
      checkinsLast7Days,
      todayClasses: classes.slice(0, 4),
      expiringMembers,
    };
  }

  // ==================== MEMBERS ====================
  public async getMembers(search?: string, planFilter?: string, statusFilter?: string): Promise<Member[]> {
    const db = await this.getDb();
    let query = `
      SELECT m.id, m.member_id, m.full_name, m.plan_type, m.trainer_id, m.join_date, m.expiry_date, m.status, t.full_name AS trainer_name
      FROM members m
      LEFT JOIN trainers t ON m.trainer_id = t.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      query += ` AND (LOWER(m.full_name) LIKE '${term}' OR LOWER(m.member_id) LIKE '${term}')`;
    }

    if (planFilter && planFilter !== 'All plans') {
      query += ` AND m.plan_type = '${planFilter}'`;
    }

    if (statusFilter && statusFilter !== 'All status') {
      query += ` AND m.status = '${statusFilter}'`;
    }

    query += ' ORDER BY m.id DESC';

    const res = db.exec(query);
    if (res.length === 0) return [];

    return res[0].values.map((row) => ({
      id: Number(row[0]),
      member_id: String(row[1]),
      full_name: String(row[2]),
      plan_type: String(row[3]),
      trainer_id: row[4] ? Number(row[4]) : null,
      join_date: String(row[5]),
      expiry_date: String(row[6]),
      status: row[7] as any,
      trainer_name: row[8] ? String(row[8]) : 'Unassigned',
    }));
  }

  public async createMember(member: Omit<Member, 'id'>): Promise<void> {
    const db = await this.getDb();
    const trainerVal = member.trainer_id ? member.trainer_id : 'NULL';
    const sql = `
      INSERT INTO members (member_id, full_name, plan_type, trainer_id, join_date, expiry_date, status)
      VALUES ('${member.member_id.replace(/'/g, "''")}', '${member.full_name.replace(/'/g, "''")}', '${member.plan_type}', ${trainerVal}, '${member.join_date}', '${member.expiry_date}', '${member.status}')
    `;
    db.run(sql);
    this.notify();
  }

  public async updateMember(id: number, member: Partial<Member>): Promise<void> {
    const db = await this.getDb();
    const sets: string[] = [];
    if (member.member_id) sets.push(`member_id = '${member.member_id.replace(/'/g, "''")}'`);
    if (member.full_name) sets.push(`full_name = '${member.full_name.replace(/'/g, "''")}'`);
    if (member.plan_type) sets.push(`plan_type = '${member.plan_type}'`);
    if (member.trainer_id !== undefined) sets.push(`trainer_id = ${member.trainer_id ? member.trainer_id : 'NULL'}`);
    if (member.join_date) sets.push(`join_date = '${member.join_date}'`);
    if (member.expiry_date) sets.push(`expiry_date = '${member.expiry_date}'`);
    if (member.status) sets.push(`status = '${member.status}'`);

    if (sets.length > 0) {
      db.run(`UPDATE members SET ${sets.join(', ')} WHERE id = ${id}`);
      this.notify();
    }
  }

  public async deleteMember(id: number): Promise<void> {
    const db = await this.getDb();
    // Retrieve member_id code before deletion to clean up attendance and payments
    const res = db.exec(`SELECT member_id FROM members WHERE id = ${id}`);
    if (res.length > 0 && res[0].values.length > 0) {
      const code = String(res[0].values[0][0]).replace(/'/g, "''");
      db.run(`DELETE FROM attendance WHERE member_id = '${code}'`);
      db.run(`DELETE FROM payments WHERE member_id = '${code}'`);
    }
    db.run(`DELETE FROM members WHERE id = ${id}`);
    this.notify();
  }

  // ==================== TRAINERS ====================
  public async getTrainers(): Promise<Trainer[]> {
    const db = await this.getDb();
    const sql = `
      SELECT t.id, t.trainer_code, t.full_name, t.specialty, t.rating,
             (SELECT COUNT(*) FROM members m WHERE m.trainer_id = t.id) AS clients_assigned,
             (SELECT COUNT(*) FROM classes c WHERE c.trainer_id = t.id) AS classes_count
      FROM trainers t
      ORDER BY t.id ASC
    `;
    const res = db.exec(sql);
    if (res.length === 0) return [];

    return res[0].values.map((row) => ({
      id: Number(row[0]),
      trainer_code: String(row[1]),
      full_name: String(row[2]),
      specialty: String(row[3]),
      rating: Number(row[4]),
      clients_assigned: Number(row[5] || 0),
      sessions_this_week: Number(row[6] || 0) * 4 + 6, // dynamic simulated weekly sessions
    }));
  }

  public async createTrainer(trainer: Omit<Trainer, 'id'>): Promise<void> {
    const db = await this.getDb();
    const sql = `
      INSERT INTO trainers (trainer_code, full_name, specialty, rating)
      VALUES ('${trainer.trainer_code.replace(/'/g, "''")}', '${trainer.full_name.replace(/'/g, "''")}', '${trainer.specialty.replace(/'/g, "''")}', ${trainer.rating || 5.0})
    `;
    db.run(sql);
    this.notify();
  }

  public async updateTrainer(id: number, trainer: Partial<Trainer>): Promise<void> {
    const db = await this.getDb();
    const sets: string[] = [];
    if (trainer.trainer_code) sets.push(`trainer_code = '${trainer.trainer_code.replace(/'/g, "''")}'`);
    if (trainer.full_name) sets.push(`full_name = '${trainer.full_name.replace(/'/g, "''")}'`);
    if (trainer.specialty) sets.push(`specialty = '${trainer.specialty.replace(/'/g, "''")}'`);
    if (trainer.rating !== undefined) sets.push(`rating = ${trainer.rating}`);

    if (sets.length > 0) {
      db.run(`UPDATE trainers SET ${sets.join(', ')} WHERE id = ${id}`);
      this.notify();
    }
  }

  public async deleteTrainer(id: number): Promise<void> {
    const db = await this.getDb();
    // Reassign or clean up classes associated with this trainer
    const otherTrainers = db.exec(`SELECT id FROM trainers WHERE id != ${id} LIMIT 1`);
    if (otherTrainers.length > 0 && otherTrainers[0].values.length > 0) {
      const fallbackTrainerId = Number(otherTrainers[0].values[0][0]);
      db.run(`UPDATE classes SET trainer_id = ${fallbackTrainerId} WHERE trainer_id = ${id}`);
    } else {
      db.run(`DELETE FROM classes WHERE trainer_id = ${id}`);
    }
    // Disassociate trainer from members
    db.run(`UPDATE members SET trainer_id = NULL WHERE trainer_id = ${id}`);
    db.run(`DELETE FROM trainers WHERE id = ${id}`);
    this.notify();
  }

  // ==================== ATTENDANCE ====================
  public async getAttendanceLogs(): Promise<AttendanceRecord[]> {
    const db = await this.getDb();
    const sql = `
      SELECT a.id, a.member_id, a.check_in_time, a.check_out_time, a.check_in_method, m.full_name as member_name
      FROM attendance a
      LEFT JOIN members m ON a.member_id = m.member_id
      ORDER BY a.id DESC
    `;
    const res = db.exec(sql);
    if (res.length === 0) return [];

    return res[0].values.map((row) => {
      const checkIn = String(row[2]);
      const checkOut = row[3] ? String(row[3]) : null;
      let duration = 'In progress';

      if (checkOut) {
        try {
          const inDate = new Date(checkIn.replace(' ', 'T'));
          const outDate = new Date(checkOut.replace(' ', 'T'));
          const diffMs = outDate.getTime() - inDate.getTime();
          if (diffMs >= 0) {
            const hrs = Math.floor(diffMs / (1000 * 60 * 60));
            const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            if (hrs > 0) {
              duration = `${hrs}h ${mins}m`;
            } else if (mins > 0) {
              duration = `${mins}m`;
            } else {
              duration = '< 1m';
            }
          } else {
            duration = 'Completed';
          }
        } catch {
          duration = 'Completed';
        }
      }

      return {
        id: Number(row[0]),
        member_id: String(row[1]),
        check_in_time: checkIn,
        check_out_time: checkOut,
        check_in_method: 'Reception Desk',
        member_name: row[5] ? String(row[5]) : String(row[1]),
        duration,
      };
    });
  }

  public async checkInMember(member_id: string, method: string = 'Reception Desk'): Promise<void> {
    const db = await this.getDb();
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const check_in_time = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const cleanMethod = (method || 'Reception Desk').trim();
    
    const sql = `
      INSERT INTO attendance (member_id, check_in_time, check_out_time, check_in_method)
      VALUES ('${member_id.replace(/'/g, "''")}', '${check_in_time}', NULL, '${cleanMethod.replace(/'/g, "''")}')
    `;
    db.run(sql);
    this.notify();
  }

  public async checkOutMember(id: number): Promise<void> {
    const db = await this.getDb();
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const check_out_time = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    db.run(`UPDATE attendance SET check_out_time = '${check_out_time}' WHERE id = ${id}`);
    this.notify();
  }

  // ==================== PAYMENTS ====================
  public async getPayments(statusFilter?: string): Promise<{ list: PaymentRecord[]; collectedMtd: number; pendingDues: number; overdueCount: number }> {
    const db = await this.getDb();
    let query = `
      SELECT p.id, p.member_id, p.plan_description, p.amount, p.due_date, p.payment_status, m.full_name as member_name
      FROM payments p
      LEFT JOIN members m ON p.member_id = m.member_id
      WHERE 1=1
    `;

    if (statusFilter && statusFilter !== 'All status') {
      query += ` AND p.payment_status = '${statusFilter}'`;
    }

    query += ' ORDER BY p.id DESC';
    const res = db.exec(query);

    const list: PaymentRecord[] = [];
    if (res.length > 0) {
      for (const row of res[0].values) {
        list.push({
          id: Number(row[0]),
          member_id: String(row[1]),
          plan_description: String(row[2]),
          amount: Number(row[3]),
          due_date: String(row[4]),
          payment_status: row[5] as any,
          member_name: row[6] ? String(row[6]) : String(row[1]),
        });
      }
    }

    // Totals
    const colRes = db.exec("SELECT SUM(amount) FROM payments WHERE payment_status = 'Paid'");
    const collectedMtd = (colRes[0]?.values[0]?.[0] as number) || 0;

    const pendRes = db.exec("SELECT SUM(amount) FROM payments WHERE payment_status IN ('Pending', 'Overdue')");
    const pendingDues = (pendRes[0]?.values[0]?.[0] as number) || 0;

    const overdueRes = db.exec("SELECT COUNT(*) FROM payments WHERE payment_status = 'Overdue'");
    const overdueCount = (overdueRes[0]?.values[0]?.[0] as number) || 0;

    return { list, collectedMtd, pendingDues, overdueCount };
  }

  public async createPayment(payment: Omit<PaymentRecord, 'id'>): Promise<void> {
    const db = await this.getDb();
    const sql = `
      INSERT INTO payments (member_id, plan_description, amount, due_date, payment_status)
      VALUES ('${payment.member_id.replace(/'/g, "''")}', '${payment.plan_description.replace(/'/g, "''")}', ${payment.amount}, '${payment.due_date}', '${payment.payment_status}')
    `;
    db.run(sql);
    this.notify();
  }

  public async updatePaymentStatus(id: number, status: 'Paid' | 'Overdue' | 'Pending'): Promise<void> {
    const db = await this.getDb();
    db.run(`UPDATE payments SET payment_status = '${status}' WHERE id = ${id}`);
    this.notify();
  }

  // ==================== CLASSES ====================
  public async getClasses(): Promise<GymClass[]> {
    const db = await this.getDb();
    const sql = `
      SELECT c.id, c.class_name, c.trainer_id, c.studio_location, c.start_time, c.max_capacity, c.booked_count, t.full_name as trainer_name
      FROM classes c
      LEFT JOIN trainers t ON c.trainer_id = t.id
      ORDER BY c.id ASC
    `;
    const res = db.exec(sql);
    if (res.length === 0) return [];

    // Query bookings with member details
    const bookingsMap: Record<number, ClassBooking[]> = {};
    try {
      const bookingsSql = `
        SELECT cb.id, cb.class_id, cb.member_id, m.full_name as member_name, cb.booked_at
        FROM class_bookings cb
        LEFT JOIN members m ON cb.member_id = m.member_id
        ORDER BY cb.id ASC
      `;
      const bRes = db.exec(bookingsSql);
      if (bRes.length > 0) {
        for (const row of bRes[0].values) {
          const cId = Number(row[1]);
          if (!bookingsMap[cId]) bookingsMap[cId] = [];
          bookingsMap[cId].push({
            id: Number(row[0]),
            class_id: cId,
            member_id: String(row[2]),
            member_name: row[3] ? String(row[3]) : String(row[2]),
            booked_at: String(row[4]),
          });
        }
      }
    } catch {
      // Table might not exist yet
    }

    return res[0].values.map((row) => {
      const id = Number(row[0]);
      const classBookings = bookingsMap[id] || [];
      const actualBooked = classBookings.length > 0 ? classBookings.length : Number(row[6] || 0);

      return {
        id,
        class_name: String(row[1]),
        trainer_id: Number(row[2]),
        studio_location: String(row[3]),
        start_time: String(row[4]),
        max_capacity: Number(row[5]),
        booked_count: actualBooked,
        trainer_name: row[7] ? String(row[7]) : 'Unassigned',
        bookings: classBookings,
      };
    });
  }

  public async createClass(cls: Omit<GymClass, 'id'>): Promise<void> {
    const db = await this.getDb();
    const sql = `
      INSERT INTO classes (class_name, trainer_id, studio_location, start_time, max_capacity, booked_count)
      VALUES ('${cls.class_name.replace(/'/g, "''")}', ${cls.trainer_id}, '${cls.studio_location.replace(/'/g, "''")}', '${cls.start_time.replace(/'/g, "''")}', ${cls.max_capacity}, ${cls.booked_count || 0})
    `;
    db.run(sql);
    this.persist();
    this.notify();
  }

  public async bookMemberInClass(classId: number, memberId: string): Promise<{ success: boolean; message?: string }> {
    const db = await this.getDb();
    const res = db.exec(`SELECT booked_count, max_capacity FROM classes WHERE id = ${classId}`);
    if (res.length === 0) return { success: false, message: 'Class not found.' };
    const max = Number(res[0].values[0][1]);

    // Check count
    const countRes = db.exec(`SELECT COUNT(*) FROM class_bookings WHERE class_id = ${classId}`);
    const currentBooked = countRes.length > 0 ? Number(countRes[0].values[0][0]) : 0;
    if (currentBooked >= max) {
      return { success: false, message: 'This class has reached maximum capacity.' };
    }

    // Check if already booked
    const checkRes = db.exec(`SELECT id FROM class_bookings WHERE class_id = ${classId} AND member_id = '${memberId.replace(/'/g, "''")}'`);
    if (checkRes.length > 0 && checkRes[0].values.length > 0) {
      return { success: false, message: 'This member is already booked in this class.' };
    }

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const bookedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    db.run(`
      INSERT INTO class_bookings (class_id, member_id, booked_at)
      VALUES (${classId}, '${memberId.replace(/'/g, "''")}', '${bookedAt}')
    `);
    db.run(`UPDATE classes SET booked_count = (SELECT COUNT(*) FROM class_bookings WHERE class_id = ${classId}) WHERE id = ${classId}`);
    this.persist();
    this.notify();
    return { success: true };
  }

  public async removeMemberFromClass(classId: number, memberId: string): Promise<boolean> {
    const db = await this.getDb();
    db.run(`DELETE FROM class_bookings WHERE class_id = ${classId} AND member_id = '${memberId.replace(/'/g, "''")}'`);
    db.run(`UPDATE classes SET booked_count = (SELECT COUNT(*) FROM class_bookings WHERE class_id = ${classId}) WHERE id = ${classId}`);
    this.persist();
    this.notify();
    return true;
  }

  public async bookClassSpot(id: number): Promise<boolean> {
    const db = await this.getDb();
    const res = db.exec(`SELECT booked_count, max_capacity FROM classes WHERE id = ${id}`);
    if (res.length === 0) return false;
    const booked = Number(res[0].values[0][0]);
    const max = Number(res[0].values[0][1]);
    if (booked >= max) return false;

    db.run(`UPDATE classes SET booked_count = booked_count + 1 WHERE id = ${id}`);
    this.persist();
    this.notify();
    return true;
  }

  public async cancelClassBooking(id: number): Promise<boolean> {
    const db = await this.getDb();
    const res = db.exec(`SELECT booked_count FROM classes WHERE id = ${id}`);
    if (res.length === 0) return false;
    const booked = Number(res[0].values[0][0]);
    if (booked <= 0) return false;

    db.run(`UPDATE classes SET booked_count = booked_count - 1 WHERE id = ${id}`);
    this.persist();
    this.notify();
    return true;
  }

  public async deleteClass(id: number): Promise<void> {
    const db = await this.getDb();
    db.run(`DELETE FROM class_bookings WHERE class_id = ${id}`);
    db.run(`DELETE FROM classes WHERE id = ${id}`);
    this.persist();
    this.notify();
  }

  // ==================== AUTHENTICATION & STAFF USERS ====================
  public async authenticateUser(username: string, password: string): Promise<StaffUser | null> {
    const db = await this.getDb();
    const cleanUser = username.trim().toLowerCase().replace(/'/g, "''");
    const cleanPass = password.trim().replace(/'/g, "''");

    try {
      const sql = `
        SELECT id, username, password, full_name, role, email, phone, shift, status,
               can_manage_members, can_process_payments, can_manage_classes, can_manage_trainers, created_at
        FROM staff_users
        WHERE LOWER(username) = '${cleanUser}' AND password = '${cleanPass}'
        LIMIT 1
      `;
      const res = db.exec(sql);
      if (res.length > 0 && res[0].values.length > 0) {
        const row = res[0].values[0];
        return {
          id: Number(row[0]),
          username: String(row[1]),
          password: String(row[2]),
          full_name: String(row[3]),
          role: (String(row[4]) === 'Admin' ? 'Admin' : 'Staff') as 'Admin' | 'Staff',
          email: row[5] ? String(row[5]) : '',
          phone: row[6] ? String(row[6]) : '',
          shift: row[7] ? String(row[7]) : 'Morning',
          status: (row[8] ? String(row[8]) : 'Active') as 'Active' | 'Inactive' | 'Suspended',
          can_manage_members: Number(row[9]) === 1,
          can_process_payments: Number(row[10]) === 1,
          can_manage_classes: Number(row[11]) === 1,
          can_manage_trainers: Number(row[12]) === 1,
          created_at: String(row[13]),
        };
      }
    } catch (err) {
      console.warn('Error querying staff_users in authenticateUser:', err);
    }

    // Fallback: check admin table
    try {
      const adminCheck = db.exec(`SELECT username, role, password FROM admin WHERE LOWER(username) = '${cleanUser}' AND password = '${cleanPass}' LIMIT 1`);
      if (adminCheck.length > 0 && adminCheck[0].values.length > 0) {
        const u = String(adminCheck[0].values[0][0]);
        const r = String(adminCheck[0].values[0][1]);
        const isAdmin = u === 'admin' || r.toLowerCase().includes('admin');
        return {
          id: 999,
          username: u,
          full_name: isAdmin ? 'Gym Administrator' : 'Staff Member',
          role: isAdmin ? 'Admin' : 'Staff',
          email: `${u}@cfitgym.com`,
          phone: '+91 98470 00000',
          shift: 'Full Day',
          status: 'Active',
          can_manage_members: true,
          can_process_payments: true,
          can_manage_classes: true,
          can_manage_trainers: true,
          created_at: '2025-01-01 00:00:00',
        };
      }
    } catch {
      // Ignore
    }

    return null;
  }

  public async getStaffUsers(): Promise<StaffUser[]> {
    const db = await this.getDb();
    try {
      const sql = `
        SELECT id, username, password, full_name, role, email, phone, shift, status,
               can_manage_members, can_process_payments, can_manage_classes, can_manage_trainers, created_at
        FROM staff_users
        ORDER BY CASE WHEN role = 'Admin' THEN 1 ELSE 2 END, id ASC
      `;
      const res = db.exec(sql);
      if (res.length === 0) return [];

      return res[0].values.map((row) => ({
        id: Number(row[0]),
        username: String(row[1]),
        password: String(row[2]),
        full_name: String(row[3]),
        role: (String(row[4]) === 'Admin' ? 'Admin' : 'Staff') as 'Admin' | 'Staff',
        email: row[5] ? String(row[5]) : '',
        phone: row[6] ? String(row[6]) : '',
        shift: row[7] ? String(row[7]) : 'Morning',
        status: (row[8] ? String(row[8]) : 'Active') as 'Active' | 'Inactive' | 'Suspended',
        can_manage_members: Number(row[9]) === 1,
        can_process_payments: Number(row[10]) === 1,
        can_manage_classes: Number(row[11]) === 1,
        can_manage_trainers: Number(row[12]) === 1,
        created_at: String(row[13]),
      }));
    } catch (err) {
      console.warn('Could not read staff_users:', err);
      return [];
    }
  }

  public async createStaffUser(data: {
    username: string;
    password?: string;
    full_name: string;
    role: 'Admin' | 'Staff';
    email?: string;
    phone?: string;
    shift?: string;
    status?: 'Active' | 'Inactive' | 'Suspended';
    can_manage_members?: boolean;
    can_process_payments?: boolean;
    can_manage_classes?: boolean;
    can_manage_trainers?: boolean;
  }): Promise<{ success: boolean; message?: string }> {
    const db = await this.getDb();
    const cleanUser = data.username.trim().toLowerCase().replace(/'/g, "''");

    const check = db.exec(`SELECT id FROM staff_users WHERE LOWER(username) = '${cleanUser}'`);
    if (check.length > 0 && check[0].values.length > 0) {
      return { success: false, message: `Username "${data.username}" is already in use.` };
    }

    const pass = (data.password || 'staff123').trim().replace(/'/g, "''");
    const name = data.full_name.trim().replace(/'/g, "''");
    const email = (data.email || '').trim().replace(/'/g, "''");
    const phone = (data.phone || '').trim().replace(/'/g, "''");
    const shift = (data.shift || 'Morning').replace(/'/g, "''");
    const status = (data.status || 'Active').replace(/'/g, "''");
    const role = data.role === 'Admin' ? 'Admin' : 'Staff';
    const cMembers = data.can_manage_members !== false ? 1 : 0;
    const cPayments = data.can_process_payments !== false ? 1 : 0;
    const cClasses = data.can_manage_classes !== false ? 1 : 0;
    const cTrainers = data.can_manage_trainers !== false ? 1 : 0;

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const createdAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    db.run(`
      INSERT INTO staff_users (username, password, full_name, role, email, phone, shift, status, can_manage_members, can_process_payments, can_manage_classes, can_manage_trainers, created_at)
      VALUES ('${cleanUser}', '${pass}', '${name}', '${role}', '${email}', '${phone}', '${shift}', '${status}', ${cMembers}, ${cPayments}, ${cClasses}, ${cTrainers}, '${createdAt}')
    `);
    this.persist();
    this.notify();
    return { success: true };
  }

  public async updateStaffUser(id: number, data: Partial<StaffUser>): Promise<{ success: boolean; message?: string }> {
    const db = await this.getDb();
    const sets: string[] = [];

    if (data.full_name !== undefined) sets.push(`full_name = '${data.full_name.replace(/'/g, "''")}'`);
    if (data.role !== undefined) sets.push(`role = '${data.role.replace(/'/g, "''")}'`);
    if (data.email !== undefined) sets.push(`email = '${data.email.replace(/'/g, "''")}'`);
    if (data.phone !== undefined) sets.push(`phone = '${data.phone.replace(/'/g, "''")}'`);
    if (data.shift !== undefined) sets.push(`shift = '${data.shift.replace(/'/g, "''")}'`);
    if (data.status !== undefined) sets.push(`status = '${data.status.replace(/'/g, "''")}'`);
    if (data.can_manage_members !== undefined) sets.push(`can_manage_members = ${data.can_manage_members ? 1 : 0}`);
    if (data.can_process_payments !== undefined) sets.push(`can_process_payments = ${data.can_process_payments ? 1 : 0}`);
    if (data.can_manage_classes !== undefined) sets.push(`can_manage_classes = ${data.can_manage_classes ? 1 : 0}`);
    if (data.can_manage_trainers !== undefined) sets.push(`can_manage_trainers = ${data.can_manage_trainers ? 1 : 0}`);
    if (data.password) sets.push(`password = '${data.password.replace(/'/g, "''")}'`);

    if (sets.length === 0) return { success: true };

    db.run(`UPDATE staff_users SET ${sets.join(', ')} WHERE id = ${id}`);
    this.persist();
    this.notify();
    return { success: true };
  }

  public async deleteStaffUser(id: number): Promise<{ success: boolean; message?: string }> {
    const db = await this.getDb();
    const userRes = db.exec(`SELECT username, role FROM staff_users WHERE id = ${id}`);
    if (userRes.length === 0 || userRes[0].values.length === 0) {
      return { success: false, message: 'Staff member not found.' };
    }
    const username = String(userRes[0].values[0][0]);
    if (username === 'admin') {
      return { success: false, message: 'The primary system Administrator account cannot be deleted.' };
    }

    db.run(`DELETE FROM staff_users WHERE id = ${id}`);
    this.persist();
    this.notify();
    return { success: true };
  }

  public async toggleStaffStatus(id: number): Promise<boolean> {
    const db = await this.getDb();
    const res = db.exec(`SELECT status FROM staff_users WHERE id = ${id}`);
    if (res.length === 0 || res[0].values.length === 0) return false;
    const current = String(res[0].values[0][0]);
    const next = current === 'Active' ? 'Suspended' : 'Active';
    db.run(`UPDATE staff_users SET status = '${next}' WHERE id = ${id}`);
    this.persist();
    this.notify();
    return true;
  }

  public async resetStaffPassword(id: number, newPass: string): Promise<boolean> {
    const db = await this.getDb();
    db.run(`UPDATE staff_users SET password = '${newPass.replace(/'/g, "''")}' WHERE id = ${id}`);
    this.persist();
    this.notify();
    return true;
  }

  // ==================== ADMIN & USERS ====================
  public async getAdminUser(): Promise<AdminUser> {
    const db = await this.getDb();
    try {
      const staffRes = db.exec("SELECT username, role, full_name FROM staff_users WHERE role = 'Admin' LIMIT 1");
      if (staffRes.length > 0 && staffRes[0].values.length > 0) {
        return {
          username: String(staffRes[0].values[0][0]),
          role: String(staffRes[0].values[0][1]),
          full_name: String(staffRes[0].values[0][2]),
        };
      }
    } catch {
      // Ignore
    }
    const res = db.exec('SELECT username, role FROM admin LIMIT 1');
    if (res.length === 0) {
      return { username: 'admin', role: 'Admin access', full_name: 'Gym Administrator' };
    }
    return {
      username: String(res[0].values[0][0]),
      role: String(res[0].values[0][1]),
      full_name: String(res[0].values[0][0]) === 'admin' ? 'Gym Administrator' : 'Staff Member',
    };
  }

  public async updateAdminUser(username: string, role: string): Promise<void> {
    const db = await this.getDb();
    db.run(`UPDATE admin SET username = '${username.replace(/'/g, "''")}', role = '${role.replace(/'/g, "''")}'`);
    try {
      db.run(`UPDATE staff_users SET username = '${username.replace(/'/g, "''")}', role = '${role.replace(/'/g, "''")}' WHERE username = 'admin'`);
    } catch {
      // Ignore
    }
    this.persist();
    this.notify();
  }

  // ==================== REPORTS ====================
  public async getRevenueReport(): Promise<{ plan: string; totalRevenue: number; memberCount: number }[]> {
    const db = await this.getDb();
    const sql = `
      SELECT m.plan_type, 
             COALESCE(SUM(p.amount), 0) AS total_revenue,
             COUNT(DISTINCT m.id) AS member_count
      FROM members m
      LEFT JOIN payments p ON m.member_id = p.member_id AND p.payment_status = 'Paid'
      GROUP BY m.plan_type
      ORDER BY total_revenue DESC
    `;
    const res = db.exec(sql);
    if (res.length === 0) return [];
    return res[0].values.map((row) => ({
      plan: String(row[0]),
      totalRevenue: Number(row[1]),
      memberCount: Number(row[2]),
    }));
  }

  public async getAttendanceReport(): Promise<{ method: string; totalCheckins: number; percentage: number }[]> {
    const db = await this.getDb();
    const sql = `
      SELECT check_in_method, COUNT(*) AS count
      FROM attendance
      GROUP BY check_in_method
      ORDER BY count DESC
    `;
    const res = db.exec(sql);
    if (res.length === 0) return [];
    const total = res[0].values.reduce((sum, r) => sum + Number(r[1]), 0) || 1;
    return res[0].values.map((row) => ({
      method: String(row[0]),
      totalCheckins: Number(row[1]),
      percentage: Math.round((Number(row[1]) / total) * 100),
    }));
  }
}

export const gymDb = new GymDatabase();
