# C-FIT FITNESS CLUB: OBJECT-ORIENTED MANAGEMENT SYSTEM (JAVA EDITION)
**Curriculum**: KTU S3 B.Tech CSE — CST 205: Object-Oriented Programming (Java)

---

## 1. Project Overview
C-FIT is an enterprise-grade Gym and Fitness Center Management System modeled using core Object-Oriented Programming principles in Java. It features complete entities for Members, Trainers, Attendance, Payments, and Classes, with dynamic plan-based pricing calculations and Role-Based Access Control (RBAC).

---

## 2. Core OOP Concepts Implemented

### A. Encapsulation (`com.cfit.model.*`)
- **`Member.java`**: All instance variables (`id`, `memberId`, `fullName`, `planType`, `status`, `expiryDate`) are declared `private`.
- **Validation in Mutators**: `setMemberId()` enforces non-empty uppercase strings; `setPlanType()` validates allowable plan tiers (`Silver`, `Gold`, `Platinum`). State cannot be corrupted by external classes.
- **`User.java`**, **`AttendanceRecord.java`**, **`PaymentRecord.java`**, **`Trainer.java`**, and **`FitnessClass.java`** encapsulate their internal representations.

### B. Abstraction (`com.cfit.service.GymOperations`, `com.cfit.model.MembershipPlan`)
- **`GymOperations.java` Interface**: Exposes abstract operations (`registerMember`, `checkInMember`, `computePlanFee`, `recordPayment`) without leaking storage implementations.
- **`MembershipPlan.java` Abstract Class**: Declares abstract methods `calculateFee(int durationMonths)` and `getBenefitsSummary()` implemented by concrete subclasses.

### C. Inheritance (`com.cfit.model.*`)
- **`User.java` (Parent Class)**: Common identity attributes (`id`, `username`, `fullName`, `email`, `role`, password verification).
- **`StaffUser.java` (Child Class)**: Extends `User`, adding duty shift schedules and fine-grained permission flags (`canManageMembers`, `canProcessPayments`).
- **`AdminUser.java` (Child Class)**: Extends `User`, possessing root administrative privileges.

### D. Polymorphism
- **Runtime Polymorphism (Method Overriding & Dynamic Dispatch)**:
  `MembershipPlan` -> `SilverPlan` (₹1,800/mo), `GoldPlan` (₹2,500/mo), and `PlatinumPlan` (₹3,500/mo) each override `calculateFee(int durationMonths)` with tier-specific duration discounts.
  In payment recording, selecting a member invokes `plan.calculateFee(months)` dynamically depending on their concrete plan instance.
- **Compile-Time Polymorphism (Method Overloading)**:
  - `findMember(String memberId)`: Searches member by string code (e.g., `"GYM-0101"`).
  - `findMember(int numericId)`: Searches member by internal integer primary key.

### E. Design Pattern: Singleton
- **`GymServiceImpl.java`**: Implements the Singleton pattern (`private static GymServiceImpl instance`, private constructor, `public static synchronized GymServiceImpl getInstance()`) ensuring single-point-of-truth state management.

---

## 3. Directory Structure
```
java/
├── src/
│   └── com/cfit/
│       ├── Main.java                        # Interactive Console Application
│       ├── gui/
│       │   └── GymDesktopApp.java           # Java Swing Modern Dark Desktop GUI
│       ├── server/
│       │   └── GymHttpServer.java           # Built-in Java REST HTTP Server (port 8080)
│       ├── model/
│       │   ├── User.java                    # Base User (Inheritance)
│       │   ├── StaffUser.java               # Subclass (Inheritance & RBAC)
│       │   ├── AdminUser.java               # Subclass (Inheritance)
│       │   ├── Member.java                  # Encapsulated Member Entity
│       │   ├── MembershipPlan.java          # Abstract Class (Abstraction)
│       │   ├── SilverPlan.java              # Concrete Plan Subclass (Polymorphism)
│       │   ├── GoldPlan.java                # Concrete Plan Subclass (Polymorphism)
│       │   ├── PlatinumPlan.java            # Concrete Plan Subclass (Polymorphism)
│       │   ├── Trainer.java                 # Encapsulated Trainer
│       │   ├── FitnessClass.java            # Encapsulated Class Schedule
│       │   ├── AttendanceRecord.java        # Encapsulated Attendance Log
│       │   └── PaymentRecord.java           # Encapsulated Billing Invoice
│       └── service/
│           ├── GymOperations.java           # Business Logic Interface (Abstraction)
│           └── GymServiceImpl.java          # Singleton Implementation Service
└── bin/                                     # Compiled .class Bytecode files
```

---

## 4. How to Compile and Run

### Option 1: Using the Unified Launcher Script
```bash
./run_java.sh
```

### Option 2: Running the Java Swing Desktop GUI
```bash
javac -d java/bin $(find java/src -name "*.java")
java -cp java/bin com.cfit.gui.GymDesktopApp
```

### Option 3: Running the Interactive Console CLI
```bash
javac -d java/bin $(find java/src -name "*.java")
java -cp java/bin com.cfit.Main
```

### Option 4: Running the Java REST API Server
```bash
javac -d java/bin $(find java/src -name "*.java")
java -cp java/bin com.cfit.server.GymHttpServer
```

---

## 5. Pre-configured Credentials
- **System Admin**: Username `admin` | Password `admin123`
- **Duty Staff**: Username `staff1` | Password `staff123`
