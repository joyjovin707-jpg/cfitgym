package com.cfit.model;

/**
 * Runtime Polymorphism: Concrete Implementation of Silver Tier
 */
public class SilverPlan extends MembershipPlan {

    public SilverPlan() {
        super("Silver", 1800.0);
    }

    @Override
    public double calculateFee(int durationMonths) {
        if (durationMonths <= 1) return 1800.0;
        if (durationMonths == 3) return 5000.0;  // Quarterly discount
        if (durationMonths == 6) return 9500.0;  // Half-yearly discount
        if (durationMonths >= 12) return 18000.0; // Annual discount
        return durationMonths * baseMonthlyRate;
    }

    @Override
    public String getBenefitsSummary() {
        return "General Gym Floor Access, Locker Room Access (Off-Peak Hours)";
    }
}
