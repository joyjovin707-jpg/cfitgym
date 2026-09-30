package com.cfit.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Encapsulated model for check-in attendance records.
 */
public class AttendanceRecord {
    private int id;
    private String memberId;
    private String memberName;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private int durationMinutes;

    public AttendanceRecord(int id, String memberId, String memberName, LocalDateTime checkInTime) {
        this.id = id;
        this.memberId = memberId;
        this.memberName = memberName;
        this.checkInTime = checkInTime;
        this.checkOutTime = null;
        this.durationMinutes = 0;
    }

    public int getId() { return id; }
    public String getMemberId() { return memberId; }
    public String getMemberName() { return memberName; }
    public LocalDateTime getCheckInTime() { return checkInTime; }
    public LocalDateTime getCheckOutTime() { return checkOutTime; }
    public int getDurationMinutes() { return durationMinutes; }

    public void checkOut(LocalDateTime outTime) {
        this.checkOutTime = outTime;
        if (checkInTime != null && checkOutTime != null) {
            this.durationMinutes = (int) java.time.Duration.between(checkInTime, checkOutTime).toMinutes();
        }
    }

    @Override
    public String toString() {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd-MMM HH:mm");
        String inStr = checkInTime.format(dtf);
        String outStr = (checkOutTime != null) ? checkOutTime.format(dtf) : "Active in Gym";
        return String.format("Log #%d | %s (%s) | In: %s | Out: %s", id, memberName, memberId, inStr, outStr);
    }
}
