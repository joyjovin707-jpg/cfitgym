package com.cfit;

import com.cfit.model.*;
import com.cfit.service.GymServiceImpl;

import java.time.LocalDate;
import java.util.List;
import java.util.Scanner;

/**
 * C-FIT Fitness Management System — Main Application Entry Point
 * Designed for KTU S3 B.Tech CSE: Object Oriented Programming (Java) Project Defense.
 */
public class Main {

    private static final GymServiceImpl gymService = GymServiceImpl.getInstance();
    private static User currentUser = null;
    private static final Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) {
        printBanner();

        // 1. Initial Authentication
        while (currentUser == null) {
            loginMenu();
        }

        // 2. Main System Menu Loop
        boolean running = true;
        while (running) {
            printMainMenu();
            System.out.print("Enter choice (1-8): ");
            String choice = scanner.nextLine().trim();

            switch (choice) {
                case "1":
                    handleListMembers();
                    break;
                case "2":
                    handleRegisterMember();
                    break;
                case "3":
                    handleDynamicPlanCalculation();
                    break;
                case "4":
                    handleAttendanceCheckIn();
                    break;
                case "5":
                    handleRecordPayment();
                    break;
                case "6":
                    handleStaffControl();
                    break;
                case "7":
                    handleSystemDiagnostics();
                    break;
                case "8":
                    System.out.println("\n[INFO] Logging out. Thank you for evaluating C-FIT Management System.");
                    running = false;
                    break;
                default:
                    System.out.println("[WARN] Invalid option. Please enter a number between 1 and 8.");
            }
        }
    }

    private static void printBanner() {
        System.out.println("================================================================================");
        System.out.println("   C-FIT FITNESS CLUB: OBJECT-ORIENTED MANAGEMENT SYSTEM (JAVA EDITION)");
        System.out.println("   APJ Abdul Kalam Technological University (KTU) | S3 B.Tech CSE OOP Project");
        System.out.println("================================================================================");
    }

    private static void loginMenu() {
        System.out.println("\n--- [TERMINAL LOGIN] ---");
        System.out.println("Demo Accounts Available:");
        System.out.println("  1. Admin Account : username = 'admin'  | password = 'admin123'");
        System.out.println("  2. Staff Account : username = 'staff1' | password = 'staff123'");
        System.out.print("\nEnter Username: ");
        String u = scanner.nextLine().trim();
        System.out.print("Enter Password: ");
        String p = scanner.nextLine().trim();

        User user = gymService.authenticate(u, p);
        if (user != null) {
            currentUser = user;
            System.out.println("\n[SUCCESS] Welcome, " + user.getFullName() + "! Logged in as: " + user.getRole());
        } else {
            System.out.println("\n[ERROR] Invalid credentials! Please check your username and password.");
        }
    }

    private static void printMainMenu() {
        System.out.println("\n--------------------------------------------------------------------------------");
        System.out.println("ACTIVE SESSION: " + currentUser.getFullName() + " [" + currentUser.getRole() + "]");
        System.out.println("--------------------------------------------------------------------------------");
        System.out.println(" 1. View All Registered Members (Encapsulated Entity List)");
        System.out.println(" 2. Register New Member (Data Validation & Encapsulation)");
        System.out.println(" 3. Dynamic Plan Pricing Calculator (Polymorphic Tier Strategy)");
        System.out.println(" 4. Attendance Terminal: Member Check-In / Check-Out");
        System.out.println(" 5. Billing & Invoicing: Record Payment (Dynamic Tier Rates)");
        System.out.println(" 6. Staff Control & RBAC Hierarchy (Admin Exclusive)");
        System.out.println(" 7. Database Diagnostics & OOP Architecture Mapping");
        System.out.println(" 8. Exit / Logout");
        System.out.println("--------------------------------------------------------------------------------");
    }

    private static void handleListMembers() {
        System.out.println("\n--- [REGISTERED GYM MEMBERS] ---");
        List<Member> members = gymService.getAllMembers();
        if (members.isEmpty()) {
            System.out.println("No members currently registered.");
        } else {
            for (Member m : members) {
                System.out.println(m);
            }
        }
    }

    private static void handleRegisterMember() {
        // RBAC Check
        if (currentUser instanceof StaffUser && !((StaffUser) currentUser).canManageMembers()) {
            System.out.println("\n[ACCESS DENIED] Your staff account lacks 'canManageMembers' privilege.");
            return;
        }

        System.out.println("\n--- [NEW MEMBER REGISTRATION] ---");
        try {
            System.out.print("Enter Member Code (e.g. GYM-0145): ");
            String code = scanner.nextLine().trim();
            System.out.print("Enter Full Name: ");
            String name = scanner.nextLine().trim();
            System.out.print("Select Plan Tier (Silver / Gold / Platinum): ");
            String tier = scanner.nextLine().trim();

            LocalDate today = LocalDate.now();
            Member newMember = new Member(
                    gymService.getAllMembers().size() + 1,
                    code, name, tier, null, today, today.plusMonths(6), "Active"
            );

            gymService.registerMember(newMember);
            System.out.println("\n[SUCCESS] Member successfully registered: " + newMember);
        } catch (IllegalArgumentException e) {
            System.out.println("\n[VALIDATION FAILED] " + e.getMessage());
        }
    }

    private static void handleDynamicPlanCalculation() {
        System.out.println("\n--- [DYNAMIC PLAN PRICING CALCULATOR (POLYMORPHISM)] ---");
        System.out.println("Choose Plan Tier:");
        System.out.println("  1. Silver   (Base: Rs. 1,800/mo)");
        System.out.println("  2. Gold     (Base: Rs. 2,500/mo)");
        System.out.println("  3. Platinum (Base: Rs. 3,500/mo)");
        System.out.print("Select (1-3): ");
        String pChoice = scanner.nextLine().trim();

        String tier = "Silver";
        if (pChoice.equals("2")) tier = "Gold";
        else if (pChoice.equals("3")) tier = "Platinum";

        System.out.print("Enter Duration in Months (e.g. 1, 3, 6, 12): ");
        try {
            int months = Integer.parseInt(scanner.nextLine().trim());
            // Invoking polymorphic calculation
            double fee = gymService.computePlanFee(tier, months);
            MembershipPlan plan = gymService.getPlanCatalog().get(tier);

            System.out.println("\n================================================================================");
            System.out.printf("  Plan Tier     : %s%n", tier);
            System.out.printf("  Billing Cycle : %d Month(s)%n", months);
            System.out.printf("  Total Payable : Rs. %,.2f%n", fee);
            System.out.printf("  Tier Benefits : %s%n", plan.getBenefitsSummary());
            System.out.println("================================================================================");
        } catch (NumberFormatException e) {
            System.out.println("[ERROR] Please enter a valid numerical duration.");
        }
    }

    private static void handleAttendanceCheckIn() {
        System.out.println("\n--- [ATTENDANCE TERMINAL] ---");
        System.out.print("Enter Member Code to Check-In (e.g. GYM-0101): ");
        String code = scanner.nextLine().trim();

        try {
            AttendanceRecord rec = gymService.checkInMember(code);
            System.out.println("\n[SUCCESS] Checked in: " + rec);
        } catch (Exception e) {
            System.out.println("\n[CHECK-IN FAILED] " + e.getMessage());
        }
    }

    private static void handleRecordPayment() {
        // RBAC Check
        if (currentUser instanceof StaffUser && !((StaffUser) currentUser).canProcessPayments()) {
            System.out.println("\n[ACCESS DENIED] Your staff account lacks 'canProcessPayments' privilege.");
            return;
        }

        System.out.println("\n--- [RECORD PAYMENT & INVOICING] ---");
        System.out.print("Enter Member Code (e.g. GYM-0101): ");
        String code = scanner.nextLine().trim();

        Member m = gymService.findMember(code);
        if (m == null) {
            System.out.println("[ERROR] Member with code " + code + " not found!");
            return;
        }

        System.out.println("Member found: " + m.getFullName() + " | Current Plan: " + m.getPlanType());
        System.out.print("Enter Billing Duration in Months (1, 3, 6, 12): ");
        try {
            int duration = Integer.parseInt(scanner.nextLine().trim());
            double autoAmount = gymService.computePlanFee(m.getPlanType(), duration);
            System.out.printf("Computed Auto-Fee for %s (%d months): Rs. %,.2f%n", m.getPlanType(), duration, autoAmount);

            System.out.print("Confirm Payment of Rs. " + autoAmount + " (y/n)? ");
            String conf = scanner.nextLine().trim();
            if (conf.equalsIgnoreCase("y")) {
                gymService.recordPayment(m.getMemberId(), m.getPlanType() + " — " + duration + " Month(s)", autoAmount, "Paid");
                System.out.println("\n[SUCCESS] Payment recorded and invoice issued successfully!");
            } else {
                System.out.println("[INFO] Payment transaction cancelled.");
            }
        } catch (Exception e) {
            System.out.println("[ERROR] " + e.getMessage());
        }
    }

    private static void handleStaffControl() {
        if (!currentUser.isAdmin()) {
            System.out.println("\n[RESTRICTED MODULE] Staff Control is reserved for Admin accounts only.");
            return;
        }

        System.out.println("\n--- [ADMIN EXCLUSIVE: STAFF CONTROL & PRIVILEGES] ---");
        System.out.println("Current Staff Registry:");
        gymService.getUserRegistry().forEach((uname, u) -> {
            System.out.println(" • " + u);
        });
    }

    private static void handleSystemDiagnostics() {
        System.out.println("\n================================================================================");
        System.out.println("             C-FIT OOP SYSTEM ARCHITECTURE DIAGNOSTICS");
        System.out.println("================================================================================");
        System.out.println(" 1. ENCAPSULATION : Member and User private fields with guarded getters/setters.");
        System.out.println(" 2. ABSTRACTION   : GymOperations interface decoupling logic from presentation.");
        System.out.println(" 3. INHERITANCE   : User parent class -> StaffUser & AdminUser specialized children.");
        System.out.println(" 4. POLYMORPHISM  : MembershipPlan abstract base -> Silver, Gold, Platinum pricing.");
        System.out.println(" 5. DESIGN PATTERN: Singleton Pattern implemented on GymServiceImpl.");
        System.out.println("================================================================================");
    }
}
