const pool = require("../config/db");

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.*, c.name AS college, d.name AS department
       FROM students s
       JOIN colleges c ON c.id = s.college_id
       JOIN departments d ON d.id = s.department_id
       WHERE s.id = ?`,
      [req.user.id]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMyRoom = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT ra.*, r.room_number, dorms.name AS dorm_name
       FROM room_assignments ra
       JOIN rooms r ON r.id = ra.room_id
       JOIN dorms ON dorms.id = r.dorm_id
       WHERE ra.student_id = ? AND ra.status = 'active'`,
      [req.user.id]
    );

    res.json(rows[0] || { message: "Not assigned" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

 

 

// Student creates a report
exports.createReport = async (req, res) => {
  try {
    const { description } = req.body;

    // Check if empty
    if (!description || description.trim() === "") {
      return res.status(400).json({ message: "Description is required" });
    }

    // Insert into reports table
    await pool.execute(
      "INSERT INTO reports (student_id, description) VALUES (?, ?)",
      [req.user.id, description]
    );

    res.json({ message: "Report submitted successfully" });
  } catch (err) {
    console.error("Report Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Student views their reports and admin responses
exports.getStudentReports = async (req, res) => {
  try {
    const [reports] = await pool.execute(
      `SELECT description, admin_response, status, created_at, responded_at
       FROM reports
       WHERE student_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(reports);
  } catch (err) {
    console.error("Student Reports Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


