import React, { useState, useEffect, useCallback } from 'react';
import { gymDb } from './db/database.ts';
import {
  Member,
  Trainer,
  AttendanceRecord,
  PaymentRecord,
  GymClass,
  DashboardStats,
  AdminUser,
  StaffUser,
} from './types/index.ts';

import { Sidebar } from './components/Sidebar.tsx';
import { LoginScreen } from './components/Auth/LoginScreen.tsx';
import { DashboardScreen } from './components/Screens/DashboardScreen.tsx';
import { MembersScreen } from './components/Screens/MembersScreen.tsx';
import { TrainersScreen } from './components/Screens/TrainersScreen.tsx';
import { AttendanceScreen } from './components/Screens/AttendanceScreen.tsx';
import { PaymentsScreen } from './components/Screens/PaymentsScreen.tsx';
import { ScheduleScreen } from './components/Screens/ScheduleScreen.tsx';
import { StaffControlScreen } from './components/Screens/StaffControlScreen.tsx';
import { SettingsScreen } from './components/Screens/SettingsScreen.tsx';

import { MemberModal } from './components/Modals/MemberModal.tsx';
import { TrainerModal } from './components/Modals/TrainerModal.tsx';
import { AttendanceModal } from './components/Modals/AttendanceModal.tsx';
import { PaymentModal } from './components/Modals/PaymentModal.tsx';
import { ClassModal } from './components/Modals/ClassModal.tsx';

import { Menu, X, CheckCircle } from 'lucide-react';

