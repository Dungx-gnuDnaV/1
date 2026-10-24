import { getDb, initDatabase } from "./db";
import bcrypt from "bcryptjs";

export function seedDatabase() {
  initDatabase();
  const db = getDb();

  // Check if already seeded
  const userCount = (db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number }).count;
  if (userCount > 0) {
    console.log("Database already seeded.");
    return;
  }

  console.log("Seeding Smart SMS database with Vietnamese High School sample data...");

  const hashPassword = (pw: string) => bcrypt.hashSync(pw, 10);
  const commonPassword = hashPassword("123456");

  // Transaction for complete seed data insertion
  db.transaction(() => {
    // 1. Roles
    const roles = [
      { id: "role_admin", name: "Super Admin", description: "Quản trị viên toàn hệ thống" },
      { id: "role_principal", name: "Ban Giám Hiệu", description: "Hiệu trưởng / Phó hiệu trưởng" },
      { id: "role_teacher", name: "Giáo Viên", description: "Giáo viên chủ nhiệm & bộ môn" },
      { id: "role_staff", name: "Nhân Viên Văn Phòng", description: "Cán bộ văn phòng, học vụ" },
      { id: "role_student", name: "Học Sinh", description: "Học sinh nhà trường" },
      { id: "role_parent", name: "Phụ Huynh", description: "Phụ huynh / Người giám hộ" },
    ];
    const insertRole = db.prepare("INSERT INTO roles (id, name, description) VALUES (?, ?, ?)");
    roles.forEach((r) => insertRole.run(r.id, r.name, r.description));

    // 2. Academic Years & Semesters
    db.prepare("INSERT INTO academic_years (id, name, start_date, end_date, is_current) VALUES (?, ?, ?, ?, ?)").run(
      "ay_2024_2025",
      "Năm học 2024 - 2025",
      "2024-09-05",
      "2025-05-31",
      1
    );

    const insertSemester = db.prepare(
      "INSERT INTO semesters (id, academic_year_id, name, semester_number, start_date, end_date, is_current) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    insertSemester.run("sem_1_2024", "ay_2024_2025", "Học kỳ I", 1, "2024-09-05", "2025-01-15", 0);
    insertSemester.run("sem_2_2024", "ay_2024_2025", "Học kỳ II", 2, "2025-01-16", "2025-05-31", 1);

    // 3. System Settings
    const insertSetting = db.prepare("INSERT INTO system_settings (key, value, description) VALUES (?, ?, ?)");
    insertSetting.run("school_name", "Trường THPT Chuyên Nguyễn Huệ", "Tên trường học");
    insertSetting.run("school_code", "THPT-NH-001", "Mã trường");
    insertSetting.run("current_academic_year", "ay_2024_2025", "Năm học hiện tại");
    insertSetting.run("current_semester", "sem_2_2024", "Học kỳ hiện tại");
    insertSetting.run("rfid_mode", "Simulation", "Chế độ RFID (Simulation / Hardware)");
    insertSetting.run("ai_assistant_mode", "Active", "Trạng thái AI Trợ lý");

    // 4. Assessment Types
    const insertAssessment = db.prepare("INSERT INTO assessment_types (id, name, weight, code) VALUES (?, ?, ?, ?)");
    insertAssessment.run("at_regular", "Đánh giá thường xuyên", 1.0, "TX");
    insertAssessment.run("at_midterm", "Đánh giá giữa kỳ", 2.0, "GK");
    insertAssessment.run("at_final", "Đánh giá cuối kỳ", 3.0, "CK");

    // 5. Subjects
    const subjects = [
      { id: "sub_math", code: "MATH", name: "Toán học", credits: 4 },
      { id: "sub_lit", code: "LIT", name: "Ngữ văn", credits: 4 },
      { id: "sub_eng", code: "ENG", name: "Tiếng Anh", credits: 3 },
      { id: "sub_phys", code: "PHYS", name: "Vật lý", credits: 2 },
      { id: "sub_chem", code: "CHEM", name: "Hóa học", credits: 2 },
      { id: "sub_bio", code: "BIO", name: "Sinh học", credits: 2 },
      { id: "sub_hist", code: "HIST", name: "Lịch sử", credits: 2 },
      { id: "sub_geo", code: "GEO", name: "Địa lý", credits: 2 },
      { id: "sub_cs", code: "CS", name: "Tin học", credits: 2 },
      { id: "sub_pe", code: "PE", name: "Giáo dục thể chất", credits: 1 },
    ];
    const insertSubject = db.prepare("INSERT INTO subjects (id, code, name, credits) VALUES (?, ?, ?, ?)");
    subjects.forEach((s) => insertSubject.run(s.id, s.code, s.name, s.credits));

    // 6. Primary Admin & Principal Accounts
    const insertUser = db.prepare(
      "INSERT INTO users (id, username, email, password_hash, full_name, phone, avatar_url, role_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );

    insertUser.run("user_admin", "admin", "admin@smart-sms.edu.vn", commonPassword, "Nguyễn Văn Admin", "0901234567", "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin", "role_admin");
    insertUser.run("user_principal", "hieutruong", "hieutruong@smart-sms.edu.vn", commonPassword, "ThS. Trần Thị Mai (BGH)", "0902345678", "https://api.dicebear.com/7.x/avataaars/svg?seed=Principal", "role_principal");

    // 7. Teachers
    const teacherData = [
      { id: "tch_01", uid: "user_tch_01", code: "GV001", name: "ThS. Lê Hoàng Nam", spec: "Toán học", isHome: 1, phone: "0912111222" },
      { id: "tch_02", uid: "user_tch_02", code: "GV002", name: "Cô Nguyễn Thu Hương", spec: "Ngữ văn", isHome: 1, phone: "0912222333" },
      { id: "tch_03", uid: "user_tch_03", code: "GV003", name: "Thầy Phạm Đức Minh", spec: "Tiếng Anh", isHome: 1, phone: "0912333444" },
      { id: "tch_04", uid: "user_tch_04", code: "GV004", name: "ThS. Đặng Thị Thanh", spec: "Vật lý", isHome: 0, phone: "0912444555" },
      { id: "tch_05", uid: "user_tch_05", code: "GV005", name: "Thầy Vũ Quốc Anh", spec: "Tin học", isHome: 0, phone: "0912555666" },
    ];

    const insertTeacher = db.prepare(
      "INSERT INTO teachers (id, user_id, teacher_code, title, specialization, is_homeroom) VALUES (?, ?, ?, ?, ?, ?)"
    );

    teacherData.forEach((t) => {
      insertUser.run(t.uid, `gv_${t.code.toLowerCase()}`, `${t.code.toLowerCase()}@smart-sms.edu.vn`, commonPassword, t.name, t.phone, `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.code}`, "role_teacher");
      insertTeacher.run(t.id, t.uid, t.code, "Giáo viên", t.spec, t.isHome);
    });

    // 8. Classes
    const classData = [
      { id: "class_10a1", name: "10A1", grade: 10, teacherId: "tch_01", room: "A101", count: 35 },
      { id: "class_11a1", name: "11A1", grade: 11, teacherId: "tch_02", room: "B201", count: 38 },
      { id: "class_12a1", name: "12A1", grade: 12, teacherId: "tch_03", room: "C301", count: 40 },
    ];

    const insertClass = db.prepare(
      "INSERT INTO classes (id, name, grade_level, academic_year_id, homeroom_teacher_id, room_number, student_count) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );

    classData.forEach((c) => {
      insertClass.run(c.id, c.name, c.grade, "ay_2024_2025", c.teacherId, c.room, c.count);
    });

    // 9. Students & Parents
    const insertStudent = db.prepare(
      "INSERT INTO students (id, user_id, student_code, dob, gender, address, class_id, status, rfid_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    const insertParent = db.prepare("INSERT INTO parents (id, user_id, occupation) VALUES (?, ?, ?)");
    const insertParentLink = db.prepare(
      "INSERT INTO parent_student_links (id, parent_id, student_id, relationship, is_primary) VALUES (?, ?, ?, ?, ?)"
    );

    // Sample students for Class 11A1
    const studentList11A1 = [
      { id: "std_01", uid: "user_std_01", code: "HS2023001", name: "Nguyễn Minh Anh", gender: "Female", rfid: "RFID_11A1_01", dob: "2008-03-15", parentName: "Nguyễn Văn Hùng", parentPhone: "0988111222", parentJob: "Kỹ sư" },
      { id: "std_02", uid: "user_std_02", code: "HS2023002", name: "Trần Bảo Nam", gender: "Male", rfid: "RFID_11A1_02", dob: "2008-07-22", parentName: "Trần Đình Trọng", parentPhone: "0988222333", parentJob: "Bác sĩ" },
      { id: "std_03", uid: "user_std_03", code: "HS2023003", name: "Lê Hoàng Khánh Linh", gender: "Female", rfid: "RFID_11A1_03", dob: "2008-11-05", parentName: "Lê Văn Thành", parentPhone: "0988333444", parentJob: "Doanh nhân" },
      { id: "std_04", uid: "user_std_04", code: "HS2023004", name: "Phạm Quốc Cường", gender: "Male", rfid: "RFID_11A1_04", dob: "2008-01-30", parentName: "Phạm Thanh Tùng", parentPhone: "0988444555", parentJob: "Giáo viên" },
      { id: "std_05", uid: "user_std_05", code: "HS2023005", name: "Đỗ Phương Thảo", gender: "Female", rfid: "RFID_11A1_05", dob: "2008-09-18", parentName: "Đỗ Đức Long", parentPhone: "0988555666", parentJob: "Luật sư" },
    ];

    studentList11A1.forEach((s, idx) => {
      // Create student user
      insertUser.run(
        s.uid,
        `hocsinh_${s.code.toLowerCase()}`,
        `${s.code.toLowerCase()}@hocsinh.smart-sms.edu.vn`,
        commonPassword,
        s.name,
        "0977000" + idx,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.code}`,
        "role_student"
      );

      // Create student profile
      insertStudent.run(s.id, s.uid, s.code, s.dob, s.gender, "Hà Nội, Việt Nam", "class_11a1", "Active", s.rfid);

      // Create parent user & link
      const pUid = `user_prt_${s.id}`;
      const pId = `prt_${s.id}`;
      insertUser.run(
        pUid,
        `phuhyenh_${s.code.toLowerCase()}`,
        `phuhyenh_${s.code.toLowerCase()}@gmail.com`,
        commonPassword,
        s.parentName,
        s.parentPhone,
        `https://api.dicebear.com/7.x/avataaars/svg?seed=Parent_${s.code}`,
        "role_parent"
      );
      insertParent.run(pId, pUid, s.parentJob);
      insertParentLink.run(`link_${s.id}`, pId, s.id, "Bố / Mẹ", 1);
    });

    // 10. Sample Attendance Sessions & Records
    const insertSession = db.prepare(
      "INSERT INTO attendance_sessions (id, class_id, teacher_id, date, session_type) VALUES (?, ?, ?, ?, ?)"
    );
    const insertAttendanceRecord = db.prepare(
      "INSERT INTO attendance_records (id, session_id, student_id, status, method, notes) VALUES (?, ?, ?, ?, ?, ?)"
    );

    const todayStr = new Date().toISOString().split("T")[0];
    const sessId = "sess_today_11a1";
    insertSession.run(sessId, "class_11a1", "tch_02", todayStr, "Morning");

    insertAttendanceRecord.run("att_rec_1", sessId, "std_01", "Present", "RFID", "Đã quét thẻ lúc 07:12 AM");
    insertAttendanceRecord.run("att_rec_2", sessId, "std_02", "Present", "RFID", "Đã quét thẻ lúc 07:14 AM");
    insertAttendanceRecord.run("att_rec_3", sessId, "std_03", "Late", "Manual", "Vào lớp muộn 10 phút");
    insertAttendanceRecord.run("att_rec_4", sessId, "std_04", "Absent_Excused", "Manual", "Phụ huynh gửi đơn xin phép nghỉ sốt");
    insertAttendanceRecord.run("att_rec_5", sessId, "std_05", "Present", "RFID", "Đã quét thẻ lúc 07:10 AM");

    // 11. Sample Grades
    const insertGrade = db.prepare(
      "INSERT INTO grades (id, student_id, subject_id, semester_id, assessment_type_id, score, recorded_by) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );

    studentList11A1.forEach((s) => {
      insertGrade.run(`grd_${s.id}_math_tx1`, s.id, "sub_math", "sem_2_2024", "at_regular", 8.5, "user_tch_01");
      insertGrade.run(`grd_${s.id}_math_tx2`, s.id, "sub_math", "sem_2_2024", "at_regular", 9.0, "user_tch_01");
      insertGrade.run(`grd_${s.id}_math_gk`, s.id, "sub_math", "sem_2_2024", "at_midterm", 8.0, "user_tch_01");
      insertGrade.run(`grd_${s.id}_lit_tx1`, s.id, "sub_lit", "sem_2_2024", "at_regular", 8.0, "user_tch_02");
      insertGrade.run(`grd_${s.id}_eng_tx1`, s.id, "sub_eng", "sem_2_2024", "at_regular", 9.5, "user_tch_03");
    });

    // 12. Sample Conduct Events & Awards
    const insertConduct = db.prepare(
      "INSERT INTO conduct_events (id, student_id, class_id, title, description, points, event_type, recorded_by, is_verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    insertConduct.run("cnd_1", "std_01", "class_11a1", "Đạt giải Nhất Tuần Thi đua", "Có đóng góp xuất sắc cho phong trào lớp", 10, "Reward", "user_tch_02", 1);
    insertConduct.run("cnd_2", "std_03", "class_11a1", "Đi học muộn", "Đi muộn 10 phút buổi sáng", -2, "Violation", "user_tch_02", 1);

    const insertAward = db.prepare(
      "INSERT INTO awards (id, student_id, title, category, date_awarded, description) VALUES (?, ?, ?, ?, ?, ?)"
    );
    insertAward.run("awd_1", "std_01", "Học sinh Giỏi cấp Trường", "Học thuật", "2024-11-20", "Đạt giải Nhất môn Toán cấp Trường");

    // 13. Notifications
    const insertNotice = db.prepare(
      "INSERT INTO notifications (id, title, content, category, target_role, sender_id, priority) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    insertNotice.run(
      "notif_1",
      "Thông báo Lịch thi Giữa kỳ Học kỳ II",
      "Kế hoạch thi giữa kỳ II sẽ diễn ra từ ngày 15/03 đến ngày 20/03. Đề nghị các lớp ôn tập tốt.",
      "General",
      null,
      "user_principal",
      "High"
    );
    insertNotice.run(
      "notif_2",
      "Nhắc nhở nộp lệ phí thi HSG môn Tiếng Anh",
      "Các em học sinh trong đội tuyển chú ý hoàn thiện thủ tục trước thứ Bảy.",
      "Event",
      "role_student",
      "user_tch_03",
      "Normal"
    );

    // 14. Audit Log initial entry
    db.prepare("INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?, ?)").run(
      "log_init",
      "user_admin",
      "INITIALIZE_DATABASE",
      "SYSTEM",
      "SYSTEM",
      "Khởi tạo và gieo dữ liệu mẫu Smart SMS thành công"
    );
  })();

  console.log("Database seeded successfully!");
}
