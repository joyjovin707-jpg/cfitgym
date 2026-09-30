package com.cfit.service;

import com.cfit.model.*;

import java.util.List;

/**
 * Abstraction Principle - Interface:
 * Declares all high-level business operations without exposing internal storage,
 * file pointers, or SQL details.
 */
public interface GymOperations {

    // Authentication abstraction
    User authenticate(String username, String password);

    // Member management abstractions
    void registerMember(Member member);
    List<Member> getAllMembers();
    
    // Compile-time Polymorphism (Method Overloading)
    Member findMember(String memberId);
    Member findMember(int numericId);

    // Attendance abstractions
    AttendanceRecord checkInMember(String memberCode);
    void checkOutMember(String memberCode);
    List<AttendanceRecord> getRecentAttendance();

    // Billing & Dynamic Plan pricing abstractions
    double computePlanFee(String planType, int durationMonths);
    void recordPayment(String memberId, String planDesc, double amount, String status);
    List<PaymentRecord> getAllPayments();

    // Trainers abstractions
    List<Trainer> getAllTrainers();
    Trainer findTrainer(int trainerId);
    void registerTrainer(Trainer trainer);

    // Classes abstractions
    List<FitnessClass> getAllClasses();
    boolean bookClass(int classId);
}
