-- ==========================================================
-- Smart Educational Center Database Seeding Script (MSSQL)
-- ==========================================================

USE center;
GO

-- 1. Seed Teachers
IF NOT EXISTS (SELECT 1 FROM teachers WHERE user_name = 'tamer_physics')
BEGIN
    INSERT INTO teachers (teacher_ssn, full_name, phone, Subject, user_name, password)
    VALUES 
    ('29001011234567', N'Dr. Tamer Hassan', '+201012345678', N'Physics', 'tamer_physics', '$2a$10$wE4Z0b1BlyQz5gV8vR5M4.v7dK1nN3H4c2m8q6r9t0y1u2i3o4p5a'),
    ('28805051234568', N'Eng. Sarah Ahmed', '+201123456789', N'Mathematics & Calculus', 'sarah_math', '$2a$10$wE4Z0b1BlyQz5gV8vR5M4.v7dK1nN3H4c2m8q6r9t0y1u2i3o4p5a');
END
GO

-- 2. Seed Students
IF NOT EXISTS (SELECT 1 FROM students WHERE user_name = 'omar_khaled')
BEGIN
    INSERT INTO students (full_Name, student_phone, parent_phone, grade_level, QR_code, user_name, password, created_At)
    VALUES 
    (N'Omar Khaled Mahmoud', '+201200001111', '+201000002222', N'Grade 12 (Thanaweya Amma)', 'STD-2026-0001-OKM', 'omar_khaled', '$2a$10$wE4Z0b1BlyQz5gV8vR5M4.v7dK1nN3H4c2m8q6r9t0y1u2i3o4p5a', GETDATE()),
    (N'Nour El-Din Youssef', '+201200003333', '+201000004444', N'Grade 12 (Thanaweya Amma)', 'STD-2026-0002-NDY', 'nour_youssef', '$2a$10$wE4Z0b1BlyQz5gV8vR5M4.v7dK1nN3H4c2m8q6r9t0y1u2i3o4p5a', GETDATE()),
    (N'Mariam Ali Mostafa', '+201200005555', '+201000006666', N'Grade 11 (Secondary 2)', 'STD-2026-0003-MAM', 'mariam_ali', '$2a$10$wE4Z0b1BlyQz5gV8vR5M4.v7dK1nN3H4c2m8q6r9t0y1u2i3o4p5a', GETDATE());
END
GO

-- 3. Seed Groups
IF NOT EXISTS (SELECT 1 FROM groups WHERE group_name LIKE '%Physics Elite%')
BEGIN
    DECLARE @Teacher1 INT = (SELECT TOP 1 teacher_id FROM teachers WHERE user_name = 'tamer_physics');
    DECLARE @Teacher2 INT = (SELECT TOP 1 teacher_id FROM teachers WHERE user_name = 'sarah_math');

    INSERT INTO groups (teacher_id, group_name, monthly_fee, is_active)
    VALUES
    (@Teacher1, N'Physics Elite - Grade 12 (Sun & Wed 5 PM)', 450.00, 1),
    (@Teacher2, N'Calculus Champions - Grade 12 (Mon & Thu 6 PM)', 500.00, 1),
    (@Teacher1, N'Physics Foundations - Grade 11 (Sat & Tue 4 PM)', 400.00, 1);
END
GO

-- 4. Enroll Students in Groups
IF NOT EXISTS (SELECT 1 FROM student_groups)
BEGIN
    DECLARE @S1 INT = (SELECT TOP 1 student_ID FROM students WHERE user_name = 'omar_khaled');
    DECLARE @S2 INT = (SELECT TOP 1 student_ID FROM students WHERE user_name = 'nour_youssef');
    DECLARE @S3 INT = (SELECT TOP 1 student_ID FROM students WHERE user_name = 'mariam_ali');

    DECLARE @G1 INT = (SELECT TOP 1 group_id FROM groups WHERE group_name LIKE '%Physics Elite%');
    DECLARE @G2 INT = (SELECT TOP 1 group_id FROM groups WHERE group_name LIKE '%Calculus Champions%');
    DECLARE @G3 INT = (SELECT TOP 1 group_id FROM groups WHERE group_name LIKE '%Physics Foundations%');

    INSERT INTO student_groups (student_id, group_id, enrollment_Date)
    VALUES 
    (@S1, @G1, GETDATE()),
    (@S1, @G2, GETDATE()),
    (@S2, @G1, GETDATE()),
    (@S3, @G3, GETDATE());
END
GO

-- 5. Seed Sessions
IF NOT EXISTS (SELECT 1 FROM sessions)
BEGIN
    DECLARE @G1_Sess INT = (SELECT TOP 1 group_id FROM groups WHERE group_name LIKE '%Physics Elite%');
    DECLARE @G2_Sess INT = (SELECT TOP 1 group_id FROM groups WHERE group_name LIKE '%Calculus Champions%');

    INSERT INTO sessions (group_id, session_date, session_title, homework_notes, completed)
    VALUES 
    (@G1_Sess, CAST(GETDATE()-4 AS DATE), N'Session 1: Electric Currents and Ohm''s Law Applications', N'Solve Chapter 1 problems 1-25 in the workbook. Submit next class.', 1),
    (@G1_Sess, CAST(GETDATE() AS DATE), N'Session 2: Kirchhoff''s Laws & Complex Circuits', N'Complete circuit analysis worksheet #2. Bring scientific calculators.', 0),
    (@G2_Sess, CAST(GETDATE()-3 AS DATE), N'Session 1: Differentiation Rules & Chain Rule', N'Section 2.3 problems 15-40.', 1);
END
GO

-- 6. Seed Attendance
IF NOT EXISTS (SELECT 1 FROM attendance)
BEGIN
    DECLARE @Sess1 INT = (SELECT TOP 1 session_ID FROM sessions WHERE session_title LIKE '%Session 1: Electric Currents%');
    DECLARE @Std1 INT = (SELECT TOP 1 student_ID FROM students WHERE user_name = 'omar_khaled');
    DECLARE @Std2 INT = (SELECT TOP 1 student_ID FROM students WHERE user_name = 'nour_youssef');

    INSERT INTO attendance (session_id, student_id, attend_time)
    VALUES 
    (@Sess1, @Std1, GETDATE()-4),
    (@Sess1, @Std2, GETDATE()-4);
END
GO

-- 7. Seed Payments
IF NOT EXISTS (SELECT 1 FROM payments)
BEGIN
    DECLARE @Std1_P INT = (SELECT TOP 1 student_ID FROM students WHERE user_name = 'omar_khaled');
    DECLARE @Std3_P INT = (SELECT TOP 1 student_ID FROM students WHERE user_name = 'mariam_ali');
    DECLARE @Grp1_P INT = (SELECT TOP 1 group_id FROM groups WHERE group_name LIKE '%Physics Elite%');
    DECLARE @Grp3_P INT = (SELECT TOP 1 group_id FROM groups WHERE group_name LIKE '%Physics Foundations%');

    INSERT INTO payments (student_id, group_id, target_month, target_year, amount_paid, payment_date)
    VALUES 
    (@Std1_P, @Grp1_P, 10, 2026, 450.00, GETDATE()-5),
    (@Std3_P, @Grp3_P, 10, 2026, 400.00, GETDATE()-3);
END
GO

PRINT 'Center Database Seeding Completed Successfully!';
