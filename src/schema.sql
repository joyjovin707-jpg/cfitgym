-- C-fit Gym Management System Database Schema
-- File: src/schema.sql

-- 1. System Users / Staff Credentials
CREATE TABLE IF NOT EXISTS admin (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'Admin access'
);

-- Staff Accounts & Role Control
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

-- 2. Trainers Table
CREATE TABLE IF NOT EXISTS trainers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trainer_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    rating REAL DEFAULT 5.0
);

-- 3. Gym Members Table
CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    plan_type TEXT NOT NULL,           -- e.g., Gold, Silver, Platinum
    trainer_id INTEGER,
    join_date TEXT NOT NULL,            -- YYYY-MM-DD
    expiry_date TEXT NOT NULL,          -- YYYY-MM-DD
    status TEXT NOT NULL,               -- Active, Expiring, Paused, Expired
    FOREIGN KEY (trainer_id) REFERENCES trainers(id)
);

-- 4. Attendance / Check-in Logs
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT NOT NULL,
    check_in_time TEXT NOT NULL,        -- YYYY-MM-DD HH:MM:SS
    check_out_time TEXT,                -- YYYY-MM-DD HH:MM:SS or NULL
    check_in_method TEXT NOT NULL,      -- RFID card, Fingerprint, QR code
    FOREIGN KEY (member_id) REFERENCES members(member_id)
);

-- 5. Payments & Billing Records
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id TEXT NOT NULL,
    plan_description TEXT NOT NULL,
    amount REAL NOT NULL,
    due_date TEXT NOT NULL,             -- YYYY-MM-DD
    payment_status TEXT NOT NULL,       -- Paid, Overdue, Pending
    FOREIGN KEY (member_id) REFERENCES members(member_id)
);

-- 6. Class Schedule Table
CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL,
    trainer_id INTEGER NOT NULL,
    studio_location TEXT NOT NULL,
    start_time TEXT NOT NULL,           -- e.g., '06:00 AM'
    max_capacity INTEGER NOT NULL,
    booked_count INTEGER DEFAULT 0,
    FOREIGN KEY (trainer_id) REFERENCES trainers(id)
);

-- 7. Class Bookings (Roster)
CREATE TABLE IF NOT EXISTS class_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    member_id TEXT NOT NULL,
    booked_at TEXT NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
    UNIQUE(class_id, member_id)
);

-- Default Staff & Sample Data Initializers
INSERT OR IGNORE INTO admin (username, password, role) 
VALUES ('admin', 'admin123', 'Admin access'),
       ('staff', 'staff123', 'Staff access');

INSERT OR IGNORE INTO staff_users (id, username, password, full_name, role, email, phone, shift, status, can_manage_members, can_process_payments, can_manage_classes, can_manage_trainers, created_at)
VALUES (1, 'admin', 'admin123', 'Gym Administrator', 'Admin', 'admin@cfitgym.com', '+91 98470 11223', 'Full Day', 'Active', 1, 1, 1, 1, '2025-01-01 00:00:00'),
       (2, 'staff', 'staff123', 'Reception Frontdesk', 'Staff', 'reception@cfitgym.com', '+91 98470 44556', 'Morning', 'Active', 1, 1, 1, 1, '2025-03-15 08:30:00'),
       (3, 'vishnu', 'staff123', 'Vishnu Nair', 'Staff', 'vishnu.nair@cfitgym.com', '+91 94471 22334', 'Evening', 'Active', 1, 1, 1, 1, '2025-06-20 14:00:00'),
       (4, 'anjali', 'staff123', 'Anjali Menon', 'Staff', 'anjali.m@cfitgym.com', '+91 98950 33445', 'Morning', 'Active', 1, 1, 1, 0, '2025-08-10 09:15:00');

-- Seed Mock Trainers
INSERT OR IGNORE INTO trainers (id, trainer_code, full_name, specialty, rating) 
VALUES (1, 'TR-01', 'Arjun Menon', 'Strength & conditioning', 4.9),
       (2, 'TR-02', 'Nina D''Souza', 'Spin & cardio', 4.8),
       (3, 'TR-03', 'Meera Kutty', 'Yoga & mobility', 5.0);

