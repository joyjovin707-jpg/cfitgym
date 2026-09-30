export type UserRole = 'Admin' | 'Staff';

export interface AdminUser {
  id?: number;
  username: string;
  password?: string;
  role: string;
  full_name?: string;
}

export interface StaffUser {
  id: number;
  username: string;
  password?: string;
  full_name: string;
  role: UserRole;
  email: string;
  phone: string;
  shift: 'Morning' | 'Evening' | 'Full Day' | 'Night' | string;
  status: 'Active' | 'Inactive' | 'Suspended';
  can_manage_members: boolean;
  can_process_payments: boolean;
  can_manage_classes: boolean;
  can_manage_trainers: boolean;
  created_at: string;
}

export interface Trainer {
  id: number;
  trainer_code: string;
  full_name: string;
  specialty: string;
  rating: number;
  clients_assigned?: number;
  sessions_this_week?: number;
}

export interface Member {
  id: number;
  member_id: string;
  full_name: string;
  plan_type: string;
  trainer_id: number | null;
  trainer_name?: string;
  join_date: string;
  expiry_date: string;
  status: 'Active' | 'Expiring' | 'Paused' | 'Expired';
}

export interface AttendanceRecord {
  id: number;
  member_id: string;
  member_name?: string;
  check_in_time: string;
  check_out_time: string | null;
  check_in_method: 'Reception Desk' | string;
  duration?: string;
}

export interface PaymentRecord {
  id: number;
  member_id: string;
  member_name?: string;
  plan_description: string;
  amount: number;
  due_date: string;
  payment_status: 'Paid' | 'Overdue' | 'Pending';
}

export interface ClassBooking {
  id: number;
  class_id: number;
  member_id: string;
  member_name: string;
  booked_at: string;
}

export interface GymClass {
  id: number;
  class_name: string;
  trainer_id: number;
  trainer_name?: string;
  studio_location: string;
  start_time: string;
  max_capacity: number;
  booked_count: number;
  bookings?: ClassBooking[];
}

export interface DashboardStats {
  activeMembers: number;
  checkedInToday: number;
  revenueMtd: number;
  expiringCount: number;
  checkinsLast7Days: { day: string; count: number; percentage: number }[];
  todayClasses: GymClass[];
  expiringMembers: Member[];
}

export interface SqlQueryResult {
  columns: string[];
  values: any[][];
  error?: string;
  affectedRows?: number;
  executionTimeMs?: number;
}
