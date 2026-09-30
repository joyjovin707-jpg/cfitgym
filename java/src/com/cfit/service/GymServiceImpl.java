package com.cfit.service;

import com.cfit.model.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Implementation of GymOperations:
 * - Singleton Design Pattern (getInstance)
 * - Polymorphic Tier Resolution (Silver, Gold, Platinum)
 * - Method Overloading (findMember by String vs int)
 * - Encapsulated in-memory relational store
 */
public class GymServiceImpl implements GymOperations {

    // Singleton instance
    private static GymServiceImpl instance;

    // Encapsulated collections
    private final Map<String, User> userRegistry = new HashMap<>();
    private final Map<String, Member> memberRegistry = new LinkedHashMap<>();
    private final List<AttendanceRecord> attendanceLog = new ArrayList<>();
    private final List<PaymentRecord> paymentLedger = new ArrayList<>();
    private final Map<Integer, Trainer> trainerRegistry = new LinkedHashMap<>();
    private final Map<Integer, FitnessClass> classRegistry = new LinkedHashMap<>();

    // Polymorphic plan strategies
    private final Map<String, MembershipPlan> planCatalog = new HashMap<>();

    private int attendanceSeq = 1;
    private int paymentSeq = 1;
    private int memberSeq = 1;
    private int trainerSeq = 1;
    private int classSeq = 1;

    // Private constructor enforcing Singleton pattern
    private GymServiceImpl() {
        initPlans();
        seedInitialData();
    }

    public static synchronized GymServiceImpl getInstance() {
        if (instance == null) {
            instance = new GymServiceImpl();
        }
        return instance;
    }

    private void initPlans() {
        planCatalog.put("Silver", new SilverPlan());
        planCatalog.put("Gold", new GoldPlan());
        planCatalog.put("Platinum", new PlatinumPlan());
    }

    private void seedInitialData() {
        // Seed Admin
        userRegistry.put("admin", new AdminUser(1, "admin", "admin123", "Arun Kumar (System Admin)", "arun@cfit.com"));

        // Seed Staff
        userRegistry.put("staff1", new StaffUser(2, "staff1", "staff123", "Priya Nair", "priya@cfit.com",
                "Morning Shift", "9847012345", "Active", true, true, false, false));

        userRegistry.put("staff2", new StaffUser(3, "staff2", "staff123", "Rahul Menon", "rahul@cfit.com",
                "Evening Shift", "9847098765", "Active", false, true, true, false));

        // Seed Trainers
        registerTrainer(new Trainer(trainerSeq++, "Vikram Sethi", "Strength & Bodybuilding", "+91 98471 22334", "vikram@cfit.com", "Active"));
        registerTrainer(new Trainer(trainerSeq++, "Sneha Pillai", "HIIT & Functional Cardio", "+91 98471 33445", "sneha@cfit.com", "Active"));
        registerTrainer(new Trainer(trainerSeq++, "Mathew Thomas", "CrossFit & Olympic Lifting", "+91 98471 44556", "mathew@cfit.com", "Active"));

        // Seed Members
        registerMember(new Member(memberSeq++, "GYM-0101", "Kavya Suresh", "Platinum", 1,
                LocalDate.now().minusMonths(3), LocalDate.now().plusMonths(9), "Active"));

        registerMember(new Member(memberSeq++, "GYM-0102", "Deepak Varma", "Gold", 2,
                LocalDate.now().minusMonths(1), LocalDate.now().plusMonths(5), "Active"));

        registerMember(new Member(memberSeq++, "GYM-0103", "Ananya Mohan", "Silver", null,
                LocalDate.now().minusMonths(6), LocalDate.now().plusDays(3), "Expiring"));

        // Seed Payments
        recordPayment("GYM-0101", "Platinum — 1 Year Full Access", 28000.0, "Paid");
        recordPayment("GYM-0102", "Gold — 6 Months Access", 13500.0, "Paid");
        recordPayment("GYM-0103", "Silver — 1 Month Access", 1800.0, "Pending");

        // Seed Classes
        FitnessClass c1 = new FitnessClass(classSeq++, "Morning CrossFit Blitz", "Strength", 1, "Vikram Sethi", "06:30 AM - 07:30 AM", "Mon, Wed, Fri", 15, 8);
        FitnessClass c2 = new FitnessClass(classSeq++, "Cardio Shred & Core", "HIIT", 2, "Sneha Pillai", "06:00 PM - 07:00 PM", "Tue, Thu, Sat", 20, 14);
        classRegistry.put(c1.getId(), c1);
        classRegistry.put(c2.getId(), c2);
    }

