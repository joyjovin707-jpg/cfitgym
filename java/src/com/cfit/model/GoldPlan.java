package com.cfit.model;

/**
 * Runtime Polymorphism: Concrete Implementation of Gold Tier
 */
public class GoldPlan extends MembershipPlan {

    public GoldPlan() {
        super("Gold", 2500.0);
    }

    @Override
    public double calculateFee(int durationMonths) {
        if (durationMonths <= 1) return 2500.0;
        if (durationMonths == 3) return 7000.0;   // Quarterly discount
        if (durationMonths == 6) return 13500.0;  // Half-yearly discount
        if (durationMonths >= 12) return 25000.0; // Annual discount
        return durationMonths * baseMonthlyRate;
    }

    @Override
    public String getBenefitsSummary() {
        return "All-Day Access, Sauna & Steam, 2 Free Personal Training Sessions/mo";
    }
}
