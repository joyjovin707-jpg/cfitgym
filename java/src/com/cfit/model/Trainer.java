package com.cfit.model;

/**
 * Encapsulated Trainer Model:
 * Manages gym fitness instructors and personal trainers.
 */
public class Trainer {
    private int id;
    private String name;
    private String specialty; // e.g. "Strength & Conditioning", "HIIT & Cardio", "Yoga & Flexibility"
    private String phone;
    private String email;
    private String status; // "Active" or "On Leave"

    public Trainer(int id, String name, String specialty, String phone, String email, String status) {
        this.id = id;
        this.setName(name);
        this.specialty = specialty;
        this.phone = phone;
        this.email = email;
        this.status = status;
    }

    public int getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) {
        if (name == null || name.trim().length() < 2) {
            throw new IllegalArgumentException("Trainer name must be at least 2 characters.");
        }
        this.name = name.trim();
    }

    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toString() {
        return String.format("[Trainer #%d] %-20s | %-22s | %s", id, name, specialty, phone);
    }
}
