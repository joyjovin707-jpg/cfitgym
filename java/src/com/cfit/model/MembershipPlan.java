package com.cfit.model;

/**
 * Abstraction & Polymorphism Principle:
 * Abstract base class for all gym membership tiers.
 * Subclasses (SilverPlan, GoldPlan, PlatinumPlan) provide specialized pricing implementations.
 */
public abstract class MembershipPlan {
    protected String tierName;
    protected double baseMonthlyRate;

    public MembershipPlan(String tierName, double baseMonthlyRate) {
        this.tierName = tierName;
        this.baseMonthlyRate = baseMonthlyRate;
    }

    public String getTierName() {
        return tierName;
    }

    public double getBaseMonthlyRate() {
        return baseMonthlyRate;
    }

    /**
     * Polymorphic method:
     * Overridden by each tier to calculate plan fee based on duration.
     */
    public abstract double calculateFee(int durationMonths);

    /**
     * Polymorphic method returning tier benefits description.
     */
    public abstract String getBenefitsSummary();

    @Override
    public String toString() {
        return tierName + " Plan [Monthly: Rs. " + baseMonthlyRate + "]";
    }
}