    @Override
    public User authenticate(String username, String password) {
        User user = userRegistry.get(username);
        if (user != null && user.verifyPassword(password)) {
            return user;
        }
        return null;
    }

    @Override
    public void registerMember(Member member) {
        if (member == null) throw new IllegalArgumentException("Member cannot be null.");
        memberRegistry.put(member.getMemberId(), member);
    }

    @Override
    public List<Member> getAllMembers() {
        return new ArrayList<>(memberRegistry.values());
    }

    // Compile-time Polymorphism: Method Overloading 1 (by String ID)
    @Override
    public Member findMember(String memberId) {
        if (memberId == null) return null;
        return memberRegistry.get(memberId.trim().toUpperCase());
    }

    // Compile-time Polymorphism: Method Overloading 2 (by numeric DB ID)
    @Override
    public Member findMember(int numericId) {
        for (Member m : memberRegistry.values()) {
            if (m.getId() == numericId) return m;
        }
        return null;
    }

    @Override
    public AttendanceRecord checkInMember(String memberCode) {
        Member member = findMember(memberCode);
        if (member == null) {
            throw new NoSuchElementException("Member with ID '" + memberCode + "' does not exist.");
        }
        if (!member.isEligibleForCheckIn()) {
            throw new IllegalStateException("Member " + member.getFullName() + " has status '" +
                    member.getStatus() + "' and cannot check in until renewed.");
        }

        AttendanceRecord record = new AttendanceRecord(attendanceSeq++, member.getMemberId(),
                member.getFullName(), LocalDateTime.now());
        attendanceLog.add(0, record);
        return record;
    }

    @Override
    public void checkOutMember(String memberCode) {
        for (AttendanceRecord rec : attendanceLog) {
            if (rec.getMemberId().equalsIgnoreCase(memberCode) && rec.getCheckOutTime() == null) {
                rec.checkOut(LocalDateTime.now());
                return;
            }
        }
        throw new NoSuchElementException("No active check-in session found for " + memberCode);
    }

    @Override
    public List<AttendanceRecord> getRecentAttendance() {
        return new ArrayList<>(attendanceLog);
    }

    /**
     * Runtime Polymorphism in Action:
     * Resolves the plan tier dynamically and delegates the pricing algorithm
     * to the appropriate subclass (SilverPlan, GoldPlan, or PlatinumPlan).
     */
    @Override
    public double computePlanFee(String planType, int durationMonths) {
        MembershipPlan plan = planCatalog.get(planType);
        if (plan == null) {
            throw new IllegalArgumentException("Unknown membership tier: " + planType);
        }
        // Polymorphic dynamic method dispatch
        return plan.calculateFee(durationMonths);
    }

    @Override
    public void recordPayment(String memberId, String planDesc, double amount, String status) {
        Member member = findMember(memberId);
        String name = (member != null) ? member.getFullName() : "Guest";
        PaymentRecord payment = new PaymentRecord(paymentSeq++, memberId, name, planDesc,
                amount, LocalDate.now().plusMonths(1), status);
        paymentLedger.add(0, payment);
    }

    @Override
    public List<PaymentRecord> getAllPayments() {
        return new ArrayList<>(paymentLedger);
    }

    @Override
    public List<Trainer> getAllTrainers() {
        return new ArrayList<>(trainerRegistry.values());
    }

    @Override
    public Trainer findTrainer(int trainerId) {
        return trainerRegistry.get(trainerId);
    }

    @Override
    public void registerTrainer(Trainer trainer) {
        if (trainer == null) throw new IllegalArgumentException("Trainer cannot be null.");
        trainerRegistry.put(trainer.getId(), trainer);
    }

    @Override
    public List<FitnessClass> getAllClasses() {
        return new ArrayList<>(classRegistry.values());
    }

    @Override
    public boolean bookClass(int classId) {
        FitnessClass fc = classRegistry.get(classId);
        if (fc != null) {
            return fc.bookSpot();
        }
        return false;
    }

    public Map<String, MembershipPlan> getPlanCatalog() {
        return planCatalog;
    }

    public Map<String, User> getUserRegistry() {
        return userRegistry;
    }
}
