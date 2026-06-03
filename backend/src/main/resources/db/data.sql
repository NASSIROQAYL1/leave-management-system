-- Seed password strategy:
-- All seeded users intentionally share the same placeholder bcrypt-formatted value below.
-- Replace with a real BCryptPasswordEncoder-generated hash before enabling real login flows.
-- Planned shared seed password label for future phases: ChangeMe123!

INSERT INTO departments (id, name, description, manager_id, created_at) VALUES
    (1, 'Engineering', 'Builds and maintains internal and customer-facing systems.', NULL, '2026-01-02 09:00:00'),
    (2, 'Human Resources', 'Owns people operations, payroll coordination, and policy execution.', NULL, '2026-01-02 09:05:00');

INSERT INTO users (
    id, first_name, last_name, email, password, phone, profile_picture, hire_date, role,
    department_id, manager_id, is_active, failed_login_attempts, account_locked_until, created_at, updated_at
) VALUES
    (1, 'Amina', 'Bennani', 'admin@company.com', '$2a$10$seedplaceholderbcryptvalueforphaseoneonly1234567890abcd', '+212600000001', NULL, '2021-03-01', 'ADMIN', 2, NULL, TRUE, 0, NULL, '2026-01-02 09:10:00', '2026-01-02 09:10:00'),
    (2, 'Youssef', 'Mansouri', 'youssef.mansouri@company.com', '$2a$10$seedplaceholderbcryptvalueforphaseoneonly1234567890abcd', '+212600000002', NULL, '2021-05-17', 'MANAGER', 1, 1, TRUE, 0, NULL, '2026-01-02 09:15:00', '2026-01-02 09:15:00'),
    (3, 'Salma', 'Idrissi', 'salma.idrissi@company.com', '$2a$10$seedplaceholderbcryptvalueforphaseoneonly1234567890abcd', '+212600000003', NULL, '2022-01-10', 'MANAGER', 2, 1, TRUE, 0, NULL, '2026-01-02 09:20:00', '2026-01-02 09:20:00'),
    (4, 'Karim', 'El Alaoui', 'karim.elalaoui@company.com', '$2a$10$seedplaceholderbcryptvalueforphaseoneonly1234567890abcd', '+212600000004', NULL, '2023-02-06', 'EMPLOYEE', 1, 2, TRUE, 0, NULL, '2026-01-02 09:25:00', '2026-01-02 09:25:00'),
    (5, 'Nadia', 'Chraibi', 'nadia.chraibi@company.com', '$2a$10$seedplaceholderbcryptvalueforphaseoneonly1234567890abcd', '+212600000005', NULL, '2023-06-12', 'EMPLOYEE', 1, 2, TRUE, 0, NULL, '2026-01-02 09:30:00', '2026-01-02 09:30:00'),
    (6, 'Omar', 'Benomar', 'omar.benomar@company.com', '$2a$10$seedplaceholderbcryptvalueforphaseoneonly1234567890abcd', '+212600000006', NULL, '2024-01-08', 'EMPLOYEE', 1, 2, TRUE, 0, NULL, '2026-01-02 09:35:00', '2026-01-02 09:35:00'),
    (7, 'Hind', 'Tazi', 'hind.tazi@company.com', '$2a$10$seedplaceholderbcryptvalueforphaseoneonly1234567890abcd', '+212600000007', NULL, '2022-11-21', 'EMPLOYEE', 2, 3, TRUE, 0, NULL, '2026-01-02 09:40:00', '2026-01-02 09:40:00'),
    (8, 'Mehdi', 'Amrani', 'mehdi.amrani@company.com', '$2a$10$seedplaceholderbcryptvalueforphaseoneonly1234567890abcd', '+212600000008', NULL, '2024-04-15', 'EMPLOYEE', 2, 3, TRUE, 0, NULL, '2026-01-02 09:45:00', '2026-01-02 09:45:00');

UPDATE departments SET manager_id = 2 WHERE id = 1;
UPDATE departments SET manager_id = 3 WHERE id = 2;

INSERT INTO leave_types (id, name, description, color_hex, max_days_per_year, requires_document, is_paid, is_active, created_at) VALUES
    (1, 'Annual Leave', 'Planned paid time off for vacation and personal rest.', '#10B981', 18, FALSE, TRUE, TRUE, '2026-01-02 10:00:00'),
    (2, 'Sick Leave', 'Medical absence that may require a supporting document for longer periods.', '#F59E0B', 10, TRUE, TRUE, TRUE, '2026-01-02 10:05:00'),
    (3, 'Unpaid Leave', 'Exceptional leave without salary continuation.', '#64748B', 30, FALSE, FALSE, TRUE, '2026-01-02 10:10:00'),
    (4, 'Maternity Leave', 'Protected maternity leave for eligible employees.', '#8B5CF6', 98, TRUE, TRUE, TRUE, '2026-01-02 10:15:00');

INSERT INTO leave_balances (id, user_id, leave_type_id, year, total_days, used_days) VALUES
    (1, 1, 1, 2026, 20, 2.0), (2, 1, 2, 2026, 10, 0.0), (3, 1, 3, 2026, 30, 0.0),
    (4, 2, 1, 2026, 18, 4.0), (5, 2, 2, 2026, 10, 1.0), (6, 2, 3, 2026, 30, 0.0),
    (7, 3, 1, 2026, 18, 3.0), (8, 3, 2, 2026, 10, 0.0), (9, 3, 3, 2026, 30, 0.0),
    (10, 4, 1, 2026, 18, 5.0), (11, 4, 2, 2026, 10, 1.0), (12, 4, 3, 2026, 30, 0.0),
    (13, 5, 1, 2026, 18, 2.0), (14, 5, 2, 2026, 10, 0.0), (15, 5, 3, 2026, 30, 0.0),
    (16, 6, 1, 2026, 18, 1.0), (17, 6, 2, 2026, 10, 0.0), (18, 6, 3, 2026, 30, 0.0),
    (19, 7, 1, 2026, 18, 6.0), (20, 7, 2, 2026, 10, 2.0), (21, 7, 3, 2026, 30, 0.0),
    (22, 8, 1, 2026, 18, 0.0), (23, 8, 2, 2026, 10, 0.0), (24, 8, 3, 2026, 30, 0.0);

