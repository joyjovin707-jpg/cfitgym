package com.cfit.model;

/**
 * Encapsulated Fitness Class Model:
 * Manages group fitness schedules, capacity limits, and trainers.
 */
public class FitnessClass {
    private int id;
    private String title;
    private String category; // "HIIT", "Strength", "Yoga", "Spinning"
    private int trainerId;
    private String trainerName;
    private String scheduleTime; // e.g. "07:00 AM - 08:00 AM"
    private String dayOfWeek;
    private int maxCapacity;
    private int bookedCount;

    public FitnessClass(int id, String title, String category, int trainerId, String trainerName,
                        String scheduleTime, String dayOfWeek, int maxCapacity, int bookedCount) {
        this.id = id;
        this.title = title;
        this.category = category;
        this.trainerId = trainerId;
        this.trainerName = trainerName;
        this.scheduleTime = scheduleTime;
        this.dayOfWeek = dayOfWeek;
        this.maxCapacity = maxCapacity;
        this.bookedCount = bookedCount;
    }

    public int getId() { return id; }
    public String getTitle() { return title; }
    public String getCategory() { return category; }
    public int getTrainerId() { return trainerId; }
    public String getTrainerName() { return trainerName; }
    public String getScheduleTime() { return scheduleTime; }
    public String getDayOfWeek() { return dayOfWeek; }
    public int getMaxCapacity() { return maxCapacity; }
    public int getBookedCount() { return bookedCount; }

    public boolean isFull() {
        return bookedCount >= maxCapacity;
    }

    public boolean bookSpot() {
        if (!isFull()) {
            bookedCount++;
            return true;
        }
        return false;
    }

    @Override
    public String toString() {
        return String.format("[%s] %-20s | Time: %s (%s) | Trainer: %s | Slots: %d/%d",
                category, title, scheduleTime, dayOfWeek, trainerName, bookedCount, maxCapacity);
    }
}
