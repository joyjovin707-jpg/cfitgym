package com.cfit.model;

/**
 * Runtime Polymorphism: Concrete Implementation of Platinum Tier
 */
public class PlatinumPlan extends MembershipPlan {

    public PlatinumPlan() {
        super("Platinum", 3500.0);
    }

    @Override
    public double calculateFee(int durationMonths) {
        if (durationMonths <= 1) return 3500.0;
        if (durationMonths == 3) return 9800.0;   // Quarterly discount
        if (durationMonths == 6) return 18500.0;  // Half-yearly discount
        if (durationMonths >= 12) return 28000.0; // Annual special discount
        return durationMonths * baseMonthlyRate;
    }

    @Override
    public String getBenefitsSummary() {
        return "VIP Access 24/7, Unlimited Studio Group Classes, Dedicated Trainer, Nutrition Consultation";
    }
}