export function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(() => {
    try {
      const saved = localStorage.getItem('cfit_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return null;
  });

  // App Data States
  const [stats, setStats] = useState<DashboardStats>({
    activeMembers: 0,
    checkedInToday: 0,
    revenueMtd: 0,
    expiringCount: 0,
    checkinsLast7Days: [],
    todayClasses: [],
    expiringMembers: [],
  });
  const [members, setMembers] = useState<Member[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentTotals, setPaymentTotals] = useState({ collectedMtd: 0, pendingDues: 0, overdueCount: 0 });
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser>({ username: 'admin', role: 'Admin access' });

  // Modal States
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadAllData = useCallback(async () => {
    try {
      const [
        dashboardStats,
        membersList,
        trainersList,
        logsList,
        paymentsData,
        classesList,
        admin,
        staff,
      ] = await Promise.all([
        gymDb.getDashboardStats(),
        gymDb.getMembers(),
        gymDb.getTrainers(),
        gymDb.getAttendanceLogs(),
        gymDb.getPayments(),
        gymDb.getClasses(),
        gymDb.getAdminUser(),
        gymDb.getStaffUsers(),
      ]);

      setStats(dashboardStats);
      setMembers(membersList);
      setTrainers(trainersList);
      setAttendanceLogs(logsList);
      setPayments(paymentsData.list);
      setPaymentTotals({
        collectedMtd: paymentsData.collectedMtd,
        pendingDues: paymentsData.pendingDues,
        overdueCount: paymentsData.overdueCount,
      });
      setClasses(classesList);
      setAdminUser(admin);
      setStaffList(staff);
    } catch (err) {
      console.error('Failed to load data from SQLite:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    gymDb.init()
      .then(() => {
        setInitError(null);
        return loadAllData();
      })
      .catch((err) => {
        console.error('Initialization error:', err);
        setInitError(err?.message || 'Database initialization error');
        setIsLoading(false);
      });
  }, [loadAllData]);

  // Handle Login & Session Management
  const handleLogin = (user: StaffUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('cfit_auth_user', JSON.stringify(user));
    } catch {
      // Ignore
    }
    notify(`Signed in as ${user.full_name} (${user.role} Access)`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('cfit_auth_user');
    } catch {
      // Ignore
    }
    setCurrentScreen('dashboard');
    notify('Signed out of terminal.');
  };

  const handleSwitchUser = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('cfit_auth_user');
    } catch {
      // Ignore
    }
    setMobileMenuOpen(false);
    setCurrentScreen('dashboard');
    notify('Switched to login page. Please choose an account to sign in.');
  };

  // Staff Management Handlers
  const handleAddStaff = async (data: any) => {
    const res = await gymDb.createStaffUser(data);
    if (res.success) {
      notify(`Staff account "@${data.username}" created successfully.`);
      const updated = await gymDb.getStaffUsers();
      setStaffList(updated);
    }
    return res;
  };

  const handleUpdateStaff = async (id: number, data: Partial<StaffUser>) => {
    const res = await gymDb.updateStaffUser(id, data);
    if (res.success) {
      notify('Staff member updated.');
      const updated = await gymDb.getStaffUsers();
      setStaffList(updated);

      if (currentUser && currentUser.id === id) {
        const refreshed = updated.find((s) => s.id === id);
        if (refreshed) {
          setCurrentUser(refreshed);
          try {
            localStorage.setItem('cfit_auth_user', JSON.stringify(refreshed));
          } catch {}
        }
      }
    }
    return res;
  };

  const handleDeleteStaff = async (id: number) => {
    const res = await gymDb.deleteStaffUser(id);
    if (res.success) {
      notify('Staff account deleted.');
      const updated = await gymDb.getStaffUsers();
      setStaffList(updated);
    } else {
      notify(res.message || 'Cannot delete account.');
    }
    return res;
  };

  const handleToggleStaffStatus = async (id: number) => {
    const success = await gymDb.toggleStaffStatus(id);
    if (success) {
      notify('Staff status updated.');
      const updated = await gymDb.getStaffUsers();
      setStaffList(updated);
    }
    return success;
  };

  const handleResetStaffPassword = async (id: number, newPass: string) => {
    const success = await gymDb.resetStaffPassword(id, newPass);
    if (success) {
      notify('Staff password reset successfully.');
    }
    return success;
  };

  // Member CRUD handlers
  const handleSaveMember = async (memberData: Omit<Member, 'id'>) => {
    if (editingMember) {
      await gymDb.updateMember(editingMember.id, memberData);
      notify(`Member "${memberData.full_name}" updated.`);
    } else {
      await gymDb.createMember(memberData);
      notify(`New member "${memberData.full_name}" registered.`);
    }
    await loadAllData();
  };

  const handleDeleteMember = async (id: number) => {
    await gymDb.deleteMember(id);
    notify('Member removed from records.');
    await loadAllData();
  };

  // Trainer CRUD handlers
  const handleSaveTrainer = async (trainerData: Omit<Trainer, 'id'>) => {
    if (editingTrainer) {
      await gymDb.updateTrainer(editingTrainer.id, trainerData);
      notify(`Trainer "${trainerData.full_name}" updated.`);
    } else {
      await gymDb.createTrainer(trainerData);
      notify(`New coach "${trainerData.full_name}" added.`);
    }
    await loadAllData();
  };

  const handleDeleteTrainer = async (id: number) => {
    await gymDb.deleteTrainer(id);
    notify('Trainer removed.');
    await loadAllData();
  };

  // Attendance handlers
  const handleCheckIn = async (memberId: string, method: string = 'Reception Desk') => {
    await gymDb.checkInMember(memberId, method);
    notify(`Member ${memberId} checked in at Reception Desk.`);
    await loadAllData();
  };

  const handleCheckOut = async (id: number) => {
    await gymDb.checkOutMember(id);
    notify('Workout session logged out.');
    await loadAllData();
  };

  // Payments handlers
  const handleSavePayment = async (paymentData: Omit<PaymentRecord, 'id'>) => {
    await gymDb.createPayment(paymentData);
    notify(`Payment of ₹${paymentData.amount.toLocaleString('en-IN')} recorded.`);
    await loadAllData();
  };

  const handleUpdatePaymentStatus = async (id: number, status: 'Paid' | 'Pending' | 'Overdue') => {
    await gymDb.updatePaymentStatus(id, status);
    notify(`Payment marked as ${status}.`);
    await loadAllData();
  };

  // Class Schedule handlers
  const handleSaveClass = async (classData: Omit<GymClass, 'id'>) => {
    await gymDb.createClass(classData);
    notify(`Class "${classData.class_name}" scheduled.`);
    await loadAllData();
  };

  const handleBookMemberInClass = async (classId: number, memberId: string) => {
    const res = await gymDb.bookMemberInClass(classId, memberId);
    if (res.success) {
      notify('Member spot booked in class!');
    } else {
      notify(res.message || 'Failed to book spot.');
    }
    await loadAllData();
    return res;
  };

  const handleRemoveMemberFromClass = async (classId: number, memberId: string) => {
    const success = await gymDb.removeMemberFromClass(classId, memberId);
    if (success) {
      notify('Member reservation removed from class.');
    }
    await loadAllData();
    return success;
  };

  const handleDeleteClass = async (id: number) => {
    await gymDb.deleteClass(id);
    notify('Class deleted from schedule.');
    await loadAllData();
  };

  if (initError) {
    return (
      <div className="min-h-screen bg-[#101214] flex flex-col items-center justify-center text-[#EDEEEA] p-6 text-center">
        <div className="w-12 h-12 bg-[#FF5F45]/20 border border-[#FF5F45] text-[#FF5F45] rounded-xl flex items-center justify-center font-anton text-2xl mb-4">
          !
        </div>
        <p className="font-anton text-xl tracking-wider text-[#EDEEEA]">Database Initialization Error</p>
        <p className="text-xs text-[#9A9E9F] mt-2 max-w-md font-mono bg-[#1A1D21] p-3 rounded-lg border border-[#2C3034]">
          {initError}
        </p>
        <button
          onClick={() => {
            setIsLoading(true);
            setInitError(null);
            gymDb.init().then(() => loadAllData()).catch((e) => {
              setInitError(e?.message || 'Failed again');
              setIsLoading(false);
            });
          }}
          className="mt-4 px-4 py-2 bg-[#C9FF3D] text-[#101214] font-bold text-xs rounded-lg hover:bg-[#b8eb32] transition-colors cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#101214] flex flex-col items-center justify-center text-[#EDEEEA]">
        <div className="w-12 h-12 bg-[#C9FF3D] rounded-lg flex items-center justify-center font-anton text-[#101214] text-2xl mb-4 animate-bounce">
          C
        </div>
        <p className="font-anton text-lg tracking-wider">C-FIT</p>
        <p className="text-xs text-[#9A9E9F] mt-1 font-mono">
          Connecting to SQLite cfit.db...
        </p>
      </div>
    );
  }

  // If user is not authenticated, show Login Screen
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-[#101214] text-[#EDEEEA] font-space">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-[#1A1D21] border border-[#C9FF3D]/40 text-[#EDEEEA] px-4 py-2.5 rounded-lg shadow-xl text-xs font-mono animate-fade-in">
          <CheckCircle className="w-4 h-4 text-[#C9FF3D]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentScreen={currentScreen}
          onSelectScreen={setCurrentScreen}
          currentUser={currentUser}
          onLogout={handleLogout}
          onSwitchUser={handleSwitchUser}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar
              currentScreen={currentScreen}
              onSelectScreen={(screen) => {
                setCurrentScreen(screen);
                setMobileMenuOpen(false);
              }}
              currentUser={currentUser}
              onLogout={handleLogout}
              onSwitchUser={handleSwitchUser}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#1A1D21] border-b border-[#2C3034]">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentScreen('dashboard')}>
            <div className="w-7 h-7 bg-[#C9FF3D] rounded flex items-center justify-center font-anton text-[#101214] text-sm">
              C
            </div>
            <span className="font-anton text-base text-[#EDEEEA]">C-FIT</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
              currentUser.role === 'Admin' ? 'bg-[#C9FF3D]/20 text-[#C9FF3D]' : 'bg-[#212528] text-[#9A9E9F]'
            }`}>
              {currentUser.role}
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded bg-[#212528] text-[#EDEEEA] border border-[#2C3034]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Screen Container */}
        <main className="flex-1 p-4 sm:p-7 lg:p-9 max-w-[1240px] w-full mx-auto">
          {currentScreen === 'dashboard' && (
            <DashboardScreen
              stats={stats}
              onOpenNewMemberModal={() => {
                setEditingMember(null);
                setIsMemberModalOpen(true);
              }}
              onNavigate={setCurrentScreen}
              onSendReminder={(memberId) => {
                notify(`Reminder sent to member ${memberId}.`);
              }}
            />
          )}

          {currentScreen === 'members' && (
            <MembersScreen
              members={members}
              trainers={trainers}
              onAddMember={() => {
                setEditingMember(null);
                setIsMemberModalOpen(true);
              }}
              onEditMember={(m) => {
                setEditingMember(m);
                setIsMemberModalOpen(true);
              }}
              onDeleteMember={handleDeleteMember}
            />
          )}

          {currentScreen === 'trainers' && (
            <TrainersScreen
              trainers={trainers}
              onAddTrainer={() => {
                setEditingTrainer(null);
                setIsTrainerModalOpen(true);
              }}
              onEditTrainer={(t) => {
                setEditingTrainer(t);
                setIsTrainerModalOpen(true);
              }}
              onDeleteTrainer={handleDeleteTrainer}
            />
          )}

          {currentScreen === 'attendance' && (
            <AttendanceScreen
              logs={attendanceLogs}
              onScanCard={() => setIsAttendanceModalOpen(true)}
              onCheckOut={handleCheckOut}
            />
          )}

          {currentScreen === 'payments' && (
            <PaymentsScreen
              payments={payments}
              collectedMtd={paymentTotals.collectedMtd}
              pendingDues={paymentTotals.pendingDues}
              overdueCount={paymentTotals.overdueCount}
              onRecordPayment={() => setIsPaymentModalOpen(true)}
              onUpdateStatus={handleUpdatePaymentStatus}
            />
          )}

          {currentScreen === 'schedule' && (
            <ScheduleScreen
              classes={classes}
              members={members}
              onNewClass={() => setIsClassModalOpen(true)}
              onBookMember={handleBookMemberInClass}
              onRemoveMember={handleRemoveMemberFromClass}
              onDeleteClass={handleDeleteClass}
            />
          )}

          {/* Admin Exclusive: Staff Control Module */}
          {currentScreen === 'staff_control' && (
            currentUser.role === 'Admin' ? (
              <StaffControlScreen
                staffList={staffList}
                currentAdminUsername={currentUser.username}
                onAddStaff={handleAddStaff}
                onUpdateStaff={handleUpdateStaff}
                onDeleteStaff={handleDeleteStaff}
                onToggleStatus={handleToggleStaffStatus}
                onResetPassword={handleResetStaffPassword}
              />
            ) : (
              <div className="bg-[#1A1D21] border border-[#FF5F45]/30 rounded-xl p-8 text-center space-y-3">
                <p className="text-sm font-bold text-[#FF5F45]">Admin Privileges Required</p>
                <p className="text-xs text-[#9A9E9F]">
                  The <strong>Staff Control</strong> module is reserved for administrator accounts.
                </p>
                <button
                  onClick={() => setCurrentScreen('dashboard')}
                  className="px-4 py-2 bg-[#212528] text-[#EDEEEA] rounded-lg text-xs font-semibold hover:bg-[#2C3034] cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            )
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen onNotify={notify} currentUser={currentUser} />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        editingMember={editingMember}
        trainers={trainers}
      />

      <TrainerModal
        isOpen={isTrainerModalOpen}
        onClose={() => {
          setIsTrainerModalOpen(false);
          setEditingTrainer(null);
        }}
        onSave={handleSaveTrainer}
        editingTrainer={editingTrainer}
      />

      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        onCheckIn={handleCheckIn}
        members={members}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={handleSavePayment}
        members={members}
      />

      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSave={handleSaveClass}
        trainers={trainers}
      />
    </div>
  );
}

export default App;
