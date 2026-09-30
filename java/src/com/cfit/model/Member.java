package com.cfit.model;

import java.time.LocalDate;

/**
 * Encapsulation Principle:
 * All state variables are private and strictly accessed via public getters/setters.
 * Enforces business rules and validation constraints before mutating state.
 */
public class Member {
    private int id;
    private String memberId; // Business identifier: e.g. "GYM-0101"
    private String fullName;
    private String planType; // "Silver", "Gold", "Platinum"
    private Integer trainerId;
    private LocalDate joinDate;
    private LocalDate expiryDate;
    private String status; // "Active", "Expiring", "Paused", "Expired"

    public Member(int id, String memberId, String fullName, String planType, Integer trainerId,
                  LocalDate joinDate, LocalDate expiryDate, String status) {
        this.id = id;
        this.setMemberId(memberId);
        this.setFullName(fullName);
        this.setPlanType(planType);
        this.trainerId = trainerId;
        this.joinDate = joinDate;
        this.expiryDate = expiryDate;
        this.setStatus(status);
    }

    // Encapsulated Getters & Setters with validation
    public int getId() { return id; }

    public String getMemberId() { return memberId; }
    public void setMemberId(String memberId) {
        if (memberId == null || memberId.trim().isEmpty()) {
            throw new IllegalArgumentException("Member ID cannot be empty.");
        }
        this.memberId = memberId.trim().toUpperCase();
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) {
        if (fullName == null || fullName.trim().length() < 2) {
            throw new IllegalArgumentException("Full name must be at least 2 characters.");
        }
        this.fullName = fullName.trim();
    }

    public String getPlanType() { return planType; }
    public void setPlanType(String planType) {
        if (!planType.equalsIgnoreCase("Silver") &&
            !planType.equalsIgnoreCase("Gold") &&
            !planType.equalsIgnoreCase("Platinum")) {
            throw new IllegalArgumentException("Invalid plan tier: " + planType + ". Allowed: Silver, Gold, Platinum.");
        }
        this.planType = planType.substring(0, 1).toUpperCase() + planType.substring(1).toLowerCase();
    }

    public Integer getTrainerId() { return trainerId; }
    public void setTrainerId(Integer trainerId) { this.trainerId = trainerId; }

    public LocalDate getJoinDate() { return joinDate; }
    public void setJoinDate(LocalDate joinDate) { this.joinDate = joinDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isEligibleForCheckIn() {
        return "Active".equalsIgnoreCase(this.status) || "Expiring".equalsIgnoreCase(this.status);
    }

    @Override
    public String toString() {
        return String.format("[%s] %-20s | Plan: %-8s | Status: %-8s | Expiry: %s",
                memberId, fullName, planType, status, expiryDate);
    }
}
