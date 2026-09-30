package com.cfit.model;

/**
 * Inheritance Principle - Subclass 2:
 * Specializes User with root administrative privileges and system control.
 */
public class AdminUser extends User {

    public AdminUser(int id, String username, String passwordHash, String fullName, String email) {
        super(id, username, passwordHash, fullName, email, "Admin");
    }

    public boolean canManageStaff() {
        return true;
    }

    public boolean canAccessFinancialDiagnostics() {
        return true;
    }

    @Override
    public String toString() {
        return "[SUPER ADMIN] " + fullName + " (@" + username + ") — Full Authority";
    }
}