INSERT INTO public_holidays (id, name, date, year, is_recurring, created_at) VALUES
    (1, 'New Year''s Day', '2026-01-01', 2026, TRUE, '2026-01-01 00:00:00'),
    (2, 'Labour Day', '2026-05-01', 2026, TRUE, '2026-01-01 00:00:00'),
    (3, 'Throne Day', '2026-07-30', 2026, TRUE, '2026-01-01 00:00:00'),
    (4, 'Independence Manifesto Day', '2026-01-11', 2026, TRUE, '2026-01-01 00:00:00'),
    (5, 'Independence Day', '2026-11-18', 2026, TRUE, '2026-01-01 00:00:00');

INSERT INTO leave_requests (
    id, user_id, leave_type_id, start_date, end_date, total_days, reason, attachment_url, status,
    manager_id, manager_comment, manager_action_date, admin_id, admin_comment, admin_action_date, created_at, updated_at
) VALUES
    (1, 4, 1, '2026-02-16', '2026-02-18', 3.0, 'Family travel planned in advance.', NULL, 'APPROVED', 2, 'Reviewed and approved for sprint planning coverage.', '2026-02-05 10:00:00', 1, 'Final approval confirmed.', '2026-02-06 09:30:00', '2026-02-04 14:00:00', '2026-02-06 09:30:00'),
    (2, 5, 2, '2026-03-09', '2026-03-10', 2.0, 'Medical consultation and recovery.', '/uploads/medical-note-nadia.pdf', 'APPROVED_BY_MANAGER', 2, 'Approved at manager level pending admin confirmation.', '2026-03-08 16:15:00', NULL, NULL, NULL, '2026-03-07 11:00:00', '2026-03-08 16:15:00'),
    (3, 6, 1, '2026-04-27', '2026-04-30', 4.0, 'Personal leave requested for travel.', NULL, 'PENDING', 2, NULL, NULL, NULL, NULL, NULL, '2026-04-20 08:45:00', '2026-04-20 08:45:00'),
    (4, 7, 2, '2026-01-19', '2026-01-20', 2.0, 'Seasonal flu recovery.', '/uploads/hind-sick-note.pdf', 'APPROVED', 3, 'Document received and team coverage arranged.', '2026-01-18 13:00:00', 1, 'Approved.', '2026-01-18 16:30:00', '2026-01-17 09:00:00', '2026-01-18 16:30:00'),
    (5, 8, 3, '2026-05-12', '2026-05-14', 3.0, 'Personal administrative obligations.', NULL, 'REJECTED_BY_MANAGER', 3, 'Team staffing is too tight during onboarding week.', '2026-05-05 12:20:00', NULL, NULL, NULL, '2026-05-04 10:10:00', '2026-05-05 12:20:00'),
    (6, 2, 1, '2026-08-10', '2026-08-14', 5.0, 'Manager summer leave request.', NULL, 'APPROVED', 1, 'Escalated directly to admin because requester is a manager.', '2026-07-15 10:00:00', 1, 'Approved and coverage delegated.', '2026-07-15 15:00:00', '2026-07-14 09:30:00', '2026-07-15 15:00:00'),
    (7, 5, 1, '2026-09-02', '2026-09-03', 2.0, 'Request cancelled by employee after schedule change.', NULL, 'CANCELLED', 2, 'Originally approved by manager.', '2026-08-20 14:45:00', NULL, NULL, NULL, '2026-08-19 09:00:00', '2026-08-25 08:30:00'),
    (8, 3, 1, '2026-06-22', '2026-06-26', 5.0, 'HR planning leave.', NULL, 'REJECTED', 1, 'Escalated to admin for final decision.', '2026-06-10 11:00:00', 1, 'Deferred due to payroll system migration.', '2026-06-11 16:00:00', '2026-06-09 10:00:00', '2026-06-11 16:00:00');

INSERT INTO notifications (id, user_id, title, message, type, is_read, related_request_id, created_at) VALUES
    (1, 2, 'New leave request', 'Karim El Alaoui submitted a leave request awaiting review.', 'INFO', FALSE, 1, '2026-02-04 14:05:00'),
    (2, 1, 'Manager-approved request', 'Nadia Chraibi has a request waiting for admin approval.', 'WARNING', FALSE, 2, '2026-03-08 16:20:00'),
    (3, 6, 'Leave request pending', 'Your annual leave request is awaiting manager approval.', 'INFO', TRUE, 3, '2026-04-20 08:46:00'),
    (4, 8, 'Request rejected', 'Your unpaid leave request was rejected by your manager.', 'ERROR', FALSE, 5, '2026-05-05 12:25:00');

INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, created_at) VALUES
    (1, 1, 'SEED_IMPORT', 'SYSTEM', NULL, NULL, 'Initial database seed executed.', '127.0.0.1', '2026-01-02 11:00:00'),
    (2, 2, 'APPROVE_REQUEST', 'LEAVE_REQUEST', 1, 'PENDING', 'APPROVED_BY_MANAGER', '10.0.0.21', '2026-02-05 10:00:00'),
    (3, 1, 'FINAL_APPROVAL', 'LEAVE_REQUEST', 1, 'APPROVED_BY_MANAGER', 'APPROVED', '10.0.0.10', '2026-02-06 09:30:00');
