package com.cfit.gui;

import com.cfit.model.*;
import com.cfit.service.GymServiceImpl;

import javax.swing.*;
import javax.swing.border.EmptyBorder;
import javax.swing.border.LineBorder;
import javax.swing.table.DefaultTableCellRenderer;
import javax.swing.table.DefaultTableModel;
import javax.swing.table.JTableHeader;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.time.LocalDate;
import java.util.List;

/**
 * C-FIT Desktop Management Application (Java Swing Edition)
 * Replicates all C-FIT UI visual properties, dark aesthetic, and features
 * using pure Java Desktop (javax.swing).
 */
public class GymDesktopApp extends JFrame {

    private final GymServiceImpl gymService = GymServiceImpl.getInstance();
    private User currentUser;

    // Theme Colors (matching C-FIT Web UI)
    private static final Color BG_DARK = new Color(16, 18, 20);       // #101214
    private static final Color PANEL_DARK = new Color(26, 29, 33);    // #1A1D21
    private static final Color CARD_DARK = new Color(33, 37, 40);     // #212528
    private static final Color BORDER_COLOR = new Color(44, 48, 52);  // #2C3034
    private static final Color ACCENT_LIME = new Color(201, 255, 61); // #C9FF3D
    private static final Color TEXT_WHITE = new Color(237, 238, 234); // #EDEEEA
    private static final Color TEXT_MUTED = new Color(154, 158, 159); // #9A9E9F
    private static final Color TEXT_SUBTLE = new Color(93, 97, 100);  // #5D6164

    private JPanel contentCards;
    private CardLayout cardLayout;

    // Table Models
    private DefaultTableModel membersTableModel;
    private DefaultTableModel paymentsTableModel;
    private DefaultTableModel attendanceTableModel;
    private DefaultTableModel trainersTableModel;

