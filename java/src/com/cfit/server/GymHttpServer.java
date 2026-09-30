package com.cfit.server;

import com.cfit.model.*;
import com.cfit.service.GymServiceImpl;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Built-in Pure Java HTTP Server:
 * Runs on port 8080 using JDK's standard library com.sun.net.httpserver.
 * Provides REST endpoints backed by the Java OOP service layer.
 */
public class GymHttpServer {

    private static final int PORT = 8080;
    private static final GymServiceImpl gymService = GymServiceImpl.getInstance();

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        server.createContext("/api/members", new MembersHandler());
        server.createContext("/api/payments", new PaymentsHandler());
        server.createContext("/api/plan-fee", new PlanFeeHandler());
        server.createContext("/api/attendance", new AttendanceHandler());
        server.createContext("/api/trainers", new TrainersHandler());
        server.createContext("/api/diagnostics", new DiagnosticsHandler());

        server.setExecutor(null); // default executor
        server.start();
        System.out.println("[JAVA SERVER] C-FIT Java Backend Server running on http://localhost:" + PORT + "/api/");
    }

    private static void sendResponse(HttpExchange exchange, int statusCode, String responseText) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        byte[] bytes = responseText.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    static class MembersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            List<Member> members = gymService.getAllMembers();
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < members.size(); i++) {
                Member m = members.get(i);
                sb.append(String.format("{\"id\":%d,\"member_id\":\"%s\",\"full_name\":\"%s\",\"plan\":\"%s\",\"status\":\"%s\"}",
                        m.getId(), m.getMemberId(), m.getFullName(), m.getPlanType(), m.getStatus()));
                if (i < members.size() - 1) sb.append(",");
            }
            sb.append("]");
            sendResponse(exchange, 200, sb.toString());
        }
    }

    static class PaymentsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            List<PaymentRecord> payments = gymService.getAllPayments();
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < payments.size(); i++) {
                PaymentRecord p = payments.get(i);
                sb.append(String.format("{\"id\":%d,\"member_id\":\"%s\",\"member_name\":\"%s\",\"plan\":\"%s\",\"amount\":%.2f,\"status\":\"%s\"}",
                        p.getId(), p.getMemberId(), p.getMemberName(), p.getPlanDescription(), p.getAmount(), p.getPaymentStatus()));
                if (i < payments.size() - 1) sb.append(",");
            }
            sb.append("]");
            sendResponse(exchange, 200, sb.toString());
        }
    }

    static class PlanFeeHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String query = exchange.getRequestURI().getQuery();
            String tier = "Silver";
            int months = 1;

            if (query != null) {
                for (String param : query.split("&")) {
                    String[] pair = param.split("=");
                    if (pair.length == 2) {
                        if (pair[0].equalsIgnoreCase("tier")) tier = pair[1];
                        if (pair[0].equalsIgnoreCase("months")) {
                            try { months = Integer.parseInt(pair[1]); } catch (NumberFormatException ignored) {}
                        }
                    }
                }
            }

            try {
                double fee = gymService.computePlanFee(tier, months);
                String json = String.format("{\"tier\":\"%s\",\"duration_months\":%d,\"total_fee\":%.2f,\"currency\":\"INR\"}",
                        tier, months, fee);
                sendResponse(exchange, 200, json);
            } catch (Exception e) {
                sendResponse(exchange, 400, "{\"error\":\"" + e.getMessage() + "\"}");
            }
        }
    }

    static class AttendanceHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            List<AttendanceRecord> list = gymService.getRecentAttendance();
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) {
                AttendanceRecord r = list.get(i);
                sb.append(String.format("{\"id\":%d,\"member_id\":\"%s\",\"member_name\":\"%s\",\"check_in\":\"%s\"}",
                        r.getId(), r.getMemberId(), r.getMemberName(), r.getCheckInTime()));
                if (i < list.size() - 1) sb.append(",");
            }
            sb.append("]");
            sendResponse(exchange, 200, sb.toString());
        }
    }

    static class TrainersHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            List<Trainer> trainers = gymService.getAllTrainers();
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < trainers.size(); i++) {
                Trainer t = trainers.get(i);
                sb.append(String.format("{\"id\":%d,\"name\":\"%s\",\"specialty\":\"%s\",\"phone\":\"%s\"}",
                        t.getId(), t.getName(), t.getSpecialty(), t.getPhone()));
                if (i < trainers.size() - 1) sb.append(",");
            }
            sb.append("]");
            sendResponse(exchange, 200, sb.toString());
        }
    }

    static class DiagnosticsHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String json = "{\"architecture\":\"Java 17 OOP\"," +
                    "\"principles\":[\"Encapsulation (Private fields with guarded mutators)\"," +
                    "\"Abstraction (GymOperations interface & MembershipPlan abstract class)\"," +
                    "\"Inheritance (User -> StaffUser & AdminUser)\"," +
                    "\"Polymorphism (SilverPlan, GoldPlan, PlatinumPlan runtime dispatch)\"," +
                    "\"Singleton (GymServiceImpl.getInstance())\"]}";
            sendResponse(exchange, 200, json);
        }
    }
}