-- Seed Mock Members
INSERT OR IGNORE INTO members (id, member_id, full_name, plan_type, trainer_id, join_date, expiry_date, status)
VALUES (1, 'GYM-0142', 'Rahul Krishnan', 'Gold', 1, '2025-10-15', '2026-09-28', 'Expiring'),
       (2, 'GYM-0198', 'Sneha Pillai', 'Silver', 2, '2026-04-20', '2026-09-30', 'Expiring'),
       (3, 'GYM-0071', 'Anand Jacob', 'Platinum', 1, '2025-03-21', '2027-03-21', 'Active'),
       (4, 'GYM-0233', 'Meera Varma', 'Gold', 3, '2026-03-30', '2026-10-30', 'Paused'),
       (5, 'GYM-0311', 'Divya Thomas', 'Silver', 2, '2026-06-18', '2027-01-18', 'Active'),
       (6, 'GYM-0057', 'Karthik Pillai', 'Platinum', 1, '2025-09-09', '2027-09-09', 'Active');

-- Seed Mock Attendance Logs
INSERT OR IGNORE INTO attendance (id, member_id, check_in_time, check_out_time, check_in_method)
VALUES (1, 'GYM-0142', '2026-09-26 06:12:00', '2026-09-26 07:34:00', 'Reception Desk'),
       (2, 'GYM-0198', '2026-09-26 07:02:00', NULL, 'Reception Desk'),
       (3, 'GYM-0071', '2026-09-26 08:15:00', '2026-09-26 09:20:00', 'Reception Desk'),
       (4, 'GYM-0311', '2026-09-26 09:05:00', NULL, 'Reception Desk');

-- Seed Mock Payments
INSERT OR IGNORE INTO payments (id, member_id, plan_description, amount, due_date, payment_status)
VALUES (1, 'GYM-0233', 'Gold — monthly', 2500, '2026-09-22', 'Overdue'),
       (2, 'GYM-0057', 'Platinum — annual', 28000, '2026-09-10', 'Paid'),
       (3, 'GYM-0311', 'Silver — monthly', 1800, '2026-09-18', 'Paid'),
       (4, 'GYM-0142', 'Gold — 6 month', 14000, '2026-09-29', 'Pending'),
       (5, 'GYM-0198', 'Silver — monthly', 1800, '2026-10-01', 'Pending');

-- Seed Mock Class Schedule
INSERT OR IGNORE INTO classes (id, class_name, trainer_id, studio_location, start_time, max_capacity, booked_count)
VALUES (1, 'Strength circuit', 1, 'Studio A', '06:00 AM', 20, 3),
       (2, 'Spin & RPM', 2, 'Studio C', '07:30 AM', 24, 3),
       (3, 'Yoga flow', 3, 'Studio B', '09:30 AM', 20, 2),
       (4, 'HIIT blast', 1, 'Studio A', '05:00 PM', 20, 2),
       (5, 'Spin Twilight', 2, 'Studio C', '07:00 PM', 24, 2);

-- Seed Mock Class Bookings
INSERT OR IGNORE INTO class_bookings (id, class_id, member_id, booked_at)
VALUES (1, 1, 'GYM-0142', '2026-09-25 10:00:00'),
       (2, 1, 'GYM-0071', '2026-09-25 11:30:00'),
       (3, 1, 'GYM-0057', '2026-09-25 14:15:00'),
       (4, 2, 'GYM-0198', '2026-09-25 09:00:00'),
       (5, 2, 'GYM-0311', '2026-09-25 10:20:00'),
       (6, 2, 'GYM-0233', '2026-09-25 12:45:00'),
       (7, 3, 'GYM-0198', '2026-09-25 08:30:00'),
       (8, 3, 'GYM-0233', '2026-09-25 15:10:00'),
       (9, 4, 'GYM-0142', '2026-09-25 16:00:00'),
       (10, 4, 'GYM-0311', '2026-09-25 16:30:00'),
       (11, 5, 'GYM-0071', '2026-09-25 17:00:00'),
       (12, 5, 'GYM-0057', '2026-09-25 17:15:00');
