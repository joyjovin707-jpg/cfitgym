package com.cfit.model;

import java.time.LocalDateTime;

/**
 * Inheritance Principle - Base Class:
 * Represents any authenticated user in the C-FIT management system.
 * Subclasses: StaffUser and AdminUser.
 */
public class User {
    protected int id;
    protected String username;
    protected String passwordHash;
    protected String fullName;
    protected String email;
    protected String role; // "Admin" or "Staff"
    protected LocalDateTime createdAt;

    public User(int id, String username, String passwordHash, String fullName, String email, String role) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.createdAt = LocalDateTime.now();
    }

    // Encapsulated getters & setters
    public int getId() { return id; }
    public String getUsername() { return username; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public boolean verifyPassword(String inputPassword) {
        return this.passwordHash != null && this.passwordHash.equals(inputPassword);
    }

    public boolean isAdmin() {
        return "Admin".equalsIgnoreCase(this.role);
    }

    @Override
    public String toString() {
        return "[" + role + "] " + fullName + " (@" + username + ")";
    }
}
