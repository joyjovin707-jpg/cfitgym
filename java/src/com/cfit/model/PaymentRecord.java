package com.cfit.model;

import java.time.LocalDate;

/**
 * Encapsulated model for billing transactions.
 */
public class PaymentRecord {
    private int id;
    private String memberId;
    private String memberName;
    private String planDescription;
    private double amount;
    private LocalDate dueDate;
    private String paymentStatus; // "Paid", "Pending", "Overdue"

    public PaymentRecord(int id, String memberId, String memberName, String planDescription,
                         double amount, LocalDate dueDate, String paymentStatus) {
        this.id = id;
        this.memberId = memberId;
        this.memberName = memberName;
        this.planDescription = planDescription;
        this.amount = amount;
        this.dueDate = dueDate;
        this.paymentStatus = paymentStatus;
    }

    public int getId() { return id; }
    public String getMemberId() { return memberId; }
    public String getMemberName() { return memberName; }
    public String getPlanDescription() { return planDescription; }
    public double getAmount() { return amount; }
    public LocalDate getDueDate() { return dueDate; }
    public String getPaymentStatus() { return paymentStatus; }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    @Override
    public String toString() {
        return String.format("Invoice #%d | %s (%s) | %-25s | Rs. %,8.2f | Status: %-7s | Due: %s",
                id, memberName, memberId, planDescription, amount, paymentStatus, dueDate);
    }
}