    public GymDesktopApp() {
        this.currentUser = gymService.authenticate("admin", "admin123");
        initUI();
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try {
                UIManager.setLookAndFeel(UIManager.getCrossPlatformLookAndFeelClassName());
            } catch (Exception ignored) {}
            GymDesktopApp app = new GymDesktopApp();
            app.setVisible(true);
        });
    }

    private void initUI() {
        setTitle("C-FIT Fitness Management System — Java Edition (OOP KTU S3 CSE)");
        setSize(1100, 720);
        setMinimumSize(new Dimension(950, 600));
        setLocationRelativeTo(null);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        getContentPane().setBackground(BG_DARK);
        setLayout(new BorderLayout());

        // Sidebar
        JPanel sidebar = createSidebar();
        add(sidebar, BorderLayout.WEST);

        // Content Area (CardLayout)
        cardLayout = new CardLayout();
        contentCards = new JPanel(cardLayout);
        contentCards.setBackground(BG_DARK);

        contentCards.add(createDashboardPanel(), "dashboard");
        contentCards.add(createMembersPanel(), "members");
        contentCards.add(createTrainersPanel(), "trainers");
        contentCards.add(createAttendancePanel(), "attendance");
        contentCards.add(createPaymentsPanel(), "payments");
        contentCards.add(createStaffControlPanel(), "staff_control");
        contentCards.add(createDiagnosticsPanel(), "diagnostics");

        add(contentCards, BorderLayout.CENTER);
    }

    private JPanel createSidebar() {
        JPanel sidebar = new JPanel();
        sidebar.setPreferredSize(new Dimension(220, 0));
        sidebar.setBackground(PANEL_DARK);
        sidebar.setBorder(BorderFactory.createMatteBorder(0, 0, 0, 1, BORDER_COLOR));
        sidebar.setLayout(new BorderLayout());

        // Header / Brand
        JPanel brandPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 12, 16));
        brandPanel.setBackground(PANEL_DARK);

        JLabel logoBadge = new JLabel(" C ", SwingConstants.CENTER);
        logoBadge.setOpaque(true);
        logoBadge.setBackground(ACCENT_LIME);
        logoBadge.setForeground(BG_DARK);
        logoBadge.setFont(new Font("SansSerif", Font.BOLD, 18));
        logoBadge.setPreferredSize(new Dimension(32, 32));

        JPanel brandText = new JPanel(new GridLayout(2, 1));
        brandText.setBackground(PANEL_DARK);
        JLabel brandName = new JLabel("C-FIT");
        brandName.setForeground(TEXT_WHITE);
        brandName.setFont(new Font("SansSerif", Font.BOLD, 16));
        JLabel brandSub = new JLabel("JAVA OOP SYSTEM");
        brandSub.setForeground(TEXT_SUBTLE);
        brandSub.setFont(new Font("Monospaced", Font.BOLD, 9));
        brandText.add(brandName);
        brandText.add(brandSub);

        brandPanel.add(logoBadge);
        brandPanel.add(brandText);
        sidebar.add(brandPanel, BorderLayout.NORTH);

        // Navigation Buttons
        JPanel navPanel = new JPanel();
        navPanel.setLayout(new BoxLayout(navPanel, BoxLayout.Y_AXIS));
        navPanel.setBackground(PANEL_DARK);
        navPanel.setBorder(new EmptyBorder(10, 8, 10, 8));

        String[][] navItems = {
                {"Dashboard", "dashboard"},
                {"Members", "members"},
                {"Trainers", "trainers"},
                {"Attendance", "attendance"},
                {"Payments", "payments"},
                {"Staff Control", "staff_control"},
                {"OOP Diagnostics", "diagnostics"}
        };

        for (String[] item : navItems) {
            JButton btn = new JButton(item[0]);
            btn.setMaximumSize(new Dimension(204, 38));
            btn.setAlignmentX(Component.CENTER_ALIGNMENT);
            btn.setBackground(CARD_DARK);
            btn.setForeground(TEXT_WHITE);
            btn.setFont(new Font("SansSerif", Font.PLAIN, 12));
            btn.setFocusPainted(false);
            btn.setBorder(BorderFactory.createCompoundBorder(
                    new LineBorder(BORDER_COLOR, 1, true),
                    new EmptyBorder(6, 12, 6, 12)
            ));
            btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
            btn.addActionListener((ActionEvent e) -> cardLayout.show(contentCards, item[1]));

            navPanel.add(btn);
            navPanel.add(Box.createVerticalStrut(6));
        }

        sidebar.add(navPanel, BorderLayout.CENTER);

        // Footer User Profile
        JPanel userFooter = new JPanel(new BorderLayout());
        userFooter.setBackground(CARD_DARK);
        userFooter.setBorder(BorderFactory.createCompoundBorder(
                BorderFactory.createMatteBorder(1, 0, 0, 0, BORDER_COLOR),
                new EmptyBorder(12, 12, 12, 12)
        ));

        JLabel uName = new JLabel(currentUser.getFullName());
        uName.setForeground(TEXT_WHITE);
        uName.setFont(new Font("SansSerif", Font.BOLD, 11));

        JLabel uRole = new JLabel(currentUser.getRole().toUpperCase() + " | cfit.db");
        uRole.setForeground(ACCENT_LIME);
        uRole.setFont(new Font("Monospaced", Font.PLAIN, 10));

        userFooter.add(uName, BorderLayout.NORTH);
        userFooter.add(uRole, BorderLayout.SOUTH);
        sidebar.add(userFooter, BorderLayout.SOUTH);

        return sidebar;
    }

    private JPanel createDashboardPanel() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBackground(BG_DARK);
        panel.setBorder(new EmptyBorder(24, 24, 24, 24));

        JLabel title = new JLabel("Operational Dashboard");
        title.setFont(new Font("SansSerif", Font.BOLD, 24));
        title.setForeground(TEXT_WHITE);

        JPanel header = new JPanel(new BorderLayout());
        header.setBackground(BG_DARK);
        header.add(title, BorderLayout.NORTH);

        JLabel sub = new JLabel("Overview of members, active check-ins, trainers, and dynamic revenue");
        sub.setForeground(TEXT_MUTED);
        sub.setFont(new Font("SansSerif", Font.PLAIN, 12));
        header.add(sub, BorderLayout.SOUTH);
        panel.add(header, BorderLayout.NORTH);

        // Stats Cards Grid
        JPanel statsGrid = new JPanel(new GridLayout(2, 2, 16, 16));
        statsGrid.setBackground(BG_DARK);
        statsGrid.setBorder(new EmptyBorder(20, 0, 20, 0));

        statsGrid.add(createMetricCard("TOTAL REGISTERED MEMBERS", String.valueOf(gymService.getAllMembers().size()), "Active & Expiring"));
        statsGrid.add(createMetricCard("CERTIFIED TRAINERS", String.valueOf(gymService.getAllTrainers().size()), "On gym floor"));
        statsGrid.add(createMetricCard("TODAY'S CHECK-INS", String.valueOf(gymService.getRecentAttendance().size()), "Reception desk"));
        statsGrid.add(createMetricCard("PAYMENT TRANSACTIONS", String.valueOf(gymService.getAllPayments().size()), "Dynamic tiered invoicing"));

        panel.add(statsGrid, BorderLayout.CENTER);
        return panel;
    }

    private JPanel createMetricCard(String label, String value, String sub) {
        JPanel card = new JPanel(new BorderLayout());
        card.setBackground(PANEL_DARK);
        card.setBorder(BorderFactory.createCompoundBorder(
                new LineBorder(BORDER_COLOR, 1, true),
                new EmptyBorder(16, 16, 16, 16)
        ));

        JLabel lbl = new JLabel(label);
        lbl.setFont(new Font("Monospaced", Font.BOLD, 10));
        lbl.setForeground(TEXT_SUBTLE);

        JLabel val = new JLabel(value);
        val.setFont(new Font("SansSerif", Font.BOLD, 32));
        val.setForeground(ACCENT_LIME);

        JLabel s = new JLabel(sub);
        s.setFont(new Font("SansSerif", Font.PLAIN, 11));
        s.setForeground(TEXT_MUTED);

        card.add(lbl, BorderLayout.NORTH);
        card.add(val, BorderLayout.CENTER);
        card.add(s, BorderLayout.SOUTH);
        return card;
    }

    private JPanel createMembersPanel() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBackground(BG_DARK);
        panel.setBorder(new EmptyBorder(24, 24, 24, 24));

        JPanel topBar = new JPanel(new BorderLayout());
        topBar.setBackground(BG_DARK);
        JLabel title = new JLabel("Members Directory");
        title.setFont(new Font("SansSerif", Font.BOLD, 22));
        title.setForeground(TEXT_WHITE);
        topBar.add(title, BorderLayout.WEST);

        JButton addBtn = new JButton("+ Register Member");
        styleAccentButton(addBtn);
        addBtn.addActionListener(e -> showRegisterMemberDialog());
        topBar.add(addBtn, BorderLayout.EAST);
        panel.add(topBar, BorderLayout.NORTH);

        // Members Table
        String[] cols = {"ID", "Member Code", "Full Name", "Plan Tier", "Join Date", "Expiry Date", "Status"};
        membersTableModel = new DefaultTableModel(cols, 0) {
            @Override
            public boolean isCellEditable(int row, int col) { return false; }
        };
        refreshMembersTable();

        JTable table = createDarkTable(membersTableModel);
        JScrollPane scroll = new JScrollPane(table);
        scroll.getViewport().setBackground(PANEL_DARK);
        scroll.setBorder(new LineBorder(BORDER_COLOR, 1));
        panel.add(scroll, BorderLayout.CENTER);

        return panel;
    }

    private void refreshMembersTable() {
        membersTableModel.setRowCount(0);
        for (Member m : gymService.getAllMembers()) {
            membersTableModel.addRow(new Object[]{
                    m.getId(), m.getMemberId(), m.getFullName(), m.getPlanType(),
                    m.getJoinDate(), m.getExpiryDate(), m.getStatus()
            });
        }
    }

    private JPanel createPaymentsPanel() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBackground(BG_DARK);
        panel.setBorder(new EmptyBorder(24, 24, 24, 24));

        JPanel topBar = new JPanel(new BorderLayout());
        topBar.setBackground(BG_DARK);
        JLabel title = new JLabel("Billing & Invoicing (Dynamic Tier Rates)");
        title.setFont(new Font("SansSerif", Font.BOLD, 22));
        title.setForeground(TEXT_WHITE);
        topBar.add(title, BorderLayout.WEST);

        JButton addBtn = new JButton("+ Record Payment");
        styleAccentButton(addBtn);
        addBtn.addActionListener(e -> showRecordPaymentDialog());
        topBar.add(addBtn, BorderLayout.EAST);
        panel.add(topBar, BorderLayout.NORTH);

        // Table
        String[] cols = {"Invoice #", "Member Code", "Member Name", "Plan Description", "Amount (₹)", "Status", "Due Date"};
        paymentsTableModel = new DefaultTableModel(cols, 0) {
            @Override
            public boolean isCellEditable(int row, int col) { return false; }
        };
        refreshPaymentsTable();

        JTable table = createDarkTable(paymentsTableModel);
        JScrollPane scroll = new JScrollPane(table);
        scroll.getViewport().setBackground(PANEL_DARK);
        scroll.setBorder(new LineBorder(BORDER_COLOR, 1));
        panel.add(scroll, BorderLayout.CENTER);

        return panel;
    }

    private void refreshPaymentsTable() {
        paymentsTableModel.setRowCount(0);
        for (PaymentRecord p : gymService.getAllPayments()) {
            paymentsTableModel.addRow(new Object[]{
                    p.getId(), p.getMemberId(), p.getMemberName(), p.getPlanDescription(),
                    String.format("₹ %,.2f", p.getAmount()), p.getPaymentStatus(), p.getDueDate()
            });
        }
    }

    /**
     * DYNAMIC PLAN PRICING DIALOG:
     * When selecting a member from the dropdown, their plan tier is immediately inspected
     * and the amount dynamically changes according to their membership plan.
     */
    private void showRecordPaymentDialog() {
        JDialog dialog = new JDialog(this, "Record Payment — Dynamic Fee Engine", true);
        dialog.setSize(480, 420);
        dialog.setLocationRelativeTo(this);
        dialog.getContentPane().setBackground(PANEL_DARK);
        dialog.setLayout(new BorderLayout());

        JPanel form = new JPanel(new GridLayout(6, 2, 10, 14));
        form.setBackground(PANEL_DARK);
        form.setBorder(new EmptyBorder(20, 20, 20, 20));

        List<Member> members = gymService.getAllMembers();
        String[] memberNames = new String[members.size()];
        for (int i = 0; i < members.size(); i++) {
            memberNames[i] = members.get(i).getMemberId() + " — " + members.get(i).getFullName() + " (" + members.get(i).getPlanType() + ")";
        }

        JComboBox<String> memberCombo = new JComboBox<>(memberNames);
        JLabel planLabel = new JLabel("Plan Tier: ");
        planLabel.setForeground(TEXT_WHITE);
        JLabel planValue = new JLabel("-");
        planValue.setForeground(ACCENT_LIME);
        planValue.setFont(new Font("SansSerif", Font.BOLD, 13));

        JComboBox<String> durationCombo = new JComboBox<>(new String[]{
                "1 Month", "3 Months (Quarterly)", "6 Months (Half-Yearly)", "12 Months (Annual)"
        });

        JLabel amountLabel = new JLabel("Computed Payable: ");
        amountLabel.setForeground(TEXT_WHITE);
        JLabel amountValue = new JLabel("₹ 0.00");
        amountValue.setForeground(ACCENT_LIME);
        amountValue.setFont(new Font("SansSerif", Font.BOLD, 18));

        // Listener to dynamically update amount when member or duration changes!
        Runnable updateCalculation = () -> {
            int selectedIdx = memberCombo.getSelectedIndex();
            if (selectedIdx >= 0 && selectedIdx < members.size()) {
                Member m = members.get(selectedIdx);
                planValue.setText(m.getPlanType() + " Plan");

                int months = 1;
                int durIdx = durationCombo.getSelectedIndex();
                if (durIdx == 1) months = 3;
                else if (durIdx == 2) months = 6;
                else if (durIdx == 3) months = 12;

                double fee = gymService.computePlanFee(m.getPlanType(), months);
                amountValue.setText(String.format("₹ %,.2f", fee));
            }
        };

        memberCombo.addActionListener(e -> updateCalculation.run());
        durationCombo.addActionListener(e -> updateCalculation.run());
        updateCalculation.run(); // initial trigger

        form.add(createFormLabel("Select Member:"));
        form.add(memberCombo);
        form.add(createFormLabel("Current Plan:"));
        form.add(planValue);
        form.add(createFormLabel("Duration:"));
        form.add(durationCombo);
        form.add(amountLabel);
        form.add(amountValue);

        dialog.add(form, BorderLayout.CENTER);

        JPanel btnPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 12));
        btnPanel.setBackground(PANEL_DARK);
        btnPanel.setBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, BORDER_COLOR));

        JButton cancelBtn = new JButton("Cancel");
        cancelBtn.setBackground(CARD_DARK);
        cancelBtn.setForeground(TEXT_WHITE);
        cancelBtn.addActionListener(e -> dialog.dispose());

        JButton confirmBtn = new JButton("Confirm & Issue Invoice");
        styleAccentButton(confirmBtn);
        confirmBtn.addActionListener(e -> {
            int selectedIdx = memberCombo.getSelectedIndex();
            if (selectedIdx >= 0 && selectedIdx < members.size()) {
                Member m = members.get(selectedIdx);
                int months = 1;
                int durIdx = durationCombo.getSelectedIndex();
                if (durIdx == 1) months = 3;
                else if (durIdx == 2) months = 6;
                else if (durIdx == 3) months = 12;

                double fee = gymService.computePlanFee(m.getPlanType(), months);
                gymService.recordPayment(m.getMemberId(), m.getPlanType() + " — " + months + " Mo", fee, "Paid");
                refreshPaymentsTable();
                dialog.dispose();
                JOptionPane.showMessageDialog(this, "Payment recorded successfully! Invoice generated for ₹ " + fee);
            }
        });

        btnPanel.add(cancelBtn);
        btnPanel.add(confirmBtn);
        dialog.add(btnPanel, BorderLayout.SOUTH);

        dialog.setVisible(true);
    }

    private void showRegisterMemberDialog() {
        JDialog dialog = new JDialog(this, "Register New Member", true);
        dialog.setSize(420, 360);
        dialog.setLocationRelativeTo(this);
        dialog.getContentPane().setBackground(PANEL_DARK);
        dialog.setLayout(new BorderLayout());

        JPanel form = new JPanel(new GridLayout(4, 2, 10, 14));
        form.setBackground(PANEL_DARK);
        form.setBorder(new EmptyBorder(20, 20, 20, 20));

        JTextField codeField = new JTextField("GYM-0" + (100 + gymService.getAllMembers().size() + 1));
        JTextField nameField = new JTextField();
        JComboBox<String> planCombo = new JComboBox<>(new String[]{"Silver", "Gold", "Platinum"});

        form.add(createFormLabel("Member Code:"));
        form.add(codeField);
        form.add(createFormLabel("Full Name:"));
        form.add(nameField);
        form.add(createFormLabel("Membership Tier:"));
        form.add(planCombo);

        dialog.add(form, BorderLayout.CENTER);

        JPanel btnPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT, 10, 12));
        btnPanel.setBackground(PANEL_DARK);
        btnPanel.setBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, BORDER_COLOR));

        JButton saveBtn = new JButton("Save Member");
        styleAccentButton(saveBtn);
        saveBtn.addActionListener(e -> {
            try {
                String code = codeField.getText().trim();
                String name = nameField.getText().trim();
                String plan = (String) planCombo.getSelectedItem();
                LocalDate today = LocalDate.now();

                Member m = new Member(gymService.getAllMembers().size() + 1, code, name, plan, null, today, today.plusMonths(6), "Active");
                gymService.registerMember(m);
                refreshMembersTable();
                dialog.dispose();
                JOptionPane.showMessageDialog(this, "Member registered successfully: " + m.getFullName());
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(dialog, ex.getMessage(), "Validation Error", JOptionPane.ERROR_MESSAGE);
            }
        });

        btnPanel.add(saveBtn);
        dialog.add(btnPanel, BorderLayout.SOUTH);
        dialog.setVisible(true);
    }

    private JPanel createTrainersPanel() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBackground(BG_DARK);
        panel.setBorder(new EmptyBorder(24, 24, 24, 24));

        JLabel title = new JLabel("Certified Fitness Trainers");
        title.setFont(new Font("SansSerif", Font.BOLD, 22));
        title.setForeground(TEXT_WHITE);
        panel.add(title, BorderLayout.NORTH);

        String[] cols = {"Trainer ID", "Name", "Specialty Area", "Contact Phone", "Status"};
        trainersTableModel = new DefaultTableModel(cols, 0) {
            @Override public boolean isCellEditable(int r, int c) { return false; }
        };
        for (Trainer t : gymService.getAllTrainers()) {
            trainersTableModel.addRow(new Object[]{t.getId(), t.getName(), t.getSpecialty(), t.getPhone(), t.getStatus()});
        }

        JTable table = createDarkTable(trainersTableModel);
        JScrollPane scroll = new JScrollPane(table);
        scroll.getViewport().setBackground(PANEL_DARK);
        scroll.setBorder(new LineBorder(BORDER_COLOR, 1));
        panel.add(scroll, BorderLayout.CENTER);

        return panel;
    }

    private JPanel createAttendancePanel() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBackground(BG_DARK);
        panel.setBorder(new EmptyBorder(24, 24, 24, 24));

        JPanel topBar = new JPanel(new BorderLayout());
        topBar.setBackground(BG_DARK);
        JLabel title = new JLabel("Attendance Terminal (Check-In Logs)");
        title.setFont(new Font("SansSerif", Font.BOLD, 22));
        title.setForeground(TEXT_WHITE);
        topBar.add(title, BorderLayout.WEST);

        JButton checkinBtn = new JButton("Check-In Member");
        styleAccentButton(checkinBtn);
        checkinBtn.addActionListener(e -> {
            String code = JOptionPane.showInputDialog(this, "Enter Member Code (e.g. GYM-0101):", "Reception Check-In", JOptionPane.QUESTION_MESSAGE);
            if (code != null && !code.trim().isEmpty()) {
                try {
                    AttendanceRecord rec = gymService.checkInMember(code.trim());
                    refreshAttendanceTable();
                    JOptionPane.showMessageDialog(this, "Checked in successfully: " + rec.getMemberName());
                } catch (Exception ex) {
                    JOptionPane.showMessageDialog(this, ex.getMessage(), "Check-In Error", JOptionPane.ERROR_MESSAGE);
                }
            }
        });
        topBar.add(checkinBtn, BorderLayout.EAST);
        panel.add(topBar, BorderLayout.NORTH);

        String[] cols = {"Log #", "Member Code", "Member Name", "Check-In Time", "Check-Out Time", "Status"};
        attendanceTableModel = new DefaultTableModel(cols, 0) {
            @Override public boolean isCellEditable(int r, int c) { return false; }
        };
        refreshAttendanceTable();

        JTable table = createDarkTable(attendanceTableModel);
        JScrollPane scroll = new JScrollPane(table);
        scroll.getViewport().setBackground(PANEL_DARK);
        scroll.setBorder(new LineBorder(BORDER_COLOR, 1));
        panel.add(scroll, BorderLayout.CENTER);

        return panel;
    }

    private void refreshAttendanceTable() {
        attendanceTableModel.setRowCount(0);
        for (AttendanceRecord r : gymService.getRecentAttendance()) {
            attendanceTableModel.addRow(new Object[]{
                    r.getId(), r.getMemberId(), r.getMemberName(),
                    r.getCheckInTime().toString().replace("T", " "),
                    (r.getCheckOutTime() != null ? r.getCheckOutTime().toString() : "—"),
                    (r.getCheckOutTime() == null ? "ACTIVE" : "COMPLETED")
            });
        }
    }

    private JPanel createStaffControlPanel() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBackground(BG_DARK);
        panel.setBorder(new EmptyBorder(24, 24, 24, 24));

        JLabel title = new JLabel("Staff Control & Role-Based Access Control (RBAC)");
        title.setFont(new Font("SansSerif", Font.BOLD, 22));
        title.setForeground(TEXT_WHITE);
        panel.add(title, BorderLayout.NORTH);

        DefaultTableModel staffModel = new DefaultTableModel(new String[]{"ID", "Staff Member", "Username", "Role", "Shift", "Status"}, 0);
        gymService.getUserRegistry().forEach((k, u) -> {
            String shift = (u instanceof StaffUser) ? ((StaffUser) u).getDutyShift() : "Full Authority";
            String stat = (u instanceof StaffUser) ? ((StaffUser) u).getStatus() : "Active";
            staffModel.addRow(new Object[]{u.getId(), u.getFullName(), u.getUsername(), u.getRole(), shift, stat});
        });

        JTable table = createDarkTable(staffModel);
        JScrollPane scroll = new JScrollPane(table);
        scroll.getViewport().setBackground(PANEL_DARK);
        scroll.setBorder(new LineBorder(BORDER_COLOR, 1));
        panel.add(scroll, BorderLayout.CENTER);

        return panel;
    }

    private JPanel createDiagnosticsPanel() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBackground(BG_DARK);
        panel.setBorder(new EmptyBorder(24, 24, 24, 24));

        JLabel title = new JLabel("OOP Architectural Principles Mapping (KTU S3 B.Tech CSE)");
        title.setFont(new Font("SansSerif", Font.BOLD, 20));
        title.setForeground(ACCENT_LIME);
        panel.add(title, BorderLayout.NORTH);

        JTextArea ta = new JTextArea();
        ta.setBackground(PANEL_DARK);
        ta.setForeground(TEXT_WHITE);
        ta.setFont(new Font("Monospaced", Font.PLAIN, 13));
        ta.setBorder(new EmptyBorder(16, 16, 16, 16));
        ta.setEditable(false);
        ta.setText(
                "========================================================================================\n" +
                "               C-FIT GYM SYSTEM: OBJECT-ORIENTED PROGRAMMING MAPPING (JAVA)             \n" +
                "========================================================================================\n\n" +
                "1. ENCAPSULATION:\n" +
                "   • Member.java: Private variables (memberId, fullName, planType, status).\n" +
                "   • Guarded Mutators: setMemberId() enforces non-null, setPlanType() validates tier enum.\n" +
                "   • AttendanceRecord.java & PaymentRecord.java enforce state boundaries.\n\n" +
                "2. ABSTRACTION:\n" +
                "   • GymOperations.java interface: Abstract high-level operations decoupled from storage.\n" +
                "   • MembershipPlan.java abstract class: Declares abstract double calculateFee(int months).\n\n" +
                "3. INHERITANCE:\n" +
                "   • User.java (Parent) -> StaffUser.java (Child with shifts & permission flags).\n" +
                "   • User.java (Parent) -> AdminUser.java (Child with root access authority).\n\n" +
                "4. POLYMORPHISM:\n" +
                "   • Runtime Polymorphism (Method Overriding): MembershipPlan -> SilverPlan, GoldPlan, PlatinumPlan.\n" +
                "   • Compile-time Polymorphism (Method Overloading): findMember(String id) vs findMember(int id).\n\n" +
                "5. SINGLETON DESIGN PATTERN:\n" +
                "   • GymServiceImpl.java enforces private constructor & global thread-safe getInstance().\n" +
                "========================================================================================\n"
        );

        panel.add(new JScrollPane(ta), BorderLayout.CENTER);
        return panel;
    }

    private JLabel createFormLabel(String text) {
        JLabel l = new JLabel(text);
        l.setForeground(TEXT_WHITE);
        l.setFont(new Font("SansSerif", Font.PLAIN, 12));
        return l;
    }

    private void styleAccentButton(JButton btn) {
        btn.setBackground(ACCENT_LIME);
        btn.setForeground(BG_DARK);
        btn.setFont(new Font("SansSerif", Font.BOLD, 12));
        btn.setFocusPainted(false);
        btn.setBorder(new EmptyBorder(8, 14, 8, 14));
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
    }

    private JTable createDarkTable(DefaultTableModel model) {
        JTable table = new JTable(model);
        table.setBackground(PANEL_DARK);
        table.setForeground(TEXT_WHITE);
        table.setRowHeight(28);
        table.setGridColor(BORDER_COLOR);
        table.setFont(new Font("SansSerif", Font.PLAIN, 12));
        table.setSelectionBackground(new Color(44, 48, 52));
        table.setSelectionForeground(ACCENT_LIME);

        JTableHeader header = table.getTableHeader();
        header.setBackground(CARD_DARK);
        header.setForeground(TEXT_MUTED);
        header.setFont(new Font("SansSerif", Font.BOLD, 11));
        header.setBorder(new LineBorder(BORDER_COLOR, 1));

        DefaultTableCellRenderer centerRenderer = new DefaultTableCellRenderer();
        centerRenderer.setHorizontalAlignment(JLabel.CENTER);

        return table;
    }
}
